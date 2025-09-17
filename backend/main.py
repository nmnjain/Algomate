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
import io
import json
from dotenv import load_dotenv

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

# Initialize FastAPI app with production configuration
app = FastAPI(
    title="AlgoMate Resume Analysis API",
    description="OCR and AI-powered resume analysis service",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,  # Disable docs in production
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
)

# Security middleware - Trust only specific hosts in production
if ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.vercel.app", "*.railway.app", "*.render.com", "localhost"]
    )

# CORS configuration from environment variables
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Length", "X-JSON"],
    max_age=86400,  # 24 hours
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Environment variables with production defaults
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", 8000))

# CORS configuration from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# Production environment checks
if ENVIRONMENT == "production":
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is required in production")
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL is required in production")
    if not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_SERVICE_KEY is required in production")

# Initialize Gemini AI with timeout configuration
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 4096,  # Reduced from 8192
    }
    
    model = genai.GenerativeModel(
        'gemini-1.5-flash',  # Changed from 'gemini-2.5-flash'
        generation_config=generation_config
    )
else:
    model = None

# Initialize Supabase client
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    supabase = None

# Request/Response models
class ResumeAnalysisRequest(BaseModel):
    file_url: HttpUrl
    file_path: str
    user_id: str
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None

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
        try:
            # Download file
            async with aiohttp.ClientSession() as session:
                async with session.get(file_url) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=400, detail="Failed to download file")
                    
                    file_content = await response.read()
            
            # Process based on file type
            if mime_type == 'application/pdf':
                return await OCRService.extract_text_from_pdf(file_content)
            elif mime_type in ['image/jpeg', 'image/jpg', 'image/png']:
                return await OCRService.extract_text_from_image(file_content)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime_type}")
        
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

# AI Analysis Service Class
class AIAnalysisService:
    @staticmethod
    def create_analysis_prompt(extracted_text: str) -> str:
        """Create optimized prompt for comprehensive analysis with reduced timeout risk"""
        # Truncate text if too long
        max_text_length = 3000
        if len(extracted_text) > max_text_length:
            extracted_text = extracted_text[:max_text_length] + "...[truncated for analysis]"
        
        return f"""
        You are a technical recruiter. Analyze this resume and provide detailed JSON response:

        RESUME TEXT:
        {extracted_text}

        Return valid JSON with ALL fields populated:

        {{
            "skills": {{
                "technical": {{
                    "programming_languages": ["extract from resume"],
                    "frameworks_libraries": ["extract from resume"],
                    "databases": ["extract from resume"],
                    "cloud_platforms": ["AWS/Azure/GCP found"],
                    "devops_tools": ["Docker/K8s/CI-CD found"],
                    "other_technical": ["remaining tech skills"]
                }},
                "soft_skills": ["leadership, communication, etc"],
                "certifications": ["certs mentioned"],
                "missing_critical_skills": ["skills needed for their level"]
            }},
            "experience_analysis": {{
                "level": "Fresher|Junior|Mid-level|Senior|Lead|Principal",
                "total_experience_years": "X.Y years",
                "career_progression": "Excellent|Good|Average|Poor",
                "industry_exposure": ["fintech", "healthcare", etc],
                "gaps_in_employment": "any gaps found"
            }},
            "project_analysis": {{
                "project_quality": "Exceptional|Good|Average|Poor",
                "technical_complexity": "High|Medium|Low",
                "business_impact": "shows business value or not",
                "standout_projects": ["most impressive projects"],
                "missing_project_types": ["types needed"]
            }},
            "education_analysis": {{
                "degree_relevance": "relevant to tech roles",
                "institution_tier": "Tier1|Tier2|Tier3",
                "academic_performance": "Excellent|Good|Average",
                "additional_courses": ["online courses found"]
            }},
            "resume_quality": {{
                "overall_score": "X/10",
                "formatting": "Professional|Good|Poor",
                "content_clarity": "Clear|Confusing",
                "quantified_achievements": "Strong|Weak metrics usage"
            }},
            "skill_gap_analysis": {{
                "for_current_level": ["missing skills for current level"],
                "for_next_level": ["skills for promotion"],
                "trending_technologies": ["2024-25 trending tech to learn"],
                "learning_priority": {{
                    "high": ["learn in 3 months"],
                    "medium": ["learn in 6 months"],
                    "low": ["learn in 1 year"]
                }}
            }},
            "market_competitiveness": {{
                "overall_rating": "Highly Competitive|Competitive|Moderate|Poor",
                "salary_range_estimate": "USD/INR range based on experience",
                "target_companies": ["realistic company targets"],
                "competitive_advantages": ["what makes them stand out"],
                "major_weaknesses": ["what hurts their chances"]
            }},
            "industry_alignment": {{
                "best_fit_roles": ["most suitable roles"],
                "emerging_opportunities": ["trending roles they can pivot to"],
                "remote_work_readiness": "assessment for remote work"
            }},
            "detailed_recommendations": [
                {{
                    "category": "Technical Skills",
                    "recommendation": "specific actionable advice",
                    "impact": "High|Medium|Low",
                    "timeframe": "1-3|3-6|6-12 months",
                    "resources": ["specific courses/platforms"]
                }},
                {{
                    "category": "Projects", 
                    "recommendation": "project suggestions",
                    "impact": "High|Medium|Low",
                    "timeframe": "timeline",
                    "resources": ["guidance"]
                }},
                {{
                    "category": "Experience",
                    "recommendation": "career move suggestions", 
                    "impact": "High|Medium|Low",
                    "timeframe": "timeline",
                    "resources": ["networking, job boards"]
                }},
                {{
                    "category": "Resume",
                    "recommendation": "formatting/content changes",
                    "impact": "High|Medium|Low", 
                    "timeframe": "Immediate|1 week",
                    "resources": ["templates, tools"]
                }}
            ],
            "ats_optimization": {{
                "current_ats_score": "X/100",
                "missing_keywords": ["important keywords for their field"],
                "formatting_issues": ["ATS parsing issues"],
                "improvements_needed": ["specific ATS improvements"]
            }},
            "interview_preparation": {{
                "technical_readiness": "Strong|Moderate|Weak",
                "likely_interview_topics": ["based on background"],
                "preparation_suggestions": ["focus areas"]
            }},
            "career_trajectory": {{
                "next_logical_step": "immediate next role target",
                "5_year_potential": "where they could be in 5 years",
                "career_pivot_options": ["alternative paths"]
            }},
            "red_flags": ["concerning patterns: job hopping, gaps, inconsistencies"],
            "standout_qualities": ["unique strengths that make them memorable"],
            "overall_insights": "3-4 sentence comprehensive analysis of current position, competitiveness, and strategic advice"
        }}

        Guidelines: Be specific, use current 2024-25 market data, provide actionable advice. Every field must have content - no empty arrays.
        """
    @staticmethod
    async def analyze_resume(extracted_text: str) -> AIAnalysisResult:
        if not model:
            return AIAnalysisService.create_fallback_analysis(extracted_text)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    wait_time = min(10, 2 ** attempt)
                    await asyncio.sleep(wait_time)
                
                # Shorten text for retries
                text_length = max(500, 2000 - (attempt * 500))
                text_to_use = extracted_text[:text_length] if len(extracted_text) > text_length else extracted_text
                
                prompt = AIAnalysisService.create_analysis_prompt(text_to_use)
                
                # Use asyncio.wait_for for timeout control
                response = await asyncio.wait_for(
                    asyncio.to_thread(model.generate_content, prompt),
                    timeout=45.0  # 45 second timeout
                )
                
                # Parse JSON response with aggressive cleaning
                response_text = response.text.strip()

                # Remove markdown formatting
                if "```json" in response_text:
                    start = response_text.find("```json") + 7
                    end = response_text.rfind("```")
                    if end > start:
                        response_text = response_text[start:end].strip()

                # Remove any text before first { and after last }
                start_brace = response_text.find('{')
                end_brace = response_text.rfind('}')
                if start_brace >= 0 and end_brace > start_brace:
                    response_text = response_text[start_brace:end_brace + 1]

                # Try parsing with error recovery
                try:
                    analysis_data = json.loads(response_text)
                    
                except json.JSONDecodeError as e:
                    # Attempt JSON repair
                    import re
                    
                    try:
                        # Remove trailing commas
                        response_text = re.sub(r',\s*([}\]])', r'\1', response_text)

                        # Attempt to balance parentheses/brackets/braces
                        while response_text and response_text[-1] in [')', ']', '}']:
                            # Count opening and closing
                            open_paren = response_text.count('(')
                            close_paren = response_text.count(')')
                            open_brack = response_text.count('[')
                            close_brack = response_text.count(']')
                            open_brace = response_text.count('{')
                            close_brace = response_text.count('}')
                            
                            # If more closing than opening, remove last char
                            if close_paren > open_paren and response_text[-1] == ')':
                                response_text = response_text[:-1]
                                continue
                            if close_brack > open_brack and response_text[-1] == ']':
                                response_text = response_text[:-1]
                                continue
                            if close_brace > open_brace and response_text[-1] == '}':
                                response_text = response_text[:-1]
                                continue
                            break
                        
                        # Remove trailing commas again after cleaning
                        response_text = re.sub(r',\s*([}\]])', r'\1', response_text)
                        
                        analysis_data = json.loads(response_text)
                                    
                    except Exception as e2:
                        if attempt < max_retries - 1:
                            continue  # Retry
                        else:
                            return AIAnalysisService.create_fallback_analysis(extracted_text)
                
                result = AIAnalysisResult(
                    skills=analysis_data.get("skills", {"technical": [], "soft": []}),
                    experience_level=analysis_data.get("experience_level", "Entry"),
                    focus_areas=analysis_data.get("focus_areas", []),
                    insights=analysis_data.get("overall_insights", ""),  # Changed from "insights"
                    recommendations=analysis_data.get("detailed_recommendations", []),  # Changed key
                    
                    # Add all the new fields
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
                
                return result
                
            except asyncio.TimeoutError:
                if attempt == max_retries - 1:
                    return AIAnalysisService.create_fallback_analysis(extracted_text)
            except Exception as e:
                if attempt == max_retries - 1:
                    return AIAnalysisService.create_fallback_analysis(extracted_text)
        
        return AIAnalysisService.create_fallback_analysis(extracted_text)

    @staticmethod
    def create_fallback_analysis(extracted_text: str) -> AIAnalysisResult:
        """Create basic analysis when AI fails"""
        words = extracted_text.lower().split()
        
        # Basic skill detection
        technical_skills = []
        for skill in ["python", "javascript", "react", "node", "sql", "aws", "docker", "git"]:
            if skill in words:
                technical_skills.append(skill.title())
        
        # Basic experience level detection
        experience_level = "Entry"
        if any(word in words for word in ["senior", "lead", "manager", "architect"]):
            experience_level = "Senior"
        elif any(word in words for word in ["mid", "intermediate", "3", "4", "5"]):
            experience_level = "Mid"
        
        return AIAnalysisResult(
            skills={"technical": technical_skills, "soft": ["Communication", "Problem Solving"]},
            experience_level=experience_level,
            focus_areas=["Software Development"],
            insights="Basic analysis completed. For detailed insights, please ensure AI service is properly configured.",
            recommendations=[
                {
                    "category": "Profile",
                    "suggestion": "Add more specific technical skills and project details",
                    "priority": "Medium"
                }
            ],
            # Add default values for all new fields
            experience_analysis={"level": experience_level, "total_experience_years": "0 years"},
            project_analysis={"project_quality": "Average"},
            education_analysis={"degree_relevance": "Unknown"},
            resume_quality={"overall_score": "5/10"},
            skill_gap_analysis={"for_current_level": ["More specific skills needed"]},
            market_competitiveness={"overall_rating": "Moderate"},
            industry_alignment={"best_fit_roles": ["Software Developer"]},
            detailed_recommendations=[],
            ats_optimization={"current_ats_score": "50/100"},
            interview_preparation={"technical_readiness": "Moderate"},
            career_trajectory={"next_logical_step": "Continue learning"},
            red_flags=[],
            standout_qualities=[],
            overall_insights="Basic analysis completed."
        )

# Background task for processing resume
async def process_resume_background(
    file_url: str,
    file_path: str,
    user_id: str,
    mime_type: str,
    analysis_id: str
):
    """Background task to process resume analysis"""
    try:
        # Update status to processing
        await update_analysis_status(analysis_id, "processing")
        
        # OCR Processing
        start_time = datetime.now()
        extracted_text, confidence = await OCRService.process_file(file_url, mime_type)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # AI Analysis
        ai_analysis = await AIAnalysisService.analyze_resume(extracted_text)
        
        # Update database with results
        await save_analysis_results(
            analysis_id,
            extracted_text,
            confidence,
            ai_analysis,
            user_id
        )
        
        # Update status to completed
        await update_analysis_status(analysis_id, "completed")
        
    except Exception as e:
        # Update status to failed
        error_msg = f"Resume processing failed: {str(e)}"
        await update_analysis_status(analysis_id, "failed", error_msg)

async def update_analysis_status(analysis_id: str, status: str, error: str = None):
    """Update analysis status in database"""
    if not supabase:
        return
    
    try:
        update_data = {
            "processing_status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        if error:
            update_data["processing_error"] = error
        
        supabase.table("resume_analysis").update(update_data).eq("id", analysis_id).execute()
    except Exception as e:
        pass  # Log error in production logging system

async def save_analysis_results(
    analysis_id: str,
    extracted_text: str,
    confidence: float,
    ai_analysis: AIAnalysisResult,
    user_id: str
):
    """Save comprehensive analysis results to database"""
    if not supabase:
        return
    
    try:
        # Parse the AI analysis for detailed fields
        analysis_data = ai_analysis.dict() if hasattr(ai_analysis, 'dict') else ai_analysis
        
        # Update resume_analysis table with comprehensive data
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
            
            # Extracted scores for easy querying
            "overall_score": analysis_data.get("resume_quality", {}).get("overall_score", "5/10").split("/")[0],
            "ats_score": analysis_data.get("ats_optimization", {}).get("current_ats_score", "50/100").split("/")[0],
            "competitiveness_rating": analysis_data.get("market_competitiveness", {}).get("overall_rating", "Moderate"),
            
            # Status updates
            "processing_status": "completed",
            "updated_at": datetime.now().isoformat()
        }).eq("id", analysis_id).execute()
        
        # Enhanced cache data for dashboard with more insights
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
        
        platform_update = supabase.table("user_platform_data").upsert({
            "user_id": user_id,
            "platform": "resume",
            "data": cache_data,
            "last_updated": datetime.now().isoformat()
        }).execute()
        
    except Exception as e:
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
    try:
        # Get file metadata from database
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        analysis_result = supabase.table("resume_analysis").select("*").eq("user_id", request.user_id).eq("file_path", request.file_path).order("created_at", desc=True).limit(1).execute()
        
        if not analysis_result.data:
            raise HTTPException(status_code=404, detail="Resume analysis record not found")
        
        analysis_record = analysis_result.data[0]
        analysis_id = analysis_record["id"]
        mime_type = analysis_record["mime_type"]
        
        # Start background processing
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
        
        return response
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start resume analysis: {str(e)}")

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

# Vercel serverless handler
app_handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)