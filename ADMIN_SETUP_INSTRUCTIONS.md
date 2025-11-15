# Admin Access & User Authorization Setup Instructions

This guide will walk you through setting up Firestore database and giving yourself admin access to manage users in your CanineKind client portal.

## Overview

The portal now requires manual authorization before users can access it. When someone signs in with Google OAuth:
1. Their account is created in Firestore with `approved: false`
2. They see a "Pending Approval" page
3. You (as admin) can approve them through the admin panel
4. Once approved, they can access the portal dashboard

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **caninekind-client-portal**
3. In the left sidebar, click **Build > Firestore Database**
4. Click **Create database**
5. Choose a starting mode:
   - Select **Start in production mode** (we'll set up security rules next)
   - Click **Next**
6. Choose a Firestore location:
   - Select a location close to your users (e.g., `us-central` or `us-east1`)
   - Click **Enable**
7. Wait for Firestore to be created (this may take a minute)

## Step 2: Set Up Firestore Security Rules

Once Firestore is created, you need to set up security rules:

1. In Firestore Database, click the **Rules** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{email} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.token.email == email;

      // Allow users to update their own lastLogin
      allow update: if request.auth != null && request.auth.token.email == email
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLogin', 'displayName', 'photoURL']);

      // Allow authenticated users to create their own user document
      allow create: if request.auth != null && request.auth.token.email == email;

      // Allow admins to read and write all user data
      allow read, write: if request.auth != null &&
                          get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';
    }
  }
}
```

3. Click **Publish**

**What these rules do:**
- Users can only read and update their own user document
- Only admins can read and modify all user documents
- Prevents unauthorized access to user data

## Step 3: Make Yourself an Admin

Since you've already signed in to the portal, your user account exists in the database but you need to make yourself an admin manually:

### Option A: Using Firebase Console (Recommended)

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Data** tab
3. You should see a `users` collection
4. Click on the `users` collection to expand it
5. Find and click on your email address (it will be the document ID)
6. You'll see fields like:
   - `approved`: false
   - `email`: your-email@gmail.com
   - `displayName`: Your Name
   - `role`: client
   - etc.
7. Click on the `approved` field and change it to **true**
8. Click on the `role` field and change it to **admin**
9. Click **Update**

### Option B: Using Firestore REST API

If you're comfortable with the command line, you can use this method:

1. Get your Firebase project ID: `caninekind-client-portal`
2. Use the Firebase CLI or Firestore REST API to update your user document
3. Set `approved: true` and `role: "admin"` for your email

## Step 4: Test Your Admin Access

1. **Sign out** from the portal if you're currently signed in
2. Go to `https://caninekind.io/portal-login.html`
3. Click **Sign in with Google**
4. Sign in with your Google account
5. You should now be redirected to the **Portal Dashboard**
6. On the dashboard, you should see a new **Admin Panel** card with a gold/orange gradient button
7. Click **Manage Users** to access the admin panel

## Step 5: Using the Admin Panel

The admin panel (`portal-admin.html`) allows you to:

### View Users
- **All Users**: See every user who has signed up
- **Pending Approval**: Filter to see only users waiting for approval
- **Approved**: See all approved users
- **Admins**: See all admin users

### Manage Users
For each user (except yourself), you can:
- **Approve**: Grant access to the portal
- **Revoke**: Remove access (sets approved to false)
- **Make Admin**: Promote a client to admin role
- **Make Client**: Demote an admin to client role
- **Delete**: Permanently remove the user from the database

### User Information Displayed
- Name
- Email address
- Status (Approved/Pending)
- Role (Admin/Client)
- Account creation date
- Action buttons

## Step 6: Approving New Users

When a new client signs up:

1. They'll sign in with Google OAuth
2. Their account is automatically created with `approved: false`
3. They see a "Pending Approval" page
4. You receive no automatic notification (you need to check the admin panel)
5. **To approve them:**
   - Go to `https://caninekind.io/portal-admin.html`
   - Click **Pending Approval** tab
   - Find the user in the list
   - Click **Approve**
   - The user can now access the portal immediately

## How the Authorization System Works

### New User Flow
```
1. User clicks "Sign in with Google"
   ↓
2. Google OAuth authentication
   ↓
3. User document created in Firestore (approved: false, role: client)
   ↓
4. Redirected to portal-pending.html
   ↓
5. User sees "Pending Approval" message
```

### Admin Approval Flow
```
1. Admin visits portal-admin.html
   ↓
2. Admin clicks "Pending Approval" tab
   ↓
3. Admin clicks "Approve" for user
   ↓
4. User's approved field set to true in Firestore
```

### Approved User Flow
```
1. User clicks "Sign in with Google"
   ↓
2. Google OAuth authentication
   ↓
3. Check Firestore: approved = true
   ↓
4. Update lastLogin timestamp
   ↓
5. Redirected to portal-dashboard.html
   ↓
6. User has full portal access
```

## Security Considerations

### Who Can Access What

**Unauthenticated Users:**
- Can only access the login page
- Cannot read or write any Firestore data

**Authenticated Users (Approved):**
- Can access portal dashboard
- Can read their own user document
- Can update their own lastLogin, displayName, and photoURL
- Cannot modify their approval status or role
- Cannot read other users' data

**Admin Users:**
- Can access everything regular users can
- Can access the admin panel
- Can read all user documents
- Can approve/deny users
- Can change user roles
- Can delete users

### Best Practices

1. **Only make trusted individuals admins**
   - Admins have full access to all user data
   - Admins can promote other users to admin

2. **Regularly review pending users**
   - Check the admin panel for pending approvals
   - Verify users are legitimate clients before approving

3. **Monitor admin activity**
   - Keep track of who has admin access
   - Review user changes periodically

4. **Backup your Firestore data**
   - Firebase Console > Firestore Database > Export data
   - Schedule regular backups

## Troubleshooting

### Issue: "Failed to initialize Firebase"
**Solution:** Make sure Firestore is enabled in your Firebase project (Step 1)

### Issue: "Access denied" when accessing admin panel
**Solution:**
- Verify you set your `role` to "admin" in Firestore (Step 3)
- Check that you're signed in with the correct Google account
- Try signing out and signing back in

### Issue: Users can't be approved
**Solution:**
- Check Firestore security rules (Step 2)
- Verify your admin role in the Firestore console
- Check browser console for errors (F12)

### Issue: Can't see users in admin panel
**Solution:**
- Verify Firestore is enabled and users collection exists
- Check browser console for errors
- Ensure you're signed in as an admin

### Issue: Security rules too restrictive
**Solution:** Review the security rules in Step 2. They should allow:
- Users to read/write their own data
- Admins to read/write all data

## Advanced Configuration

### Adding Multiple Admins

To make another user an admin:

1. Have them sign up and sign in (they'll be pending)
2. Go to your admin panel
3. First, approve them by clicking **Approve**
4. Then, click **Make Admin**
5. They can now access the admin panel

### Custom Email Notifications (Future Enhancement)

Currently, users are not notified when approved. To add notifications:
- Set up Firebase Cloud Functions
- Use SendGrid or another email service
- Trigger email when `approved` field changes to `true`

### Audit Logging (Future Enhancement)

To track admin actions:
- Create an `audit_log` collection in Firestore
- Log all approval/denial/role changes
- Include: timestamp, admin email, action, target user

## Files Created

- `firebase-config.js` - Updated with Firestore functions
- `portal-pending.html` - Page shown to unapproved users
- `portal-admin.html` - Admin panel for user management
- `portal-login.html` - Updated to check user approval
- `portal-dashboard.html` - Updated to show admin panel link
- `ADMIN_SETUP_INSTRUCTIONS.md` - This file

## Summary

You now have a fully functional user authorization system:

✅ Users sign in with Google OAuth
✅ New users are created as "pending approval"
✅ Admins can approve/deny users
✅ Only approved users can access the portal
✅ Admins have special access to manage users
✅ Firestore security rules protect user data

**Next Steps:**
1. Enable Firestore (Step 1)
2. Set up security rules (Step 2)
3. Make yourself an admin (Step 3)
4. Test the system (Step 4)
5. Start approving users! (Step 6)

If you need help, check the browser console (F12) for error messages or review the troubleshooting section.
