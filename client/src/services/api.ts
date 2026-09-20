import {
  User,
  Category,
  Question,
  TestSummary,
  TestDetail,
  Submission,
  AnalyticsData,
} from '../types';

const API_BASE = '/api';

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('volei_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Error en la solicitud';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {
      // response was not JSON
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async googleAuth(payload: { credential?: string; demoUser?: any }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  async updateAvatar(avatarUrl: string) {
    const res = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ avatarUrl }),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  async getAllUsers() {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getHeaders(),
    });
    return handleResponse<{ users: User[] }>(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getHeaders(),
    });
    return handleResponse<{ categories: Category[] }>(res);
  },

  async createCategory(data: Partial<Category>) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ category: Category }>(res);
  },

  // Questions
  async getQuestions(filters?: { categoryId?: string; difficulty?: string; phase?: string }) {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.phase) params.append('phase', filters.phase);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/questions${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ questions: Question[] }>(res);
  },

  async getQuestionById(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ question: Question }>(res);
  },

  async createQuestion(data: any) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ question: Question; message: string }>(res);
  },

  async deleteQuestion(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Tests
  async getTests() {
    const res = await fetch(`${API_BASE}/tests`, {
      headers: getHeaders(),
    });
    return handleResponse<{ tests: TestSummary[] }>(res);
  },

  async getTestById(id: string) {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ test: TestDetail }>(res);
  },

  async createTest(data: {
    title: string;
    description?: string;
    phase?: string;
    durationMinutes?: number;
    passingScore?: number;
    competentThreshold?: number;
    professionalThreshold?: number;
    questionIds: string[];
  }) {
    const res = await fetch(`${API_BASE}/tests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ test: any; message: string }>(res);
  },

  async deleteTest(id: string) {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Submissions
  async submitTest(data: {
    testId: string;
    timeSpentSeconds: number;
    answers: { questionId: string; selectedOptionId: string }[];
  }) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ submission: Submission; message: string }>(res);
  },

  async getSubmissions(filters?: { userId?: string; testId?: string }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.testId) params.append('testId', filters.testId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/submissions${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ submissions: Submission[] }>(res);
  },

  async getSubmissionById(id: string) {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ submission: Submission }>(res);
  },

  // Analytics
  async getAnalytics(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/analytics${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<AnalyticsData>(res);
  },
};
