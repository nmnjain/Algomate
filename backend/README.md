# AlgoMate Resume Analysis Backend

A FastAPI-based backend service that provides OCR (Optical Character Recognition) and AI-powered analysis for resume documents. This service integrates with the AlgoMate dashboard to process uploaded resumes and provide structured insights.

## Features

- **OCR Processing**: Extract text from PDF and image files (JPG, PNG)
- **AI Analysis**: Use Google Gemini AI for intelligent resume analysis
- **Structured Output**: Skills extraction, experience level assessment, focus areas identification
- **Background Processing**: Asynchronous resume processing with status tracking
- **Database Integration**: Seamless integration with Supabase
- **RESTful API**: Clean API endpoints for frontend integration

## Architecture

```
Frontend (React) → FastAPI Backend → OCR Service → AI Analysis → Supabase Database
                                  ↓
                               File Storage (Supabase Storage)
```

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PyPDF2**: PDF text extraction
- **Tesseract OCR**: Image text extraction
- **Google Gemini AI**: Intelligent resume analysis
- **Supabase**: Database and file storage
- **Docker**: Containerization for easy deployment

## Prerequisites

- Python 3.11 or higher
- Tesseract OCR
- Google Gemini API key
- Supabase project with service key

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate.bat  # Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Install Tesseract OCR:**
   - **Ubuntu/Debian:** `sudo apt-get install tesseract-ocr tesseract-ocr-eng`
   - **macOS:** `brew install tesseract`
   - **Windows:** Download from [Tesseract Wiki](https://github.com/UB-Mannheim/tesseract/wiki)

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. **Start the server:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

Create a `.env` file with the following variables:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Optional: Additional configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
LOG_LEVEL=INFO
```

### Getting API Keys

1. **Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Supabase Credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the URL and service role key

## API Endpoints

### Health Check
```http
GET /
```
Returns API status and version information.

### Start Resume Analysis
```http
POST /analyze-resume
Content-Type: application/json

{
  "file_url": "https://signed-url-to-resume-file",
  "file_path": "user_id/resume_filename.pdf",
  "user_id": "user-uuid",
  "supabase_url": "optional-override",
  "supabase_service_key": "optional-override"
}
```

### Check Analysis Status
```http
GET /analysis-status/{analysis_id}
```
Returns the current processing status of a resume analysis.

## OCR Processing

The service supports multiple file formats:

- **PDF Files**: Uses PyPDF2 for text extraction
- **Image Files**: Uses Tesseract OCR for JPG, JPEG, PNG files

### OCR Confidence Scoring

- **PDF**: Confidence based on text length and structure
- **Images**: Tesseract confidence scores averaged across detected text regions

## AI Analysis

The AI analysis provides structured insights including:

- **Skills Extraction**: Technical and soft skills identification
- **Experience Level**: Entry, Mid, Senior, or Expert classification
- **Focus Areas**: Primary areas of expertise
- **Detailed Insights**: Comprehensive analysis of strengths and career progression
- **Recommendations**: Actionable suggestions for improvement

### AI Prompt Engineering

The service uses carefully crafted prompts to ensure consistent, structured output from Gemini AI. Fallback mechanisms handle cases where AI responses are malformed.

## Database Schema

The service interacts with these Supabase tables:

### `resume_analysis`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- file_path: VARCHAR(500)
- file_name: VARCHAR(255)
- extracted_text: TEXT
- ocr_confidence: DECIMAL(5,2)
- skills: JSONB
- experience_level: VARCHAR(50)
- focus_areas: JSONB
- ai_insights: TEXT
- recommendations: JSONB
- processing_status: VARCHAR(50)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### `user_platform_data` (cache)
```sql
- platform: 'resume'
- data: JSONB (analysis results for dashboard)
```

## Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t algomate-resume-api .

# Run container
docker run -p 8000:8000 --env-file .env algomate-resume-api
```

### Docker Compose (with Tesseract)

```yaml
version: '3.8'
services:
  resume-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    volumes:
      - ./logs:/app/logs
```

## Error Handling

The service implements comprehensive error handling:

- **File Processing Errors**: Invalid formats, corrupted files
- **OCR Failures**: Fallback to alternative processing methods
- **AI Analysis Errors**: Fallback to rule-based analysis
- **Database Errors**: Graceful degradation with status updates

## Performance Considerations

- **Background Processing**: Resume analysis runs asynchronously
- **Caching**: Results cached in `user_platform_data` for fast dashboard loading
- **File Size Limits**: 10MB maximum file size
- **Rate Limiting**: Implement based on your API quotas

## Monitoring and Logging

- Health check endpoint for uptime monitoring
- Structured logging for debugging
- Status tracking in database
- Error reporting with detailed messages

## Testing

Run tests with pytest:

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/ -v
```

## Production Deployment

### Environment Setup
1. Use production Supabase project
2. Set up proper CORS origins
3. Configure logging level
4. Set up monitoring and alerts

### Scalability
- Deploy multiple instances behind a load balancer
- Use Redis for shared caching
- Implement job queues for high-volume processing

### Security
- Validate all file uploads
- Sanitize extracted text
- Implement rate limiting
- Use secure environment variable management

## Troubleshooting

### Common Issues

1. **Tesseract not found**
   - Ensure Tesseract is installed and in PATH
   - Set `TESSERACT_CMD` environment variable if needed

2. **Gemini API errors**
   - Verify API key is correct
   - Check API quotas and limits
   - Ensure proper internet connectivity

3. **Supabase connection issues**
   - Verify URL and service key
   - Check database permissions
   - Ensure tables exist with correct schema

4. **OCR quality issues**
   - Ensure images are high resolution
   - Use good quality scans
   - Consider preprocessing images for better OCR

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the AlgoMate application suite.