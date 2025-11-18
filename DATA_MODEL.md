# CanineKind Client Portal - Data Model & ERD

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ email (PK)      │
│ displayName     │
│ photoURL        │
│ approved        │
│ admin           │
│ createdAt       │
│ lastLogin       │
└─────────────────┘
         │
         │ 1:N
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│  USER_GOAL_PROGRESS  │              │   USER_SESSIONS      │
│──────────────────────│              │──────────────────────│
│ id (PK)              │              │ id (PK)              │
│ userEmail (FK)       │              │ userEmail (FK)       │
│ goalId (FK) ─────────┼──┐           │ sessionDate         │
│ selectedAt           │  │           │ sessionTime         │
│ progress (%)         │  │           │ duration            │
│ completed            │  │           │ notes               │
│ tasks: [             │  │           │ homework            │
│   {                  │  │           │ createdBy           │
│     text             │  │           │ createdAt           │
│     completed        │  │           └──────────────────────┘
│     completedAt      │  │
│   }                  │  │
│ ]                    │  │           ┌──────────────────────┐
└──────────────────────┘  │           │  USER_LEVEL_ACCESS   │
         │                │           │──────────────────────│
         │                │           │ userEmail (PK)       │
         │                │           │ levels: [0, 1, 2]    │
         │                │           │ individualGoals: []  │
         ▼                │           │ masteryCategories:[] │
┌──────────────────────┐  │           │ updatedAt           │
│ USER_LEVEL_COMPLETE  │  │           │ updatedBy           │
│──────────────────────│  │           └──────────────────────┘
│ id (PK)              │  │
│ userEmail (FK)       │  │
│ level                │  │           ┌──────────────────────┐
│ status               │  │           │   USER_SCHEDULE      │
│ submittedAt          │  │           │──────────────────────│
│ reviewedAt           │  │           │ id (PK)              │
│ reviewedBy           │  │           │ userEmail (FK)       │
└──────────────────────┘  │           │ activityId (FK) ─────┼──┐
                          │           │ date                 │  │
                          │           │ completed            │  │
                          │           │ completedAt          │  │
                          │           │ notes                │  │
                          │           └──────────────────────┘  │
                          │                                     │
                          │           ┌──────────────────────┐  │
                          │           │  USER_SETTINGS       │  │
                          │           │──────────────────────│  │
                          │           │ userEmail (PK)       │  │
                          │           │ ownerName            │  │
                          │           │ dogName              │  │
                          │           │ phone                │  │
                          │           │ address              │  │
                          │           │ emergencyContact     │  │
                          │           │ updatedAt            │  │
                          │           └──────────────────────┘  │
                          │                                     │
                          ▼                                     │
                 ┌─────────────────┐                           │
                 │     GOALS       │◄──────────────────────────┘
                 │─────────────────│
                 │ id (PK)         │
                 │ title           │
                 │ description     │
                 │ level           │
                 │ order           │
                 │ type            │
                 │ tasks: [        │
                 │   "task 1",     │
                 │   "task 2"      │
                 │ ]               │
                 │ prerequisites:[]│◄───┐
                 │ relatedGoals:[] │────┘
                 │ category        │
                 │ active          │
                 │ createdAt       │
                 └─────────────────┘
                          │
                          │ N:M
                          ▼
                 ┌─────────────────┐
                 │   ACTIVITIES    │
                 │─────────────────│
                 │ id (PK)         │
                 │ title           │
                 │ description     │
                 │ goalIds: [FK]   │
                 │ duration (mins) │
                 │ difficulty      │
                 │ instructions    │
                 │ tips            │
                 │ videoURL        │
                 │ category        │
                 │ active          │
                 └─────────────────┘
                          │
                          │ 1:N
                          ▼
                 ┌─────────────────┐
                 │ ACTIVITY_STEPS  │
                 │─────────────────│
                 │ id (PK)         │
                 │ activityId (FK) │
                 │ stepNumber      │
                 │ description     │
                 │ tips            │
                 │ imageURL        │
                 └─────────────────┘

┌────────────────────┐
│      LEVELS        │
│────────────────────│
│ level (PK)         │
│ name               │
│ description        │
│ requiredGoals: []  │
│ unlockCriteria     │
│ order              │
└────────────────────┘

┌────────────────────────┐
│  MASTERY_CATEGORIES    │
│────────────────────────│
│ id (PK)                │
│ title                  │
│ description            │
│ goalIds: [FK]          │
│ requiredLevel          │
│ order                  │
└────────────────────────┘
```

## Collections Structure in Firestore

### 1. **Top-Level Collections** (Global Data)

#### `goals/` - Training Goals Library
```javascript
goals/{goalId}
{
  id: "sit",
  title: "Sit",
  description: "Master the fundamental sit command",
  level: 1,
  order: 1,
  type: "tasks", // or "single"
  tasks: [
    "Dog can sit on command with hand signal",
    "Dog can sit for 10 seconds before release",
    "Dog can sit with distractions present"
  ],
  prerequisites: ["markers-release"], // IDs of goals that should be completed first
  relatedGoals: ["down", "place"], // Related goals for suggestions
  category: "basic-obedience",
  estimatedDuration: 14, // days to complete
  active: true,
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "admin@email.com"
}
```

#### `activities/` - Training Activities Library
```javascript
activities/{activityId}
{
  id: "sit-practice-basic",
  title: "Basic Sit Practice",
  description: "Daily sit command practice routine",
  goalIds: ["sit"], // Goals this activity supports
  duration: 10, // minutes
  difficulty: "beginner",
  instructions: "Step-by-step practice guide...",
  tips: [
    "Use high-value treats",
    "Practice in low-distraction environment first"
  ],
  videoURL: "https://...",
  imageURL: "https://...",
  category: "obedience",
  frequency: "daily", // or "3x-per-week", etc.
  active: true,
  createdAt: timestamp
}
```

#### `activitySteps/` - Subcollection under activities
```javascript
activities/{activityId}/steps/{stepId}
{
  stepNumber: 1,
  title: "Get dog's attention",
  description: "Call dog's name and show treat",
  tips: ["Make eye contact", "Keep treat at nose level"],
  imageURL: "https://...",
  duration: 2 // minutes for this step
}
```

#### `levels/` - Level Definitions
```javascript
levels/{level}
{
  level: 1,
  name: "Foundation",
  description: "Build basic obedience skills",
  requiredGoals: [], // Goals required to complete this level (for validation)
  unlockCriteria: {
    previousLevel: 0,
    minGoalsCompleted: 3,
    requiresTrainerApproval: true
  },
  order: 1,
  color: "#799972",
  icon: "🌱"
}
```

#### `masteryCategories/` - Advanced Category Definitions
```javascript
masteryCategories/{categoryId}
{
  id: "reactivity",
  title: "Reactivity Training",
  description: "Advanced reactivity management",
  goalIds: ["leash-reactivity", "neutral-walking"], // Goals in this category
  requiredLevel: 2,
  prerequisites: ["sit", "down", "loose-leash"],
  order: 1,
  active: true
}
```

---

### 2. **User-Specific Collections** (Under `users/{email}/`)

#### `users/{email}/selectedGoals/{goalId}` - User's Active Goals
```javascript
{
  goalId: "sit", // Reference to goals collection
  selectedAt: timestamp,
  startedAt: timestamp,
  completedAt: timestamp || null,
  progress: 66, // percentage
  currentTaskIndex: 1,
  tasks: [
    {
      text: "Dog can sit on command with hand signal",
      completed: true,
      completedAt: timestamp
    },
    {
      text: "Dog can sit for 10 seconds before release",
      completed: true,
      completedAt: timestamp
    },
    {
      text: "Dog can sit with distractions present",
      completed: false,
      completedAt: null
    }
  ],
  notes: "Dog doing great! Struggles with distractions.",
  remindersEnabled: true
}
```

#### `users/{email}/schedule/{dateString}` - User's Daily Schedule
```javascript
users/{email}/schedule/2025-01-18
{
  date: "2025-01-18",
  activities: [
    {
      activityId: "sit-practice-basic", // Reference to activities collection
      scheduledTime: "09:00",
      duration: 10,
      completed: false,
      completedAt: null,
      notes: ""
    },
    {
      activityId: "loose-leash-walk",
      scheduledTime: "17:00",
      duration: 20,
      completed: true,
      completedAt: timestamp,
      notes: "Great session! Less pulling today."
    }
  ],
  totalPlanned: 30, // minutes
  totalCompleted: 20, // minutes
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{email}/sessions/{sessionId}` - Training Sessions
```javascript
{
  sessionDate: timestamp,
  sessionTime: "14:00",
  duration: 60,
  type: "in-person", // or "virtual", "check-in"
  status: "scheduled", // or "completed", "cancelled"
  trainerEmail: "trainer@caninekind.com",
  location: "Client's home",
  goals: ["sit", "down"], // Goals to work on
  notes: "Work on duration with sit command",
  homework: "Practice sit 3x daily for 5 minutes",
  homeworkGoals: ["sit"], // Goals the homework supports
  completedAt: timestamp || null,
  createdBy: "trainer@email.com",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{email}/levelAccess/access` - User's Level Access (Single Doc)
```javascript
{
  levels: [0, 1], // Unlocked levels
  individualGoals: ["reactivity-basics"], // Individual goal unlocks
  masteryCategories: [], // Unlocked mastery categories
  currentLevel: 1,
  updatedAt: timestamp,
  updatedBy: "trainer@email.com"
}
```

#### `users/{email}/levelCompletions/{completionId}` - Level Completion Requests
```javascript
{
  level: 1,
  completedGoals: ["sit", "down", "recall", "markers-release"],
  status: "pending", // or "approved", "rejected"
  submittedAt: timestamp,
  reviewedAt: timestamp || null,
  reviewedBy: "trainer@email.com" || null,
  feedback: "Great job! Moving to Level 2.",
  autoUnlockNext: true // Whether to auto-unlock next level on approval
}
```

#### `users/{email}/settings/profile` - User Settings (Single Doc)
```javascript
{
  ownerName: "John Doe",
  dogName: "Max",
  dogBreed: "Golden Retriever",
  dogAge: 2,
  phone: "+1234567890",
  address: "123 Main St",
  emergencyContact: {
    name: "Jane Doe",
    phone: "+1234567891"
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    reminderTime: "08:00"
  },
  updatedAt: timestamp
}
```

#### `users/{email}/activityHistory/{activityId}` - Activity Tracking
```javascript
{
  activityId: "sit-practice-basic",
  totalSessions: 15,
  lastCompleted: timestamp,
  averageDuration: 10,
  streak: 5, // consecutive days
  longestStreak: 12,
  completionRate: 0.85, // 85%
  completions: [
    {
      date: "2025-01-18",
      duration: 10,
      notes: "Great session",
      rating: 5
    }
  ]
}
```

---

## Key Relationships & References

### 1. **Goals ↔ Activities** (Many-to-Many)
- `activities.goalIds[]` contains goal IDs
- One activity can support multiple goals
- One goal can have multiple recommended activities

### 2. **Goals ↔ Prerequisites** (Self-Referencing)
- `goals.prerequisites[]` contains goal IDs
- Defines the order goals should be learned
- Used for suggestions and unlock logic

### 3. **User ↔ Goals** (Many-to-Many via selectedGoals)
- Users select goals from the global `goals` collection
- Progress is tracked in `users/{email}/selectedGoals`
- References maintain single source of truth

### 4. **Levels ↔ Goals** (One-to-Many)
- Each goal belongs to one level
- Level completion requires completing certain goals
- Used for progression tracking

### 5. **Sessions ↔ Goals** (Many-to-Many)
- Sessions reference which goals will be worked on
- Homework can be tied to specific goals
- Helps track which goals are trainer-supported

---

## Benefits of This Structure

### ✅ **Single Source of Truth**
- Goals are defined once in `goals/` collection
- Changes to goal definitions propagate everywhere
- No duplicate data, easier maintenance

### ✅ **Flexible Relationships**
- Prerequisites define learning paths
- Related goals for suggestions
- Activities map to multiple goals

### ✅ **Easy Updates**
- Add new goals without touching user data
- Modify goal descriptions globally
- Archive goals with `active: false`

### ✅ **Rich Queries**
```javascript
// Get all Level 1 goals
db.collection('goals').where('level', '==', 1).where('active', '==', true)

// Get prerequisites for a goal
db.collection('goals').doc('sit').get()
  .then(doc => {
    const prereqIds = doc.data().prerequisites
    // Fetch prerequisite goals
  })

// Get user's active goals
db.collection('users').doc(email).collection('selectedGoals').get()

// Get activities for a specific goal
db.collection('activities').where('goalIds', 'array-contains', 'sit').get()
```

### ✅ **Scalable**
- Add new goal types easily
- Extend with new fields without breaking existing data
- Support multiple trainers, dogs per user

### ✅ **Supports Advanced Features**
- Goal recommendations based on prerequisites
- Activity suggestions based on selected goals
- Progress tracking and analytics
- Automated unlocking with Firebase Functions

---

## Migration Strategy

### Phase 1: Create Global Collections
1. Move hardcoded `GOALS_STRUCTURE` to `goals/` collection
2. Create `levels/` collection
3. Create `activities/` collection (future)
4. Create `masteryCategories/` collection

### Phase 2: Update User Data Structure
1. Migrate existing user goal data to new schema
2. Add `goalId` references instead of embedded data
3. Update `levelAccess` structure

### Phase 3: Update Frontend Code
1. Load goals from Firestore instead of hardcoded
2. Use goal IDs for references
3. Update queries to use new structure

### Phase 4: Add Advanced Features
1. Implement prerequisite checking
2. Add activity recommendations
3. Build progress analytics
4. Enable automated workflows

---

## Next Steps

1. **Review this data model** - Does it fit your business logic?
2. **Create seed data** - Populate initial goals, levels, activities
3. **Write migration scripts** - Move existing user data to new structure
4. **Update security rules** - Ensure proper access control
5. **Refactor frontend** - Load from Firestore instead of hardcoded data

Want me to help with any of these steps?
