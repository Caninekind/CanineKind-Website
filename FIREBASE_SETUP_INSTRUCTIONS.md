# Firebase Google OAuth Setup Instructions

This guide will walk you through setting up Firebase Authentication with Google OAuth for your CanineKind client portal.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "CanineKind Portal")
4. Follow the setup wizard:
   - Choose whether to enable Google Analytics (optional)
   - Accept the terms and click "Create project"
5. Wait for Firebase to create your project

## Step 2: Register Your Web App

1. In the Firebase Console, click on the web icon (`</>`) to add a web app
2. Register your app:
   - App nickname: "CanineKind Website"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. You'll see your Firebase configuration object - **SAVE THIS!**

## Step 3: Enable Google Authentication

1. In the Firebase Console, go to **Build > Authentication**
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Click on "Google" in the providers list
5. Toggle the "Enable" switch
6. Configure the provider:
   - **Project support email**: Enter your email (e.g., caninekindtraining@gmail.com)
   - **Project public-facing name**: CanineKind
7. Click "Save"

## Step 4: Configure Authorized Domains

1. Still in **Authentication**, go to the **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domain(s):
   - `caninekind.io`
   - `www.caninekind.io`
   - `localhost` (for local testing)
4. Click "Add domain" for each one

## Step 5: Update Firebase Configuration

1. Open the file `firebase-config.js` in your website folder
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};
```

**Where to find these values:**
- Firebase Console > Project Settings (gear icon) > General
- Scroll down to "Your apps" section
- Copy each value from the SDK setup and configuration

## Step 6: Deploy Your Website

### If using GitHub Pages:

1. Commit and push your changes to GitHub:
```bash
git add .
git commit -m "Add Firebase Google OAuth authentication"
git push
```

2. Your site should automatically deploy to `caninekind.io`

### If testing locally:

1. Open `portal-login.html` in your browser
2. Or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## Step 7: Test the Authentication Flow

1. Navigate to your portal login page: `https://caninekind.io/portal-login.html`
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to the dashboard: `https://caninekind.io/portal-dashboard.html`
5. Your name, email, and photo should appear in the user info bar
6. Click "Sign Out" to test the logout functionality

## Security Best Practices

### Protect Your API Key

While Firebase API keys are safe to expose in client-side code (they're restricted by domain), you should still:

1. Enable **App Check** in Firebase Console to prevent unauthorized access
2. Set up **Firestore Security Rules** if you add database functionality later
3. Monitor usage in Firebase Console regularly

### Optional: Add .gitignore Protection

Create a `.gitignore` file to exclude sensitive files:

```
# Firebase
.firebase/
firebase-debug.log
.env
```

## Troubleshooting

### "auth/unauthorized-domain" Error

**Problem:** Your domain is not authorized
**Solution:** Add your domain to Authorized Domains in Firebase Console (Step 4)

### "Firebase not defined" Error

**Problem:** Firebase SDK not loading
**Solution:** Check that the Firebase CDN scripts are loading correctly. Check your browser's network tab.

### Popup Blocked Error

**Problem:** Browser is blocking the Google sign-in popup
**Solution:** Allow popups for your domain, or use redirect instead of popup (modify `firebase-config.js`)

### "Access Denied" After Sign-In

**Problem:** Google OAuth not properly configured
**Solution:** Verify Google is enabled in Authentication > Sign-in method

## Next Steps

Now that basic authentication is working, you can:

1. **Add user data storage**: Store user profiles in Firestore
2. **Implement role-based access**: Differentiate between clients and admins
3. **Add training progress tracking**: Store and display training milestones
4. **Create appointment management**: Integrate with your booking system
5. **Build messaging system**: Allow clients to message trainers
6. **Add file uploads**: Let users upload photos/videos of their dogs

## Support

If you encounter issues:

1. Check the browser console for error messages (F12)
2. Verify your Firebase configuration is correct
3. Check Firebase Console > Authentication > Users to see if sign-ins are being logged
4. Review Firebase Console > Authentication > Usage for any errors

## Files Created

- `firebase-config.js` - Firebase configuration and authentication functions
- `portal-login.html` - Login page with Google OAuth button
- `portal-dashboard.html` - Protected dashboard page for authenticated users
- `FIREBASE_SETUP_INSTRUCTIONS.md` - This setup guide

---

**Important:** Remember to replace the placeholder values in `firebase-config.js` with your actual Firebase project credentials before deploying!
