const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const authAPI = {
  signup: async (data) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  login: async (data) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const resumeAPI = {
  create: async (data) => {
    const res = await fetch(`${API_URL}/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      console.error('Create resume failed:', result);
      throw new Error(result.message || 'Failed to create resume');
    }
    return result;
  },
  getAll: async () => {
    const res = await fetch(`${API_URL}/resumes`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },
  getOne: async (id) => {
    const res = await fetch(`${API_URL}/resumes/${id}`);
    return res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/resumes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },
  duplicate: async (id) => {
    const res = await fetch(`${API_URL}/resumes/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },
  matchJD: async (resumeId, jobDescription) => {
    const res = await fetch(`${API_URL}/resumes/match-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ resumeId, jobDescription })
    });
    return res.json();
  }
};

export const aiAPI = {
  optimize: async (text, type, context = {}, enforceRewrite = false) => {
    const res = await fetch(`${API_URL}/ai/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ text, type, context, enforceRewrite })
    });
    return res.json();
  }
};
