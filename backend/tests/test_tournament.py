"""SMK26 Tournament module backend tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://events-os.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "test_session_smk26_2026"
AUTH = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

# Use a unique sport_id per run so we don't collide with pre-seeded bola-sepak data
SPORT = f"testsport-{uuid.uuid4().hex[:6]}"


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", **AUTH})
    return s


# ---------- Auth guards ----------
class TestAuthGuards:
    def test_teams_import_requires_admin(self, api_client):
        r = api_client.post(f"{API}/tournament/{SPORT}/teams/import",
                            data="name,group\nFoo,A\n",
                            headers={"Content-Type": "text/csv"})
        assert r.status_code == 401

    def test_fixtures_import_requires_admin(self, api_client):
        r = api_client.post(f"{API}/tournament/{SPORT}/fixtures/import",
                            data="round,team_a,team_b\ngroup,A,B\n",
                            headers={"Content-Type": "text/csv"})
        assert r.status_code == 401

    def test_create_team_requires_admin(self, api_client):
        r = api_client.post(f"{API}/tournament/teams",
                            json={"sport_id": SPORT, "name": "X"})
        assert r.status_code == 401

    def test_create_match_requires_admin(self, api_client):
        r = api_client.post(f"{API}/tournament/matches",
                            json={"sport_id": SPORT, "round": "group",
                                  "team_a": "A", "team_b": "B"})
        assert r.status_code == 401

    def test_patch_match_requires_admin(self, api_client):
        r = api_client.patch(f"{API}/tournament/matches/fake",
                             json={"score_a": 1})
        assert r.status_code == 401

    def test_config_patch_requires_admin(self, api_client):
        r = api_client.patch(f"{API}/tournament/{SPORT}/config",
                             json={"scoreboard_mode": "sheet"})
        assert r.status_code == 401

    def test_export_fixtures_requires_admin(self, api_client):
        r = api_client.get(f"{API}/admin/export/fixtures/{SPORT}")
        assert r.status_code == 401


# ---------- Public reads (empty by default) ----------
class TestDefaults:
    def test_teams_empty(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/teams")
        assert r.status_code == 200
        assert r.json() == []

    def test_fixtures_empty(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/fixtures")
        assert r.status_code == 200
        assert r.json() == []

    def test_groups_empty(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/groups")
        assert r.status_code == 200
        assert r.json() == {}

    def test_bracket_empty(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/bracket")
        assert r.status_code == 200
        data = r.json()
        assert data == {"QF": [], "SF": [], "F": [], "3P": []}

    def test_live_for_sport_empty(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/live")
        assert r.status_code == 200
        assert r.json() == []

    def test_config_default(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/config")
        assert r.status_code == 200
        data = r.json()
        assert data["sport_id"] == SPORT
        assert data["scoreboard_mode"] == "native"
        assert data["format"] == "group_knockout"
        assert data["group_sizes"] == [4, 4, 3, 3]


# ---------- CSV import: teams & fixtures ----------
class TestImports:
    csv_teams = (
        "name,group,agency,players\n"
        "DOA United,A,DOA,P1 P2\n"
        "FAMA FC,A,FAMA,P3 P4\n"
        "KPKM Tigers,A,KPKM,\n"
        "PSRP Warriors,A,PSRP,\n"
        "Team E,B,,\n"
        "Team F,B,,\n"
    )

    csv_fixtures = (
        "round,group,match_no,team_a,team_b,venue,scheduled_at\n"
        "group,A,1,DOA United,FAMA FC,Padang 1,2026-03-01 09:00\n"
        "group,A,2,KPKM Tigers,PSRP Warriors,Padang 1,2026-03-01 10:00\n"
        "QF,,1,TBD,TBD,,\n"
    )

    def test_import_teams(self, admin):
        r = admin.post(f"{API}/tournament/{SPORT}/teams/import",
                       data=self.csv_teams,
                       headers={"Content-Type": "text/csv", **AUTH})
        assert r.status_code == 200, r.text
        assert r.json()["inserted"] == 6

    def test_teams_listed_after_import(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/teams")
        assert r.status_code == 200
        teams = r.json()
        assert len(teams) == 6
        names = {t["name"] for t in teams}
        assert "DOA United" in names and "FAMA FC" in names

    def test_import_fixtures(self, admin):
        r = admin.post(f"{API}/tournament/{SPORT}/fixtures/import",
                       data=self.csv_fixtures,
                       headers={"Content-Type": "text/csv", **AUTH})
        assert r.status_code == 200, r.text
        assert r.json()["inserted"] == 3

    def test_fixtures_listed(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/fixtures")
        assert r.status_code == 200
        matches = r.json()
        assert len(matches) == 3
        rounds = {m["round"] for m in matches}
        assert rounds == {"group", "QF"}

    def test_fixtures_filter_round(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/fixtures", params={"round": "group"})
        assert r.status_code == 200
        assert all(m["round"] == "group" for m in r.json())
        assert len(r.json()) == 2

    def test_bracket_has_qf(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/bracket")
        data = r.json()
        assert len(data["QF"]) == 1
        assert data["SF"] == [] and data["F"] == [] and data["3P"] == []


# ---------- Match update, winner auto, standings ----------
class TestMatchFlow:
    def _group_match_id(self, api_client, team_a, team_b):
        r = api_client.get(f"{API}/tournament/{SPORT}/fixtures", params={"round": "group"})
        for m in r.json():
            if m["team_a"] == team_a and m["team_b"] == team_b:
                return m["match_id"]
        return None

    def test_set_match_live(self, admin, api_client):
        mid = self._group_match_id(api_client, "DOA United", "FAMA FC")
        assert mid
        r = admin.patch(f"{API}/tournament/matches/{mid}", json={"status": "live"})
        assert r.status_code == 200
        assert r.json()["status"] == "live"

    def test_live_endpoints_reflect_status(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/live")
        assert r.status_code == 200
        assert len(r.json()) == 1

        r2 = api_client.get(f"{API}/tournament/live")
        assert r2.status_code == 200
        assert any(m["sport_id"] == SPORT for m in r2.json())

    def test_score_update_and_finish_auto_winner(self, admin, api_client):
        mid = self._group_match_id(api_client, "DOA United", "FAMA FC")
        # Set score then finish without providing winner
        r1 = admin.patch(f"{API}/tournament/matches/{mid}",
                         json={"score_a": 2, "score_b": 1, "score_details": "1-0, 2-1"})
        assert r1.status_code == 200
        r2 = admin.patch(f"{API}/tournament/matches/{mid}", json={"status": "finished"})
        assert r2.status_code == 200
        data = r2.json()
        assert data["status"] == "finished"
        assert data["winner"] == "DOA United"
        assert data["score_a"] == 2 and data["score_b"] == 1

    def test_standings_after_one_match(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/groups")
        assert r.status_code == 200
        groups = r.json()
        assert "A" in groups
        rows = groups["A"]
        doa = next(x for x in rows if x["name"] == "DOA United")
        fama = next(x for x in rows if x["name"] == "FAMA FC")
        assert doa["W"] == 1 and doa["Pts"] == 3 and doa["GF"] == 2 and doa["GA"] == 1 and doa["GD"] == 1
        assert fama["L"] == 1 and fama["Pts"] == 0 and fama["GF"] == 1 and fama["GA"] == 2 and fama["GD"] == -1
        # DOA must rank above FAMA (by Pts desc)
        idx_doa = next(i for i, r in enumerate(rows) if r["name"] == "DOA United")
        idx_fama = next(i for i, r in enumerate(rows) if r["name"] == "FAMA FC")
        assert idx_doa < idx_fama

    def test_live_empty_after_finished(self, api_client):
        r = api_client.get(f"{API}/tournament/{SPORT}/live")
        assert r.status_code == 200
        assert r.json() == []


# ---------- Sport config persistence ----------
class TestConfig:
    def test_patch_config_persists(self, admin, api_client):
        r = admin.patch(f"{API}/tournament/{SPORT}/config",
                        json={"scoreboard_mode": "sheet",
                              "sheet_embed_url": "https://docs.google.com/sheets/d/EXAMPLE/preview"})
        assert r.status_code == 200
        data = r.json()
        assert data["scoreboard_mode"] == "sheet"
        assert data["sheet_embed_url"].startswith("https://")

        r2 = api_client.get(f"{API}/tournament/{SPORT}/config")
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["scoreboard_mode"] == "sheet"
        assert d2["sheet_embed_url"].startswith("https://")


# ---------- Admin exports ----------
class TestExports:
    def test_export_fixtures_csv(self, admin):
        r = admin.get(f"{API}/admin/export/fixtures/{SPORT}")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        header = r.text.split("\n", 1)[0]
        for col in ["match_id", "round", "team_a", "team_b", "score_a", "winner"]:
            assert col in header


# ---------- Regression: existing endpoints ----------
class TestRegression:
    def test_products_still_works(self, api_client):
        r = api_client.get(f"{API}/products")
        assert r.status_code == 200
        assert len(r.json()) == 4

    def test_admin_stats_still_works(self, admin):
        r = admin.get(f"{API}/admin/stats")
        assert r.status_code == 200
        assert "registrations_total" in r.json()

    def test_auth_me_admin(self, admin):
        r = admin.get(f"{API}/auth/me")
        assert r.status_code == 200


# ---------- Cleanup ----------
@pytest.fixture(scope="module", autouse=True)
def cleanup(request):
    yield
    # Best-effort cleanup via admin delete endpoints
    s = requests.Session()
    s.headers.update(AUTH)
    try:
        teams = s.get(f"{API}/tournament/{SPORT}/teams").json()
        for t in teams:
            s.delete(f"{API}/tournament/teams/{t['team_id']}")
        matches = s.get(f"{API}/tournament/{SPORT}/fixtures").json()
        for m in matches:
            s.delete(f"{API}/tournament/matches/{m['match_id']}")
    except Exception:
        pass
