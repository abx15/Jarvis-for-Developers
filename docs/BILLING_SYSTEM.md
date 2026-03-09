# Phase 16: SaaS Billing and Subscription System

This implementation adds a complete SaaS billing and subscription system to the AI Developer OS platform.

## Overview

The billing system transforms the platform into a commercial SaaS product with:

- **Subscription Plans**: Free, Pro, and Team tiers
- **Stripe Integration**: Secure payment processing and subscription management
- **Usage Tracking**: Monitor AI requests, tokens, repository scans, and agent executions
- **Billing Dashboard**: User-friendly interface for managing subscriptions
- **Webhook Handling**: Real-time synchronization with Stripe events
- **Access Control**: Middleware for enforcing plan limits

## Architecture

### Backend Components

#### 1. Database Schema (`database/schema.sql`)
- `subscriptions`: User subscription information
- `usage_logs`: Feature usage tracking
- `billing_invoices`: Payment history

#### 2. Services
- `services/billing_service.py`: Stripe integration and subscription management
- `services/usage_tracker.py`: Usage monitoring and limit enforcement

#### 3. API Routes
- `apps/api/routes/billing.py`: Billing endpoints
- `apps/api/routes/stripe_webhook.py`: Stripe webhook handler

#### 4. Middleware
- `utils/subscription_middleware.py`: Plan-based access control

### Frontend Components

#### 1. UI Components (`apps/web/components/billing/`)
- `PlanSelector`: Subscription plan comparison and upgrade
- `BillingDashboard`: Current plan overview and usage statistics
- `InvoiceList`: Billing history and invoice downloads
- `UsageMeter`: Visual usage progress bars

#### 2. Pages
- `apps/web/pages/dashboard/billing.tsx`: Complete billing management interface

## Subscription Plans

### Free Plan
- 100 AI requests per month
- 1 repository
- Basic AI agents
- Community support

### Pro Plan ($29/month)
- Unlimited AI requests
- Unlimited repositories
- Advanced AI agents
- Priority processing
- Email support

### Team Plan ($99/month)
- Everything in Pro
- Up to 10 team members
- Team collaboration
- Enterprise features
- Priority support

## Setup Instructions

### 1. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Configure the following variables:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Price IDs (create these in Stripe dashboard)
STRIPE_PRO_PRICE_ID=price_your-pro-plan-price-id
STRIPE_TEAM_PRICE_ID=price_your-team-plan-price-id
```

### 2. Stripe Setup

1. Create a Stripe account: https://dashboard.stripe.com/register
2. Create products and prices:
   - Pro Plan: $29/month
   - Team Plan: $99/month
3. Copy the price IDs to your environment
4. Set up webhook endpoint: `https://your-domain.com/api/v1/webhooks/stripe-webhook`
5. Configure webhook events:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.created`
   - `customer.subscription.updated`

### 3. Database Migration

Run the database schema updates:
```bash
psql -d ai_developer_os -f database/schema.sql
```

### 4. Install Dependencies

Backend:
```bash
cd apps/api
pip install -r requirements.txt
```

Frontend:
```bash
cd apps/web
npm install
```

### 5. Start Services

Backend API:
```bash
cd apps/api
uvicorn main:app --reload
```

Frontend:
```bash
cd apps/web
npm run dev
```

## API Endpoints

### Billing Management
- `POST /api/v1/billing/create-customer` - Create Stripe customer
- `POST /api/v1/billing/create-subscription` - Create subscription
- `PUT /api/v1/billing/update-subscription` - Update subscription
- `POST /api/v1/billing/cancel-subscription` - Cancel subscription
- `GET /api/v1/billing/subscription` - Get current subscription
- `GET /api/v1/billing/usage` - Get usage statistics
- `GET /api/v1/billing/plans` - Get available plans
- `POST /api/v1/billing/billing-portal` - Open Stripe portal
- `GET /api/v1/billing/invoices` - Get billing history

### Webhooks
- `POST /api/v1/webhooks/stripe-webhook` - Stripe webhook handler

## Usage Tracking

The system tracks the following metrics:

### Features
- `ai_requests`: Number of AI API calls
- `ai_tokens`: AI token consumption
- `repo_scans`: Repository analysis operations
- `agent_executions`: AI agent runs

### Implementation

To track usage in your API endpoints:

```python
from utils.subscription_middleware import track_api_usage

@router.post("/ai/generate")
async def generate_code(
    request: CodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    # Track usage automatically
    usage_tracker: bool = Depends(track_api_usage("ai_requests", 1))
):
    # Your endpoint logic
    pass
```

### Access Control

To enforce plan limits:

```python
from utils.subscription_middleware import check_ai_requests

@router.post("/ai/generate")
async def generate_code(
    request: CodeRequest,
    # Check if user can make AI requests
    has_access: bool = Depends(check_ai_requests(1)),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Your endpoint logic
    pass
```

## Frontend Integration

### Adding Billing to Navigation

```tsx
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      {/* ... other nav items */}
      <Link href="/dashboard/billing">
        Billing
      </Link>
    </nav>
  );
}
```

### Using Billing Components

```tsx
import { BillingDashboard, PlanSelector } from '@/components/billing/BillingComponents';

function BillingPage() {
  return (
    <div>
      <BillingDashboard 
        usageData={usageData}
        onManageBilling={handleManageBilling}
      />
      <PlanSelector
        plans={plans}
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

## Security Considerations

1. **Webhook Verification**: All Stripe webhooks are verified using signature validation
2. **Rate Limiting**: API endpoints are protected with rate limiting
3. **Access Control**: Subscription middleware enforces plan limits
4. **Data Encryption**: Sensitive data is encrypted at rest
5. **Audit Logging**: All billing operations are logged

## Monitoring and Analytics

### Key Metrics to Monitor
- Subscription conversion rates
- Customer churn
- Revenue per user
- Feature usage patterns
- Payment failure rates

### Recommended Tools
- Stripe Dashboard for payment analytics
- Custom dashboard for usage metrics
- Alert system for payment failures

## Testing

### Unit Tests
```bash
cd apps/api
pytest tests/test_billing.py -v
```

### Integration Tests
```bash
cd apps/api
pytest tests/test_billing_integration.py -v
```

### Stripe Test Mode
Use Stripe test keys and test cards for development:
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Deployment

### Production Checklist
- [ ] Use production Stripe keys
- [ ] Configure webhook endpoints
- [ ] Set up SSL certificates
- [ ] Configure database backups
- [ ] Set up monitoring alerts
- [ ] Test payment flows
- [ ] Verify webhook delivery

### Environment Variables
Ensure all production environment variables are set:
- `STRIPE_SECRET_KEY` (production key)
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL` (production database)
- `FRONTEND_URL` (production URL)

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check Stripe webhook logs

2. **Payment Failed**
   - Verify Stripe keys are correct
   - Check customer payment methods
   - Review webhook event logs

3. **Usage Not Tracked**
   - Ensure usage tracker is implemented
   - Check database connection
   - Review middleware configuration

4. **Plan Limits Not Enforced**
   - Verify middleware is applied
   - Check subscription status
   - Review usage tracking data

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug
```

Check logs for detailed error information.

## Support

For billing-related issues:
1. Check Stripe Dashboard for payment issues
2. Review application logs
3. Verify webhook configuration
4. Test with Stripe test mode

## Future Enhancements

### Planned Features
- Annual billing options
- Custom enterprise plans
- Usage-based billing
- Multi-currency support
- Advanced analytics dashboard
- Automated dunning management
- Refund management system

### Scalability Considerations
- Database partitioning for usage logs
- Caching for subscription data
- Queue system for webhook processing
- Load balancing for billing APIs

---

This billing system provides a solid foundation for monetizing the AI Developer OS platform while maintaining a great user experience and robust security.
