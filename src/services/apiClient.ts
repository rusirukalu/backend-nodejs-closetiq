// src/services/apiClient.ts - API Client for AI Backend Communication
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AI_BACKEND_URL || 'http://localhost:5002',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET method
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST method
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT method
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE method
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload method for Node.js
  async uploadFile<T = any>(url: string, fileBuffer: Buffer, filename: string, mimetype: string): Promise<T> {
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: mimetype
    });

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...formData.getHeaders(),
      },
    });
  }

  // Batch file upload method
  async uploadFiles<T = any>(url: string, files: Array<{ buffer: Buffer; filename: string; mimetype: string }>): Promise<T> {
    const FormData = require('form-data');
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file.buffer, {
        filename: file.filename,
        contentType: file.mimetype
      });
    });

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...formData.getHeaders(),
      },
    });
  }
}

export default new ApiClient();
