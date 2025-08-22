// Application configuration
export const config = {
  // API Configuration - Update this to match your backend URL
  apiUrl: import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  
  // File upload limits
  maxFileSize: 10, // MB
  allowedFileTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  
  // UI Configuration
  maxFilesPerUpload: 10,
  
  // Development settings
  isDevelopment: import.meta.env.MODE === 'development',
} as const;

export default config;
