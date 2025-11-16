# 🔥 UPDATED Firestore Security Rules for CanineKind Portal

⚠️ **DEPLOY THESE UPDATED RULES TO FIREBASE CONSOLE NOW!**

These rules include support for the new **Tiered Goals System** with admin access controls.

---

## 📋 Step 1: Deploy These Security Rules

Go to **Firebase Console → Firestore Database → Rules** and replace everything with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/users/$(request.auth.token.email))
        && get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role == 'admin';
    }

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
      allow read: if isAdmin();

      // Allow admins to update ALL user documents
      allow update: if isAdmin();

      // Allow admins to delete ALL user documents
      allow delete: if isAdmin();

      // ========================================
      // SIGNED DOCUMENTS SUBCOLLECTION
      // ========================================
      match /signedDocuments/{documentId} {
        // Allow users to read their own signed documents
        allow read: if request.auth != null && request.auth.token.email == email;

        // Allow users to create their own signed documents
        allow create: if request.auth != null && request.auth.token.email == email;

        // Prevent users from modifying signed documents after creation
        allow update: if false;
        allow delete: if false;

        // Allow admins to read ALL signed documents
        allow read: if isAdmin();
      }

      // ========================================
      // OLD GOALS SYSTEM (LEGACY - Keep for backward compatibility)
      // ========================================
      match /goals/{goalId} {
        // Allow users to read/write their own goals
        allow read, write: if request.auth != null && request.auth.token.email == email;

        // Allow admins to read/write ALL goals
        allow read, write: if isAdmin();
      }

      // ========================================
      // GOAL ACCESS SETTINGS (NEW - Admin grants access to levels/goals)
      // ========================================
      match /goalAccess/{document} {
        // Allow users to READ their own access settings
        allow read: if request.auth != null && request.auth.token.email == email;

        // Only ADMINS can WRITE access settings
        allow write: if isAdmin();
      }

      // ========================================
      // SELECTED GOALS (NEW - Client's active goals with tasks)
      // ========================================
      match /selectedGoals/{goalId} {
        // Allow users to read/write their own selected goals
        allow read, write: if request.auth != null && request.auth.token.email == email;

        // Allow admins to read/write ALL selected goals
        allow read, write: if isAdmin();
      }

      // ========================================
      // SCHEDULES SUBCOLLECTION
      // ========================================
      match /schedules/{scheduleId} {
        // Allow users to read/write their own schedules
        allow read, write: if request.auth != null && request.auth.token.email == email;

        // Allow admins to read/write ALL schedules
        allow read, write: if isAdmin();
      }

      // ========================================
      // LEVEL COMPLETIONS (NEW - Client level completion tracking)
      // ========================================
      match /levelCompletions/{levelId} {
        // Allow users to read/write their own level completions
        allow read, write: if request.auth != null && request.auth.token.email == email;

        // Allow admins to read/write ALL level completions (for approval)
        allow read, write: if isAdmin();
      }
    }

    // ========================================
    // SESSIONS COLLECTION (Global - filtered by clientEmail)
    // ========================================
    match /sessions/{sessionId} {
      // Allow users to read their own sessions
      allow read: if request.auth != null
                  && resource.data.clientEmail == request.auth.token.email;

      // Allow admins to read/write ALL sessions
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 🚀 Step 2: Deploy to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. **DELETE** all existing rules
5. **PASTE** the rules above
6. Click **Publish**
7. Wait for confirmation message

---

## ✅ What These Rules Enable

### For Clients:
- ✅ Select and track training goals
- ✅ Complete milestones within goals with manual date entry
- ✅ Add optional notes when completing Level 1+ goals
- ✅ View progress statistics
- ✅ Manage their weekly schedule (excludes Level 0 goals)
- ✅ View their own sessions

### For Admins:
- ✅ Grant level access (Level 0-4) to clients
- ✅ Grant individual goal access to clients
- ✅ Grant access to Goal Mastery categories
- ✅ View all client goals and progress
- ✅ Manage all client data
- ✅ Create and manage training sessions
- ✅ Approve client level completions

### Goal Levels:
- **Level 0:** Get Ready to Train!
- **Level 1:** Beginner Goals
- **Level 2:** Intermediate Goals
- **Level 3:** Advanced Goals
- **Level 4:** Master Goals

### Mastery Categories (Non-Level):
- Goal Mastery: Loose Leash Walking
- Goal Mastery: Dogs
- Goal Mastery: Humans
- Goal Mastery: Competitive Obedience

---

## 📊 New Collections Explained

### 1. `users/{email}/goalAccess/settings`
**Purpose:** Stores which levels/goals a client has access to
**Who can write:** Admins only
**Who can read:** Client (their own) + Admins (all)

**Example data:**
```json
{
  "levels": [1, 2],
  "individualGoals": ["sit", "down"],
  "masteryCategories": ["loose-leash", "dogs"],
  "updatedAt": "2025-01-16T10:00:00Z",
  "updatedBy": "admin@caninekind.com"
}
```

**Available Mastery Categories:**
- `loose-leash` - Goal Mastery: Loose Leash Walking
- `dogs` - Goal Mastery: Dogs
- `humans` - Goal Mastery: Humans
- `competitive-obedience` - Goal Mastery: Competitive Obedience

### 2. `users/{email}/selectedGoals/{goalId}`
**Purpose:** Stores client's active goals with milestone progress
**Who can write:** Client (their own) + Admins (all)
**Who can read:** Client (their own) + Admins (all)

**Example data:**
```json
{
  "level": 1,
  "title": "Sit",
  "emoji": "🪑",
  "description": "Master the fundamental sit command",
  "tasks": [
    {
      "description": "Dog can sit on command with hand signal",
      "completed": true,
      "completedAt": "2025-01-15T14:30:00Z"
    },
    {
      "description": "Dog can sit for 10 seconds before release",
      "completed": false,
      "completedAt": null
    }
  ],
  "progress": 33,
  "selectedAt": "2025-01-14T10:00:00Z"
}
```

**Note:** The `tasks` field stores milestone data. In the UI, these are labeled as "milestones" for better user experience, but the database field name remains "tasks" for backward compatibility. Clients manually enter completion dates when checking off milestones.

### 3. `users/{email}/schedules/weekly`
**Purpose:** Stores client's weekly training schedule
**Who can write:** Client (their own) + Admins (all)
**Who can read:** Client (their own) + Admins (all)

### 4. `users/{email}/levelCompletions/{levelId}`
**Purpose:** Tracks level completion requests and admin approvals
**Who can write:** Client (creates) + Admins (approves)
**Who can read:** Client (their own) + Admins (all)

**Example data:**
```json
{
  "level": 1,
  "levelName": "Beginner Goals",
  "completedAt": "2025-01-16T14:00:00Z",
  "status": "pending",
  "clientEmail": "client@example.com",
  "clientName": "John Doe",
  "clientNotes": "My dog did great with sit and down! Still working on consistency with recall in distracting environments.",
  "approvedAt": "2025-01-16T15:00:00Z",
  "approvedBy": "admin@caninekind.com"
}
```

**Note:** `clientNotes` field is optional and only available for Level 1+ completions. Level 0 submissions do not include notes.

---

## 🔧 Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** Security rules not deployed or incorrect
**Solution:**
1. Verify rules are deployed in Firebase Console
2. Check "Last deployed" timestamp
3. Re-deploy if needed
4. Clear browser cache and refresh

### Error: "User not authorized"

**Cause:** User role not set correctly
**Solution:**
1. Go to Firestore Database
2. Navigate to `users/{email}`
3. Verify `role` field is set to 'admin' or 'client'

### Goals won't save

**Cause:** Missing `selectedGoals` rules
**Solution:** Deploy the updated rules above

---

## 🎯 Next Steps

After deploying these rules:

1. **Test Admin Access:**
   - Log in as admin
   - Go to Sessions page
   - Select a client
   - Grant Level 1 access
   - Save settings

2. **Test Client Access:**
   - Log in as client
   - Go to Goals page
   - Click on a Level 1 goal
   - Check off tasks
   - Verify progress updates

3. **Remove Temporary Unlock:**
   - In `portal-goals.html` around line 800
   - Remove the `return true;` line
   - Access will now be controlled by admin

---

## 📝 Important Notes

- These rules use a helper function `isAdmin()` for cleaner code
- All new collections are properly scoped under `users/{email}`
- Admins have full read/write access to all data
- Clients can only access their own data
- Goal access is read-only for clients (only admins can grant)

---

**Deploy these rules NOW to fix the permissions error!** 🚀
