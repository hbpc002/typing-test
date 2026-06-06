import axios from 'axios';

export const getMe = () => {
  return axios.get('/api/users/me');
};

export const postLogin = (params: { userName: string; password: string }) => {
  return axios.post('/api/users/login', params);
};

export const postLogout = () => {
  return axios.post('/api/users/logout');
};

export const postRegister = (params: { password: string; userName: string; email?: string }) => {
  return axios.post('/api/users/register', params);
};

export const getConfig = () => {
  return axios.get('/api/config');
};

export const getUserInfo = (params: { userId?: string; userName?: string }) => {
  return axios.get('/api/users/info', { params });
};
export const setPersonalInfo = (params: {
  userId: string;
  question?: string;
  answer?: string;
  email?: string;
}) => {
  return axios.post('/api/users/set-personal-info', params);
};

export const updatePassword = (params: { oldPassword: string; newPassword: string }) => {
  return axios.post('/api/users/update-password', params);
};
export const updatePasswordWithAnswer = (params: {
  userName: string;
  answer: string;
  newPassword: string;
}) => {
  return axios.post('/api/users/update-password-with-answer', params);
};

export const postVerifyAnswer = (params: { userName: string; answer: string }) => {
  return axios.post('/api/users/verify-answer', params);
};

// 获取建议
export const getSuggest = (params?: { sort?: 'time' | 'hot' | 'theme' }) => {
  return axios.get('/api/suggest', { params });
};

// 获取某人的建议
export const getSuggestByUserId = (params?: { id: string }) => {
  return axios.get('/api/suggest/by-user-id', { params });
};

// 提出建议
export const createSuggest = (params: {
  content: string;
  userId?: string;
  userName?: string;
  isTheme?: boolean;
  canShow?: boolean;
}) => {
  return axios.post('/api/suggest/create', params);
};

export const voteSuggest = (params: { id: string; value: string }) => {
  return axios.post('/api/suggest/vote', params);
};

// 获取将要做的列表
export const getTodo = () => {
  return axios.get('/api/todo');
};

// === Exam / Admin APIs ===

export const adminLogin = (params: { password: string }) => {
  return axios.post('/api/admin/login', params);
};

function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getArticles = () => {
  return axios.get('/api/articles');
};

export const getArticleById = (id: number) => {
  return axios.get(`/api/articles/${id}`);
};

export const createArticle = (params: { title: string; author?: string; content: string; type?: string }) => {
  return axios.post('/api/articles', params, { headers: authHeaders() });
};

export const updateArticle = (id: number, params: { title: string; author?: string; content: string; type?: string }) => {
  return axios.put(`/api/articles/${id}`, params, { headers: authHeaders() });
};

export const deleteArticle = (id: number) => {
  return axios.delete(`/api/articles/${id}`, { headers: authHeaders() });
};

export const saveRecord = (params: {
  employee_name: string;
  employee_group: string;
  article_id: number;
  article_title?: string;
  wpm: number;
  accuracy: string;
  duration: number;
  total_keystrokes?: number;
  wrong_keystrokes?: number;
  strict_wrong_count?: number;
}) => {
  return axios.post('/api/records', params);
};

export const getRecords = (params?: {
  name?: string;
  group?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) => {
  return axios.get('/api/records', { params });
};

export const exportRecords = (params?: {
  name?: string;
  group?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return axios.get('/api/records/export', { params, headers: { ...authHeaders() }, responseType: 'blob' });
};

export const getStats = () => {
  return axios.get('/api/records/stats', { headers: authHeaders() });
};

export const deleteRecord = (id: number) => {
  return axios.delete(`/api/records/${id}`, { headers: authHeaders() });
};

export const batchDeleteRecords = (ids: number[]) => {
  return axios.post('/api/records/batch-delete', { ids }, { headers: authHeaders() });
};

export const getSettings = () => {
  return axios.get('/api/settings', { headers: authHeaders() });
};

export const updateSetting = (key: string, value: string) => {
  return axios.put(`/api/settings/${key}`, { value }, { headers: authHeaders() });
};
