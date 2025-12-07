# Firebase Functions Setup Guide

This guide will help you set up and deploy the Firebase Functions for the CanineKind Training portal email system.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project already initialized (you should have a `.firebaserc` file)
- Node.js 18 or higher installed

## Email Service Setup

The functions use Nodemailer to send emails. You'll need to configure an email service provider.

### Option 1: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password**:
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google", select "2-Step Verification"
   - Scroll down and select "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Set Firebase environment variables**:
   ```bash
   firebase functions:config:set gmail.email="your-email@gmail.com"
   firebase functions:config:set gmail.password="your-app-password"
   ```

### Option 2: SendGrid (Recommended for Production)

1. Sign up for SendGrid: https://sendgrid.com/
2. Create an API key
3. Update `functions/index.js`:
   ```javascript
   const emailConfig = {
     host: 'smtp.sendgrid.net',
     port: 587,
     auth: {
       user: 'apikey',
       pass: functions.config().sendgrid?.apikey || process.env.SENDGRID_APIKEY
     }
   };
   ```
4. Set the environment variable:
   ```bash
   firebase functions:config:set sendgrid.apikey="YOUR_SENDGRID_API_KEY"
   ```

### Option 3: Other Email Services

Nodemailer supports many email services. Update the `emailConfig` in `functions/index.js` accordingly:
- **Mailgun**: Use SMTP credentials from Mailgun
- **AWS SES**: Configure with AWS credentials
- **Custom SMTP**: Use your own SMTP server

## Installation Steps

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Test Functions Locally (Optional)

```bash
# Start the Firebase emulator
npm run serve

# The functions will be available at:
# http://localhost:5001/YOUR-PROJECT-ID/us-central1/sendClientInvitation
# http://localhost:5001/YOUR-PROJECT-ID/us-central1/sendClientEmail
```

### 3. Deploy Firestore Rules

Before deploying functions, make sure your Firestore rules are up to date:

```bash
firebase deploy --only firestore:rules
```

### 4. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:sendClientInvitation
firebase deploy --only functions:sendClientEmail
firebase deploy --only functions:cleanupExpiredInvitations
```

## Functions Overview

### 1. `sendClientInvitation`

**Purpose**: Sends invitation emails to new clients

**Triggered by**: Admin action in `portal-admin-emails.html`

**Parameters**:
- `email`: Client's email address
- `name`: Client's name
- `token`: Unique invitation token

**What it does**:
1. Verifies the caller is an admin
2. Sends a beautifully formatted invitation email
3. Creates a signup link with the invitation token
4. Logs the email in the `emailLog` collection

### 2. `sendClientEmail`

**Purpose**: Sends custom emails to existing clients

**Triggered by**: Admin action in `portal-admin-emails.html`

**Parameters**:
- `email`: Client's email address
- `subject`: Email subject line
- `message`: Email message content
- `clientName`: Client's name (optional)

**What it does**:
1. Verifies the caller is an admin
2. Sends a custom formatted email
3. Logs the email in the `emailLog` collection

### 3. `cleanupExpiredInvitations`

**Purpose**: Automatically marks expired invitations

**Triggered by**: Scheduled to run every 24 hours

**What it does**:
1. Finds all pending invitations past their expiration date
2. Updates their status to 'expired'
3. Logs the number of updated invitations

## Testing

### Test Invitation Email

1. Log in to `portal-admin-emails.html` as an admin
2. Enter a test email address and name
3. Click "Send Invitation"
4. Check the Functions logs:
   ```bash
   firebase functions:log
   ```

### Test Client Email

1. Log in to `portal-admin-emails.html` as an admin
2. Select an existing client
3. Choose a template or write a custom message
4. Click "Send Email"
5. Verify the email was received

## Monitoring

### View Function Logs

```bash
# View all logs
firebase functions:log

# View logs for a specific function
firebase functions:log --only sendClientInvitation

# Stream logs in real-time
firebase functions:log --follow
```

### Firebase Console

You can also monitor functions in the Firebase Console:
- Go to https://console.firebase.google.com/
- Select your project
- Navigate to "Functions" in the left sidebar
- View execution logs, errors, and performance metrics

## Troubleshooting

### "Permission denied" errors

**Solution**: Make sure you're logged in as an admin user. Check that your user document has `role: 'admin'` in Firestore.

### Emails not sending

**Possible causes**:
1. **Email credentials not configured**:
   ```bash
   firebase functions:config:get
   ```
   This should show your gmail.email and gmail.password (or other service config)

2. **Gmail blocking sign-in**:
   - Make sure you're using an App Password, not your regular password
   - Check https://myaccount.google.com/notifications for security alerts

3. **Function deployment failed**:
   ```bash
   firebase deploy --only functions --debug
   ```

### "CORS" errors when calling functions

The functions are configured as `onCall` which automatically handles CORS. If you still see CORS errors:
1. Make sure you're calling the function from a Firebase-hosted domain
2. Check that your Firebase config is correct in `firebase-config.js`

### Invitations not tracking

1. Check that the invitation was created in Firestore:
   - Open Firebase Console → Firestore
   - Look for the `invitations` collection
   - Verify the document was created with the correct token

2. Check the `emailLog` collection for send status

## Cost Estimation

Firebase Functions pricing (as of 2024):
- **First 2 million invocations/month**: FREE
- **Additional invocations**: $0.40 per million
- **Compute time**: Based on GB-seconds (very minimal for email functions)

For a typical dog training business:
- 100 invitations/month + 200 client emails/month = 300 invocations
- **Cost**: $0 (well within free tier)

## Security Notes

1. **Email credentials are sensitive**: Never commit them to Git
2. **Admin verification**: All functions verify the caller is an admin
3. **Rate limiting**: Consider adding rate limiting for production to prevent abuse
4. **Email validation**: Functions validate email addresses before sending

## Next Steps

After deployment:

1. ✅ Test sending an invitation to yourself
2. ✅ Test sending a client email
3. ✅ Verify emails are logged in the `emailLog` collection
4. ✅ Verify invitations are tracked in the `invitations` collection
5. ✅ Set up the invitation acceptance flow in the signup process

## Support

If you encounter issues:
1. Check the Firebase Functions logs: `firebase functions:log`
2. Check the browser console in `portal-admin-emails.html`
3. Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
4. Review the Firebase Console for function execution errors
