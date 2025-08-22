import React, { useEffect, useRef } from 'react';
import './ResponseModal.css';

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: unknown;
  isLoading?: boolean;
}

const ResponseModal: React.FC<ResponseModalProps> = ({ 
  isOpen, 
  onClose, 
  response, 
  isLoading = false 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isStructuredResponse = (data: unknown): data is { score?: number; issues?: string[]; suggestions?: string[] } => {
    return typeof data === 'object' && data !== null && 
           ('score' in data || 'issues' in data || 'suggestions' in data);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    if (score >= 40) return '#ef4444'; // Red
    return '#dc2626'; // Dark red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const formatResponse = (data: unknown): string => {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      // Check if it's a common response format
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      if ('text' in data && typeof data.text === 'string') {
        return data.text;
      }
      if ('content' in data && typeof data.content === 'string') {
        return data.content;
      }
      if ('response' in data) {
        return typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
      }
      
      // Fallback to JSON stringify
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isLoading ? 'Processing...' : 'API Response'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner-large"></div>
              <p className="loading-text">Processing your request...</p>
            </div>
          ) : (
            <div className="response-container">
              {response && typeof response === 'object' && 'data' in response && isStructuredResponse(response.data) ? (
                // Structured response display
                <div className="structured-response">
                  {/* Score Section */}
                  {typeof response.data.score === 'number' && (
                    <div className="score-section">
                      <div className="score-header">
                        <h3>Requirements Score</h3>
                      </div>
                      <div className="score-display">
                        <div 
                          className="score-circle"
                          style={{ borderColor: getScoreColor(response.data.score) }}
                        >
                          <span 
                            className="score-number"
                            style={{ color: getScoreColor(response.data.score) }}
                          >
                            {response.data.score}
                          </span>
                          <span className="score-total">/100</span>
                        </div>
                        <div className="score-info">
                          <span 
                            className="score-label"
                            style={{ color: getScoreColor(response.data.score) }}
                          >
                            {getScoreLabel(response.data.score)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues Section */}
                  {response.data.issues && response.data.issues.length > 0 && (
                    <div className="issues-section">
                      <h3 className="section-title">
                        <span className="section-icon">🚨</span>
                        Issues Found
                      </h3>
                      <div className="issues-list">
                        {response.data.issues.map((issue, index) => (
                          <div key={index} className="issue-item">
                            <span className="issue-text">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions Section */}
                  {response.data.suggestions && response.data.suggestions.length > 0 && (
                    <div className="suggestions-section">
                      <h3 className="section-title">
                        <span className="section-icon">💡</span>
                        Suggestions
                      </h3>
                      <div className="suggestions-list">
                        {response.data.suggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <span className="suggestion-bullet">•</span>
                            <span className="suggestion-text">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback to original response display
                <div className="response-content">
                  <pre className="response-text">{formatResponse(response)}</pre>
                </div>
              )}
              
              {response && typeof response === 'object' && (
                <div className="response-metadata">
                  <h3>Response Details</h3>
                  <div className="metadata-item">
                    <span className="metadata-label">Type:</span>
                    <span className="metadata-value">{typeof response}</span>
                  </div>
                  {'timestamp' in response && typeof response.timestamp === 'string' && (
                    <div className="metadata-item">
                      <span className="metadata-label">Timestamp:</span>
                      <span className="metadata-value">{new Date(response.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                  {'status' in response && (
                    <div className="metadata-item">
                      <span className="metadata-label">Status:</span>
                      <span className="metadata-value">{String(response.status)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="modal-button secondary" onClick={onClose}>
            Close
          </button>
          {!isLoading && response && (
            <button 
              className="modal-button primary"
              onClick={() => {
                navigator.clipboard.writeText(formatResponse(response));
                // You could add a toast notification here
              }}
            >
              Copy Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
