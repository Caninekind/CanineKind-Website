# Migration Guide: From Hardcoded to Firestore Data Model

## Overview

This guide walks you through migrating from hardcoded goals in JavaScript to a proper Firestore database structure with entity relationships.

## Current State vs. Target State

### ❌ **Current (Hardcoded)**
```javascript
// portal-goals.html
const GOALS_STRUCTURE = {
  0: [{ id: 'sit', title: 'Sit', ... }],
  1: [{ id: 'down', title: 'Down', ... }]
}

// User data embedded
users/{email}/selectedGoals/{goalId} {
  id: 'sit',
  title: 'Sit', // ← Duplicated!
  description: '...', // ← Duplicated!
  tasks: [...], // ← Duplicated!
  progress: 50
}
```

### ✅ **Target (Firestore)**
```javascript
// Global goal definition (single source of truth)
goals/sit {
  id: 'sit',
  title: 'Sit',
  description: '...',
  tasks: [...],
  prerequisites: ['markers-release'],
  relatedGoals: ['down']
}

// User's instance (references goal by ID)
users/{email}/selectedGoals/sit {
  goalId: 'sit', // ← Reference only!
  progress: 50,
  selectedAt: timestamp
}
```

## Migration Steps

### Step 1: Backup Existing Data

```javascript
// Run this script to backup existing user data
const admin = require('firebase-admin');
const fs = require('fs');

async function backupUserData() {
  const users = await db.collection('users').get();
  const backup = {};

  for (const userDoc of users.docs) {
    const email = userDoc.id;
    backup[email] = userDoc.data();

    // Backup selectedGoals subcollection
    const goals = await db.collection('users')
      .doc(email)
      .collection('selectedGoals')
      .get();

    backup[email].selectedGoals = {};
    goals.forEach(doc => {
      backup[email].selectedGoals[doc.id] = doc.data();
    });
  }

  // Save to file
  fs.writeFileSync('backup-' + Date.now() + '.json', JSON.stringify(backup, null, 2));
  console.log('✅ Backup complete!');
}
```

### Step 2: Seed Global Collections

```bash
# Run the seed script
node seed-data-example.js
```

This creates:
- ✅ `goals/` collection with all goal definitions
- ✅ `levels/` collection with level metadata
- ✅ `activities/` collection with training activities
- ✅ `masteryCategories/` collection

### Step 3: Migrate User Data

```javascript
// migrate-user-data.js
const admin = require('firebase-admin');

async function migrateUserGoals() {
  const users = await db.collection('users').get();

  for (const userDoc of users.docs) {
    const email = userDoc.id;
    console.log(`Migrating ${email}...`);

    // Get existing selectedGoals
    const goalsSnapshot = await db.collection('users')
      .doc(email)
      .collection('selectedGoals')
      .get();

    const batch = db.batch();

    for (const goalDoc of goalsSnapshot.docs) {
      const oldData = goalDoc.data();
      const goalId = goalDoc.id;

      // New structure with reference
      const newData = {
        goalId: goalId, // Reference to goals collection
        selectedAt: oldData.selectedAt || admin.firestore.FieldValue.serverTimestamp(),
        progress: oldData.progress || 0,
        tasks: oldData.tasks || [], // Keep task completion state
        notes: oldData.notes || '',
        remindersEnabled: true
      };

      // Remove duplicated fields (title, description, type)
      // These now come from the goals collection
      const goalRef = db.collection('users')
        .doc(email)
        .collection('selectedGoals')
        .doc(goalId);

      batch.set(goalRef, newData);
    }

    await batch.commit();
    console.log(`✅ Migrated ${email}`);
  }

  console.log('✅ All users migrated!');
}

migrateUserGoals();
```

### Step 4: Update Frontend Code

#### **Before (Hardcoded):**
```javascript
// portal-goals.html
const GOALS_STRUCTURE = { ... }; // ← Remove this

function renderGoalCard(goal, level) {
  return `
    <div class="goal-card">
      <h3>${goal.title}</h3>
      <p>${goal.description}</p>
    </div>
  `;
}
```

#### **After (Firestore):**
```javascript
// portal-goals.html
let allGoals = {}; // Global cache

// Load goals from Firestore
async function loadGoalsLibrary() {
  const goalsSnapshot = await db.collection('goals')
    .where('active', '==', true)
    .get();

  goalsSnapshot.forEach(doc => {
    allGoals[doc.id] = doc.data();
  });
}

// Load user's selected goals
async function loadUserGoals(email) {
  const selectedSnapshot = await db.collection('users')
    .doc(email)
    .collection('selectedGoals')
    .get();

  const userGoals = {};
  selectedSnapshot.forEach(doc => {
    const userGoal = doc.data();
    const goalDef = allGoals[userGoal.goalId]; // Get goal definition

    userGoals[doc.id] = {
      ...goalDef, // Full goal definition
      ...userGoal, // User's progress
      id: doc.id
    };
  });

  return userGoals;
}

// Render goal card with data from both sources
function renderGoalCard(goalId, level) {
  const goalDef = allGoals[goalId]; // From goals collection
  const userGoal = selectedGoals[goalId]; // From user's selectedGoals

  return `
    <div class="goal-card">
      <h3>${goalDef.title}</h3>
      <p>${goalDef.description}</p>
      <div class="progress">${userGoal?.progress || 0}%</div>
    </div>
  `;
}
```

### Step 5: Update Goal Selection Logic

#### **Before:**
```javascript
async function selectGoal(goalId, level) {
  // Find goal in hardcoded structure
  const goal = GOALS_STRUCTURE[level].find(g => g.id === goalId);

  // Save entire goal object (duplication!)
  await db.collection('users').doc(email)
    .collection('selectedGoals').doc(goalId)
    .set({
      ...goal, // ← Duplicates all data!
      selectedAt: firebase.firestore.FieldValue.serverTimestamp(),
      progress: 0
    });
}
```

#### **After:**
```javascript
async function selectGoal(goalId) {
  // Just save reference and user-specific data
  await db.collection('users').doc(email)
    .collection('selectedGoals').doc(goalId)
    .set({
      goalId: goalId, // ← Reference only!
      selectedAt: firebase.firestore.FieldValue.serverTimestamp(),
      progress: 0,
      tasks: allGoals[goalId].tasks.map(text => ({
        text,
        completed: false,
        completedAt: null
      })),
      notes: '',
      remindersEnabled: true
    });
}
```

### Step 6: Add Prerequisite Checking

Now you can use the relationship data!

```javascript
function canSelectGoal(goalId) {
  const goal = allGoals[goalId];

  // Check if prerequisites are met
  if (goal.prerequisites && goal.prerequisites.length > 0) {
    for (const prereqId of goal.prerequisites) {
      const userGoal = selectedGoals[prereqId];

      // Prerequisite must be selected AND completed
      if (!userGoal || userGoal.progress < 100) {
        return {
          allowed: false,
          reason: `You must complete "${allGoals[prereqId].title}" first`
        };
      }
    }
  }

  // Check level access
  if (!hasAccessToGoal(goalId, goal.level)) {
    return {
      allowed: false,
      reason: 'This goal is locked. Complete earlier levels first.'
    };
  }

  return { allowed: true };
}
```

### Step 7: Build Goal Recommendations

```javascript
function getRecommendedGoals() {
  const recommendations = [];

  // For each selected but incomplete goal
  for (const goalId in selectedGoals) {
    const userGoal = selectedGoals[goalId];
    if (userGoal.progress < 100) {
      const goalDef = allGoals[goalId];

      // Add related goals as recommendations
      if (goalDef.relatedGoals) {
        goalDef.relatedGoals.forEach(relatedId => {
          // Only recommend if not already selected
          if (!selectedGoals[relatedId]) {
            const relatedGoal = allGoals[relatedId];
            recommendations.push({
              goalId: relatedId,
              title: relatedGoal.title,
              reason: `Works well with "${goalDef.title}"`
            });
          }
        });
      }
    }
  }

  return recommendations;
}
```

### Step 8: Update Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Global goals collection - read-only for clients
    match /goals/{goalId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Global levels collection - read-only for clients
    match /levels/{level} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Global activities collection - read-only for clients
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // User's selected goals
    match /users/{email}/selectedGoals/{goalId} {
      allow read: if isOwner(email) || isAdmin();

      // Users can select/deselect goals
      allow create, delete: if isOwner(email);

      // Users can update their own progress
      // Admins can update anything
      allow update: if isOwner(email) || isAdmin();
    }

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.admin == true;
    }

    function isOwner(email) {
      return request.auth != null && request.auth.token.email == email;
    }
  }
}
```

## Testing the Migration

### 1. Test Goal Loading
```javascript
// Should load from Firestore, not hardcoded
await loadGoalsLibrary();
console.log(allGoals); // Should show all goals from DB
```

### 2. Test User Goal Selection
```javascript
// Should only save reference + user data
await selectGoal('sit');

// Check Firestore - should NOT have title, description, etc.
const doc = await db.collection('users').doc(email)
  .collection('selectedGoals').doc('sit').get();

console.log(doc.data());
// Should be: { goalId: 'sit', progress: 0, tasks: [...] }
// NOT: { id: 'sit', title: 'Sit', description: '...', ... }
```

### 3. Test Prerequisites
```javascript
const result = canSelectGoal('down');
// If 'sit' prerequisite not complete:
// { allowed: false, reason: 'You must complete "Sit" first' }
```

### 4. Test Recommendations
```javascript
const recommended = getRecommendedGoals();
// Should show goals related to selected goals
```

## Rollback Plan

If something goes wrong:

```javascript
// Restore from backup
const backup = require('./backup-TIMESTAMP.json');

async function rollback() {
  for (const email in backup) {
    const userData = backup[email];

    // Restore selectedGoals
    for (const goalId in userData.selectedGoals) {
      await db.collection('users').doc(email)
        .collection('selectedGoals').doc(goalId)
        .set(userData.selectedGoals[goalId]);
    }
  }
}
```

## Timeline

**Total estimated time: 4-6 hours**

1. **Backup data** - 30 mins
2. **Run seed script** - 5 mins
3. **Migrate user data** - 30 mins
4. **Update frontend code** - 2-3 hours
5. **Update security rules** - 30 mins
6. **Testing** - 1 hour

## Benefits After Migration

✅ **Add new goals** - Just add to `goals/` collection, no code changes
✅ **Update goal descriptions** - Changes reflect everywhere instantly
✅ **Build recommendations** - Use `prerequisites` and `relatedGoals` fields
✅ **Analytics** - Query which goals are most popular, completion rates
✅ **A/B testing** - Try different goal descriptions with different users
✅ **Versioning** - Track changes to goals over time
✅ **Multi-language** - Store translations in goal documents

## Need Help?

If you get stuck during migration:
1. Check your backup file exists
2. Test with ONE user first
3. Verify security rules allow read/write
4. Check browser console for errors
5. Ensure Firebase indexes are created

Ready to migrate? Start with Step 1!
