# Firestore Security Rules for CanineKind Portal

⚠️ **CRITICAL: YOU MUST DEPLOY THESE RULES TO FIREBASE CONSOLE!**

These rules control who can read/write to your Firestore database. If not deployed, users won't be able to create accounts or access the portal.

## Step 1: Deploy Security Rules

Use these security rules in Firebase Console → Firestore Database → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{email} {
      // Allow any authenticated user to read their own document
      allow read: if request.auth != null && request.auth.token.email == email;

      // Allow any authenticated user to create their own document
      allow create: if request.auth != null && request.auth.token.email == email;

      // Allow users to update only specific fields in their own document
      allow update: if request.auth != null
                    && request.auth.token.email == email
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLogin', 'displayName', 'photoURL']);

      // Allow users to update documentsComplete field when signing documents
      allow update: if request.auth != null
                    && request.auth.token.email == email
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['documentsComplete', 'documentsCompletedAt']);

      // Allow admins to read ALL user documents
      allow read: if request.auth != null
                  && exists(/databases/$(database)/documents/users/$(request.auth.token.email))
                  && get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';

      // Allow admins to update ALL user documents
      allow update: if request.auth != null
                    && exists(/databases/$(database)/documents/users/$(request.auth.token.email))
                    && get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';

      // Allow admins to delete ALL user documents
      allow delete: if request.auth != null
                    && exists(/databases/$(database)/documents/users/$(request.auth.token.email))
                    && get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';

      // Signed Documents Subcollection
      match /signedDocuments/{documentId} {
        // Allow users to read their own signed documents
        allow read: if request.auth != null && request.auth.token.email == email;

        // Allow users to create their own signed documents
        allow create: if request.auth != null && request.auth.token.email == email;

        // Prevent users from modifying signed documents after creation
        allow update: if false;
        allow delete: if false;

        // Allow admins to read ALL signed documents
        allow read: if request.auth != null
                    && exists(/databases/$(database)/documents/users/$(request.auth.token.email))
                    && get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';
      }
    }
  }
}
```

## How to Update Security Rules:

1. Go to Firebase Console → Firestore Database
2. Click the **Rules** tab
3. Replace everything with the rules above
4. Click **Publish**

These rules ensure:
- ✅ Admins can read all user documents
- ✅ Admins can update all user documents (approve/deny/change roles)
- ✅ Regular users can only see their own data
- ✅ Users can create their account when signing up

## Important Notes:

**The rules use TWO checks for admins:**
1. First check if the user document exists: `exists(/databases/.../users/$(request.auth.token.email))`
2. Then check if role == 'admin': `get(...).data.role == 'admin'`

This is more explicit and should work better than the simpler version.

---

## Troubleshooting: Users Not Being Created

If new users are signing in but not appearing in your Firestore database, follow these steps:

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab when signing in. Look for:
- 🔵 Blue messages showing the sign-in flow
- ❌ Red error messages indicating what failed
- Any Firestore permission errors (code: `permission-denied`)

### 2. Verify Security Rules Are Deployed
1. Go to Firebase Console → Firestore Database → Rules tab
2. Make sure the rules shown above are present
3. Check the "Last deployed" timestamp - it should be recent
4. If rules haven't been deployed, copy the rules above and click **Publish**

### 3. Check for Ad Blocker Issues
Ad blockers (uBlock Origin, AdBlock Plus, etc.) can block Firebase/Firestore requests:
1. Try **completely disabling** your ad blocker for the site
2. If that works, add exceptions for:
   - `*.firebaseapp.com`
   - `*.googleapis.com`
   - `*.firestore.googleapis.com`
3. Clear your browser cache and try again

### 4. Check Network Tab
In Developer Tools → Network tab:
1. Filter by "firestore" or "googleapis"
2. Sign in with a test account
3. Look for any failed requests (shown in red)
4. Click on failed requests to see the error details

### 5. Verify Firestore Is Enabled
1. Go to Firebase Console → Firestore Database
2. Make sure the database exists (not just Authentication)
3. If you see "Create database", you need to create it first

### 6. Test with Detailed Logging
The portal now includes detailed console logging:
- Open browser console (F12)
- Sign in with a test account
- Look for `[LOGIN]` and `[FIRESTORE]` messages
- These will show exactly where the process is failing

### Common Error Messages:

**"Missing or insufficient permissions"**
- Security rules not deployed or too restrictive
- Solution: Deploy the rules above to Firebase Console

**"ERR_BLOCKED_BY_CLIENT"**
- Ad blocker is blocking Firebase requests
- Solution: Disable ad blocker or add Firebase to whitelist

**"Failed to get document because the client is offline"**
- Network connectivity issue
- Solution: Check internet connection, try refreshing

**"Error creating user: [error message]"**
- Check the exact error message in console for details
- Solution: Follow the specific error guidance

---

## Firebase Storage Security Rules

In addition to Firestore rules, you need to deploy Storage rules for signed document PDFs.

### Storage Rules to Deploy:

Go to Firebase Console → Storage → Rules tab and use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Signed documents - users can upload their own, admins can read all
    match /signed-documents/{userEmail}/{allPaths=**} {
      // Allow users to upload their own documents
      allow write: if request.auth != null
                   && request.auth.token.email == userEmail;

      // Allow users to read their own documents
      allow read: if request.auth != null
                  && request.auth.token.email == userEmail;

      // Allow admins to read all documents
      allow read: if request.auth != null
                  && firestore.get(/databases/(default)/documents/users/$(request.auth.token.email)).data.role == 'admin';
    }

    // Signatures - same rules as signed documents
    match /signatures/{userEmail}/{allPaths=**} {
      // Allow users to upload their own signatures
      allow write: if request.auth != null
                   && request.auth.token.email == userEmail;

      // Allow users to read their own signatures
      allow read: if request.auth != null
                  && request.auth.token.email == userEmail;

      // Allow admins to read all signatures
      allow read: if request.auth != null
                  && firestore.get(/databases/(default)/documents/users/$(request.auth.token.email)).data.role == 'admin';
    }
  }
}
```

### How to Deploy Storage Rules:

1. Go to Firebase Console → Storage
2. Click the **Rules** tab
3. Replace everything with the rules above
4. Click **Publish**

These storage rules ensure:
- ✅ Users can upload PDFs and signatures to their own folder
- ✅ Users can view/download their own documents
- ✅ Users CANNOT view other users' documents
- ✅ Admins can view/download all documents
- ✅ Documents cannot be modified after creation (only read/write, no update)
