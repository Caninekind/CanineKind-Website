const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { Client, Environment } = require('square');

admin.initializeApp();

// Email configuration - YOU NEED TO UPDATE THESE WITH YOUR EMAIL SERVICE CREDENTIALS
// For production, use environment variables: firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const emailConfig = {
  service: 'gmail', // or 'sendgrid', 'mailgun', etc.
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
    pass: functions.config().gmail?.password || process.env.GMAIL_PASSWORD
  }
};

const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send invitation email to a new client
 * Called from portal-admin-emails.html when admin invites a new client
 */
exports.sendClientInvitation = functions.https.onCall(async (data, context) => {
  // Verify the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerUid = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(callerUid).get();

  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can send invitations');
  }

  const { email, name, token } = data;

  if (!email || !token) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and token are required');
  }

  // Create the invitation signup link
  const signupLink = `https://caninekindtraining.com/portal-login.html?invite=${token}`;

  // Email content
  const mailOptions = {
    from: `CanineKind Training <${emailConfig.auth.user}>`,
    to: email,
    subject: 'Welcome to CanineKind Training Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(135deg, #799972 0%, #5a7a52 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-left: 1px solid #e0e0e0;
            border-right: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            background: #799972;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐾 Welcome to CanineKind Training!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>

          <p>Thank you for choosing CanineKind Training! We're excited to begin working with you and your furry friend.</p>

          <p>You've been invited to join our client portal, where you can:</p>
          <ul>
            <li>Complete required forms and agreements</li>
            <li>Track your training goals and progress</li>
            <li>View session notes and schedules</li>
            <li>Access training resources and videos</li>
          </ul>

          <p>To get started, please click the button below to create your account:</p>

          <div style="text-align: center;">
            <a href="${signupLink}" class="button">Create My Account</a>
          </div>

          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${signupLink}">${signupLink}</a>
          </p>

          <p style="margin-top: 30px; color: #e74c3c; font-weight: bold;">
            ⏰ This invitation expires in 7 days.
          </p>

          <p>If you have any questions, please don't hesitate to reach out!</p>

          <p>Looking forward to working with you,<br>
          <strong>CanineKind Training</strong></p>
        </div>
        <div class="footer">
          <p>CanineKind Training | Professional Dog Training Services</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Log the email in Firestore
    await admin.firestore().collection('emailLog').add({
      type: 'invitation',
      to: email,
      subject: mailOptions.subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: callerUid,
      status: 'sent',
      invitationToken: token
    });

    return { success: true, message: 'Invitation sent successfully' };
  } catch (error) {
    console.error('Error sending invitation email:', error);

    // Log failed email attempt
    await admin.firestore().collection('emailLog').add({
      type: 'invitation',
      to: email,
      subject: mailOptions.subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: callerUid,
      status: 'failed',
      error: error.message,
      invitationToken: token
    });

    throw new functions.https.HttpsError('internal', 'Failed to send invitation email');
  }
});

/**
 * Send email to existing client
 * Called from portal-admin-emails.html when admin sends email to existing client
 */
exports.sendClientEmail = functions.https.onCall(async (data, context) => {
  // Verify the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerUid = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(callerUid).get();

  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can send emails');
  }

  const { email, subject, message, clientName } = data;

  if (!email || !subject || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, subject, and message are required');
  }

  // Email content
  const mailOptions = {
    from: `CanineKind Training <${emailConfig.auth.user}>`,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(135deg, #799972 0%, #5a7a52 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-left: 1px solid #e0e0e0;
            border-right: 1px solid #e0e0e0;
            white-space: pre-wrap;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐾 CanineKind Training</h1>
        </div>
        <div class="content">
          ${message}
        </div>
        <div class="footer">
          <p>CanineKind Training | Professional Dog Training Services</p>
          <p>You can reply directly to this email if you have any questions.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Log the email in Firestore
    await admin.firestore().collection('emailLog').add({
      type: 'client_email',
      to: email,
      subject: subject,
      message: message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: callerUid,
      status: 'sent',
      clientName: clientName || 'Unknown'
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending client email:', error);

    // Log failed email attempt
    await admin.firestore().collection('emailLog').add({
      type: 'client_email',
      to: email,
      subject: subject,
      message: message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: callerUid,
      status: 'failed',
      error: error.message,
      clientName: clientName || 'Unknown'
    });

    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

/**
 * Clean up expired invitations
 * Run daily to update invitation status to 'expired'
 */
exports.cleanupExpiredInvitations = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();

  const expiredInvitations = await admin.firestore().collection('invitations')
    .where('status', '==', 'pending')
    .where('expiresAt', '<', now)
    .get();

  const batch = admin.firestore().batch();

  expiredInvitations.forEach(doc => {
    batch.update(doc.ref, { status: 'expired' });
  });

  await batch.commit();

  console.log(`Updated ${expiredInvitations.size} expired invitations`);
  return null;
});

/**
 * Create Square Checkout Session
 * Called from shop.html when customer proceeds to checkout
 */
exports.createSquareCheckout = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { items, customerInfo } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      res.status(400).json({ error: 'No items in cart' });
      return;
    }

    // Get Square configuration from environment variables
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
    const squareLocationId = process.env.SQUARE_LOCATION_ID;
    const squareEnvironment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    const siteUrl = process.env.SITE_URL || 'https://caninekind.io';

    if (!squareAccessToken || !squareLocationId) {
      console.error('Missing Square credentials');
      res.status(500).json({ error: 'Square checkout not configured' });
      return;
    }

    // Initialize Square client
    const client = new Client({
      environment: squareEnvironment === 'production'
        ? Environment.Production
        : Environment.Sandbox,
      accessToken: squareAccessToken
    });

    // Calculate total amount
    const totalAmount = Math.round(
      items.reduce((total, item) => total + (item.price * item.quantity), 0) * 100
    );

    // Create payment link
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quickPay: {
        name: 'CanineKind Shop Order',
        priceMoney: {
          amount: totalAmount,
          currency: 'USD'
        },
        locationId: squareLocationId
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/order-confirmation`,
        askForShippingAddress: true,
        merchantSupportEmail: 'caninekindtraining@gmail.com',
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
          cashAppPay: true,
          afterpayClearpay: false
        }
      },
      prePopulatedData: customerInfo ? {
        buyerEmail: customerInfo.email,
        buyerPhoneNumber: customerInfo.phone
      } : undefined
    });

    res.status(200).json({
      checkoutUrl: result.paymentLink.url,
      orderId: result.paymentLink.orderId
    });

  } catch (error) {
    console.error('Square Checkout Error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message
    });
  }
});
