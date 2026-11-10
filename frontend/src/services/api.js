const API_BASE = "https://tqkmh2t9ph.execute-api.ap-southeast-2.amazonaws.com/api";

function toCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(s) {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function keysToCamel(obj) {
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), keysToCamel(v)])
    );
  }
  return obj;
}

function keysToSnake(obj) {
  if (Array.isArray(obj)) return obj.map(keysToSnake);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toSnake(k), keysToSnake(v)])
    );
  }
  return obj;
}

function getToken() {
  return localStorage.getItem("interview_hub_token");
}

function getRefreshToken() {
  return localStorage.getItem("interview_hub_refresh_token");
}

let refreshPromise = null;

async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) throw new Error("No refresh token");

  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      localStorage.setItem("interview_hub_token", data.access_token);
      localStorage.setItem("interview_hub_refresh_token", data.refresh_token);
      return data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function forceLogout() {
  localStorage.removeItem("interview_hub_token");
  localStorage.removeItem("interview_hub_refresh_token");
  window.dispatchEvent(new Event("auth:logout"));
}

async function request(path, options = {}, _isRetry = false) {
  const token = getToken();
  const headers = { ...options.headers };
  let body = options.body;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(keysToSnake(body));
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, body });

  if (res.status === 204) return null;

  if (res.status === 401 && !_isRetry) {
    try {
      await refreshAccessToken();
      return request(path, options, true);
    } catch {
      forceLogout();
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  const json = await res.json();
  return keysToCamel(json);
}

// --- Auth ---

export async function login(username, password) {
  const body = JSON.stringify(keysToSnake({ username, password }));
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Invalid credentials");
  }

  const data = await res.json();
  localStorage.setItem("interview_hub_token", data.access_token);
  localStorage.setItem("interview_hub_refresh_token", data.refresh_token);
  return keysToCamel(data.user);
}

export async function getMe() {
  return request("/auth/me");
}

export function logout() {
  const token = getToken();
  if (token) {
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem("interview_hub_token");
  localStorage.removeItem("interview_hub_refresh_token");
}

export function hasToken() {
  return Boolean(getToken());
}

// --- Users ---

export async function getUsers() {
  return request("/users");
}

export async function createUser(data) {
  return request("/users", { method: "POST", body: data });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

// --- Profiles ---

export async function getProfiles() {
  return request("/profiles");
}

export async function getProfile(id) {
  return request(`/profiles/${id}`);
}

export async function createProfile(data) {
  return request("/profiles", { method: "POST", body: data });
}

export async function updateProfile(id, data) {
  return request(`/profiles/${id}`, { method: "PUT", body: data });
}

export async function deleteProfile(id) {
  return request(`/profiles/${id}`, { method: "DELETE" });
}

// --- Companies ---

export async function getCompanies() {
  return request("/companies");
}

export async function createCompany(name) {
  return request("/companies", { method: "POST", body: { name } });
}

export async function deleteCompany(id) {
  return request(`/companies/${id}`, { method: "DELETE" });
}

// --- Rounds ---

export async function getRounds() {
  return request("/rounds");
}

export async function createRound(name) {
  return request("/rounds", { method: "POST", body: { name } });
}

export async function deleteRound(id) {
  return request(`/rounds/${id}`, { method: "DELETE" });
}

// --- Interviews ---

export async function getInterviews(assignedTo) {
  const params = assignedTo ? `?assigned_to=${assignedTo}` : "";
  return request(`/interviews${params}`);
}

export async function getInterview(id) {
  return request(`/interviews/${id}`);
}

export async function createInterview(data) {
  return request("/interviews", { method: "POST", body: data });
}

export async function updateInterview(id, data) {
  return request(`/interviews/${id}`, { method: "PUT", body: data });
}

export async function addInterviewNote(interviewId, note) {
  return request(`/interviews/${interviewId}/notes`, {
    method: "POST",
    body: note,
  });
}

export async function getRoundChain(interviewId) {
  return request(`/interviews/${interviewId}/chain`);
}

// --- Questions ---

export async function getQuestions() {
  return request("/questions");
}

export async function createQuestion(data) {
  return request("/questions", { method: "POST", body: data });
}

export async function deleteQuestion(id) {
  return request(`/questions/${id}`, { method: "DELETE" });
}
