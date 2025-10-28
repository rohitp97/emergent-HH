from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import random
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 10080))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Mock OTP Storage (in production, use Redis or similar)
otp_storage = {}

# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    phone: str
    password_hash: str
    role: str  # 'worker' or 'restaurant'
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkerProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location_city: str
    experience_years: int
    preferred_roles: List[str]  # ['barista', 'waiter', 'counter_staff']
    preferred_shifts: List[str]  # ['morning', 'evening', 'night']
    languages: List[str]
    availability: str  # 'immediate', 'within_week', 'within_month'
    skills: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RestaurantProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    number_of_outlets: int
    manager_name: str
    location_cities: List[str]
    description: str = ""
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    restaurant_name: str
    title: str
    role: str  # 'barista', 'waiter', 'counter_staff'
    location_city: str
    shift_timing: str  # 'morning', 'evening', 'night'
    experience_required: str  # 'entry', '1-2', '3-5', '5+'
    wage_min: float
    wage_max: float
    description: str
    requirements: List[str] = []
    benefits: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    worker_id: str
    worker_name: str
    status: str = "applied"  # 'applied', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected'
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    worker_id: str
    worker_name: str
    overall_rating: float
    wage_accuracy: float
    work_environment: float
    career_growth: float
    compliance: float
    comment: str = ""
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    session_id: str
    amount: float
    currency: str = "inr"
    payment_status: str = "pending"  # 'pending', 'paid', 'failed'
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request/Response Models
class RegisterRequest(BaseModel):
    phone: str
    password: str
    role: str  # 'worker' or 'restaurant'
    name: str
    email: Optional[str] = None

class LoginRequest(BaseModel):
    phone: str
    password: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str

class JobCreateRequest(BaseModel):
    title: str
    role: str
    location_city: str
    shift_timing: str
    experience_required: str
    wage_min: float
    wage_max: float
    description: str
    requirements: List[str] = []
    benefits: List[str] = []

class ApplicationStatusUpdate(BaseModel):
    status: str

class ReviewCreateRequest(BaseModel):
    restaurant_id: str
    overall_rating: float
    wage_accuracy: float
    work_environment: float
    career_growth: float
    compliance: float
    comment: str = ""

class WorkerProfileRequest(BaseModel):
    location_city: str
    experience_years: int
    preferred_roles: List[str]
    preferred_shifts: List[str]
    languages: List[str]
    availability: str
    skills: List[str] = []

class RestaurantProfileRequest(BaseModel):
    company_name: str
    number_of_outlets: int
    manager_name: str
    location_cities: List[str]
    description: str = ""

# Helper functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return {"user_id": user_id, "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    # Check if user exists
    existing = await db.users.find_one({"phone": req.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Create user
    user = User(
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        role=req.role,
        name=req.name,
        email=req.email
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = await db.users.find_one({"phone": req.phone})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return TokenResponse(access_token=token, user_id=user["id"], role=user["role"])

@api_router.post("/auth/send-otp")
async def send_otp(req: OTPRequest):
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_storage[req.phone] = otp
    # In production: Send via Twilio SMS
    logging.info(f"OTP for {req.phone}: {otp}")
    return {"message": "OTP sent successfully", "otp": otp}  # Remove otp in production

@api_router.post("/auth/verify-otp")
async def verify_otp(req: OTPVerifyRequest):
    stored_otp = otp_storage.get(req.phone)
    if not stored_otp or stored_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    del otp_storage[req.phone]
    return {"message": "OTP verified successfully"}

# Worker Profile Routes
@api_router.post("/workers/profile")
async def create_worker_profile(req: WorkerProfileRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if profile exists
    existing = await db.worker_profiles.find_one({"user_id": current_user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile = WorkerProfile(user_id=current_user["user_id"], **req.model_dump())
    profile_dict = profile.model_dump()
    profile_dict['created_at'] = profile_dict['created_at'].isoformat()
    await db.worker_profiles.insert_one(profile_dict)
    return profile

@api_router.get("/workers/profile")
async def get_worker_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.worker_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.put("/workers/profile")
async def update_worker_profile(req: WorkerProfileRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.worker_profiles.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": req.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated successfully"}

# Restaurant Profile Routes
@api_router.post("/restaurants/profile")
async def create_restaurant_profile(req: RestaurantProfileRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    existing = await db.restaurant_profiles.find_one({"user_id": current_user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile = RestaurantProfile(user_id=current_user["user_id"], **req.model_dump())
    profile_dict = profile.model_dump()
    profile_dict['created_at'] = profile_dict['created_at'].isoformat()
    await db.restaurant_profiles.insert_one(profile_dict)
    return profile

@api_router.get("/restaurants/profile")
async def get_restaurant_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.restaurant_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.put("/restaurants/profile")
async def update_restaurant_profile(req: RestaurantProfileRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.restaurant_profiles.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": req.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated successfully"}

# Job Routes
@api_router.post("/jobs")
async def create_job(req: JobCreateRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    restaurant = await db.restaurant_profiles.find_one({"user_id": current_user["user_id"]})
    if not restaurant:
        raise HTTPException(status_code=400, detail="Create restaurant profile first")
    
    job = Job(
        restaurant_id=current_user["user_id"],
        restaurant_name=restaurant["company_name"],
        **req.model_dump()
    )
    
    job_dict = job.model_dump()
    job_dict['created_at'] = job_dict['created_at'].isoformat()
    await db.jobs.insert_one(job_dict)
    return job

@api_router.get("/jobs", response_model=List[Dict])
async def get_jobs(
    role: Optional[str] = None,
    location: Optional[str] = None,
    shift: Optional[str] = None,
    experience: Optional[str] = None
):
    query = {"is_active": True}
    if role:
        query["role"] = role
    if location:
        query["location_city"] = location
    if shift:
        query["shift_timing"] = shift
    if experience:
        query["experience_required"] = experience
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.get("/restaurants/jobs")
async def get_restaurant_jobs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    jobs = await db.jobs.find({"restaurant_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

# Application Routes
@api_router.post("/applications/{job_id}")
async def apply_for_job(job_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if job exists
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = await db.applications.find_one({"job_id": job_id, "worker_id": current_user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    
    # Get worker info
    user = await db.users.find_one({"id": current_user["user_id"]})
    
    application = Application(
        job_id=job_id,
        worker_id=current_user["user_id"],
        worker_name=user["name"]
    )
    
    app_dict = application.model_dump()
    app_dict['applied_at'] = app_dict['applied_at'].isoformat()
    app_dict['updated_at'] = app_dict['updated_at'].isoformat()
    await db.applications.insert_one(app_dict)
    return application

@api_router.get("/workers/applications")
async def get_worker_applications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    applications = await db.applications.find({"worker_id": current_user["user_id"]}, {"_id": 0}).sort("applied_at", -1).to_list(100)
    
    # Enrich with job details
    for app in applications:
        job = await db.jobs.find_one({"id": app["job_id"]}, {"_id": 0})
        if job:
            app["job_details"] = job
    
    return applications

@api_router.get("/restaurants/applications/{job_id}")
async def get_job_applications(job_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify job belongs to restaurant
    job = await db.jobs.find_one({"id": job_id, "restaurant_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    applications = await db.applications.find({"job_id": job_id}, {"_id": 0}).sort("applied_at", -1).to_list(100)
    
    # Enrich with worker details
    for app in applications:
        worker = await db.worker_profiles.find_one({"user_id": app["worker_id"]}, {"_id": 0})
        if worker:
            app["worker_profile"] = worker
    
    return applications

@api_router.put("/restaurants/applications/{application_id}")
async def update_application_status(application_id: str, req: ApplicationStatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify application belongs to restaurant's job
    application = await db.applications.find_one({"id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    job = await db.jobs.find_one({"id": application["job_id"], "restaurant_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.applications.update_one(
        {"id": application_id},
        {"$set": {"status": req.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Application updated successfully"}

# Review Routes
@api_router.post("/reviews")
async def create_review(req: ReviewCreateRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await db.users.find_one({"id": current_user["user_id"]})
    
    review = Review(
        restaurant_id=req.restaurant_id,
        worker_id=current_user["user_id"],
        worker_name=user["name"],
        overall_rating=req.overall_rating,
        wage_accuracy=req.wage_accuracy,
        work_environment=req.work_environment,
        career_growth=req.career_growth,
        compliance=req.compliance,
        comment=req.comment
    )
    
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    await db.reviews.insert_one(review_dict)
    return review

@api_router.get("/reviews/{restaurant_id}")
async def get_restaurant_reviews(restaurant_id: str):
    reviews = await db.reviews.find({"restaurant_id": restaurant_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Calculate averages
    if reviews:
        avg_overall = sum(r["overall_rating"] for r in reviews) / len(reviews)
        avg_wage = sum(r["wage_accuracy"] for r in reviews) / len(reviews)
        avg_environment = sum(r["work_environment"] for r in reviews) / len(reviews)
        avg_growth = sum(r["career_growth"] for r in reviews) / len(reviews)
        avg_compliance = sum(r["compliance"] for r in reviews) / len(reviews)
        
        return {
            "reviews": reviews,
            "averages": {
                "overall": round(avg_overall, 1),
                "wage_accuracy": round(avg_wage, 1),
                "work_environment": round(avg_environment, 1),
                "career_growth": round(avg_growth, 1),
                "compliance": round(avg_compliance, 1)
            },
            "total_reviews": len(reviews)
        }
    
    return {"reviews": [], "averages": {}, "total_reviews": 0}

# Analytics Routes
@api_router.get("/restaurants/analytics")
async def get_restaurant_analytics(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Total jobs
    total_jobs = await db.jobs.count_documents({"restaurant_id": current_user["user_id"]})
    
    # Total applications
    jobs = await db.jobs.find({"restaurant_id": current_user["user_id"]}, {"id": 1}).to_list(1000)
    job_ids = [j["id"] for j in jobs]
    total_applications = await db.applications.count_documents({"job_id": {"$in": job_ids}})
    
    # Applications by status
    pipeline = [
        {"$match": {"job_id": {"$in": job_ids}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await db.applications.aggregate(pipeline).to_list(100)
    
    # Reviews summary
    reviews = await db.reviews.find({"restaurant_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    avg_rating = sum(r["overall_rating"] for r in reviews) / len(reviews) if reviews else 0
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "applications_by_status": {item["_id"]: item["count"] for item in status_counts},
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews)
    }

# AI Job Matching
@api_router.get("/workers/job-recommendations")
async def get_job_recommendations(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get worker profile
    profile = await db.worker_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=400, detail="Create profile first")
    
    # Get all active jobs
    jobs = await db.jobs.find({"is_active": True}, {"_id": 0}).to_list(100)
    
    # Use LLM to rank jobs
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"job_match_{current_user['user_id']}",
            system_message="You are a job matching AI. Analyze worker profile and rank jobs by match quality."
        ).with_model("openai", "gpt-4o-mini")
        
        message = UserMessage(
            text=f"""Worker Profile:
            - Location: {profile.get('location_city')}
            - Experience: {profile.get('experience_years')} years
            - Preferred Roles: {', '.join(profile.get('preferred_roles', []))}
            - Preferred Shifts: {', '.join(profile.get('preferred_shifts', []))}
            - Skills: {', '.join(profile.get('skills', []))}
            
            Available Jobs: {str(jobs[:10])}
            
            Return only the job IDs in order of best match to worst, comma-separated."""
        )
        
        response = await chat.send_message(message)
        # Parse response and return sorted jobs
        return {"jobs": jobs[:10], "ai_recommendation": response}
    except Exception as e:
        logging.error(f"AI matching error: {e}")
        # Fallback to simple filtering
        matched_jobs = [
            j for j in jobs 
            if j.get("role") in profile.get("preferred_roles", []) 
            and j.get("location_city") == profile.get("location_city")
        ]
        return {"jobs": matched_jobs[:10]}

# Payment Routes
@api_router.post("/payments/create-checkout")
async def create_payment_checkout(request: Request, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied")
    
    body = await request.json()
    origin_url = body.get("origin_url")
    package_id = body.get("package_id", "commission")
    
    # Fixed commission amount (in production, calculate based on placement)
    PACKAGES = {
        "commission": 1500.0,  # ₹1,500 per placement
        "monthly": 5000.0,     # ₹5,000 monthly subscription
        "annual": 50000.0      # ₹50,000 annual subscription
    }
    
    if package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    amount = PACKAGES[package_id]
    
    # Initialize Stripe
    stripe_key = os.environ.get('STRIPE_API_KEY')
    base_url = str(request.base_url)
    webhook_url = f"{base_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="inr",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "restaurant_id": current_user["user_id"],
            "package_id": package_id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store transaction
    transaction = PaymentTransaction(
        restaurant_id=current_user["user_id"],
        session_id=session.session_id,
        amount=amount,
        currency="inr",
        payment_status="pending",
        metadata={"package_id": package_id}
    )
    
    trans_dict = transaction.model_dump()
    trans_dict['created_at'] = trans_dict['created_at'].isoformat()
    await db.payment_transactions.insert_one(trans_dict)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    # Get transaction from DB
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check Stripe status
    stripe_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url="")
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction if status changed
        if status.payment_status == "paid" and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
        
        return status
    except Exception as e:
        logging.error(f"Payment status error: {e}")
        return transaction

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_key = os.environ.get('STRIPE_API_KEY')
    base_url = str(request.base_url)
    webhook_url = f"{base_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"payment_status": "paid"}}
            )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()