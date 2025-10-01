/**
 * API Client Library
 * Connects frontend to backend with authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  userAddress?: string;
}

/**
 * Main API client class
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP request with authentication
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { userAddress, headers, ...restOptions } = options;

    const requestHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add user address for RLS authentication
    if (userAddress) {
      (requestHeaders as Record<string, string>)['x-user-address'] = userAddress;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

/**
 * API endpoints and methods
 */
export const api = {
  // Auth
  auth: {
    register: (params: { address: string; email: string; name: string; role: 'PATIENT' | 'DOCTOR' | 'INSTITUTION' | 'INSURANCE' }) =>
      apiClient.post('/register', params),
    login: (params: { address?: string; email?: string; password?: string }) =>
      apiClient.post('/login', params),
    setPassword: (userAddress: string, body: { password: string }) =>
      apiClient.post('/set-password', body, { userAddress }),
  },

  // Health check
  health: {
    check: () => apiClient.healthCheck(),
  },

  // User profile
  profile: {
    get: (userAddress: string) =>
      apiClient.get('/profile', { userAddress }),
    update: (
      userAddress: string,
      body: Partial<{ name: string; email: string; phone: string; avatar: string }>
    ) => apiClient.put('/profile', body, { userAddress }),
  },

  // Invoices
  invoices: {
    list: (userAddress: string) =>
      apiClient.get('/invoices', { userAddress }),
    get: (id: string, userAddress: string) =>
      apiClient.get(`/invoices/${id}`, { userAddress }),
  },

  // Medical records
  medicalRecords: {
    list: (userAddress: string) =>
      apiClient.get('/medical-records', { userAddress }),
    get: (id: string, userAddress: string) =>
      apiClient.get(`/medical-records/${id}`, { userAddress }),
  },

  // Prescriptions
  prescriptions: {
    list: (userAddress: string) =>
      apiClient.get('/prescriptions', { userAddress }),
    get: (id: string, userAddress: string) =>
      apiClient.get(`/prescriptions/${id}`, { userAddress }),
  },

  // Insurance
  insurance: {
    packages: () => apiClient.get('/insurance-packages'),
    my: (userAddress: string) =>
      apiClient.get('/my-insurance', { userAddress }),
  },

  // Products
  products: {
    list: (params?: { category?: string; institutionId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return apiClient.get(`/products${query ? `?${query}` : ''}`);
    },
  },
};

export default api;

