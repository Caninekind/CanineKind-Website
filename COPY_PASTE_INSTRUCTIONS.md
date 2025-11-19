# 📋 Copy & Paste Instructions for Firebase Setup

Follow these steps **exactly** to set up your database. Each step has copy-paste ready data.

---

## 🔐 STEP 1: Update Security Rules

1. Go to https://console.firebase.google.com/
2. Select your **CanineKind project**
3. Click **"Firestore Database"** in left sidebar
4. Click the **"Rules"** tab at the top
5. **SELECT ALL** existing rules and **DELETE THEM**
6. Open the file `FIRESTORE_RULES.txt`
7. **COPY ALL CONTENT** from that file
8. **PASTE** into the Firebase Rules editor
9. Click **"Publish"** button
10. ✅ You should see "Rules published successfully"

---

## 📚 STEP 2: Create Goal Library Collection

### Add First Goal: "Sit"

1. Go back to **"Data"** tab in Firestore
2. Click **"Start collection"**
3. Collection ID: Type `goalLibrary` and click **Next**
4. Document ID: Type `sit`
5. Now add fields one by one:

**Field 1:**
- Field: `goalId`
- Type: `string`
- Value: `sit`

**Field 2:**
- Field: `title`
- Type: `string`
- Value: `Sit`

**Field 3:**
- Field: `category`
- Type: `string`
- Value: `basic-obedience`

**Field 4:**
- Field: `description`
- Type: `string`
- Value: `Teach your dog to sit on command in various situations`

**Field 5:**
- Field: `level`
- Type: `number`
- Value: `1`

**Field 6:**
- Field: `required`
- Type: `boolean`
- Value: `true` (toggle on)

**Field 7 (Array):**
- Field: `tasks`
- Type: `array`
- Click **"Add item"** 3 times to create 3 items

For each array item, click on it and add these fields:

**Task 1 (map):**
- Click the array item [0]
- Type: `map`
- Add fields inside:
  - `description` (string): `Dog sits within 3 seconds of verbal cue with no distractions`
  - `completed` (boolean): `false`
  - `order` (number): `1`

**Task 2 (map):**
- Click the array item [1]
- Type: `map`
- Add fields inside:
  - `description` (string): `Dog sits with mild distractions (toys, other people in room)`
  - `completed` (boolean): `false`
  - `order` (number): `2`

**Task 3 (map):**
- Click the array item [2]
- Type: `map`
- Add fields inside:
  - `description` (string): `Dog maintains sit for 10 seconds`
  - `completed` (boolean): `false`
  - `order` (number): `3`

6. Click **"Save"**
7. ✅ You should now see the "sit" document in goalLibrary collection

---

### Quick Add More Goals

Repeat the above process for each goal in `SEED_DATA_GOALS.json`. Here are the document IDs you need to create:

- `sit` ✅ (you just did this)
- `down`
- `recall`
- `loose-leash`
- `stay`
- `place`
- `leave-it`
- `drop-it`
- `crate-manners`
- `door-manners`
- `greeting-manners`
- `dog-socialization`

**TIP:** It's faster to copy the "sit" document, paste it as a new document with a different ID, then edit the fields.

---

## 👤 STEP 3: Create Users Collection

### Add Your Admin User

1. In Firestore, click **"Start collection"** (or if you see "Add collection")
2. Collection ID: `users`
3. Document ID: **YOUR ACTUAL ADMIN EMAIL** (e.g., `admin@caninekind.com`)
4. Add these fields:

- `email` (string): **YOUR ACTUAL ADMIN EMAIL**
- `displayName` (string): `Your Name`
- `photoURL` (string): `` (leave empty)
- `uid` (string): `admin-uid-temp`
- `approved` (boolean): `true`
- `role` (string): `admin`
- `createdAt` (timestamp): Click the **clock icon** and select "Set to current time"
- `lastLogin` (timestamp): Click the **clock icon** and select "Set to current time"

5. Click **"Save"**

### Add Test Client User

1. Click **"Add document"** in the users collection
2. Document ID: `testclient@example.com` (or your actual test account email)
3. Add these fields:

- `email` (string): `testclient@example.com`
- `displayName` (string): `Test Client`
- `photoURL` (string): `` (leave empty)
- `uid` (string): `test-client-uid`
- `approved` (boolean): `true`
- `role` (string): `client`
- `createdAt` (timestamp): **Set to current time**
- `lastLogin` (timestamp): **Set to current time**

4. Click **"Save"**

---

## 🎯 STEP 4: Create Selected Goals Collection

This tracks which goals your test client has selected.

1. In Firestore, click **"Start collection"**
2. Collection ID: `selectedGoals`
3. Click **"Auto-ID"** (don't type a document ID, let Firebase generate it)
4. Add these fields:

- `userEmail` (string): `testclient@example.com`
- `goalId` (string): `sit`
- `level` (number): `1`
- `progress` (number): `33`
- `status` (string): `in-progress`
- `selectedAt` (timestamp): **Set to current time**
- `tasks` (array): Add 3 items (same as the goal library tasks structure)

**For tasks array:**
Click "Add item" 3 times, then for each item:

**Task 1:**
- Type: `map`
- `description` (string): `Dog sits within 3 seconds of verbal cue with no distractions`
- `completed` (boolean): `true`
- `completedDate` (timestamp): **Set to current time**

**Task 2:**
- Type: `map`
- `description` (string): `Dog sits with mild distractions (toys, other people in room)`
- `completed` (boolean): `false`

**Task 3:**
- Type: `map`
- `description` (string): `Dog maintains sit for 10 seconds`
- `completed` (boolean): `false`

5. Click **"Save"**

### Add Second Selected Goal (Recall)

1. Click **"Add document"**
2. Click **"Auto-ID"**
3. Add fields:

- `userEmail` (string): `testclient@example.com`
- `goalId` (string): `recall`
- `level` (number): `1`
- `progress` (number): `0`
- `status` (string): `not-started`
- `selectedAt` (timestamp): **Set to current time**
- `tasks` (array): Add 3 items

**Task array:**
- Task 1: `Dog comes when called from 10 feet away indoors`, completed: `false`
- Task 2: `Dog comes when called from 20 feet away outdoors on long line`, completed: `false`
- Task 3: `Dog recalls with mild distractions present`, completed: `false`

4. Click **"Save"**

---

## 📅 STEP 5: Create Schedules Collection

1. In Firestore, click **"Start collection"**
2. Collection ID: `schedules`
3. Click **"Auto-ID"**
4. Add these fields:

- `userEmail` (string): `testclient@example.com`
- `day` (string): `Monday`
- `time` (string): `9:00 AM`
- `activity` (string): `Neighborhood walk`
- `goalId` (string): `recall`
- `personalNote` (string): `Bring high-value treats and practice in quiet area`
- `createdAt` (timestamp): **Set to current time**

5. Click **"Save"**

### Add Second Schedule Entry

1. Click **"Add document"**
2. Click **"Auto-ID"**
3. Add fields:

- `userEmail` (string): `testclient@example.com`
- `day` (string): `Wednesday`
- `time` (string): `2:00 PM`
- `activity` (string): `At Home Training Slot`
- `goalId` (string): `sit`
- `personalNote` (string): `Practice during low-energy time`
- `createdAt` (timestamp): **Set to current time**

4. Click **"Save"**

---

## ✅ STEP 6: Verify Everything Works

### Test Admin Access

1. Open your portal website
2. Go to `portal-login.html`
3. Sign in with your **admin email**
4. You should be redirected to `portal-admin-dashboard.html`
5. ✅ Check that you can access all admin pages

### Test Client Access

1. Open a new **incognito/private window**
2. Go to `portal-login.html`
3. Sign in with your **test client email**
4. You should be redirected to `portal-dashboard.html`

**Check these pages:**

✅ **Goals Page** (`portal-goals.html`):
- Should show "Sit" and "Recall" as selected goals
- Should show progress bars
- Should show tasks with completion status

✅ **Schedule Page** (`portal-schedule.html`):
- Should show your two scheduled activities
- Monday 9:00 AM - Neighborhood walk (Recall goal)
- Wednesday 2:00 PM - At Home Training Slot (Sit goal)

✅ **Training Reminders** (on Goals page):
- Should show "You have training plans" section
- Should display both scheduled activities
- Should show personal notes you added

---

## 🐛 Troubleshooting

### "Permission Denied" Error
**Fix:**
1. Check that security rules were published correctly
2. Verify the user's email in `users` collection has `approved: true`
3. Make sure you're signed in with Google

### Goals Not Showing
**Fix:**
1. Verify `goalLibrary` collection exists
2. Check that document IDs match exactly (lowercase, no spaces)
3. Look in browser console (F12) for specific errors

### Schedule Not Loading
**Fix:**
1. Verify `schedules` collection exists
2. Check that `userEmail` matches exactly (case-sensitive!)
3. Verify `goalId` matches a goal in `goalLibrary`

### Training Reminders Not Showing
**Fix:**
1. Must have entries in BOTH `selectedGoals` AND `schedules` collections
2. The `goalId` must match in both collections
3. The `userEmail` must match your signed-in user

---

## 📊 Your Database Structure (Final Check)

After completing all steps, your Firestore should have:

```
Firestore Database
├── goalLibrary (12 documents)
│   ├── sit
│   ├── down
│   ├── recall
│   ├── loose-leash
│   ├── stay
│   ├── place
│   ├── leave-it
│   ├── drop-it
│   ├── crate-manners
│   ├── door-manners
│   ├── greeting-manners
│   └── dog-socialization
│
├── users (2 documents)
│   ├── YOUR_ADMIN_EMAIL
│   └── testclient@example.com
│
├── selectedGoals (2 documents)
│   ├── (auto-id-1) → sit for testclient
│   └── (auto-id-2) → recall for testclient
│
└── schedules (2 documents)
    ├── (auto-id-1) → Monday walk
    └── (auto-id-2) → Wednesday training
```

---

## 🎉 Success!

If everything works:
- ✅ Admin can access all admin pages
- ✅ Test client can see their goals and schedules
- ✅ Training reminders show up on goals page
- ✅ No permission errors

**You're ready to start using the portal!**

---

## 🚀 Next Steps

1. **Delete test data** when you're ready for real clients
2. **Add more goals** to the goal library as needed
3. **Create your first real client** account
4. **Start tracking expenses** in the admin expenses page

---

## 📞 Need Help?

Open browser console (F12 → Console tab) to see detailed error messages. Most issues are:
- Spelling/capitalization errors in field names
- Wrong document IDs
- Missing required fields
- Security rules not published
