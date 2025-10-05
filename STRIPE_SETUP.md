# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for wallet recharge functionality in the CircularSync application.

## Prerequisites

1. **Stripe Account**: Create a Stripe account at [https://stripe.com](https://stripe.com)
2. **Node.js and npm**: For frontend dependencies
3. **PostgreSQL**: For database setup
4. **Ballerina**: For backend services

## Backend Setup

### 1. Install Stripe Dependency

The Stripe dependency has been added to `Ballerina.toml`:

```toml
[[dependency]]
org = "ballerinax"
name = "stripe"
version = "3.0.0"
```

### 2. Configure Stripe Credentials

Update your `Config.toml` file with your Stripe credentials:

```toml
# Stripe Payment Configuration
stripeSecretKey = "sk_test_your-stripe-secret-key-here"
stripeWebhookSecret = "whsec_your-webhook-secret-here"
```

**Important**: 
- Use test keys for development (starting with `sk_test_`)
- Never commit real API keys to version control
- Use environment variables in production

### 3. Database Setup

Run the payment schema SQL script to create required tables:

```bash
psql -U your_username -d your_database -f backend/scripts/payment_schema.sql
```

This creates:
- `payment_intents` table for tracking Stripe payments
- `payment_methods` table for storing user payment methods
- `stripe_customers` table for Stripe customer mapping
- Necessary indexes and triggers

### 4. Start Payment Service

The payment service runs on port 8098. Make sure this port is available:

```bash
cd backend
bal run
```

## Frontend Setup

### 1. Install Stripe Dependencies

Install the required Stripe packages:

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Stripe Publishable Key

Update your `.env` file:

```env
# Add your Stripe publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here

# Add payment API URL
NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:8098
```

### 3. Start Frontend

```bash
npm run dev
```

## Stripe Dashboard Configuration

### 1. Get API Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers > API keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, go to **Developers > Webhooks**

### 2. Setup Webhooks (Optional)

Create a webhook endpoint for production:

1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`

### 3. Test Cards

Use these test card numbers during development:

- **Visa**: 4242424242424242
- **Visa (debit)**: 4000056655665556
- **Mastercard**: 5555555555554444
- **Declined card**: 4000000000000002

Use any future expiry date, any 3-digit CVC, and any postal code.

## Features Implemented

### Backend Features

1. **Payment Intent Creation**: Create secure payment intents for wallet recharge
2. **Payment Confirmation**: Verify and process successful payments
3. **Customer Management**: Create and manage Stripe customers
4. **Webhook Processing**: Handle Stripe webhook events
5. **Database Integration**: Automatic wallet balance updates
6. **Transaction Logging**: Complete audit trail of payments

### Frontend Features

1. **Stripe Elements**: Secure card input with Stripe Elements
2. **Payment Flow**: Multi-step payment process with validation
3. **Real-time Validation**: Amount and payment method validation
4. **Error Handling**: Comprehensive error messages and recovery
5. **Loading States**: User feedback during payment processing
6. **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### Payment Service (Port 8098)

- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm-payment` - Confirm payment
- `GET /api/payment/intent/{id}` - Get payment intent status
- `POST /api/payment/customer` - Create Stripe customer
- `POST /api/payment/webhook` - Handle Stripe webhooks

### Frontend API Routes

- `POST /api/payment/create-intent` - Proxy to backend
- `POST /api/payment/confirm-payment` - Proxy to backend
- `GET /api/payment/intent/[id]` - Proxy to backend
- `POST /api/payment/customer` - Proxy to backend

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **HTTPS**: Always use HTTPS in production
3. **Webhook Verification**: Verify webhook signatures
4. **Amount Validation**: Validate amounts on both frontend and backend
5. **Authentication**: All endpoints require user authentication
6. **Input Sanitization**: Validate and sanitize all inputs

## Testing

### 1. Test Payment Flow

1. Navigate to wallet dashboard
2. Click "Deposit Funds"
3. Select "Credit/Debit Card" payment method
4. Enter amount and click "Continue to Payment"
5. Use test card: 4242424242424242
6. Complete payment and verify wallet balance update

### 2. Test Error Scenarios

- Invalid card numbers
- Expired cards
- Insufficient funds
- Network errors

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Run `npm install` to install dependencies
2. **Stripe key errors**: Verify your publishable key is correct
3. **Payment failures**: Check Stripe Dashboard for detailed error logs
4. **Database errors**: Ensure payment schema is properly applied
5. **CORS issues**: Verify service configurations and ports

### Debug Logs

Check these locations for debug information:

- Ballerina console output
- Browser developer console
- Stripe Dashboard > Logs
- Backend log files

## Production Deployment

### 1. Environment Variables

Set these environment variables in production:

```bash
# Backend
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-live-webhook-secret

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
NEXT_PUBLIC_PAYMENT_API_URL=https://yourdomain.com/api/payment
```

### 2. Webhook Endpoints

Update webhook URL to your production domain and ensure HTTPS.

### 3. Database

Apply the payment schema to your production database.

## Support

For additional help:

1. **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
2. **Ballerina Stripe Connector**: [https://central.ballerina.io/ballerinax/stripe](https://central.ballerina.io/ballerinax/stripe)
3. **CircularSync Documentation**: Check the docs folder

## Next Steps

1. Implement payment method management (save/delete cards)
2. Add subscription billing for premium features
3. Implement refund functionality
4. Add multi-currency support
5. Integration with accounting systems