# Firestore Database Setup Guide

## Database Schema (Normalized Structure)

### Collections Overview

1. **users** - User accounts and permissions
2. **goals** - Master goals list (default + custom)
3. **goalsProgress** - Tracks user progress on goals
4. **tasks** - Individual tasks within goals
5. **sessions** - Training sessions
6. **schedules** - User weekly schedules
7. **forms** - Legal forms and documents
8. **formSubmissions** - Submitted forms by users

---

## Detailed Schema

### 1. users (collection)
**Document ID:** Firebase Auth UID (auto-generated)

```javascript
{
  email: string,                    // User email
  displayName: string,               // Full name
  role: string,                      // "admin" or "client"
  status: string,                    // "pending", "approved", "rejected"
  createdAt: timestamp,
  approvedAt: timestamp,             // When admin approved
  approvedBy: string,                // User ID of approving admin
  settings: {
    // Permissions granted by admin
    canAccessGoals: boolean,
    canAccessSchedule: boolean,
    canAccessSessions: boolean,
    canAccessForms: boolean,
    accessibleLevels: [1, 2, 3, 4],  // Which goal levels they can see
    hasCompletedIntake: boolean,
    firstSessionCompleted: boolean
  }
}
```

### 2. goals (collection)
**Document ID:** Auto-generated

```javascript
{
  title: string,                     // "Sit", "Down", etc.
  description: string,
  level: number,                     // 1-4
  emoji: string,                     // "🪑", "⬇️", etc.
  category: string,                  // "obedience", "socialization", etc.
  isCustom: boolean,                 // false for default, true for custom
  ownerId: string,                   // null for default goals, userId for custom
  createdAt: timestamp,
  createdBy: string                  // User ID
}
```

### 3. goalsProgress (collection)
**Document ID:** Auto-generated

```javascript
{
  userId: string,                    // Reference to user
  goalId: string,                    // Reference to goal
  status: string,                    // "not_started", "in_progress", "completed"
  progress: number,                  // 0-100
  startedAt: timestamp,
  completedAt: timestamp,
  lastUpdated: timestamp,
  notes: string,                     // Admin/client notes
  updatedBy: string                  // User ID of last updater
}
```

### 4. tasks (collection)
**Document ID:** Auto-generated

```javascript
{
  goalId: string,                    // Reference to goal
  title: string,                     // Task name
  description: string,
  order: number,                     // Display order (1, 2, 3...)
  isCompleted: boolean,              // For user-specific task completion
  userId: string,                    // null for default tasks, userId for custom
  createdAt: timestamp,
  createdBy: string                  // User ID
}
```

### 5. sessions (collection)
**Document ID:** Auto-generated

```javascript
{
  clientId: string,                  // User ID of client
  trainerId: string,                 // User ID of trainer/admin
  sessionDate: timestamp,
  sessionTime: string,               // "10:00 AM"
  duration: number,                  // Minutes
  notes: string,                     // Trainer notes
  homework: string,                  // Homework assignment
  status: string,                    // "scheduled", "completed", "cancelled"
  createdAt: timestamp,
  createdBy: string,                 // User ID
  updatedAt: timestamp,
  updatedBy: string                  // User ID
}
```

### 6. schedules (collection)
**Document ID:** Auto-generated

```javascript
{
  userId: string,                    // User ID
  dayOfWeek: string,                 // "Monday", "Tuesday", etc.
  timeSlot: string,                  // "morning", "afternoon", "evening"
  activity: string,                  // Hard-coded activity name
  duration: number,                  // Minutes
  notes: string,
  createdAt: timestamp,
  createdBy: string                  // User ID
}
```

### 7. forms (collection)
**Document ID:** Auto-generated

```javascript
{
  title: string,                     // "Liability Waiver"
  description: string,
  pdfUrl: string,                    // URL to PDF in Firebase Storage
  isRequired: boolean,
  requiresSignature: boolean,
  createdAt: timestamp,
  createdBy: string,                 // User ID
  isActive: boolean                  // Can be deactivated
}
```

### 8. formSubmissions (collection)
**Document ID:** Auto-generated

```javascript
{
  formId: string,                    // Reference to form
  userId: string,                    // User ID who submitted
  submittedAt: timestamp,
  signatureUrl: string,              // URL to signature image
  signedPdfUrl: string,              // URL to signed PDF
  status: string,                    // "pending", "approved", "rejected"
  reviewedBy: string,                // User ID of admin reviewer
  reviewedAt: timestamp
}
```

---

## Setup Instructions

### Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `caninekind-client-portal`
3. Click on "Firestore Database" in the left menu
4. Click "Create database"
5. Choose "Start in production mode" (we'll add security rules next)
6. Select your region (choose closest to your users)

### Step 2: Run the Seed Data Script

Run the seed script to populate default data:

```bash
node seed-firestore.js
```

This will create:
- Default goals (Levels 1-4)
- Default tasks for each goal
- Your admin user account

### Step 3: Deploy Security Rules

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### Step 4: Enable Authentication

1. Go to Authentication in Firebase Console
2. Click "Get Started"
3. Enable "Google" sign-in provider
4. Add your authorized domain if deploying to custom domain

### Step 5: Test the Setup

1. Open `portal-login.html` in your browser
2. Sign in with Google
3. Your account should be auto-approved as admin
4. Test creating a new user and approving them

---

## Key Differences from Old Structure

### ✅ Improvements

1. **No email as primary key** - Using Firebase Auth UIDs instead
2. **No email foreign keys** - All references use user IDs
3. **Normalized structure** - No data duplication
4. **Single goals table** - Combined default and custom goals with `isCustom` flag
5. **Renamed Selected Goals → Goals Progress** - More accurate naming
6. **Added Tasks table** - Separate from goals for better structure
7. **Flexible permissions** - Settings object allows granular control

### 📋 Admin Workflow

**Before First Session:**
- Approve user account (status: "pending" → "approved")
- Grant basic permissions (canAccessGoals, canAccessForms)
- Assign accessible goal levels

**After First Session:**
- Mark firstSessionCompleted = true
- Grant additional permissions (canAccessSchedule, canAccessSessions)
- Assign specific goals to user

---

## Next Steps

1. Review the schema above
2. Run the seed script to populate data
3. Deploy security rules
4. Test user registration and approval flow
5. Update frontend code to use new schema
