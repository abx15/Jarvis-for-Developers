from fastapi import APIRouter, Request, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import stripe
import os
from datetime import datetime, timezone

from database.connection import get_db
from apps.api.models.billing import Subscription, BillingInvoice
from apps.api.models.user import User
from utils.logger import logger

router = APIRouter()

# Stripe webhook secret
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    try:
        # Get the raw request body
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            logger.error("No Stripe signature found")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No signature found"
            )
        
        # Verify the webhook signature
        try:
            event = stripe.Webhook.construct_event(
                body, signature, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid Stripe signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
        
        # Handle the event
        await handle_stripe_event(event, db)
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error handling Stripe webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


async def handle_stripe_event(event: stripe.Event, db: Session):
    """Handle different types of Stripe events"""
    event_type = event.type
    event_data = event.data.object
    
    logger.info(f"Handling Stripe event: {event_type}")
    
    try:
        if event_type == "invoice.paid":
            await handle_invoice_paid(event_data, db)
        elif event_type == "invoice.payment_failed":
            await handle_invoice_payment_failed(event_data, db)
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(event_data, db)
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event_data, db)
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event_data, db)
        elif event_type == "invoice.created":
            await handle_invoice_created(event_data, db)
        elif event_type == "invoice.finalized":
            await handle_invoice_finalized(event_data, db)
        elif event_type == "payment_intent.succeeded":
            await handle_payment_succeeded(event_data, db)
        elif event_type == "payment_intent.payment_failed":
            await handle_payment_failed(event_data, db)
        else:
            logger.info(f"Unhandled Stripe event type: {event_type}")
    
    except Exception as e:
        logger.error(f"Error handling Stripe event {event_type}: {str(e)}")
        raise


async def handle_invoice_paid(invoice: stripe.Invoice, db: Session):
    """Handle successful invoice payment"""
    logger.info(f"Invoice paid: {invoice.id}")
    
    # Find the subscription
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == invoice.subscription
    ).first()
    
    if subscription:
        # Update subscription status
        subscription.status = "active"
        
        # Update billing period
        if invoice.period_start:
            subscription.current_period_start = datetime.fromtimestamp(
                invoice.period_start, tz=timezone.utc
            )
        if invoice.period_end:
            subscription.current_period_end = datetime.fromtimestamp(
                invoice.period_end, tz=timezone.utc
            )
        
        db.commit()
        logger.info(f"Updated subscription {subscription.id} status to active")
    
    # Update invoice record
    await update_invoice_record(invoice, "paid", db)


async def handle_invoice_payment_failed(invoice: stripe.Invoice, db: Session):
    """Handle failed invoice payment"""
    logger.warning(f"Invoice payment failed: {invoice.id}")
    
    # Find the subscription
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == invoice.subscription
    ).first()
    
    if subscription:
        # Update subscription status
        subscription.status = "past_due"
        db.commit()
        logger.warning(f"Updated subscription {subscription.id} status to past_due")
    
    # Update invoice record
    await update_invoice_record(invoice, "open", db)


async def handle_subscription_created(subscription: stripe.Subscription, db: Session):
    """Handle subscription creation"""
    logger.info(f"Subscription created: {subscription.id}")
    
    # Find subscription by Stripe ID
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription.id
    ).first()
    
    if db_subscription:
        # Update subscription details
        db_subscription.status = subscription.status
        db_subscription.current_period_start = datetime.fromtimestamp(
            subscription.current_period_start, tz=timezone.utc
        )
        db_subscription.current_period_end = datetime.fromtimestamp(
            subscription.current_period_end, tz=timezone.utc
        )
        db_subscription.cancel_at_period_end = subscription.cancel_at_period_end
        
        # Determine plan type from price ID
        plan_type = get_plan_type_from_price(subscription.items.data[0].price.id)
        if plan_type:
            db_subscription.plan_type = plan_type
        
        db.commit()
        logger.info(f"Updated subscription {db_subscription.id} from Stripe webhook")


async def handle_subscription_updated(subscription: stripe.Subscription, db: Session):
    """Handle subscription updates"""
    logger.info(f"Subscription updated: {subscription.id}")
    
    # Find subscription by Stripe ID
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription.id
    ).first()
    
    if db_subscription:
        # Update subscription details
        db_subscription.status = subscription.status
        db_subscription.current_period_start = datetime.fromtimestamp(
            subscription.current_period_start, tz=timezone.utc
        )
        db_subscription.current_period_end = datetime.fromtimestamp(
            subscription.current_period_end, tz=timezone.utc
        )
        db_subscription.cancel_at_period_end = subscription.cancel_at_period_end
        
        # Update plan type if changed
        if subscription.items.data:
            plan_type = get_plan_type_from_price(subscription.items.data[0].price.id)
            if plan_type:
                db_subscription.plan_type = plan_type
        
        db.commit()
        logger.info(f"Updated subscription {db_subscription.id} from Stripe webhook")


async def handle_subscription_deleted(subscription: stripe.Subscription, db: Session):
    """Handle subscription deletion/cancellation"""
    logger.info(f"Subscription deleted: {subscription.id}")
    
    # Find subscription by Stripe ID
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription.id
    ).first()
    
    if db_subscription:
        # Update subscription to free plan
        db_subscription.status = "canceled"
        db_subscription.plan_type = "free"
        db_subscription.stripe_subscription_id = None
        db_subscription.current_period_start = None
        db_subscription.current_period_end = None
        db_subscription.cancel_at_period_end = False
        
        db.commit()
        logger.info(f"Canceled subscription {db_subscription.id}, converted to free plan")


async def handle_invoice_created(invoice: stripe.Invoice, db: Session):
    """Handle invoice creation"""
    logger.info(f"Invoice created: {invoice.id}")
    
    # Create invoice record
    await create_invoice_record(invoice, "draft", db)


async def handle_invoice_finalized(invoice: stripe.Invoice, db: Session):
    """Handle invoice finalization"""
    logger.info(f"Invoice finalized: {invoice.id}")
    
    # Update invoice record
    await update_invoice_record(invoice, "open", db)


async def handle_payment_succeeded(payment_intent: stripe.PaymentIntent, db: Session):
    """Handle successful payment"""
    logger.info(f"Payment succeeded: {payment_intent.id}")
    # Payment success is handled through invoice.paid event


async def handle_payment_failed(payment_intent: stripe.PaymentIntent, db: Session):
    """Handle failed payment"""
    logger.warning(f"Payment failed: {payment_intent.id}")
    # Payment failure is handled through invoice.payment_failed event


async def create_invoice_record(invoice: stripe.Invoice, status: str, db: Session):
    """Create or update invoice record in database"""
    try:
        # Find user by Stripe customer ID
        subscription = db.query(Subscription).filter(
            Subscription.stripe_customer_id == invoice.customer
        ).first()
        
        if not subscription:
            logger.warning(f"No subscription found for customer {invoice.customer}")
            return
        
        # Check if invoice already exists
        existing_invoice = db.query(BillingInvoice).filter(
            BillingInvoice.stripe_invoice_id == invoice.id
        ).first()
        
        if existing_invoice:
            await update_invoice_record(invoice, status, db)
            return
        
        # Create new invoice record
        new_invoice = BillingInvoice(
            user_id=subscription.user_id,
            stripe_invoice_id=invoice.id,
            amount=float(invoice.total) / 100,  # Convert from cents
            currency=invoice.currency.upper(),
            status=status,
            due_date=datetime.fromtimestamp(invoice.due_date, tz=timezone.utc) if invoice.due_date else None,
            hosted_invoice_url=invoice.hosted_invoice_url,
            invoice_pdf=invoice.invoice_pdf
        )
        
        db.add(new_invoice)
        db.commit()
        logger.info(f"Created invoice record for {invoice.id}")
        
    except Exception as e:
        logger.error(f"Error creating invoice record: {str(e)}")
        raise


async def update_invoice_record(invoice: stripe.Invoice, status: str, db: Session):
    """Update existing invoice record"""
    try:
        existing_invoice = db.query(BillingInvoice).filter(
            BillingInvoice.stripe_invoice_id == invoice.id
        ).first()
        
        if not existing_invoice:
            await create_invoice_record(invoice, status, db)
            return
        
        # Update invoice
        existing_invoice.status = status
        existing_invoice.amount = float(invoice.total) / 100  # Convert from cents
        existing_invoice.currency = invoice.currency.upper()
        existing_invoice.hosted_invoice_url = invoice.hosted_invoice_url
        existing_invoice.invoice_pdf = invoice.invoice_pdf
        
        if status == "paid" and invoice.status_transitions.paid_at:
            existing_invoice.paid_at = datetime.fromtimestamp(
                invoice.status_transitions.paid_at, tz=timezone.utc
            )
        
        db.commit()
        logger.info(f"Updated invoice record for {invoice.id}")
        
    except Exception as e:
        logger.error(f"Error updating invoice record: {str(e)}")
        raise


def get_plan_type_from_price(price_id: str) -> str:
    """Determine plan type from Stripe price ID"""
    from services.billing_service import SUBSCRIPTION_PLANS
    
    for plan_type, config in SUBSCRIPTION_PLANS.items():
        if config.get("price_id") == price_id:
            return plan_type
    
    logger.warning(f"Unknown price ID: {price_id}")
    return None


# Utility function to manually sync a subscription from Stripe
@router.post("/sync-subscription/{stripe_subscription_id}")
async def sync_subscription(
    stripe_subscription_id: str,
    db: Session = Depends(get_db)
):
    """Manually sync a subscription from Stripe (for debugging)"""
    try:
        from services.billing_service import BillingService
        
        billing_service = BillingService(db)
        subscription = await billing_service.sync_subscription_from_stripe(stripe_subscription_id)
        
        if subscription:
            return {"status": "success", "subscription": subscription}
        else:
            return {"status": "error", "message": "Subscription not found"}
    
    except Exception as e:
        logger.error(f"Error syncing subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
