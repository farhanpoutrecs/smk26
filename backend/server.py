from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import csv
import uuid
import httpx
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="SMK26 EventOS API")
api_router = APIRouter(prefix="/api")

# ============================================================
# CONFIG
# ============================================================
ADMIN_ALLOWLIST = {
    "admin@poutrecs.com",
    "psrp@poutrecs.com",
    "kelabtani.kpkm@gmail.com",
    # Any email used for testing admin — allow all during MVP:
}
ALLOW_ALL_ADMINS = True  # MVP: treat any authenticated google user as admin

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ============================================================
# MODELS
# ============================================================
def now_utc():
    return datetime.now(timezone.utc)


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=now_utc)


class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    reg_id: str = Field(default_factory=lambda: f"REG-{uuid.uuid4().hex[:8].upper()}")
    full_name: str
    ic_number: str
    phone: str
    email: Optional[str] = None
    team_name: Optional[str] = None
    sport_id: str
    category: str = "individual"  # individual | team
    agency: Optional[str] = None
    payment_status: str = "UNPAID"  # UNPAID | PENDING | PAID | REJECTED
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=now_utc)


class RegistrationCreate(BaseModel):
    full_name: str
    ic_number: str
    phone: str
    email: Optional[str] = None
    team_name: Optional[str] = None
    sport_id: str
    category: str = "individual"
    agency: Optional[str] = None


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
    full_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    product_id: str
    product_name: str
    quantity: int = 1
    unit_price: float
    total: float
    delivery_method: str = "pickup"  # pickup | delivery
    payment_status: str = "UNPAID"
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=now_utc)


class OrderCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    product_id: str
    quantity: int = 1
    delivery_method: str = "pickup"


class PaymentUpdate(BaseModel):
    status: str  # PENDING | PAID | REJECTED
    notes: Optional[str] = None


class ReceiptUpload(BaseModel):
    receipt_base64: str


class TreasureHuntSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    submission_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    team_name: str
    category: str  # cycling | briskwalk | maze_runner | fun_open
    checkpoint_id: str
    code: Optional[str] = None
    photo_base64: Optional[str] = None
    points: int = 10
    created_at: datetime = Field(default_factory=now_utc)


class TreasureHuntSubmissionCreate(BaseModel):
    team_name: str
    category: str
    checkpoint_id: str
    code: Optional[str] = None
    photo_base64: Optional[str] = None


# ============================================================
# PRODUCTS (static catalog)
# ============================================================
PRODUCTS = [
    {
        "product_id": "finisher-medal",
        "name": "Finisher Medal Edisi Terhad",
        "price": 45.0,
        "description": "Pingat finisher edisi eksklusif SMK26 dengan aksen neon.",
        "image": "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/65609957ee1c8d2b312741cc07f5277bae779005afc80d6093ef3d2be5a23de6.png",
        "badge": "LIMITED",
    },
    {
        "product_id": "trophy-replica",
        "name": "Replika Trofi Mini SMK26",
        "price": 65.0,
        "description": "Trofi mini rasmi kejohanan. Sesuai sebagai cenderahati.",
        "image": "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/65609957ee1c8d2b312741cc07f5277bae779005afc80d6093ef3d2be5a23de6.png",
        "badge": "NEW",
    },
    {
        "product_id": "wrist-towel",
        "name": "Tuala Pergelangan Sulaman",
        "price": 25.0,
        "description": "Tuala sports sulaman SMK26, sesuai untuk semua sukan.",
        "image": "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/65609957ee1c8d2b312741cc07f5277bae779005afc80d6093ef3d2be5a23de6.png",
        "badge": None,
    },
    {
        "product_id": "bundle-pack",
        "name": "Pakej Bundle Peserta (Jimat RM35)",
        "price": 100.0,
        "description": "Pingat + Replika Trofi + Tuala dalam satu pakej.",
        "image": "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/65609957ee1c8d2b312741cc07f5277bae779005afc80d6093ef3d2be5a23de6.png",
        "badge": "BEST VALUE",
    },
]


def get_product(pid: str):
    for p in PRODUCTS:
        if p["product_id"] == pid:
            return p
    return None


# ============================================================
# AUTH HELPERS
# ============================================================
async def get_current_user(request: Request) -> Optional[dict]:
    """Return user dict or None. Checks session_token cookie or Authorization header."""
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        return None

    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None

    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < now_utc():
        return None

    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not (user.get("is_admin") or ALLOW_ALL_ADMINS or user.get("email") in ADMIN_ALLOWLIST):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ============================================================
# AUTH ROUTES
# ============================================================
@api_router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    """Exchange session_id (from Emergent auth redirect) for session_token cookie."""
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15.0) as httpc:
        r = await httpc.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()

    email = data["email"]
    name = data.get("name", email)
    picture = data.get("picture")
    session_token = data["session_token"]

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        is_admin = ALLOW_ALL_ADMINS or email in ADMIN_ALLOWLIST
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "is_admin": is_admin,
            "created_at": now_utc().isoformat(),
        })

    # Upsert session
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (now_utc() + timedelta(days=7)),
            "created_at": now_utc(),
        }},
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================
@api_router.get("/")
async def root():
    return {"app": "SMK26 EventOS", "status": "ok"}


@api_router.get("/products")
async def list_products():
    return PRODUCTS


# --- Registration ---
@api_router.post("/registrations", response_model=Registration)
async def create_registration(payload: RegistrationCreate):
    reg = Registration(**payload.model_dump())
    doc = reg.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.registrations.insert_one(doc)
    return reg


@api_router.get("/registrations", response_model=List[Registration])
async def list_registrations(request: Request, sport_id: Optional[str] = None, status: Optional[str] = None):
    await require_admin(request)
    q = {}
    if sport_id:
        q["sport_id"] = sport_id
    if status:
        q["payment_status"] = status
    docs = await db.registrations.find(q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.post("/registrations/{reg_id}/receipt")
async def upload_receipt(reg_id: str, payload: ReceiptUpload):
    existing = await db.registrations.find_one({"reg_id": reg_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Registration not found")
    await db.registrations.update_one(
        {"reg_id": reg_id},
        {"$set": {"receipt_url": payload.receipt_base64, "payment_status": "PENDING"}},
    )
    return {"ok": True}


@api_router.patch("/registrations/{reg_id}/payment")
async def update_registration_payment(reg_id: str, payload: PaymentUpdate, request: Request):
    await require_admin(request)
    if payload.status not in ("UNPAID", "PENDING", "PAID", "REJECTED"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.registrations.update_one(
        {"reg_id": reg_id},
        {"$set": {"payment_status": payload.status, "notes": payload.notes}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --- Orders ---
@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    product = get_product(payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    order = Order(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        product_id=product["product_id"],
        product_name=product["name"],
        quantity=payload.quantity,
        unit_price=product["price"],
        total=product["price"] * payload.quantity,
        delivery_method=payload.delivery_method,
    )
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def list_orders(request: Request, product_id: Optional[str] = None, status: Optional[str] = None):
    await require_admin(request)
    q = {}
    if product_id:
        q["product_id"] = product_id
    if status:
        q["payment_status"] = status
    docs = await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.post("/orders/{order_id}/receipt")
async def upload_order_receipt(order_id: str, payload: ReceiptUpload):
    existing = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"receipt_url": payload.receipt_base64, "payment_status": "PENDING"}},
    )
    return {"ok": True}


@api_router.patch("/orders/{order_id}/payment")
async def update_order_payment(order_id: str, payload: PaymentUpdate, request: Request):
    await require_admin(request)
    if payload.status not in ("UNPAID", "PENDING", "PAID", "REJECTED"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"payment_status": payload.status}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --- Treasure Hunt ---
@api_router.post("/treasure-hunt/submit", response_model=TreasureHuntSubmission)
async def submit_checkpoint(payload: TreasureHuntSubmissionCreate):
    sub = TreasureHuntSubmission(**payload.model_dump())
    doc = sub.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.th_submissions.insert_one(doc)
    return sub


@api_router.get("/treasure-hunt/leaderboard")
async def th_leaderboard(category: Optional[str] = None):
    q = {}
    if category:
        q["category"] = category
    docs = await db.th_submissions.find(q, {"_id": 0}).to_list(10000)
    agg = {}
    for d in docs:
        key = (d["team_name"], d["category"])
        if key not in agg:
            agg[key] = {"team_name": d["team_name"], "category": d["category"], "points": 0, "checkpoints": 0}
        agg[key]["points"] += d.get("points", 10)
        agg[key]["checkpoints"] += 1
    result = sorted(agg.values(), key=lambda x: x["points"], reverse=True)
    return result


# --- Admin: CSV export ---
@api_router.get("/admin/export/registrations")
async def export_registrations(request: Request):
    await require_admin(request)
    docs = await db.registrations.find({}, {"_id": 0}).to_list(10000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["reg_id", "full_name", "ic_number", "phone", "email", "team_name", "sport_id", "category", "agency", "payment_status", "created_at"])
    for d in docs:
        writer.writerow([d.get("reg_id"), d.get("full_name"), d.get("ic_number"), d.get("phone"), d.get("email"), d.get("team_name"), d.get("sport_id"), d.get("category"), d.get("agency"), d.get("payment_status"), d.get("created_at")])
    return Response(content=buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=registrations.csv"})


@api_router.get("/admin/export/orders")
async def export_orders(request: Request):
    await require_admin(request)
    docs = await db.orders.find({}, {"_id": 0}).to_list(10000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["order_id", "full_name", "phone", "email", "product_name", "quantity", "total", "delivery_method", "payment_status", "created_at"])
    for d in docs:
        writer.writerow([d.get("order_id"), d.get("full_name"), d.get("phone"), d.get("email"), d.get("product_name"), d.get("quantity"), d.get("total"), d.get("delivery_method"), d.get("payment_status"), d.get("created_at")])
    return Response(content=buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=orders.csv"})


@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    reg_count = await db.registrations.count_documents({})
    reg_paid = await db.registrations.count_documents({"payment_status": "PAID"})
    reg_pending = await db.registrations.count_documents({"payment_status": "PENDING"})
    ord_count = await db.orders.count_documents({})
    ord_paid = await db.orders.count_documents({"payment_status": "PAID"})
    ord_pending = await db.orders.count_documents({"payment_status": "PENDING"})
    th_count = await db.th_submissions.count_documents({})
    checkin_count = await db.checkins.count_documents({})
    return {
        "registrations_total": reg_count,
        "registrations_paid": reg_paid,
        "registrations_pending": reg_pending,
        "orders_total": ord_count,
        "orders_paid": ord_paid,
        "orders_pending": ord_pending,
        "th_submissions": th_count,
        "checkins_total": checkin_count,
    }


# ============================================================
# CHECK-IN SYSTEM (QR)
# ============================================================
class CheckIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    checkin_id: str = Field(default_factory=lambda: f"CHK-{uuid.uuid4().hex[:8].upper()}")
    event_id: str  # slug, e.g. "final-tarik-tali"
    event_title: Optional[str] = None
    full_name: str
    phone: str
    agency: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=now_utc)


class CheckInCreate(BaseModel):
    event_id: str
    event_title: Optional[str] = None
    full_name: str
    phone: str
    agency: Optional[str] = None
    note: Optional[str] = None


@api_router.post("/checkins", response_model=CheckIn)
async def create_checkin(payload: CheckInCreate):
    doc = CheckIn(**payload.model_dump())
    d = doc.model_dump()
    d["created_at"] = d["created_at"].isoformat()
    await db.checkins.insert_one(d)
    return doc


@api_router.get("/checkins/{event_id}")
async def list_checkins(event_id: str, request: Request):
    await require_admin(request)
    docs = await db.checkins.find({"event_id": event_id}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.get("/checkins/{event_id}/count")
async def count_checkins(event_id: str):
    count = await db.checkins.count_documents({"event_id": event_id})
    return {"event_id": event_id, "count": count}


# ============================================================
# TOURNAMENT SYSTEM (Kumpulan + Kalah Mati, 4 kumpulan)
# ============================================================
class Team(BaseModel):
    model_config = ConfigDict(extra="ignore")
    team_id: str = Field(default_factory=lambda: f"T-{uuid.uuid4().hex[:8].upper()}")
    sport_id: str
    name: str
    group: Optional[str] = None  # "A" | "B" | "C" | "D"
    agency: Optional[str] = None
    players: Optional[str] = None  # comma-separated
    created_at: datetime = Field(default_factory=now_utc)


class TeamCreate(BaseModel):
    sport_id: str
    name: str
    group: Optional[str] = None
    agency: Optional[str] = None
    players: Optional[str] = None


class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    match_id: str = Field(default_factory=lambda: f"M-{uuid.uuid4().hex[:8].upper()}")
    sport_id: str
    round: str  # "group" | "QF" | "SF" | "F" | "3P"
    group: Optional[str] = None  # A/B/C/D (for round=group)
    match_no: Optional[int] = None  # display order / bracket slot
    team_a: str  # team name or "TBD"
    team_b: str
    team_a_id: Optional[str] = None
    team_b_id: Optional[str] = None
    venue: Optional[str] = None
    scheduled_at: Optional[str] = None
    status: str = "scheduled"  # scheduled | live | finished
    score_a: int = 0
    score_b: int = 0
    score_details: Optional[str] = None  # free text/JSON (e.g., "21-15, 18-21, 21-19")
    winner: Optional[str] = None  # team name
    notes: Optional[str] = None
    updated_at: datetime = Field(default_factory=now_utc)


class MatchCreate(BaseModel):
    sport_id: str
    round: str
    group: Optional[str] = None
    match_no: Optional[int] = None
    team_a: str
    team_b: str
    venue: Optional[str] = None
    scheduled_at: Optional[str] = None


class ScoreUpdate(BaseModel):
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    score_details: Optional[str] = None
    status: Optional[str] = None  # scheduled | live | finished
    winner: Optional[str] = None
    notes: Optional[str] = None


class SportConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sport_id: str
    scoreboard_mode: str = "native"  # native | sheet
    sheet_embed_url: Optional[str] = None
    format: str = "group_knockout"  # group_knockout | round_robin | single_elim
    group_sizes: List[int] = [4, 4, 3, 3]
    updated_at: datetime = Field(default_factory=now_utc)


class SportConfigUpdate(BaseModel):
    scoreboard_mode: Optional[str] = None
    sheet_embed_url: Optional[str] = None
    format: Optional[str] = None
    group_sizes: Optional[List[int]] = None


# ---- Public ----
@api_router.get("/tournament/{sport_id}/teams", response_model=List[Team])
async def list_teams(sport_id: str):
    docs = await db.teams.find({"sport_id": sport_id}, {"_id": 0}).sort("group", 1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.get("/tournament/{sport_id}/groups")
async def get_groups(sport_id: str):
    teams = await db.teams.find({"sport_id": sport_id}, {"_id": 0}).to_list(500)
    matches = await db.matches.find({"sport_id": sport_id, "round": "group"}, {"_id": 0}).to_list(1000)
    groups = {}
    for t in teams:
        g = t.get("group") or "-"
        groups.setdefault(g, []).append({
            "team_id": t["team_id"], "name": t["name"], "agency": t.get("agency"),
            "P": 0, "W": 0, "D": 0, "L": 0, "GF": 0, "GA": 0, "GD": 0, "Pts": 0,
        })
    # Compute standings from finished matches
    for m in matches:
        if m.get("status") != "finished":
            continue
        g = m.get("group")
        if g not in groups:
            continue
        row_a = next((r for r in groups[g] if r["name"] == m["team_a"]), None)
        row_b = next((r for r in groups[g] if r["name"] == m["team_b"]), None)
        if not row_a or not row_b:
            continue
        sa, sb = m.get("score_a", 0), m.get("score_b", 0)
        row_a["P"] += 1; row_b["P"] += 1
        row_a["GF"] += sa; row_a["GA"] += sb
        row_b["GF"] += sb; row_b["GA"] += sa
        if sa > sb:
            row_a["W"] += 1; row_a["Pts"] += 3; row_b["L"] += 1
        elif sb > sa:
            row_b["W"] += 1; row_b["Pts"] += 3; row_a["L"] += 1
        else:
            row_a["D"] += 1; row_b["D"] += 1
            row_a["Pts"] += 1; row_b["Pts"] += 1
    for g, rows in groups.items():
        for r in rows:
            r["GD"] = r["GF"] - r["GA"]
        rows.sort(key=lambda r: (-r["Pts"], -r["GD"], -r["GF"], r["name"]))
    return groups


@api_router.get("/tournament/{sport_id}/fixtures", response_model=List[Match])
async def list_fixtures(sport_id: str, round: Optional[str] = None, status: Optional[str] = None):
    q = {"sport_id": sport_id}
    if round:
        q["round"] = round
    if status:
        q["status"] = status
    docs = await db.matches.find(q, {"_id": 0}).sort([("round", 1), ("match_no", 1)]).to_list(2000)
    for d in docs:
        if isinstance(d.get("updated_at"), str):
            d["updated_at"] = datetime.fromisoformat(d["updated_at"])
    return docs


@api_router.get("/tournament/{sport_id}/bracket")
async def get_bracket(sport_id: str):
    qf = await db.matches.find({"sport_id": sport_id, "round": "QF"}, {"_id": 0}).sort("match_no", 1).to_list(200)
    sf = await db.matches.find({"sport_id": sport_id, "round": "SF"}, {"_id": 0}).sort("match_no", 1).to_list(200)
    f = await db.matches.find({"sport_id": sport_id, "round": "F"}, {"_id": 0}).sort("match_no", 1).to_list(200)
    tp = await db.matches.find({"sport_id": sport_id, "round": "3P"}, {"_id": 0}).sort("match_no", 1).to_list(200)
    return {"QF": qf, "SF": sf, "F": f, "3P": tp}


@api_router.get("/tournament/{sport_id}/live", response_model=List[Match])
async def live_matches(sport_id: str):
    docs = await db.matches.find({"sport_id": sport_id, "status": "live"}, {"_id": 0}).to_list(50)
    for d in docs:
        if isinstance(d.get("updated_at"), str):
            d["updated_at"] = datetime.fromisoformat(d["updated_at"])
    return docs


@api_router.get("/tournament/live")
async def all_live_matches():
    docs = await db.matches.find({"status": "live"}, {"_id": 0}).to_list(100)
    for d in docs:
        if isinstance(d.get("updated_at"), str):
            d["updated_at"] = datetime.fromisoformat(d["updated_at"])
    return docs


@api_router.get("/tournament/{sport_id}/config", response_model=SportConfig)
async def get_sport_config(sport_id: str):
    doc = await db.sport_configs.find_one({"sport_id": sport_id}, {"_id": 0})
    if not doc:
        return SportConfig(sport_id=sport_id)
    return doc


# ---- Admin: Teams ----
@api_router.post("/tournament/teams", response_model=Team)
async def create_team(payload: TeamCreate, request: Request):
    await require_admin(request)
    team = Team(**payload.model_dump())
    doc = team.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.teams.insert_one(doc)
    return team


@api_router.delete("/tournament/teams/{team_id}")
async def delete_team(team_id: str, request: Request):
    await require_admin(request)
    await db.teams.delete_one({"team_id": team_id})
    return {"ok": True}


@api_router.post("/tournament/{sport_id}/teams/import")
async def import_teams_csv(sport_id: str, request: Request):
    """CSV headers: name,group,agency,players"""
    await require_admin(request)
    body = await request.body()
    text = body.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    inserted = 0
    docs = []
    for row in reader:
        if not row.get("name"):
            continue
        t = Team(
            sport_id=sport_id,
            name=row["name"].strip(),
            group=(row.get("group") or "").strip() or None,
            agency=(row.get("agency") or "").strip() or None,
            players=(row.get("players") or "").strip() or None,
        )
        d = t.model_dump()
        d["created_at"] = d["created_at"].isoformat()
        docs.append(d)
        inserted += 1
    if docs:
        await db.teams.insert_many(docs)
    return {"inserted": inserted}


# ---- Admin: Matches ----
@api_router.post("/tournament/matches", response_model=Match)
async def create_match(payload: MatchCreate, request: Request):
    await require_admin(request)
    m = Match(**payload.model_dump())
    doc = m.model_dump()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.matches.insert_one(doc)
    return m


@api_router.delete("/tournament/matches/{match_id}")
async def delete_match(match_id: str, request: Request):
    await require_admin(request)
    await db.matches.delete_one({"match_id": match_id})
    return {"ok": True}


@api_router.post("/tournament/{sport_id}/fixtures/import")
async def import_fixtures_csv(sport_id: str, request: Request):
    """CSV headers: round,group,match_no,team_a,team_b,venue,scheduled_at"""
    await require_admin(request)
    body = await request.body()
    text = body.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    inserted = 0
    docs = []
    for row in reader:
        if not (row.get("team_a") and row.get("team_b")):
            continue
        m = Match(
            sport_id=sport_id,
            round=(row.get("round") or "group").strip(),
            group=(row.get("group") or "").strip() or None,
            match_no=int(row["match_no"]) if (row.get("match_no") or "").strip().isdigit() else None,
            team_a=row["team_a"].strip(),
            team_b=row["team_b"].strip(),
            venue=(row.get("venue") or "").strip() or None,
            scheduled_at=(row.get("scheduled_at") or "").strip() or None,
        )
        d = m.model_dump()
        d["updated_at"] = d["updated_at"].isoformat()
        docs.append(d)
        inserted += 1
    if docs:
        await db.matches.insert_many(docs)
    return {"inserted": inserted}


@api_router.patch("/tournament/matches/{match_id}", response_model=Match)
async def update_match_score(match_id: str, payload: ScoreUpdate, request: Request):
    await require_admin(request)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["updated_at"] = now_utc().isoformat()
    # Auto-set winner if status becomes finished
    match = await db.matches.find_one({"match_id": match_id}, {"_id": 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    merged = {**match, **update}
    if merged.get("status") == "finished" and not update.get("winner"):
        sa, sb = merged.get("score_a", 0), merged.get("score_b", 0)
        if sa > sb:
            update["winner"] = merged["team_a"]
        elif sb > sa:
            update["winner"] = merged["team_b"]
    await db.matches.update_one({"match_id": match_id}, {"$set": update})
    updated = await db.matches.find_one({"match_id": match_id}, {"_id": 0})
    if isinstance(updated.get("updated_at"), str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    return updated


# ---- Admin: Sport Config ----
@api_router.patch("/tournament/{sport_id}/config", response_model=SportConfig)
async def update_sport_config(sport_id: str, payload: SportConfigUpdate, request: Request):
    await require_admin(request)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["sport_id"] = sport_id
    update["updated_at"] = now_utc().isoformat()
    await db.sport_configs.update_one(
        {"sport_id": sport_id},
        {"$set": update},
        upsert=True,
    )
    doc = await db.sport_configs.find_one({"sport_id": sport_id}, {"_id": 0})
    return doc


# ---- Admin: Export ----
@api_router.get("/admin/export/fixtures/{sport_id}")
async def export_fixtures(sport_id: str, request: Request):
    await require_admin(request)
    docs = await db.matches.find({"sport_id": sport_id}, {"_id": 0}).sort([("round", 1), ("match_no", 1)]).to_list(5000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["match_id", "round", "group", "match_no", "team_a", "team_b", "score_a", "score_b", "score_details", "status", "winner", "venue", "scheduled_at"])
    for d in docs:
        w.writerow([d.get("match_id"), d.get("round"), d.get("group"), d.get("match_no"), d.get("team_a"), d.get("team_b"), d.get("score_a"), d.get("score_b"), d.get("score_details"), d.get("status"), d.get("winner"), d.get("venue"), d.get("scheduled_at")])
    return Response(content=buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=fixtures_{sport_id}.csv"})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
