import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const authApi = {
  exchange: (session_id) => api.post("/auth/session", { session_id }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const publicApi = {
  createRegistration: (data) => api.post("/registrations", data),
  uploadReceipt: (reg_id, b64) => api.post(`/registrations/${reg_id}/receipt`, { receipt_base64: b64 }),
  listProducts: () => api.get("/products"),
  createOrder: (data) => api.post("/orders", data),
  uploadOrderReceipt: (order_id, b64) => api.post(`/orders/${order_id}/receipt`, { receipt_base64: b64 }),
  thSubmit: (data) => api.post("/treasure-hunt/submit", data),
  thLeaderboard: (category) => api.get("/treasure-hunt/leaderboard", { params: category ? { category } : {} }),
  createCheckin: (data) => api.post("/checkins", data),
  countCheckins: (event_id) => api.get(`/checkins/${event_id}/count`),
};

export const adminApi = {
  listRegistrations: (params = {}) => api.get("/registrations", { params }),
  listOrders: (params = {}) => api.get("/orders", { params }),
  stats: () => api.get("/admin/stats"),
  updateRegistrationPayment: (reg_id, status, notes) => api.patch(`/registrations/${reg_id}/payment`, { status, notes }),
  updateOrderPayment: (order_id, status) => api.patch(`/orders/${order_id}/payment`, { status }),
  exportRegistrationsUrl: () => `${API}/admin/export/registrations`,
  exportOrdersUrl: () => `${API}/admin/export/orders`,
};

export const tournamentApi = {
  getTeams: (sport_id) => api.get(`/tournament/${sport_id}/teams`),
  getGroups: (sport_id) => api.get(`/tournament/${sport_id}/groups`),
  getFixtures: (sport_id, params = {}) => api.get(`/tournament/${sport_id}/fixtures`, { params }),
  getBracket: (sport_id) => api.get(`/tournament/${sport_id}/bracket`),
  getLive: (sport_id) => api.get(`/tournament/${sport_id}/live`),
  getAllLive: () => api.get(`/tournament/live`),
  getConfig: (sport_id) => api.get(`/tournament/${sport_id}/config`),

  // admin
  createTeam: (data) => api.post(`/tournament/teams`, data),
  deleteTeam: (team_id) => api.delete(`/tournament/teams/${team_id}`),
  importTeams: (sport_id, csvText) => api.post(`/tournament/${sport_id}/teams/import`, csvText, { headers: { "Content-Type": "text/csv" } }),
  createMatch: (data) => api.post(`/tournament/matches`, data),
  deleteMatch: (match_id) => api.delete(`/tournament/matches/${match_id}`),
  importFixtures: (sport_id, csvText) => api.post(`/tournament/${sport_id}/fixtures/import`, csvText, { headers: { "Content-Type": "text/csv" } }),
  updateMatch: (match_id, data) => api.patch(`/tournament/matches/${match_id}`, data),
  updateConfig: (sport_id, data) => api.patch(`/tournament/${sport_id}/config`, data),
  exportFixturesUrl: (sport_id) => `${API}/admin/export/fixtures/${sport_id}`,
};

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
