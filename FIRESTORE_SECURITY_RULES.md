# Firestore Security Rules for CanineKind Portal

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
