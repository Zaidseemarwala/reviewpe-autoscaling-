from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import shutil
import os
from app.gst_ocr import extract_gst_details
from app.config import GEOAPIFY_API_KEY
from sqlalchemy import desc
import requests
from app.schemas import SendOTPRequest, VerifyOTPRequest
from app.models import OTPVerification, Business, CitySequence
from app.schemas import (
    SendOTPRequest,
    VerifyOTPRequest,
    BusinessCreate,
    GSTVerificationRequest
)
from app.dependencies import get_current_user
from app.auth import create_access_token
from app.database import get_db, engine
from app.qr_utils import generate_qr_code
from app.address_match import (
    calculate_match_score,
    get_verification_status
)


app = FastAPI()
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://reviewpe-4zfarxta5-reviewpe-s-projects.vercel.app",
        "https://reviewpe-7fxlcvvta-reviewpe-s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_city_code(city: str):
    city = city.strip().upper()

    custom_codes = {
        "MUMBAI": "MUM",
        "DELHI": "DEL",
        "BANGALORE": "BLR",
        "BENGALURU": "BLR",
        "PUNE": "PUN",
        "HYDERABAD": "HYD",
        "CHENNAI": "CHE",
        "KOLKATA": "KOL",
        "AHMEDABAD": "AMD",
        "SURAT": "SUR",
        "JAIPUR": "JAI"
    }

    if city in custom_codes:
        return custom_codes[city]

    return city[:3]


@app.get("/")
def home():
    return {
        "message": "ReviewPe Backend Running Successfully"
    }


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "Database Connected Successfully"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/send-otp")
def send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    otp = str(random.randint(100000, 999999))

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_record = OTPVerification(
        mobile=request.mobile,
        otp=otp,
        expires_at=expires_at
    )

    db.add(otp_record)
    db.commit()

    print("\n========================")
    print(f"OTP FOR {request.mobile}: {otp}")
    print("========================\n")

    return {
        "success": True,
        "message": "OTP generated successfully",
        "mobile": request.mobile,
        "otp": otp
    }


@app.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    otp_record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.mobile == request.mobile
        )
        .order_by(desc(OTPVerification.created_at))
        .first()
    )

    if not otp_record:
        return {
            "success": False,
            "message": "OTP not found"
        }

    if otp_record.is_verified:
        return {
            "success": False,
            "message": "OTP already used"
        }

    # FIX: strip tzinfo before comparing to avoid TypeError
    expires_at = otp_record.expires_at
    if expires_at.tzinfo is not None:
        expires_at = expires_at.replace(tzinfo=None)

    if datetime.utcnow() > expires_at:
        return {
            "success": False,
            "message": "OTP expired"
        }

    if otp_record.otp != request.otp:
        return {
            "success": False,
            "message": "Invalid OTP"
        }

    otp_record.is_verified = True
    otp_record.verified_at = datetime.utcnow()
    db.commit()

    token = create_access_token({"mobile": request.mobile})

    return {
        "success": True,
        "message": "OTP verified successfully",
        "access_token": token,
        "token_type": "bearer"
    }


@app.post("/register-business")
def register_business(
    request: BusinessCreate,
    db: Session = Depends(get_db)
):
    # Check OTP verification
    verified_otp = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.mobile == request.mobile,
            OTPVerification.is_verified == True
        )
        .order_by(desc(OTPVerification.created_at))
        .first()
    )

    if not verified_otp:
        return {
            "success": False,
            "message": "Mobile number not verified"
        }

    # FIX: strip tzinfo from verified_at before comparing
    verified_at = verified_otp.verified_at
    if verified_at.tzinfo is not None:
        verified_at = verified_at.replace(tzinfo=None)

    verification_age = (
        datetime.utcnow() - verified_at
    ).total_seconds()

    if verification_age > 3600:  # FIX: raised to 1 hour to avoid issues during testing
        return {
            "success": False,
            "message": "OTP verification expired. Please verify again."
        }

    existing_business = (
        db.query(Business)
        .filter(Business.mobile == request.mobile)
        .first()
    )

    if existing_business:
        return {
            "success": False,
            "message": "Business already registered"
        }

    # Generate city code
    city_code = generate_city_code(request.city)

    # Get city sequence
    city_sequence = (
        db.query(CitySequence)
        .filter(CitySequence.city_code == city_code)
        .first()
    )

    if not city_sequence:
        return {
            "success": False,
            "message": f"City code {city_code} not found in database. Please add it first."
        }

    # Generate ReviewPe ID
    city_sequence.current_number += 1
    db.commit()
    db.refresh(city_sequence)
    sequence_number = city_sequence.current_number

    reviewpe_id = f"RVP-{city_code}-{sequence_number:06d}"

    qr_path = generate_qr_code(reviewpe_id)
    BASE_URL = "https://reviewpe-production.up.railway.app"
    qr_url = f"{BASE_URL}/{qr_path}"
    business = Business(
    reviewpe_business_id=reviewpe_id,
    qr_code_url=qr_url,

        business_name=request.business_name,
        owner_name=request.owner_name,

        mobile=request.mobile,
        mobile_verified=True,

        email=request.email,
        category=request.category,

        address=request.address,
        city=request.city,
        state=request.state,
        pincode=request.pincode,

        city_code=city_code,
        latitude=request.latitude,
        longitude=request.longitude,
        formatted_address=request.formatted_address,

        gst_number=request.gst_number,
        website=request.website,
        description=request.description,
        logo_url=request.logo_url,
        gst_certificate_url=request.gst_certificate_url,
        gst_verification_status=request.gst_verification_status,
        gst_match_score=request.gst_match_score
    )

    db.add(business)
    db.commit()
    db.refresh(business)

    return {
        "success": True,
        "message": "Business registered successfully",
        "reviewpe_business_id": reviewpe_id,
        "qr_code_url": qr_url
    }


@app.get("/business/{reviewpe_business_id}")
def get_business_profile(
    reviewpe_business_id: str,
    db: Session = Depends(get_db)
):
    business = (
        db.query(Business)
        .filter(
            Business.reviewpe_business_id == reviewpe_business_id
        )
        .first()
    )

    if not business:
        return {
            "success": False,
            "message": "Business not found"
        }

    return {
        "success": True,
        "reviewpe_business_id": business.reviewpe_business_id,
        "business_name": business.business_name,
        "category": business.category,
        "city": business.city,
        "state": business.state,
        "trust_score": float(business.trust_score),
        "average_rating": float(business.average_rating),
        "total_reviews": business.total_reviews,
        "gst_verified": business.gst_verified,
        "mobile_verified": business.mobile_verified,
        "description": business.description,
        "logo_url": business.logo_url,
        "gst_verification_status": business.gst_verification_status,
        "gst_match_score": business.gst_match_score,
        "qr_code_url": business.qr_code_url
    }


@app.get("/dashboard")
def dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = (
        db.query(Business)
        .filter(Business.mobile == current_user["mobile"])
        .first()
    )

    if not business:
        return {
            "success": False,
            "message": "Business not found"
        }

    return {
        "success": True,
        "business_name": business.business_name,
        "reviewpe_business_id": business.reviewpe_business_id,
        "mobile": business.mobile,
        "category": business.category,
        "city": business.city,
        "trust_score": float(business.trust_score),
        "average_rating": float(business.average_rating),
        "total_reviews": business.total_reviews,
        "gst_verification_status": business.gst_verification_status,
        "gst_match_score": business.gst_match_score,
        "logo_url": business.logo_url,
        "qr_code_url": business.qr_code_url
    }

@app.post("/login-send-otp")
def login_send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    business = (
        db.query(Business)
        .filter(Business.mobile == request.mobile)
        .first()
    )

    if not business:
        return {
            "success": False,
            "message": "Business not registered. Please register first."
        }

    otp = str(random.randint(100000, 999999))

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_record = OTPVerification(
        mobile=request.mobile,
        otp=otp,
        expires_at=expires_at
    )

    db.add(otp_record)
    db.commit()

    print(f"LOGIN OTP: {otp}")

    return {
        "success": True,
        "otp": otp
    }
@app.get("/search-location")
def search_location(q: str):
    url = "https://api.geoapify.com/v1/geocode/autocomplete"

    response = requests.get(
        url,
        params={
            "text": q,
            "limit": 5,
            "apiKey": GEOAPIFY_API_KEY
        },
        timeout=10
    )

    return response.json()


@app.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    try:
        os.makedirs("static/logos", exist_ok=True)
        file_path = f"static/logos/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"success": True, "file_url": file_path}

    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/upload-gst")
async def upload_gst(file: UploadFile = File(...)):
    try:
        os.makedirs("static/gst", exist_ok=True)
        file_path = f"static/gst/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"success": True, "file_url": file_path}

    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/extract-gst")
def extract_gst(file_path: str):
    try:
        result = extract_gst_details(file_path)
        return {"success": True, "data": result}

    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/verify-gst-address")
def verify_gst_address(request: GSTVerificationRequest):
    score = calculate_match_score(
        request.gst_address,
        request.store_address
    )
    status = get_verification_status(score)

    return {
        "match_score": score,
        "verification_status": status
    }