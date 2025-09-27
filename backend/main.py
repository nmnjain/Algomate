import asyncio
import os
import tempfile
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import aiohttp
import PyPDF2
import pytesseract
from PIL import Image
from pydantic import BaseModel
import io
import json
from hackathon_recommender import find_matching_teammates, generate_and_store_recommendations 
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
import google.generativeai as genai
from supabase import create_client, Client

# Environment variables with production defaults (MUST BE BEFORE APP INITIALIZATION)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", 8000))

# Debug: Print environment configuration
print("=" * 50)
print("🚀 BACKEND SERVICE STARTUP DEBUG")
print("=" * 50)
print(f"ENVIRONMENT: {ENVIRONMENT}")
print(f"PORT: {PORT}")
print(f"GEMINI_API_KEY: {'✓ Configured' if GEMINI_API_KEY else '✗ Missing'}")
print(f"SUPABASE_URL: {'✓ Configured' if SUPABASE_URL else '✗ Missing'}")
print(f"SUPABASE_SERVICE_KEY: {'✓ Configured' if SUPABASE_SERVICE_KEY else '✗ Missing'}")

# CORS configuration from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
print(f"ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")
print("=" * 50)

# Production environment checks
if ENVIRONMENT == "production":
    print("🔍 Production environment checks...")
    if not GEMINI_API_KEY:
        print("❌ ERROR: GEMINI_API_KEY is required in production")
        raise ValueError("GEMINI_API_KEY is required in production")
    if not SUPABASE_URL:
        print("❌ ERROR: SUPABASE_URL is required in production")
        raise ValueError("SUPABASE_URL is required in production")
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERROR: SUPABASE_SERVICE_KEY is required in production")
        raise ValueError("SUPABASE_SERVICE_KEY is required in production")
    print("✅ Production environment checks passed")
else:
    print("🛠️ Running in development mode")

# Initialize FastAPI app with production configuration
print("🚀 Initializing FastAPI app...")
app = FastAPI(
    title="AlgoMate Resume Analysis API",
    description="OCR and AI-powered resume analysis service",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,  # Disable docs in production
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
)
print("✅ FastAPI app initialized")

# Security middleware - Trust only specific hosts in production
if ENVIRONMENT == "production":
    print("🔒 Adding trusted host middleware for production...")
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.vercel.app", "*.railway.app", "*.render.com", "localhost"]
    )
    print("✅ Trusted host middleware added")

# CORS configuration from environment variables
print("🌐 Setting up CORS middleware...")
print(f"CORS Allowed Origins: {ALLOWED_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Length", "X-JSON"],
    max_age=86400,  # 24 hours
)
print("✅ CORS middleware added")

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    print(f"🔒 Processing request: {request.method} {request.url}")
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    print(f"✅ Security headers added, response status: {response.status_code}")
    return response

# Initialize Gemini AI with working configuration from original code
print("🤖 Initializing Gemini AI...")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,  # Increased from 4096 to allow complete responses
        }
        
        model = genai.GenerativeModel(
            'gemini-2.5-flash',  # Use correct model name
            generation_config=generation_config
        )
        print("✅ Gemini AI initialized successfully")
        print(f"Model: gemini-1.5-flash")
        print(f"Config: {generation_config}")
    except Exception as e:
        print(f"❌ Failed to initialize Gemini AI: {str(e)}")
        model = None
else:
    print("⚠️ Gemini API key not provided - using fallback analysis")
    model = None

# Initialize Supabase client
print("🗄️ Initializing Supabase client...")
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase client initialized successfully")
        print(f"Supabase URL: {SUPABASE_URL}")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {str(e)}")
        supabase = None
else:
    print("⚠️ Supabase credentials not provided - database operations will fail")
    supabase = None

print("=" * 50)
print("🎯 BACKEND SERVICE READY")
print("=" * 50)

# Request/Response models
class ResumeAnalysisRequest(BaseModel):
    file_url: HttpUrl
    file_path: str
    user_id: str
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None

class TeammateRequest(BaseModel):
    hackathon_id: str
    user_id: str

class OCRResult(BaseModel):
    extracted_text: str
    confidence: float
    processing_time: float

class AIAnalysisResult(BaseModel):
    skills: Dict[str, Any]  # Changed from Dict[str, List[str]] to Dict[str, Any]
    experience_level: str
    focus_areas: List[str]
    insights: str
    recommendations: List[Dict[str, Any]]
    
    # Add all the new fields your prompt generates
    experience_analysis: Optional[Dict[str, Any]] = {}
    project_analysis: Optional[Dict[str, Any]] = {}
    education_analysis: Optional[Dict[str, Any]] = {}
    resume_quality: Optional[Dict[str, Any]] = {}
    skill_gap_analysis: Optional[Dict[str, Any]] = {}
    market_competitiveness: Optional[Dict[str, Any]] = {}
    industry_alignment: Optional[Dict[str, Any]] = {}
    detailed_recommendations: Optional[List[Dict[str, Any]]] = []
    ats_optimization: Optional[Dict[str, Any]] = {}
    interview_preparation: Optional[Dict[str, Any]] = {}
    career_trajectory: Optional[Dict[str, Any]] = {}
    red_flags: Optional[List[str]] = []
    standout_qualities: Optional[List[str]] = []
    overall_insights: Optional[str] = ""

class ResumeAnalysisResponse(BaseModel):
    analysis_id: str
    ocr_result: OCRResult
    ai_analysis: AIAnalysisResult
    processing_status: str

# OCR Service Class
class OCRService:
    @staticmethod
    async def extract_text_from_pdf(file_content: bytes) -> tuple[str, float]:
        """Extract text from PDF using PyPDF2"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            extracted_text = ""
            
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            
            # Simple confidence calculation based on text length
            confidence = min(95.0, max(50.0, len(extracted_text.strip()) / 10))
            
            return extracted_text.strip(), confidence
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF text extraction failed: {str(e)}")

    @staticmethod
    async def extract_text_from_image(file_content: bytes) -> tuple[str, float]:
        """Extract text from image using Tesseract OCR"""
        try:
            # Open image
            image = Image.open(io.BytesIO(file_content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using Tesseract
            custom_config = r'--oem 3 --psm 6'
            extracted_text = pytesseract.image_to_string(image, config=custom_config)
            
            # Get confidence data
            confidence_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in confidence_data['conf'] if int(conf) > 0]
            average_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return extracted_text.strip(), float(average_confidence)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image text extraction failed: {str(e)}")

    @staticmethod
    async def process_file(file_url: str, mime_type: str) -> tuple[str, float]:
        """Process file based on MIME type"""
        print(f"📁 Processing file: {file_url}")
        print(f"MIME type: {mime_type}")
        
        try:
            # Download file
            print("⬇️ Downloading file...")
            async with aiohttp.ClientSession() as session:
                async with session.get(file_url) as response:
                    print(f"Download response status: {response.status}")
                    if response.status != 200:
                        error_msg = f"Failed to download file, status: {response.status}"
                        print(f"❌ {error_msg}")
                        raise HTTPException(status_code=400, detail="Failed to download file")
                    
                    file_content = await response.read()
                    print(f"✅ File downloaded successfully: {len(file_content)} bytes")
            
            # Process based on file type
            if mime_type == 'application/pdf':
                print("🔍 Processing as PDF...")
                result = await OCRService.extract_text_from_pdf(file_content)
            elif mime_type in ['image/jpeg', 'image/jpg', 'image/png']:
                print("🔍 Processing as image...")
                result = await OCRService.extract_text_from_image(file_content)
            else:
                error_msg = f"Unsupported file type: {mime_type}"
                print(f"❌ {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)
            
            print(f"✅ File processed successfully")
            return result
        
        except Exception as e:
            print(f"❌ File processing failed: {str(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

# AI Analysis Service Class
class AIAnalysisService:
    
    @staticmethod
    def create_optimized_analysis_prompt(extracted_text: str) -> str:
        """Create optimized prompt that ensures complete JSON response with better structure"""
        return f"""
You are a technical recruiter analyzing resumes. You must respond with ONLY a valid JSON object - no markdown formatting, no explanations, no additional text.

RESUME TEXT:
{extracted_text}

Analyze this resume and return ONLY the following JSON structure with all fields populated:

{{
    "skills": {{
        "technical": {{
            "programming_languages": ["list all programming languages found"],
            "frameworks_libraries": ["list all frameworks and libraries"],
            "databases": ["list all databases"],
            "cloud_platforms": ["AWS, Azure, GCP, etc."],
            "devops_tools": ["Docker, Kubernetes, Jenkins, etc."],
            "other_technical": ["any other technical skills"]
        }},
        "soft_skills": ["communication", "leadership", "problem-solving", "etc"],
        "certifications": ["list any certifications mentioned"],
        "missing_critical_skills": ["skills they should have for their level"]
    }},
    "experience_analysis": {{
        "level": "Fresher",
        "total_experience_years": "0.0 years",
        "career_progression": "description of career path",
        "industry_exposure": ["industries they have experience in"],
        "gaps_in_employment": "any employment gaps or N/A"
    }},
    "project_analysis": {{
        "project_quality": "Exceptional",
        "technical_complexity": "High",
        "business_impact": "description of business value demonstrated",
        "standout_projects": ["list of most impressive projects"],
        "missing_project_types": ["types of projects they should add"]
    }},
    "education_analysis": {{
        "degree_relevance": "how relevant their education is to tech roles",
        "institution_tier": "Tier1",
        "academic_performance": "Excellent",
        "additional_courses": ["online courses, certifications, etc"]
    }},
    "resume_quality": {{
        "overall_score": "8/10",
        "formatting": "Professional",
        "content_clarity": "Clear",
        "quantified_achievements": "Strong"
    }},
    "skill_gap_analysis": {{
        "for_current_level": ["skills missing for current level"],
        "for_next_level": ["skills needed for advancement"],
        "trending_technologies": ["2024-25 trending technologies to learn"],
        "learning_priority": {{
            "high": ["skills to learn in next 3 months"],
            "medium": ["skills to learn in 6 months"],
            "low": ["skills to learn in 1 year"]
        }}
    }},
    "market_competitiveness": {{
        "overall_rating": "Competitive",
        "salary_range_estimate": "salary range based on experience and location",
        "target_companies": ["types of companies they should target"],
        "competitive_advantages": ["what makes them stand out"],
        "major_weaknesses": ["what hurts their competitiveness"]
    }},
    "industry_alignment": {{
        "best_fit_roles": ["most suitable job roles"],
        "emerging_opportunities": ["new roles they could pivot to"],
        "remote_work_readiness": "assessment of remote work suitability"
    }},
    "detailed_recommendations": [
        {{
            "category": "Technical Skills",
            "recommendation": "specific technical skills to develop",
            "impact": "High",
            "timeframe": "3 months",
            "resources": ["specific learning resources"]
        }},
        {{
            "category": "Projects",
            "recommendation": "project ideas to build",
            "impact": "High",
            "timeframe": "6 months",
            "resources": ["project guidance resources"]
        }},
        {{
            "category": "Experience",
            "recommendation": "career development advice",
            "impact": "Medium",
            "timeframe": "ongoing",
            "resources": ["networking and job search resources"]
        }},
        {{
            "category": "Resume",
            "recommendation": "resume improvement suggestions",
            "impact": "Medium",
            "timeframe": "1 week",
            "resources": ["resume tools and templates"]
        }}
    ],
    "ats_optimization": {{
        "current_ats_score": "75/100",
        "missing_keywords": ["important keywords for their field"],
        "formatting_issues": ["ATS formatting problems"],
        "improvements_needed": ["specific ATS improvements"]
    }},
    "interview_preparation": {{
        "technical_readiness": "Moderate",
        "likely_interview_topics": ["topics they should prepare for"],
        "preparation_suggestions": ["interview prep recommendations"]
    }},
    "career_trajectory": {{
        "next_logical_step": "immediate next career move",
        "5_year_potential": "where they could be in 5 years",
        "career_pivot_options": ["alternative career paths"]
    }},
    "red_flags": ["any concerning resume patterns"],
    "standout_qualities": ["unique strengths that make them memorable"],
    "overall_insights": "comprehensive 2-3 sentence analysis summary",
    "experience_level": "Fresher",
    "focus_areas": ["main technical focus areas"],
    "insights": "key insights about their profile",
    "recommendations": [
        {{
            "category": "Skills",
            "recommendation": "skill development advice",
            "priority": "High"
        }}
    ]
}}

CRITICAL INSTRUCTIONS:
- Respond with ONLY the JSON object above
- Fill ALL fields with relevant content - no empty arrays or null values
- Use realistic assessments based on the resume content
- Be specific and actionable in recommendations
- No markdown formatting, no code blocks, no explanatory text
"""

    @staticmethod 
    async def analyze_resume(extracted_text: str) -> AIAnalysisResult:
        print("🤖 Starting AI analysis...")
        print(f"Input text length: {len(extracted_text)} characters")
        
        if not model:
            print("❌ No AI model available - analysis cannot proceed")
            raise Exception("AI model not configured - cannot perform analysis")
        
        max_retries = 2  # Reduced retries since we have better prompting
        for attempt in range(max_retries):
            print(f"🔄 Analysis attempt {attempt + 1}/{max_retries}")
            
            try:
                if attempt > 0:
                    wait_time = 3  # Shorter wait time
                    print(f"⏳ Waiting {wait_time} seconds before retry...")
                    await asyncio.sleep(wait_time)
                
                prompt = AIAnalysisService.create_optimized_analysis_prompt(extracted_text)
                print("📝 Generated optimized analysis prompt")
                
                # Use asyncio.wait_for for timeout control  
                print("🚀 Sending request to Gemini API...")
                response = await asyncio.wait_for(
                    asyncio.to_thread(model.generate_content, prompt),
                    timeout=60.0  # Increased timeout for longer responses
                )
                print("✅ Received response from Gemini API")
                
                # Parse JSON response
                response_text = response.text.strip()
                print(f"Raw response length: {len(response_text)} characters")
                print(f"Response preview: {response_text[:200]}...")
                
                # The response should be pure JSON due to response_mime_type setting
                try:
                    analysis_data = json.loads(response_text)
                    print("✅ JSON parsed successfully on first attempt")
                    
                except json.JSONDecodeError as e:
                    print(f"⚠️ JSON parse error: {str(e)}")
                    print("🔧 Attempting to clean response...")
                    
                    # Remove any potential markdown formatting
                    cleaned_text = response_text
                    if "```json" in cleaned_text:
                        start = cleaned_text.find("```json") + 7
                        end = cleaned_text.rfind("```")
                        if end > start:
                            cleaned_text = cleaned_text[start:end].strip()
                    elif "```" in cleaned_text:
                        # Remove any other code block formatting
                        cleaned_text = re.sub(r'```[\w]*\n?', '', cleaned_text)
                        cleaned_text = cleaned_text.strip()
                    
                    # Find JSON boundaries
                    start_brace = cleaned_text.find('{')
                    end_brace = cleaned_text.rfind('}')
                    if start_brace >= 0 and end_brace > start_brace:
                        cleaned_text = cleaned_text[start_brace:end_brace + 1]
                    
                    # Try parsing cleaned version
                    try:
                        analysis_data = json.loads(cleaned_text)
                        print("✅ JSON parsed successfully after cleaning")
                    except json.JSONDecodeError as e2:
                        print(f"❌ Cleaning failed: {str(e2)}")
                        if attempt < max_retries - 1:
                            print("🔄 Retrying with fresh request...")
                            continue
                        else:
                            print("❌ All parsing attempts failed")
                            raise Exception("Failed to parse AI response after all attempts")
                
                # Validate that we have a complete analysis
                required_fields = [
                    'skills', 'experience_analysis', 'project_analysis', 
                    'education_analysis', 'resume_quality', 'skill_gap_analysis',
                    'market_competitiveness', 'industry_alignment'
                ]
                
                missing_fields = [field for field in required_fields if field not in analysis_data or not analysis_data[field]]
                if missing_fields:
                    print(f"⚠️ Missing required fields: {missing_fields}")
                    if attempt < max_retries - 1:
                        print("🔄 Retrying for complete analysis...")
                        continue
                    else:
                        raise Exception(f"Incomplete analysis - missing fields: {missing_fields}")
                
                # Validate required fields and create result
                print("📊 Creating AI analysis result...")
                
                # Ensure all required fields exist with defaults
                skills = analysis_data.get("skills", {})
                if not isinstance(skills, dict):
                    skills = {"technical": [], "soft": []}
                
                result = AIAnalysisResult(
                    skills=skills,
                    experience_level=analysis_data.get("experience_level", "Entry"),
                    focus_areas=analysis_data.get("focus_areas", []),
                    insights=analysis_data.get("overall_insights", analysis_data.get("insights", "")),
                    recommendations=analysis_data.get("recommendations", analysis_data.get("detailed_recommendations", [])),
                    
                    # All additional fields
                    experience_analysis=analysis_data.get("experience_analysis", {}),
                    project_analysis=analysis_data.get("project_analysis", {}),
                    education_analysis=analysis_data.get("education_analysis", {}),
                    resume_quality=analysis_data.get("resume_quality", {}),
                    skill_gap_analysis=analysis_data.get("skill_gap_analysis", {}),
                    market_competitiveness=analysis_data.get("market_competitiveness", {}),
                    industry_alignment=analysis_data.get("industry_alignment", {}),
                    detailed_recommendations=analysis_data.get("detailed_recommendations", []),
                    ats_optimization=analysis_data.get("ats_optimization", {}),
                    interview_preparation=analysis_data.get("interview_preparation", {}),
                    career_trajectory=analysis_data.get("career_trajectory", {}),
                    red_flags=analysis_data.get("red_flags", []),
                    standout_qualities=analysis_data.get("standout_qualities", []),
                    overall_insights=analysis_data.get("overall_insights", "")
                )
                
                print("✅ Complete AI analysis result created successfully")
                return result
                
            except asyncio.TimeoutError:
                print(f"⏰ Timeout on attempt {attempt + 1}")
                if attempt == max_retries - 1:
                    print("❌ Analysis failed due to timeout")
                    raise Exception("AI analysis timed out after all attempts")
            except Exception as e:
                print(f"❌ Error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    print("❌ All analysis attempts failed")
                    raise Exception(f"AI analysis failed: {str(e)}")
        
        print("❌ All attempts failed")
        raise Exception("AI analysis failed after all retry attempts")

# Background task for processing resume
async def process_resume_background(
    file_url: str,
    file_path: str,
    user_id: str,
    mime_type: str,
    analysis_id: str
):
    """Background task to process resume analysis"""
    print("=" * 50)
    print("🔄 BACKGROUND PROCESSING STARTED")
    print("=" * 50)
    print(f"Analysis ID: {analysis_id}")
    print(f"File URL: {file_url}")
    print(f"MIME Type: {mime_type}")
    print(f"User ID: {user_id}")
    
    try:
        # Update status to processing
        print("📝 Updating status to 'processing'...")
        await update_analysis_status(analysis_id, "processing")
        
        # OCR Processing
        print("🔍 Starting OCR processing...")
        start_time = datetime.now()
        extracted_text, confidence = await OCRService.process_file(file_url, mime_type)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        print(f"✅ OCR completed in {processing_time:.2f} seconds")
        print(f"  - Text length: {len(extracted_text)} characters")
        print(f"  - Confidence: {confidence}%")
        print(f"  - Preview: {extracted_text[:200]}...")
        
        # AI Analysis
        print("🤖 Starting AI analysis...")
        start_time = datetime.now()
        
        try:
            ai_analysis = await AIAnalysisService.analyze_resume(extracted_text)
            analysis_time = (datetime.now() - start_time).total_seconds()
            
            print(f"✅ AI analysis completed in {analysis_time:.2f} seconds")
            print(f"  - Experience level: {ai_analysis.experience_level}")
            print(f"  - Skills found: {len(ai_analysis.skills.get('technical', {}).get('programming_languages', []))} programming languages")
            
            # Update database with results ONLY if analysis succeeded
            print("💾 Saving analysis results to database...")
            await save_analysis_results(
                analysis_id,
                extracted_text,
                confidence,
                ai_analysis,
                user_id
            )
            
            # Update status to completed
            print("📝 Updating status to 'completed'...")
            await update_analysis_status(analysis_id, "completed")
            
            print("🎯 Generating hackathon recommendations...")
            await generate_and_store_recommendations(user_id, supabase)
            
            print("✅ BACKGROUND PROCESSING COMPLETED SUCCESSFULLY")
            print("=" * 50)
            
        except Exception as ai_error:
            # AI analysis failed - do not update database with partial results
            analysis_time = (datetime.now() - start_time).total_seconds()
            error_msg = f"AI analysis failed after {analysis_time:.2f} seconds: {str(ai_error)}"
            print(f"❌ {error_msg}")
            print("❌ Database will NOT be updated - no valid analysis to save")
            
            # Update status to failed with specific error
            await update_analysis_status(analysis_id, "failed", error_msg)
            print("=" * 50)
            return
        
    except Exception as e:
        # Update status to failed
        error_msg = f"Resume processing failed: {str(e)}"
        print(f"❌ BACKGROUND PROCESSING FAILED: {error_msg}")
        print(f"Exception type: {type(e).__name__}")
        print("=" * 50)
        await update_analysis_status(analysis_id, "failed", error_msg)

async def update_analysis_status(analysis_id: str, status: str, error: str = None):
    """Update analysis status in database"""
    print(f"📝 Updating analysis status: {analysis_id} -> {status}")
    if error:
        print(f"Error details: {error}")
    
    if not supabase:
        print("⚠️ No Supabase client - skipping status update")
        return
    
    try:
        update_data = {
            "processing_status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        if error:
            update_data["processing_error"] = error
        
        result = supabase.table("resume_analysis").update(update_data).eq("id", analysis_id).execute()
        print(f"✅ Status updated successfully: {len(result.data)} records affected")
    except Exception as e:
        print(f"❌ Failed to update status: {str(e)}")
        pass  # Log error in production logging system

async def save_analysis_results(
    analysis_id: str,
    extracted_text: str,
    confidence: float,
    ai_analysis: AIAnalysisResult,
    user_id: str
):
    """Save comprehensive analysis results to database"""
    print("💾 Saving analysis results to database...")
    print(f"Analysis ID: {analysis_id}")
    print(f"User ID: {user_id}")
    print(f"Text length: {len(extracted_text)}")
    print(f"Confidence: {confidence}")
    
    if not supabase:
        print("⚠️ No Supabase client - skipping database save")
        return
    
    try:
        # Parse the AI analysis for detailed fields
        analysis_data = ai_analysis.dict() if hasattr(ai_analysis, 'dict') else ai_analysis
        print("📊 Parsed AI analysis data")
        
        # Extract key fields for logging
        overall_score = analysis_data.get("resume_quality", {}).get("overall_score", "5/10")
        ats_score = analysis_data.get("ats_optimization", {}).get("current_ats_score", "50/100")
        experience_level = analysis_data.get("experience_level", "Entry")
        
        print(f"Key metrics - Overall: {overall_score}, ATS: {ats_score}, Experience: {experience_level}")
        
        # Update resume_analysis table with comprehensive data
        print("📝 Updating resume_analysis table...")
        resume_update = supabase.table("resume_analysis").update({
            # Existing fields
            "extracted_text": extracted_text,
            "ocr_confidence": confidence,
            "skills": analysis_data.get("skills", {}),
            "experience_level": analysis_data.get("experience_level", "Entry"),
            "focus_areas": analysis_data.get("focus_areas", []),
            "ai_insights": analysis_data.get("insights", ""),
            "recommendations": analysis_data.get("recommendations", []),
            
            # New comprehensive fields
            "experience_analysis": analysis_data.get("experience_analysis", {}),
            "project_analysis": analysis_data.get("project_analysis", {}),
            "education_analysis": analysis_data.get("education_analysis", {}),
            "resume_quality": analysis_data.get("resume_quality", {}),
            "skill_gap_analysis": analysis_data.get("skill_gap_analysis", {}),
            "market_competitiveness": analysis_data.get("market_competitiveness", {}),
            "industry_alignment": analysis_data.get("industry_alignment", {}),
            "ats_optimization": analysis_data.get("ats_optimization", {}),
            "interview_preparation": analysis_data.get("interview_preparation", {}),
            "career_trajectory": analysis_data.get("career_trajectory", {}),
            "red_flags": analysis_data.get("red_flags", []),
            "standout_qualities": analysis_data.get("standout_qualities", []),
            "overall_insights": analysis_data.get("overall_insights", ""),
            
            # Extracted scores for easy querying (proper decimal and integer types)
            "overall_score": float(analysis_data.get("resume_quality", {}).get("overall_score", "5/10").split("/")[0]),
            "ats_score": int(analysis_data.get("ats_optimization", {}).get("current_ats_score", "50/100").split("/")[0]),
            "competitiveness_rating": analysis_data.get("market_competitiveness", {}).get("overall_rating", "Moderate"),
            
            # Status updates
            "processing_status": "completed",
            "updated_at": datetime.now().isoformat()
        }).eq("id", analysis_id).execute()
        
        print(f"✅ Resume analysis table updated: {len(resume_update.data)} records")
        
        # Enhanced cache data for dashboard with more insights
        print("📋 Preparing cache data for user platform...")
        cache_data = {
            # Core info
            "skills": analysis_data.get("skills", {}),
            "experience_level": analysis_data.get("experience_level", "Entry"),
            "focus_areas": analysis_data.get("focus_areas", []),
            "insights": analysis_data.get("overall_insights", ""),
            "analysis_id": analysis_id,
            
            # Key metrics for dashboard
            "overall_score": analysis_data.get("resume_quality", {}).get("overall_score", "5/10"),
            "ats_score": analysis_data.get("ats_optimization", {}).get("current_ats_score", "50/100"),
            "competitiveness": analysis_data.get("market_competitiveness", {}).get("overall_rating", "Moderate"),
            "career_level": analysis_data.get("experience_analysis", {}).get("level", "Entry"),
            "salary_estimate": analysis_data.get("market_competitiveness", {}).get("salary_range_estimate", "Not specified"),
            
            # Quick insights for dashboard cards
            "top_strengths": analysis_data.get("standout_qualities", [])[:3],
            "critical_skills_needed": analysis_data.get("skill_gap_analysis", {}).get("learning_priority", {}).get("high", [])[:3],
            "red_flags": analysis_data.get("red_flags", [])[:2],
            "next_step": analysis_data.get("career_trajectory", {}).get("next_logical_step", "Continue learning"),
            
            "last_updated": datetime.now().isoformat()
        }
        
        print("📝 Updating user platform data...")
        platform_update = supabase.table("user_platform_data").upsert({
            "user_id": user_id,
            "platform": "resume",
            "data": cache_data,
            "last_updated": datetime.now().isoformat()
        }).execute()
        
        print(f"✅ User platform data updated: {len(platform_update.data)} records")
        print("💾 Database save completed successfully")
        
    except Exception as e:
        print(f"❌ Failed to save analysis results: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        pass  # Log error in production logging system

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AlgoMate Resume Analysis API is running",
        "status": "healthy",
        "environment": ENVIRONMENT,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    health_status = {
        "status": "healthy",
        "services": {
            "gemini_ai": "configured" if GEMINI_API_KEY else "missing",
            "supabase": "configured" if SUPABASE_URL and SUPABASE_SERVICE_KEY else "missing"
        },
        "environment": ENVIRONMENT
    }
    
    # Return 503 if critical services are missing in production
    if ENVIRONMENT == "production" and (not GEMINI_API_KEY or not SUPABASE_URL):
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", **health_status}
        )
    
    return health_status

@app.post("/analyze-resume")
async def analyze_resume(request: ResumeAnalysisRequest, background_tasks: BackgroundTasks):
    """Start resume analysis process"""
    print("=" * 50)
    print("📄 RESUME ANALYSIS REQUEST")
    print("=" * 50)
    print(f"File URL: {request.file_url}")
    print(f"File Path: {request.file_path}")
    print(f"User ID: {request.user_id}")
    
    try:
        # Get file metadata from database
        if not supabase:
            print("❌ Database service not available")
            raise HTTPException(status_code=503, detail="Database service not available")
        
        print("🔍 Querying database for resume analysis record...")
        analysis_result = supabase.table("resume_analysis").select("*").eq("user_id", request.user_id).eq("file_path", request.file_path).order("created_at", desc=True).limit(1).execute()
        print(f"Database query result: {len(analysis_result.data)} records found")
        
        if not analysis_result.data:
            print("❌ Resume analysis record not found")
            raise HTTPException(status_code=404, detail="Resume analysis record not found")
        
        analysis_record = analysis_result.data[0]
        analysis_id = analysis_record["id"]
        mime_type = analysis_record["mime_type"]
        
        print(f"✅ Found analysis record:")
        print(f"  - Analysis ID: {analysis_id}")
        print(f"  - MIME Type: {mime_type}")
        
        # Start background processing
        print("🚀 Starting background processing task...")
        background_tasks.add_task(
            process_resume_background,
            str(request.file_url),
            request.file_path,
            request.user_id,
            mime_type,
            analysis_id
        )
        
        response = {
            "message": "Resume analysis started",
            "analysis_id": analysis_id,
            "status": "processing"
        }
        
        print("✅ Background task started successfully")
        print(f"Response: {response}")
        print("=" * 50)
        return response
    
    except HTTPException as he:
        print(f"❌ HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        error_msg = f"Failed to start resume analysis: {str(e)}"
        print(f"❌ Unexpected error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/recommend-hackathons/{user_id}", status_code=202)
async def trigger_hackathon_recommendations(user_id: str, background_tasks: BackgroundTasks):
    """
    Triggers a background task to generate hackathon recommendations for a user.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service not available")

    background_tasks.add_task(generate_and_store_recommendations, user_id, supabase)
    
    return {
        "message": "Hackathon recommendation generation has been started in the background.",
        "user_id": user_id
    }

@app.get("/analysis-status/{analysis_id}")
async def get_analysis_status(analysis_id: str):
    """Get analysis status"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    try:
        result = supabase.table("resume_analysis").select("processing_status,processing_error").eq("id", analysis_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {
            "analysis_id": analysis_id,
            "status": result.data["processing_status"],
            "error": result.data.get("processing_error")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
    
@app.post("/find-teammates")
async def get_teammates_for_hackathon(request: TeammateRequest):
    """
    Finds and returns a list of suitable teammates for a given hackathon.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    teammates = await find_matching_teammates(request.hackathon_id, request.user_id, supabase)
    
    if teammates is None:
        raise HTTPException(status_code=500, detail="An error occurred while searching for teammates.")
        
    return {"teammates": teammates}

# Vercel serverless handler
app_handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)