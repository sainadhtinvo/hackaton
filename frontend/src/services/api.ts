import config from '../config';

// API configuration
const API_BASE_URL = config.apiUrl;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  files?: File[];
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async makeFormDataRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Send message with optional files
  async sendMessage(request: ChatRequest): Promise<ApiResponse> {
    if (request.files && request.files.length > 0) {
      // If files are present, use FormData
      const formData = new FormData();
      formData.append('message', request.message);
      
      request.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      return this.makeFormDataRequest('/chat/upload', formData);
    } else {
      // If no files, send as JSON
      return this.makeRequest('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message: request.message }),
      });
    }
  }

  // Upload files only
  async uploadFiles(files: File[]): Promise<ApiResponse> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    return this.makeFormDataRequest('/upload', formData);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  // Get chat history (if your API supports it)
  async getChatHistory(): Promise<ApiResponse> {
    return this.makeRequest('/chat/history');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate file types
export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  return allowedTypes.includes(file.type);
};

// Helper function to validate file size (default 10MB limit)
export const validateFileSize = (file: File, maxSizeInMB: number = 10): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export default apiService;
