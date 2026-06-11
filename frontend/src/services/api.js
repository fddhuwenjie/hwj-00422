const API_BASE = 'http://localhost:8422/api';

export const exerciseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/exercises?${query}`).then(res => res.json());
  },
  getById: (id) => fetch(`${API_BASE}/exercises/${id}`).then(res => res.json()),
  create: (data) => fetch(`${API_BASE}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data) => fetch(`${API_BASE}/exercises/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_BASE}/exercises/${id}`, { method: 'DELETE' }).then(res => res.json()),
  seed: () => fetch(`${API_BASE}/exercises/seed`, { method: 'POST' }).then(res => res.json())
};

export const planApi = {
  getAll: () => fetch(`${API_BASE}/plans`).then(res => res.json()),
  getById: (id) => fetch(`${API_BASE}/plans/${id}`).then(res => res.json()),
  create: (data) => fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data) => fetch(`${API_BASE}/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' }).then(res => res.json())
};

export const recordApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/records?${query}`).then(res => res.json());
  },
  getById: (id) => fetch(`${API_BASE}/records/${id}`).then(res => res.json()),
  create: (data) => fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data) => fetch(`${API_BASE}/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' }).then(res => res.json())
};

export const analysisApi = {
  dashboard: () => fetch(`${API_BASE}/analysis/dashboard`).then(res => res.json()),
  oneRepMax: (exerciseId) => fetch(`${API_BASE}/analysis/one-rep-max/${exerciseId}`).then(res => res.json()),
  weeklyVolume: () => fetch(`${API_BASE}/analysis/weekly-volume`).then(res => res.json()),
  bodyMetrics: () => fetch(`${API_BASE}/analysis/body-metrics`).then(res => res.json()),
  addBodyMetrics: (data) => fetch(`${API_BASE}/analysis/body-metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  personalRecords: () => fetch(`${API_BASE}/analysis/personal-records`).then(res => res.json()),
  muscleGroupDistribution: () => fetch(`${API_BASE}/analysis/muscle-group-distribution`).then(res => res.json()),
  fatigueIndex: () => fetch(`${API_BASE}/analysis/fatigue-index`).then(res => res.json()),
  trainingRecommendation: () => fetch(`${API_BASE}/analysis/training-recommendation`).then(res => res.json())
};

export const friendApi = {
  getInviteCode: () => fetch(`${API_BASE}/friends/invite-code`).then(res => res.json()),
  addFriend: (inviteCode) => fetch(`${API_BASE}/friends/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode })
  }).then(res => res.json()),
  getFriends: () => fetch(`${API_BASE}/friends/list`).then(res => res.json())
};

export const challengeApi = {
  create: (data) => fetch(`${API_BASE}/challenges/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  join: (id) => fetch(`${API_BASE}/challenges/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),
  getAll: () => fetch(`${API_BASE}/challenges`).then(res => res.json()),
  getById: (id) => fetch(`${API_BASE}/challenges/${id}`).then(res => res.json())
};