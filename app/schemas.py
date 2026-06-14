from pydantic import BaseModel


class SendOTPRequest(BaseModel):
    mobile: str


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str



class BusinessCreate(BaseModel):
    business_name: str
    owner_name: str

    mobile: str

    category: str

    address: str
    city: str
    state: str
    pincode: str

    latitude: float | None = None
    longitude: float | None = None
    formatted_address: str | None = None

    email: str | None = None
    gst_number: str | None = None

    website: str | None = None
    description: str | None = None

    # NEW

    logo_url: str | None = None

    gst_certificate_url: str | None = None

    gst_verification_status: str | None = "PENDING"

    gst_match_score: float | None = 0
class GSTVerificationRequest(BaseModel):
    gst_address: str
    store_address: str