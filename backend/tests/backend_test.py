"""SMK26 EventOS Backend API tests."""
import os
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://events-os.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "test_session_smk26_2026"
AUTH_HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", **AUTH_HEADERS})
    return s


# ---------- Public endpoints ----------
class TestPublic:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"

    def test_products_list(self, api_client):
        r = api_client.get(f"{API}/products")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) == 4
        ids = {p["product_id"] for p in products}
        assert ids == {"finisher-medal", "trophy-replica", "wrist-towel", "bundle-pack"}
        for p in products:
            assert "name" in p and "price" in p

    def test_auth_me_unauthenticated(self, api_client):
        r = api_client.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Registrations ----------
class TestRegistrations:
    reg_id = None

    def test_create_registration(self, api_client):
        payload = {
            "full_name": "TEST_Ahmad Ali",
            "ic_number": "900101-01-1234",
            "phone": "0123456789",
            "email": "test_ahmad@example.com",
            "sport_id": "futsal",
            "category": "individual",
            "agency": "KPKM",
        }
        r = api_client.post(f"{API}/registrations", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["full_name"] == payload["full_name"]
        assert data["sport_id"] == "futsal"
        assert data["payment_status"] == "UNPAID"
        assert data["reg_id"].startswith("REG-")
        TestRegistrations.reg_id = data["reg_id"]

    def test_list_registrations_unauth(self, api_client):
        r = api_client.get(f"{API}/registrations")
        assert r.status_code == 401

    def test_list_registrations_admin(self, admin_client):
        r = admin_client.get(f"{API}/registrations")
        assert r.status_code == 200
        regs = r.json()
        assert isinstance(regs, list)
        assert any(x.get("reg_id") == TestRegistrations.reg_id for x in regs)

    def test_upload_receipt(self, api_client):
        assert TestRegistrations.reg_id
        fake_b64 = "data:image/png;base64," + base64.b64encode(b"fake-image").decode()
        r = api_client.post(
            f"{API}/registrations/{TestRegistrations.reg_id}/receipt",
            json={"receipt_base64": fake_b64},
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_receipt_set_pending(self, admin_client):
        r = admin_client.get(f"{API}/registrations")
        assert r.status_code == 200
        reg = next((x for x in r.json() if x["reg_id"] == TestRegistrations.reg_id), None)
        assert reg is not None
        assert reg["payment_status"] == "PENDING"
        assert reg.get("receipt_url")

    def test_admin_update_payment_paid(self, admin_client):
        r = admin_client.patch(
            f"{API}/registrations/{TestRegistrations.reg_id}/payment",
            json={"status": "PAID", "notes": "verified"},
        )
        assert r.status_code == 200
        # Verify persistence
        r2 = admin_client.get(f"{API}/registrations")
        reg = next((x for x in r2.json() if x["reg_id"] == TestRegistrations.reg_id), None)
        assert reg["payment_status"] == "PAID"

    def test_update_payment_invalid_status(self, admin_client):
        r = admin_client.patch(
            f"{API}/registrations/{TestRegistrations.reg_id}/payment",
            json={"status": "WEIRD"},
        )
        assert r.status_code == 400

    def test_receipt_for_missing_reg(self, api_client):
        r = api_client.post(
            f"{API}/registrations/REG-NOPE/receipt",
            json={"receipt_base64": "x"},
        )
        assert r.status_code == 404


# ---------- Orders ----------
class TestOrders:
    order_id = None

    def test_create_order(self, api_client):
        payload = {
            "full_name": "TEST_Buyer",
            "phone": "0198888888",
            "email": "buyer@example.com",
            "product_id": "finisher-medal",
            "quantity": 2,
            "delivery_method": "pickup",
        }
        r = api_client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["product_name"] == "Finisher Medal Edisi Terhad"
        assert data["unit_price"] == 45.0
        assert data["total"] == 90.0
        assert data["order_id"].startswith("ORD-")
        TestOrders.order_id = data["order_id"]

    def test_create_order_invalid_product(self, api_client):
        r = api_client.post(
            f"{API}/orders",
            json={"full_name": "x", "phone": "0", "product_id": "does-not-exist", "quantity": 1},
        )
        assert r.status_code == 404

    def test_list_orders_unauth(self, api_client):
        r = api_client.get(f"{API}/orders")
        assert r.status_code == 401

    def test_list_orders_admin(self, admin_client):
        r = admin_client.get(f"{API}/orders")
        assert r.status_code == 200
        orders = r.json()
        assert any(o["order_id"] == TestOrders.order_id for o in orders)

    def test_upload_order_receipt(self, api_client):
        fake_b64 = "data:image/png;base64," + base64.b64encode(b"fake").decode()
        r = api_client.post(
            f"{API}/orders/{TestOrders.order_id}/receipt",
            json={"receipt_base64": fake_b64},
        )
        assert r.status_code == 200

    def test_admin_update_order_payment(self, admin_client):
        r = admin_client.patch(
            f"{API}/orders/{TestOrders.order_id}/payment",
            json={"status": "PAID"},
        )
        assert r.status_code == 200
        r2 = admin_client.get(f"{API}/orders")
        order = next((o for o in r2.json() if o["order_id"] == TestOrders.order_id), None)
        assert order["payment_status"] == "PAID"


# ---------- Treasure Hunt ----------
class TestTreasureHunt:
    def test_submit_and_leaderboard(self, api_client):
        subs = [
            {"team_name": "TEST_Harimau", "category": "cycling", "checkpoint_id": "cp1", "code": "A"},
            {"team_name": "TEST_Harimau", "category": "cycling", "checkpoint_id": "cp2", "code": "B"},
            {"team_name": "TEST_Rimau", "category": "cycling", "checkpoint_id": "cp1", "code": "A"},
        ]
        for s in subs:
            r = api_client.post(f"{API}/treasure-hunt/submit", json=s)
            assert r.status_code == 200
            assert r.json().get("points", 0) > 0

        r = api_client.get(f"{API}/treasure-hunt/leaderboard", params={"category": "cycling"})
        assert r.status_code == 200
        board = r.json()
        assert isinstance(board, list)
        # Check sort desc by points
        if len(board) >= 2:
            assert board[0]["points"] >= board[1]["points"]
        top = next((x for x in board if x["team_name"] == "TEST_Harimau"), None)
        assert top is not None
        assert top["points"] >= 20
        assert top["checkpoints"] >= 2


# ---------- Admin stats / exports / auth ----------
class TestAdmin:
    def test_stats_unauth(self, api_client):
        assert api_client.get(f"{API}/admin/stats").status_code == 401

    def test_stats_admin(self, admin_client):
        r = admin_client.get(f"{API}/admin/stats")
        assert r.status_code == 200
        data = r.json()
        for k in [
            "registrations_total", "registrations_paid", "registrations_pending",
            "orders_total", "orders_paid", "orders_pending", "th_submissions",
            "checkins_total",
        ]:
            assert k in data
            assert isinstance(data[k], int)

    def test_export_registrations_unauth(self, api_client):
        assert api_client.get(f"{API}/admin/export/registrations").status_code == 401

    def test_export_registrations_admin(self, admin_client):
        r = admin_client.get(f"{API}/admin/export/registrations")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert "reg_id" in r.text.split("\n", 1)[0]

    def test_export_orders_admin(self, admin_client):
        r = admin_client.get(f"{API}/admin/export/orders")
        assert r.status_code == 200
        assert "order_id" in r.text.split("\n", 1)[0]

    def test_auth_me_admin(self, admin_client):
        r = admin_client.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json().get("email") == "admin+test@poutrecs.com"


# ---------- Check-ins (QR Check-in system) ----------
class TestCheckIns:
    checkin_id = None
    event_id = "TEST_final-tarik-tali"

    def test_create_checkin(self, api_client):
        payload = {
            "event_id": TestCheckIns.event_id,
            "event_title": "Final Tarik Tali",
            "full_name": "TEST_Peserta Satu",
            "phone": "0123456789",
            "agency": "KPKM",
            "note": "checkpoint test",
        }
        r = api_client.post(f"{API}/checkins", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["event_id"] == TestCheckIns.event_id
        assert data["full_name"] == "TEST_Peserta Satu"
        assert data["phone"] == "0123456789"
        assert data["agency"] == "KPKM"
        assert data["checkin_id"].startswith("CHK-")
        TestCheckIns.checkin_id = data["checkin_id"]

    def test_create_checkin_minimal(self, api_client):
        """Only required fields: event_id, full_name, phone."""
        r = api_client.post(f"{API}/checkins", json={
            "event_id": TestCheckIns.event_id,
            "full_name": "TEST_Peserta Dua",
            "phone": "0198888888",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["full_name"] == "TEST_Peserta Dua"
        assert data.get("agency") is None
        assert data.get("note") is None

    def test_create_checkin_missing_required(self, api_client):
        r = api_client.post(f"{API}/checkins", json={
            "event_id": TestCheckIns.event_id,
            "full_name": "TEST_NoPhone",
        })
        assert r.status_code == 422

    def test_count_checkins_public(self, api_client):
        r = api_client.get(f"{API}/checkins/{TestCheckIns.event_id}/count")
        assert r.status_code == 200
        data = r.json()
        assert data["event_id"] == TestCheckIns.event_id
        assert isinstance(data["count"], int)
        assert data["count"] >= 2  # at least the 2 created above

    def test_list_checkins_unauth(self, api_client):
        r = api_client.get(f"{API}/checkins/{TestCheckIns.event_id}")
        assert r.status_code == 401

    def test_list_checkins_admin(self, admin_client):
        r = admin_client.get(f"{API}/checkins/{TestCheckIns.event_id}")
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list)
        assert any(d["checkin_id"] == TestCheckIns.checkin_id for d in docs)
        # Verify persistence of fields
        target = next(d for d in docs if d["checkin_id"] == TestCheckIns.checkin_id)
        assert target["full_name"] == "TEST_Peserta Satu"
        assert target["agency"] == "KPKM"

    def test_count_checkins_unknown_event(self, api_client):
        r = api_client.get(f"{API}/checkins/TEST_nonexistent_event_xyz/count")
        assert r.status_code == 200
        assert r.json()["count"] == 0

    def test_admin_stats_checkins_total_increased(self, admin_client):
        r = admin_client.get(f"{API}/admin/stats")
        assert r.status_code == 200
        assert r.json()["checkins_total"] >= 2

