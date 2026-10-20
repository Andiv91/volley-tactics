import {
  User,
  Team,
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

  async googleAuth(payload: {
    credential?: string;
    demoUser?: any;
    mode?: 'login' | 'register';
    role?: string;
    name?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      token?: string;
      user?: User;
      message: string;
      notRegistered?: boolean;
      googleProfile?: {
        email: string;
        name: string;
        avatarUrl?: string;
        googleId?: string;
        credential?: string;
      };
    }>(res);
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

  async createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    teamId?: string | null;
  }) {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      teamId?: string | null;
    }
  ) {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
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
    scaleType?: string;
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

  async updateTest(id: string, data: {
    title: string;
    description?: string;
    phase?: string;
    durationMinutes?: number;
    passingScore?: number;
    scaleType?: string;
    competentThreshold?: number;
    professionalThreshold?: number;
    questionIds?: string[];
    isActive?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      method: 'PUT',
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

  async getSubmissions(filters?: { userId?: string; testId?: string; teamId?: string }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.testId) params.append('testId', filters.testId);
    if (filters?.teamId) params.append('teamId', filters.teamId);

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

  // Teams
  async getTeams() {
    const res = await fetch(`${API_BASE}/teams`, {
      headers: getHeaders(),
    });
    return handleResponse<{ teams: Team[] }>(res);
  },

  async createTeam(data: { name: string; description?: string }) {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ team: Team; message: string }>(res);
  },

  async deleteTeam(id: string) {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getAvailableStudents() {
    const res = await fetch(`${API_BASE}/teams/students/available`, {
      headers: getHeaders(),
    });
    return handleResponse<{ students: User[] }>(res);
  },

  async addTeamMember(teamId: string, studentId: string) {
    const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentId }),
    });
    return handleResponse<{ message: string }>(res);
  },

  async removeTeamMember(teamId: string, studentId: string) {
    const res = await fetch(`${API_BASE}/teams/${teamId}/members/${studentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async joinTeam(teamId: string | null) {
    const res = await fetch(`${API_BASE}/teams/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ teamId }),
    });
    return handleResponse<{ user: User; team: Team | null; message: string }>(res);
  },

  async getMyTeam() {
    const res = await fetch(`${API_BASE}/teams/my-team`, {
      headers: getHeaders(),
    });
    return handleResponse<{ team: Team | null }>(res);
  },

  // Analytics
  async getAnalytics(filters?: { userId?: string; teamId?: string } | string) {
    const params = new URLSearchParams();
    if (typeof filters === 'string') {
      if (filters) params.append('userId', filters);
    } else if (filters) {
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.teamId) params.append('teamId', filters.teamId);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/analytics${query}`, {
      headers: getHeaders(),
    });
    return handleResponse<AnalyticsData>(res);
  },
};
