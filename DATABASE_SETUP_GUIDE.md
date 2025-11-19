# CanineKind Firestore Database Setup Guide

## 🎯 Overview

This guide will walk you through setting up your complete Firestore database structure from scratch. You'll be copying and pasting data directly into Firebase Console.

---

## 📐 Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     USERS       │
│  (Collection)   │
├─────────────────┤
│ email (ID)      │◄────────┐
│ displayName     │         │
│ photoURL        │         │
│ uid             │         │
│ approved        │         │
│ role            │         │
│ createdAt       │         │
│ lastLogin       │         │
└─────────────────┘         │
                            │
                            │
┌─────────────────┐         │
│  GOAL_LIBRARY   │         │
│  (Collection)   │         │
├─────────────────┤         │
│ goalId (ID)     │         │
│ title           │         │
│ category        │         │
│ description     │         │
│ tasks[]         │         │
│ level           │         │
│ required        │         │
└─────────────────┘         │
        │                   │
        │                   │
        ▼                   │
┌─────────────────┐         │
│ SELECTED_GOALS  │         │
│  (Collection)   │         │
├─────────────────┤         │
│ id (auto)       │         │
│ userEmail ──────┼─────────┘
│ goalId ─────────┼─────────┐
│ level           │         │
│ progress        │         │
│ status          │         │
│ tasks[]         │         │
│ selectedAt      │         │
└─────────────────┘         │
                            │
                            │
┌─────────────────┐         │
│   SCHEDULES     │         │
│  (Collection)   │         │
├─────────────────┤         │
│ id (auto)       │         │
│ userEmail ──────┼─────────┤
│ day             │         │
│ time            │         │
│ activity        │         │
│ goalId ─────────┼─────────┘
│ personalNote    │
│ createdAt       │
└─────────────────┘


┌─────────────────┐
│    SESSIONS     │
│  (Collection)   │
├─────────────────┤
│ id (auto)       │
│ userEmail ──────┼──────┐
│ sessionDate     │      │
│ sessionType     │      │
│ notes           │      │
│ homework        │      │
│ createdBy       │      │
│ createdAt       │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│   DOCUMENTS     │      │
│  (Collection)   │      │
├─────────────────┤      │
│ id (auto)       │      │
│ userEmail ──────┼──────┘
│ documentType    │
│ title           │
│ fileURL         │
│ signed          │
│ signedDate      │
│ uploadedAt      │
└─────────────────┘


┌─────────────────┐
│  CUSTOM_GOALS   │
│  (Collection)   │
├─────────────────┤
│ id (auto)       │
│ userEmail       │
│ title           │
│ description     │
│ tasks[]         │
│ progress        │
│ createdAt       │
└─────────────────┘


┌─────────────────┐
│    EXPENSES     │
│  (Collection)   │
│   (Admin Only)  │
├─────────────────┤
│ id (auto)       │
│ date            │
│ category        │
│ description     │
│ amount          │
│ deductible      │
│ mileage         │
│ notes           │
│ createdAt       │
└─────────────────┘
```

---

## 🗂️ Collection Structures

### 1. **users** Collection
**Document ID:** User's email address

```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  uid: "firebase-auth-uid",
  approved: true,
  role: "client", // or "admin"
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

---

### 2. **goalLibrary** Collection
**Document ID:** goalId (e.g., "sit", "down", "recall")

Master list of all available training goals.

```javascript
{
  goalId: "sit",
  title: "Sit",
  category: "basic-obedience",
  description: "Teach your dog to sit on command",
  level: 1,
  required: false,
  tasks: [
    {
      description: "Dog sits within 3 seconds of cue with no distractions",
      completed: false,
      order: 1
    },
    {
      description: "Dog sits with mild distractions present",
      completed: false,
      order: 2
    }
  ]
}
```

---

### 3. **selectedGoals** Collection
**Document ID:** Auto-generated

Tracks which goals each user has selected and their progress.

```javascript
{
  userEmail: "client@example.com",
  goalId: "sit",
  level: 1,
  progress: 50,
  status: "in-progress", // "not-started", "in-progress", "completed"
  tasks: [
    {
      description: "Dog sits within 3 seconds of cue with no distractions",
      completed: true,
      completedDate: Timestamp
    },
    {
      description: "Dog sits with mild distractions present",
      completed: false
    }
  ],
  selectedAt: Timestamp
}
```

---

### 4. **schedules** Collection
**Document ID:** Auto-generated

Individual schedule entries for goal-activity pairings.

```javascript
{
  userEmail: "client@example.com",
  day: "Monday",
  time: "9:00 AM",
  activity: "Neighborhood walk",
  goalId: "recall",
  personalNote: "Bring high-value treats",
  createdAt: Timestamp
}
```

---

### 5. **sessions** Collection
**Document ID:** Auto-generated

Training sessions created by admin/trainer.

```javascript
{
  userEmail: "client@example.com",
  sessionDate: Timestamp,
  sessionType: "private-lesson",
  notes: "Worked on loose leash walking. Great progress!",
  homework: "Practice 10 minutes daily in the backyard",
  createdBy: "admin@caninekind.com",
  createdAt: Timestamp
}
```

---

### 6. **documents** Collection
**Document ID:** Auto-generated

Legal documents and forms for clients.

```javascript
{
  userEmail: "client@example.com",
  documentType: "liability-waiver",
  title: "Training Liability Waiver",
  fileURL: "https://storage.googleapis.com/...",
  signed: true,
  signedDate: Timestamp,
  uploadedAt: Timestamp
}
```

---

### 7. **customGoals** Collection
**Document ID:** Auto-generated

User-created custom training goals.

```javascript
{
  userEmail: "client@example.com",
  title: "Stop Barking at Doorbell",
  description: "Train quiet response to doorbell",
  tasks: [
    {
      description: "No barking for 5 seconds after doorbell",
      completed: false
    }
  ],
  progress: 0,
  createdAt: Timestamp
}
```

---

### 8. **expenses** Collection
**Document ID:** Auto-generated
**Admin Only**

Business expense tracking.

```javascript
{
  date: "2024-01-15",
  category: "training",
  description: "Dog training clicker set",
  amount: 25.99,
  deductible: "yes", // "yes", "partial", "no"
  deductiblePercent: null, // or number if partial
  mileage: null, // or number for travel
  mileageDeduction: null, // calculated amount
  notes: "Receipt #12345",
  createdAt: Timestamp
}
```

---

## 🚀 Step-by-Step Setup Instructions

Follow these steps **in order** to set up your database:

### ✅ Step 1: Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Click on your CanineKind project
3. Click "Firestore Database" in the left sidebar
4. You should see your existing database

---

### ✅ Step 2: Set Up Firestore Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. **DELETE** all existing rules
3. **COPY AND PASTE** the rules from `FIRESTORE_RULES.txt` (I'll create this file for you)
4. Click **"Publish"**

---

### ✅ Step 3: Create Goal Library Collection

This is the master list of all training goals.

1. In Firestore, click **"Start collection"**
2. Collection ID: `goalLibrary`
3. Add your first document with **Document ID: `sit`**
4. Add fields by copying the data from `SEED_DATA_GOALS.json` (I'll create this)

Repeat for each goal in the seed data file.

---

### ✅ Step 4: Create Test User

1. Click **"Start collection"**
2. Collection ID: `users`
3. Document ID: **your test client email** (e.g., `testclient@example.com`)
4. Copy fields from `SEED_DATA_USERS.json`

---

### ✅ Step 5: Add Sample Selected Goal for Test User

1. Click **"Start collection"**
2. Collection ID: `selectedGoals`
3. Click **"Auto-ID"** for document ID
4. Copy fields from `SEED_DATA_SELECTED_GOALS.json`

---

### ✅ Step 6: Add Sample Schedule Entry

1. Click **"Start collection"**
2. Collection ID: `schedules`
3. Click **"Auto-ID"**
4. Copy fields from `SEED_DATA_SCHEDULES.json`

---

### ✅ Step 7: Verify Everything Works

1. Open your portal: `portal-dashboard.html`
2. Sign in with your test client account
3. Check that:
   - ✅ Goals page shows available goals
   - ✅ Schedule page shows your sample schedule
   - ✅ Everything loads without errors

---

## 📝 Notes

- **Users Collection**: Uses email as document ID for easy lookups
- **All Other Collections**: Use auto-generated IDs
- **References**: Use `userEmail` and `goalId` strings to reference related data
- **Timestamps**: Use Firebase server timestamps for consistency
- **Indexes**: Firebase will prompt you to create indexes as needed - just click the link in error messages

---

## 🔧 Migration Strategy

Since you're just starting with a test account:

1. **Keep your admin account as-is** in the users collection
2. **Add your test client** using the instructions above
3. **Manually add sample data** for testing
4. Once everything works, **delete test data** and start fresh with real clients

---

## 🆘 Troubleshooting

### "Permission Denied" Errors
- Check that your security rules are published
- Make sure you're signed in
- Verify your user has the correct `role` in the users collection

### Goals Not Loading
- Check that `goalLibrary` collection exists
- Verify document IDs match the goalId field
- Check browser console for errors

### Schedule Not Saving
- Verify `schedules` collection exists
- Check that userEmail matches your signed-in user
- Make sure goalId exists in goalLibrary

---

## 📚 What's Next?

After setup is complete:
1. Test all features with your test account
2. Add more goals to the goal library
3. Create sample sessions and documents
4. Once verified, add your first real client!

---

**Need Help?** Check the browser console (F12) for detailed error messages.
