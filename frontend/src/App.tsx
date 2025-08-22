import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInput from './components/ChatInput';
import ResponseModal from './components/ResponseModal';
import ToastContainer from './components/ToastContainer';
import { apiService, type ApiResponse } from './services/api';
import { useToast } from './hooks/useToast';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const { toasts, removeToast, showError, showSuccess } = useToast();

  const handleFilesSelected = (files: File[]) => {
    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        invalidFiles.push(`${file.name}: Invalid file type (only images and PDFs allowed)`);
      } else if (!isValidSize) {
        invalidFiles.push(`${file.name}: File too large (max 10MB)`);
      } else {
        validFiles.push(file);
      }
    });
    
    // Show error toasts for invalid files
    invalidFiles.forEach(error => {
      showError(error);
    });
    
    // Show success toast if valid files were added
    if (validFiles.length > 0) {
      showSuccess(`${validFiles.length} file(s) uploaded successfully`);
    }
    
    setUploadedFiles(validFiles);
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setModalOpen(true);
    setApiResponse(null);

    try {
      const response: ApiResponse = await apiService.sendMessage({
        message,
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });

      // Check if the API returned an error
      if (!response.success) {
        const errorMessage = response.error || 'An unknown error occurred';
        showError(`API Error: ${errorMessage}`);
        
        // Still show the response in modal for debugging
        setApiResponse(response);
      } else {
        // Success case
        setApiResponse(response);
        showSuccess('Message sent successfully!');
        
        // Clear uploaded files after successful sending
        if (uploadedFiles.length > 0) {
          setUploadedFiles([]);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      showError(`Network Error: ${errorMessage}`);
      
      setApiResponse({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setApiResponse(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hackathon Chat Assistant</h1>
        <p>Upload images or PDFs and chat with AI</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            uploadedFiles={uploadedFiles}
          />
        </div>
      </main>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        hasFiles={uploadedFiles.length > 0}
      />

      <ResponseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        response={apiResponse}
        isLoading={isLoading}
      />

      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
}

export default App;
