# Square Checkout API Setup Guide (Firebase Functions)

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

## Step 2: Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

This will install the Square SDK and other required packages.

## Step 3: Configure Environment Variables in Firebase

You need to set environment variables for your Firebase Functions:

```bash
# Set Square credentials
firebase functions:config:set square.access_token="YOUR_ACCESS_TOKEN"
firebase functions:config:set square.location_id="YOUR_LOCATION_ID"
firebase functions:config:set square.environment="sandbox"
firebase functions:config:set square.site_url="https://caninekind.io"
```

**Alternative:** You can also use a `.env` file in the functions directory for local testing:

```bash
cd functions
cp ../.env.example .env
# Edit .env with your credentials
```

## Step 4: Deploy Firebase Function

Deploy the Square checkout function to Firebase:

```bash
firebase deploy --only functions:createSquareCheckout
```

Or deploy all functions:

```bash
firebase deploy --only functions
```

## Step 5: Test Your Setup

### Testing in Sandbox Mode:
1. Make sure `SQUARE_ENVIRONMENT=sandbox` in your Firebase config
2. Add items to cart on your website
3. Click "Proceed to Checkout"
4. You'll be redirected to Square's test checkout page
5. Use Square's test card numbers: https://developer.squareup.com/docs/devtools/sandbox/payments#card-brands-and-test-numbers

**Example test card:**
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiration: Any future date
- ZIP: Any 5 digits

## Step 6: Go Live

When ready for production:

1. Update environment variables in Firebase:
   ```bash
   firebase functions:config:set square.access_token="YOUR_PRODUCTION_ACCESS_TOKEN"
   firebase functions:config:set square.environment="production"
   ```

2. Redeploy your function:
   ```bash
   firebase deploy --only functions:createSquareCheckout
   ```

3. Test with a real card (you can refund test orders)

## How It Works

1. Customer adds items to cart
2. Customer clicks "Proceed to Checkout"
3. Firebase Function creates a Square Payment Link with all cart items
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

## Firebase Function Details

- **Function Name:** `createSquareCheckout`
- **Type:** HTTPS callable function
- **URL:** `https://us-central1-caninekind-client-portal.cloudfunctions.net/createSquareCheckout`
- **Method:** POST
- **Required Environment Variables:**
  - `SQUARE_ACCESS_TOKEN`
  - `SQUARE_LOCATION_ID`
  - `SQUARE_ENVIRONMENT` (sandbox or production)
  - `SITE_URL` (your website URL)

## Troubleshooting

### Function not working?
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify environment variables are set: `firebase functions:config:get`
3. Make sure you deployed the function: `firebase deploy --only functions:createSquareCheckout`

### CORS errors?
The function already includes CORS headers to allow requests from any origin. If you still have issues, check your browser console for specific error messages.

### Environment variables not working?
After setting environment variables with `firebase functions:config:set`, you must redeploy your functions for the changes to take effect.

## Support

- Firebase Functions Docs: https://firebase.google.com/docs/functions
- Square Developer Docs: https://developer.squareup.com/docs
- Square Support: https://squareup.com/help/us/en
