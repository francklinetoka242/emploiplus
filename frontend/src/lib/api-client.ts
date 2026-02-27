/**
 * API CLIENT - Centralized HTTP client for API calls
 * Provides a simple interface for making HTTP requests with authentication
 */

import { apiFetch, authHeaders, getApiBaseUrl, buildApiUrl } from '@/lib/headers';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  statusText: string;
}

/**
 * API Client for making HTTP requests
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseUrl = buildApiUrl('');
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return buildApiUrl(endpoint);
  }

  /**
   * Make GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    endpoint: string,
    data: any = undefined,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    endpoint: string,
    data: any = undefined,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data: any = undefined,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Internal method to make all requests
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = {
      ...this.defaultHeaders,
      ...authHeaders(undefined, 'adminToken'),
      ...options.headers,
    };

    const init: RequestInit = {
      method,
      headers,
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      init.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, init);
      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        };
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error);

      if (error.status) {
        return {
          error: error.data?.message || error.statusText || 'Unknown error',
          status: error.status,
          statusText: error.statusText,
        };
      }

      return {
        error: error?.message || 'Network error',
        status: 0,
        statusText: 'Network Error',
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type
export type { ApiResponse };
