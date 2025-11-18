// CanineKind Portal - Seed Data Examples
// This file contains example data to populate your Firestore database

// Run this once to populate initial data:
// node seed-data-example.js

const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // You'll need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================
// GOALS SEED DATA
// ============================================

const goalsData = {
  // LEVEL 0 - Getting Started
  'training-gear': {
    id: 'training-gear',
    title: 'Training Gear Checklist',
    description: 'Make sure you have your training gear for your first in-person session',
    level: 0,
    order: 1,
    type: 'single',
    tasks: ['Yes I have all my things'],
    prerequisites: [],
    relatedGoals: [],
    category: 'preparation',
    estimatedDuration: 1,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'legal-forms': {
    id: 'legal-forms',
    title: 'Sign Legal/Training Forms',
    description: 'Complete all required legal and training documentation',
    level: 0,
    order: 2,
    type: 'single',
    tasks: ['Forms completed and signed'],
    prerequisites: [],
    relatedGoals: [],
    category: 'preparation',
    estimatedDuration: 1,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'review-instructions': {
    id: 'review-instructions',
    title: 'Review Email Instructions',
    description: 'Review email instructions and guidance prior to meeting with your trainer',
    level: 0,
    order: 3,
    type: 'single',
    tasks: ['Yes I have checked my email 24-48 hours before my first session'],
    prerequisites: [],
    relatedGoals: [],
    category: 'preparation',
    estimatedDuration: 1,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },

  // LEVEL 1 - Foundation
  'markers-release': {
    id: 'markers-release',
    title: 'Markers & Release Words',
    description: 'Establish clear communication markers',
    level: 1,
    order: 1,
    type: 'tasks',
    tasks: [
      'Dog understands "Yes" marker for correct behavior',
      'Dog responds to release word (e.g., "Free" or "Okay")',
      'Dog waits for release word before breaking position'
    ],
    prerequisites: [],
    relatedGoals: ['sit', 'down', 'place'],
    category: 'basic-obedience',
    estimatedDuration: 7,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'sit': {
    id: 'sit',
    title: 'Sit',
    description: 'Master the fundamental sit command',
    level: 1,
    order: 2,
    type: 'tasks',
    tasks: [
      'Dog can sit on command with hand signal',
      'Dog can sit for 10 seconds before release',
      'Dog can sit with distractions present'
    ],
    prerequisites: ['markers-release'],
    relatedGoals: ['down', 'place'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'down': {
    id: 'down',
    title: 'Down',
    description: 'Teach your dog to lie down on command',
    level: 1,
    order: 3,
    type: 'tasks',
    tasks: [
      'Dog can lie down on command with hand signal',
      'Dog can hold down position for 10 seconds',
      'Dog can lie down from a sitting or standing position'
    ],
    prerequisites: ['sit'],
    relatedGoals: ['place', 'stay'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'recall': {
    id: 'recall',
    title: 'Recall',
    description: 'Train your dog to come when called',
    level: 1,
    order: 4,
    type: 'tasks',
    tasks: [
      'Dog comes when called in a quiet environment',
      'Dog comes when called with mild distractions',
      'Dog consistently responds to recall command'
    ],
    prerequisites: ['markers-release'],
    relatedGoals: ['basic-engagement'],
    category: 'basic-obedience',
    estimatedDuration: 21,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'place': {
    id: 'place',
    title: 'Place',
    description: 'Teach your dog to go to their designated spot',
    level: 1,
    order: 5,
    type: 'tasks',
    tasks: [
      'Dog goes to place on command',
      'Dog stays on place for 30 seconds',
      'Dog can hold place with distractions'
    ],
    prerequisites: ['sit', 'down'],
    relatedGoals: ['stay'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'boundaries-thresholds': {
    id: 'boundaries-thresholds',
    title: 'Boundaries & Thresholds',
    description: 'Teach impulse control at doorways and boundaries',
    level: 1,
    order: 6,
    type: 'tasks',
    tasks: [
      'Dog waits at doorways until released',
      'Dog respects boundary markers (e.g., baby gates, doorways)',
      'Dog can hold position at threshold with mild distractions'
    ],
    prerequisites: ['sit', 'markers-release'],
    relatedGoals: ['place', 'impulse-control'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'leave-it': {
    id: 'leave-it',
    title: 'Leave it Command',
    description: 'Teach your dog to ignore items on command',
    level: 1,
    order: 7,
    type: 'tasks',
    tasks: [
      'Dog can leave a treat in your hand on command',
      'Dog can leave a treat on the floor on command',
      'Dog can walk past distractions without engaging'
    ],
    prerequisites: ['markers-release'],
    relatedGoals: ['impulse-control', 'loose-leash'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  'basic-engagement': {
    id: 'basic-engagement',
    title: 'Basic Engagement',
    description: 'Build focus and attention skills',
    level: 1,
    order: 8,
    type: 'tasks',
    tasks: [
      'Dog makes eye contact when name is called',
      'Dog can maintain focus for 5 seconds',
      'Dog checks in with handler during walks'
    ],
    prerequisites: ['markers-release'],
    relatedGoals: ['recall', 'loose-leash'],
    category: 'basic-obedience',
    estimatedDuration: 14,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  }
};

// ============================================
// LEVELS SEED DATA
// ============================================

const levelsData = {
  0: {
    level: 0,
    name: 'Getting Started',
    description: 'Preparation and onboarding',
    requiredGoals: ['training-gear', 'legal-forms', 'review-instructions'],
    unlockCriteria: {
      previousLevel: null,
      minGoalsCompleted: 0,
      requiresTrainerApproval: false
    },
    order: 0,
    color: '#799972',
    icon: '📋'
  },
  1: {
    level: 1,
    name: 'Foundation',
    description: 'Basic obedience skills',
    requiredGoals: [], // Can complete any goals to move to Level 2
    unlockCriteria: {
      previousLevel: 0,
      minGoalsCompleted: 3, // Must complete 3 Level 0 goals
      requiresTrainerApproval: true
    },
    order: 1,
    color: '#799972',
    icon: '🌱'
  },
  2: {
    level: 2,
    name: 'Intermediate',
    description: 'Building on the basics',
    requiredGoals: [],
    unlockCriteria: {
      previousLevel: 1,
      minGoalsCompleted: 4, // Must complete at least 4 Level 1 goals
      requiresTrainerApproval: true
    },
    order: 2,
    color: '#6a8a62',
    icon: '🎯'
  },
  3: {
    level: 3,
    name: 'Advanced',
    description: 'Complex skills and behaviors',
    requiredGoals: [],
    unlockCriteria: {
      previousLevel: 2,
      minGoalsCompleted: 5,
      requiresTrainerApproval: true
    },
    order: 3,
    color: '#5a7a52',
    icon: '⭐'
  },
  4: {
    level: 4,
    name: 'Mastery',
    description: 'Expert-level training',
    requiredGoals: [],
    unlockCriteria: {
      previousLevel: 3,
      minGoalsCompleted: 5,
      requiresTrainerApproval: true
    },
    order: 4,
    color: '#4a6a42',
    icon: '🏆'
  }
};

// ============================================
// ACTIVITIES SEED DATA
// ============================================

const activitiesData = {
  'sit-practice-basic': {
    id: 'sit-practice-basic',
    title: 'Basic Sit Practice',
    description: 'Daily sit command practice routine for beginners',
    goalIds: ['sit'],
    duration: 10,
    difficulty: 'beginner',
    instructions: `
1. Get your dog's attention with a treat
2. Hold treat above their nose
3. Move treat back over their head
4. As their bottom touches the ground, say "Sit"
5. Mark with "Yes" and reward immediately
6. Repeat 5-10 times
    `,
    tips: [
      'Use high-value treats',
      'Practice in a low-distraction environment first',
      'Keep sessions short (5-10 minutes)',
      'End on a positive note'
    ],
    videoURL: '',
    imageURL: '',
    category: 'obedience',
    frequency: 'daily',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  'marker-training': {
    id: 'marker-training',
    title: 'Marker Word Training',
    description: 'Establish your marker word and release word',
    goalIds: ['markers-release'],
    duration: 5,
    difficulty: 'beginner',
    instructions: `
1. Have treats ready
2. Say "Yes" and immediately give a treat
3. Repeat 10-15 times
4. Dog should start anticipating treat after "Yes"
5. Practice release word by asking for sit, then saying "Free"
    `,
    tips: [
      'Timing is crucial - mark immediately',
      'Use the same marker word consistently',
      'Practice multiple times per day'
    ],
    videoURL: '',
    category: 'foundation',
    frequency: '3x-per-day',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  'recall-practice-indoor': {
    id: 'recall-practice-indoor',
    title: 'Indoor Recall Practice',
    description: 'Build reliable recall in low-distraction environment',
    goalIds: ['recall'],
    duration: 15,
    difficulty: 'beginner',
    instructions: `
1. Start 5 feet away from your dog
2. Call their name enthusiastically
3. When they come, mark with "Yes"
4. Reward with treats and praise
5. Gradually increase distance
6. Practice in different rooms
    `,
    tips: [
      'Always reward coming when called',
      'Never call for something negative (bath, nails, etc)',
      'Make yourself exciting and fun',
      'Use a happy, high-pitched voice'
    ],
    videoURL: '',
    category: 'obedience',
    frequency: 'daily',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
};

// ============================================
// MASTERY CATEGORIES SEED DATA
// ============================================

const masteryCategoriesData = {
  'reactivity': {
    id: 'reactivity',
    title: 'Reactivity Training',
    description: 'Advanced reactivity management and desensitization',
    goalIds: [], // Add goal IDs when you create reactivity goals
    requiredLevel: 2,
    prerequisites: ['sit', 'down', 'loose-leash', 'basic-engagement'],
    order: 1,
    active: true
  },
  'off-leash': {
    id: 'off-leash',
    title: 'Off-Leash Reliability',
    description: 'Advanced off-leash control and distance work',
    goalIds: [],
    requiredLevel: 3,
    prerequisites: ['recall', 'sit', 'down', 'stay'],
    order: 2,
    active: true
  }
};

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedGoals() {
  console.log('📝 Seeding goals...');
  const batch = db.batch();

  Object.keys(goalsData).forEach(goalId => {
    const goalRef = db.collection('goals').doc(goalId);
    batch.set(goalRef, goalsData[goalId]);
  });

  await batch.commit();
  console.log(`✅ Seeded ${Object.keys(goalsData).length} goals`);
}

async function seedLevels() {
  console.log('📝 Seeding levels...');
  const batch = db.batch();

  Object.keys(levelsData).forEach(level => {
    const levelRef = db.collection('levels').doc(level.toString());
    batch.set(levelRef, levelsData[level]);
  });

  await batch.commit();
  console.log(`✅ Seeded ${Object.keys(levelsData).length} levels`);
}

async function seedActivities() {
  console.log('📝 Seeding activities...');
  const batch = db.batch();

  Object.keys(activitiesData).forEach(activityId => {
    const activityRef = db.collection('activities').doc(activityId);
    batch.set(activityRef, activitiesData[activityId]);
  });

  await batch.commit();
  console.log(`✅ Seeded ${Object.keys(activitiesData).length} activities`);
}

async function seedMasteryCategories() {
  console.log('📝 Seeding mastery categories...');
  const batch = db.batch();

  Object.keys(masteryCategoriesData).forEach(categoryId => {
    const categoryRef = db.collection('masteryCategories').doc(categoryId);
    batch.set(categoryRef, masteryCategoriesData[categoryId]);
  });

  await batch.commit();
  console.log(`✅ Seeded ${Object.keys(masteryCategoriesData).length} mastery categories`);
}

async function seedAll() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await seedLevels();
    await seedGoals();
    await seedActivities();
    await seedMasteryCategories();

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedAll();
