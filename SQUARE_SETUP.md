# Square Checkout API Setup Guide

## Step 1: Get Your Square API Credentials

1. Go to https://developer.squareup.com/apps
2. Sign in with your Square account
3. Create a new application or select an existing one
4. Go to the **Credentials** tab

### Get Your Access Token:
- For testing: Copy the **Sandbox Access Token**
- For live: Copy the **Production Access Token**

### Get Your Location ID:
- Go to the **Locations** tab
- Copy the Location ID for your business

## Step 2: Configure Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add the following variables:

```
SQUARE_ACCESS_TOKEN = [Your Access Token from Square]
SQUARE_LOCATION_ID = [Your Location ID from Square]
SQUARE_ENVIRONMENT = sandbox  (or 'production' when ready to go live)
URL = https://caninekind.io
```

## Step 3: Install Dependencies

Run this command in your project:

```bash
npm install
```

This will install the Square SDK.

## Step 4: Test Your Setup

### Testing in Sandbox Mode:
1. Set `SQUARE_ENVIRONMENT=sandbox`
2. Add items to cart
3. Click "Proceed to Checkout"
4. You'll be redirected to Square's test checkout page
5. Use Square's test card numbers: https://developer.squareup.com/docs/devtools/sandbox/payments#card-brands-and-test-numbers

**Example test card:**
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiration: Any future date
- ZIP: Any 5 digits

## Step 5: Go Live

When ready for production:
1. Update environment variables in Netlify:
   - `SQUARE_ACCESS_TOKEN` = Your Production Access Token
   - `SQUARE_ENVIRONMENT` = production
2. Redeploy your site
3. Test with a real card (you can refund test orders)

## How It Works

1. Customer adds items to cart
2. Customer clicks "Proceed to Checkout"
3. Netlify function creates a Square Payment Link with all cart items
4. Customer is redirected to Square's secure checkout page
5. Square handles payment processing
6. Customer is redirected back to your order confirmation page
7. Cart is automatically cleared

## Features

✅ Handles multiple items automatically
✅ Square collects shipping address
✅ Supports Apple Pay, Google Pay, Cash App Pay
✅ Mobile-optimized checkout
✅ PCI compliant (Square handles all payment data)
✅ Email receipts sent automatically by Square

## Support

- Square Developer Docs: https://developer.squareup.com/docs
- Square Support: https://squareup.com/help/us/en
