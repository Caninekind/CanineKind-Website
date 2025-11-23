# Firestore Quick Start Guide

Follow these steps to set up your Firestore database from scratch.

## Prerequisites

- Firebase project already created (`caninekind-client-portal`)
- Node.js installed on your machine
- Firebase CLI installed (`npm install -g firebase-tools`)

---

## Step 1: Install Dependencies

```bash
npm install firebase-admin --save-dev
```

---

## Step 2: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `caninekind-client-portal`
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Move it to your project root directory (`/home/user/CanineKind-Website/`)

**⚠️ IMPORTANT:** Add `serviceAccountKey.json` to your `.gitignore` to keep it private!

---

## Step 3: Enable Firestore

1. In Firebase Console, click **Firestore Database** in left menu
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose your region (e.g., `us-central1`)
5. Click **Enable**

---

## Step 4: Seed the Database

Run the seed script to populate default data:

```bash
node seed-firestore.js
```

This will:
- Create all default goals (12 goals across 4 levels)
- Create tasks for each goal (~36 tasks)
- Prompt you for your admin email

**Expected output:**
```
🚀 Starting Firestore Database Seeding...

📋 Seeding Goals...
   ✓ Created goal: Sit (Level 1)
   ✓ Created goal: Down (Level 1)
   ...
✅ Created 12 goals

📝 Seeding Tasks...
   ✓ Created 3 tasks for: Sit
   ...
✅ Created 36 tasks
```

---

## Step 5: Initialize Firebase Project (if not done)

If you haven't initialized Firebase CLI in this project:

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Hosting (if deploying)

This creates `firebase.json` and `.firebaserc`.

---

## Step 6: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules from `firestore.rules` to your Firebase project.

**Expected output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/caninekind-client-portal/overview
```

---

## Step 7: Create Your Admin Account

### Option A: Using Firebase Console (Recommended)

1. Sign in to your portal at `portal-login.html`
2. Use the Google account you want to be admin
3. After signing in, go to Firebase Console
4. Navigate to **Firestore Database**
5. Find your user document in the `users` collection
6. Click on your user document
7. Click **Edit field** for these fields:
   - `role`: Change to `"admin"`
   - `status`: Change to `"approved"`
8. Save changes

### Option B: Using Firebase CLI

After signing in once, get your user ID from Firestore, then run:

```bash
firebase firestore:update users/YOUR_USER_ID --data '{"role":"admin","status":"approved"}'
```

Replace `YOUR_USER_ID` with your actual Firebase Auth UID.

---

## Step 8: Set Up Initial Admin Settings

Your admin account should have these settings:

```javascript
{
  email: "your-email@gmail.com",
  displayName: "Your Name",
  role: "admin",
  status: "approved",
  settings: {
    canAccessGoals: true,
    canAccessSchedule: true,
    canAccessSessions: true,
    canAccessForms: true,
    accessibleLevels: [1, 2, 3, 4],
    hasCompletedIntake: true,
    firstSessionCompleted: true
  }
}
```

You can set this manually in Firebase Console or it will be set automatically when you approve your first client.

---

## Step 9: Test the Setup

1. **Sign out** and **sign in again** to your portal
2. You should now see:
   - ✅ Admin Portal navigation
   - ✅ User Approval page
   - ✅ All admin controls

3. **Test user approval flow:**
   - Have someone else (or use another Google account) sign in
   - They should see "Pending Approval" page
   - As admin, go to User Approval page
   - Approve the user and set their permissions
   - User should now see their portal dashboard

---

## Step 10: Verify Database Structure

In Firebase Console > Firestore Database, you should see these collections:

- ✅ `users` (your admin account)
- ✅ `goals` (12 documents)
- ✅ `tasks` (36+ documents)
- `goalsProgress` (empty initially)
- `sessions` (empty initially)
- `schedules` (empty initially)
- `forms` (empty initially)
- `formSubmissions` (empty initially)

---

## Common Issues & Troubleshooting

### Issue: "Permission denied" when running seed script

**Solution:** Make sure you downloaded `serviceAccountKey.json` from Firebase Console.

### Issue: "Cannot find module 'firebase-admin'"

**Solution:** Run `npm install firebase-admin --save-dev`

### Issue: User stuck on "Pending Approval"

**Solution:**
1. Check Firebase Console > Firestore > users collection
2. Find the user document
3. Change `status` from `"pending"` to `"approved"`
4. Add appropriate `settings` object with permissions

### Issue: Security rules not working

**Solution:**
1. Make sure you deployed rules: `firebase deploy --only firestore:rules`
2. Check rules in Firebase Console > Firestore > Rules tab
3. Test rules using the Rules Simulator in console

### Issue: "Cannot read properties of null (reading 'data')"

**Solution:** This means the user document doesn't exist yet. Make sure users sign in at least once before checking their permissions.

---

## Next Steps

1. ✅ Read full schema in `FIRESTORE_SETUP.md`
2. ✅ Update frontend code to use new database structure
3. ✅ Test user registration and approval workflow
4. ✅ Test goal assignment and progress tracking
5. ✅ Test session creation and management

---

## Security Checklist

Before going live:

- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] Firestore security rules are deployed
- [ ] Only your email(s) have admin role
- [ ] Test that clients can only see their own data
- [ ] Test that unapproved users see pending page
- [ ] Test that permissions work correctly

---

## Database Backup

To backup your data:

```bash
# Install gcloud CLI first
gcloud firestore export gs://YOUR_BUCKET_NAME/backups/$(date +%Y%m%d)
```

Or use Firebase Console > Firestore > Import/Export

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full schema in `FIRESTORE_SETUP.md`
3. Check Firebase Console > Firestore for data verification
4. Review security rules in `firestore.rules`

---

**🎉 That's it! Your Firestore database is now set up and ready to use.**
