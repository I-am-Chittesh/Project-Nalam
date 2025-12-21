# Nalam API Server Setup

## Installation

Install Flask and CORS support:
```bash
pip install flask flask-cors
```

## Running the Server

Start the API server in a separate terminal:
```bash
python api_server.py
```

The server will start on `http://localhost:5000` with the following endpoints:

### Endpoints

#### POST /api/chat
Processes a user message and returns an AI response.

**Request:**
```json
{
  "message": "What services are available?",
  "language": "en"
}
```

**Response:**
```json
{
  "response_text": "Welcome! We offer various government services...",
  "language_code": "en"
}
```

#### GET /api/health
Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Nalam API server is running"
}
```

## Configuration

The API server uses the same Gemini API keys as nalam.py:
- Primary: `AIzaSyDqBrTJOy8bGnZToQmn-Xajp-h8vMj_8DQ`
- Secondary: `AIzaSyCpmLq58_7uqFQqHMLIVpc9YLSXEAscCCc`

Override via environment variables:
```bash
set GEMINI_API_KEY_PRIMARY=your_primary_key
set GEMINI_API_KEY_SECONDARY=your_secondary_key
python api_server.py
```

## Network Configuration

By default, the server listens on `0.0.0.0:5000` (all interfaces).

### For Local Development (Same Machine)
Update `AIInteractiveScreen.js`:
```javascript
const API_SERVER = 'http://localhost:5000';
```

### For Mobile Emulator / Different Machine
Update `AIInteractiveScreen.js` to your server's IP:
```javascript
const API_SERVER = 'http://192.168.x.x:5000'; // Replace with your server IP
```

## Integration with React Native

The `AIInteractiveScreen.js` now:
- Sends user messages to the API server
- Displays AI responses with language persistence
- Handles loading states and error messages
- Maintains conversation history

The existing "AI Mode" button on `HomeScreen.js` already navigates to this enhanced screen.
