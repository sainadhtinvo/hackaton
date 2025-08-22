# Hackathon Chat Assistant - Frontend Setup

A modern React application for uploading files (images/PDFs) and chatting with an AI assistant.

## Features

- 🎯 **Drag & Drop File Upload**: Upload images and PDFs with intuitive drag-and-drop interface
- 💬 **Chat Interface**: Clean chat input at the bottom with auto-resize textarea
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔄 **Real-time API Integration**: Send messages and files to your backend API
- 📊 **Response Modal**: Display API responses in a beautiful modal with syntax highlighting
- ✨ **Modern UI**: Beautiful gradient background and smooth animations

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API Endpoint

Edit `src/config.ts` to update your API URL:

```typescript
export const config = {
  apiUrl: 'http://your-backend-url/api', // Update this
  // ... other settings
};
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## File Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── FileUpload.tsx   # Drag & drop file upload
│   │   ├── ChatInput.tsx    # Bottom chat input
│   │   └── ResponseModal.tsx # API response modal
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── config.ts            # App configuration
│   ├── App.tsx              # Main app component
│   └── App.css              # Global styles
```

## API Integration

The app expects your backend API to have these endpoints:

### POST `/api/chat/message`
Send a text message only:
```json
{
  "message": "Your message here"
}
```

### POST `/api/chat/upload`
Send message with files (multipart/form-data):
- `message`: Text message
- `file_0`, `file_1`, etc.: Uploaded files

### Response Format
Your API should return responses in this format:
```json
{
  "success": true,
  "data": "Your response content",
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Customization

### File Upload Settings
Edit `src/config.ts`:
- `maxFileSize`: Maximum file size in MB
- `allowedFileTypes`: Array of allowed MIME types
- `maxFilesPerUpload`: Maximum number of files per upload

### Styling
- `src/App.css`: Main app styles and layout
- `src/components/*.css`: Component-specific styles

### API Service
- `src/services/api.ts`: Customize API calls and error handling

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with modern JavaScript support

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure your backend includes proper CORS headers for your frontend domain.

### File Upload Limits
Check both frontend config (`maxFileSize`) and your backend's file upload limits.

### API Connection
Verify the API URL in `src/config.ts` matches your backend server.

## Need Help?

1. Check the browser console for error messages
2. Verify your API endpoints are working with a tool like Postman
3. Ensure your backend is running and accessible
4. Check network tab in browser dev tools for API call details
