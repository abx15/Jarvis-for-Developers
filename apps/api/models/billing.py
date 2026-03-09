from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, DECIMAL, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan_type = Column(String(50), default="free", nullable=False)  # 'free', 'pro', 'team'
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # 'active', 'canceled', 'past_due', 'unpaid'
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subscription")
    usage_logs = relationship("UsageLogs", back_populates="subscription", cascade="all, delete-orphan")
    billing_invoices = relationship("BillingInvoice", back_populates="subscription", cascade="all, delete-orphan")


class UsageLogs(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature = Column(String(100), nullable=False)  # 'ai_requests', 'ai_tokens', 'repo_scans', 'agent_executions'
    usage_count = Column(Integer, default=1, nullable=False)
    metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="usage_logs")


class BillingInvoice(Base):
    __tablename__ = "billing_invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_invoice_id = Column(String(255), unique=True, nullable=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="usd", nullable=False)
    status = Column(String(50), nullable=False)  # 'draft', 'open', 'paid', 'void', 'uncollectible'
    due_date = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    hosted_invoice_url = Column(Text, nullable=True)
    invoice_pdf = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="billing_invoices")
