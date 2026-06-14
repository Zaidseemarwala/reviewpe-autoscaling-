from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DECIMAL,
    TIMESTAMP,
    Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Business(Base):
    __tablename__ = "businesses"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    reviewpe_business_id = Column(String(30), unique=True)

    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)

    mobile = Column(String(15), unique=True, nullable=False)
    mobile_verified = Column(Boolean, default=False)

    email = Column(String(255))

    category = Column(String(100), nullable=False)

    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    city_code = Column(String(10), nullable=False)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    formatted_address = Column(Text)

    gst_number = Column(String(20))
    gst_verified = Column(Boolean, default=False)

    # FIX: removed duplicate logo_url — only one definition kept here
    logo_url = Column(Text)
    cover_image_url = Column(Text)
    gst_certificate_url = Column(Text)
    gst_verification_status = Column(String(30), default="PENDING")
    gst_match_score = Column(DECIMAL(5, 2), default=0)

    website = Column(String(255))
    description = Column(Text)

    trust_score = Column(DECIMAL(5, 2), default=0)
    total_reviews = Column(Integer, default=0)
    average_rating = Column(DECIMAL(3, 2), default=0)

    business_status = Column(String(20), default="ACTIVE")

    qr_code_url = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    mobile = Column(String(15), nullable=False)
    otp = Column(String(6), nullable=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    verified_at = Column(TIMESTAMP)


class CitySequence(Base):
    __tablename__ = "city_sequences"

    city_code = Column(String(10), primary_key=True)
    current_number = Column(Integer, default=0)