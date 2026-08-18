import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCompanyOverview = async (ticker: string) => {
  const response = await api.get(`/companies/${ticker}/overview`);
  return response.data;
};

export const getCompanyFinancials = async (ticker: string) => {
  const response = await api.get(`/companies/${ticker}/financials`);
  return response.data;
};

export const getCompanyNews = async (ticker: string) => {
  const response = await api.get(`/companies/${ticker}/news`);
  return response.data;
};

export const runAnalystResearch = async (ticker: string, query: string) => {
  const response = await api.post('/analyst/research', { ticker, query });
  return response.data;
};

export const resumeAnalystResearch = async (threadId: string, approve: boolean, feedback?: string) => {
  const response = await api.post('/analyst/research/resume', { thread_id: threadId, approve, feedback });
  return response.data;
};

export const getMLAnalysis = async (ticker: string) => {
  const response = await api.post('/analyst/ml-analysis', { ticker });
  return response.data;
};

export default api;
