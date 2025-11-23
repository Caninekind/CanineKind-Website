#!/usr/bin/env node

/**
 * Firestore Database Seeder
 *
 * This script populates your Firestore database with default data:
 * - Default goals (Levels 1-4)
 * - Tasks for each goal
 * - Your admin account
 *
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Place it in this directory as 'serviceAccountKey.json'
 *
 * Usage: node seed-firestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:');
  console.error('   Make sure you have downloaded serviceAccountKey.json from Firebase Console');
  console.error('   Go to: Project Settings > Service Accounts > Generate New Private Key');
  process.exit(1);
}

const db = admin.firestore();

// Load seed data
const goalsData = JSON.parse(fs.readFileSync('./SEED_DATA_GOALS.json', 'utf8'));

// Emoji mappings for goals
const EMOJI_MAP = {
  'sit': '🪑',
  'down': '⬇️',
  'recall': '📢',
  'loose-leash': '🐕',
  'stay': '✋',
  'place': '🎯',
  'leave-it': '🚫',
  'drop-it': '💧',
  'crate-manners': '🏠',
  'door-manners': '🚪',
  'greeting-manners': '👋',
  'dog-socialization': '🐕‍🦺'
};

async function seedGoals() {
  console.log('\n📋 Seeding Goals...');
  const goalsRef = db.collection('goals');
  const createdGoals = [];

  for (const goalData of goalsData) {
    const { documentId, fields } = goalData;
    const { goalId, title, category, description, level, tasks } = fields;

    // Create goal document
    const goalDoc = {
      title: title,
      description: description,
      level: level,
      emoji: EMOJI_MAP[documentId] || '🎓',
      category: category,
      isCustom: false,
      ownerId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    };

    // Add goal to Firestore
    const goalRef = await goalsRef.add(goalDoc);
    console.log(`   ✓ Created goal: ${title} (Level ${level})`);

    createdGoals.push({
      id: goalRef.id,
      title: title,
      tasks: tasks
    });
  }

  console.log(`✅ Created ${createdGoals.length} goals`);
  return createdGoals;
}

async function seedTasks(goals) {
  console.log('\n📝 Seeding Tasks...');
  const tasksRef = db.collection('tasks');
  let taskCount = 0;

  for (const goal of goals) {
    for (const task of goal.tasks) {
      const taskDoc = {
        goalId: goal.id,
        title: task.description,
        description: task.description,
        order: task.order,
        isCompleted: false,
        userId: null, // Default task, not user-specific
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system'
      };

      await tasksRef.add(taskDoc);
      taskCount++;
    }
    console.log(`   ✓ Created ${goal.tasks.length} tasks for: ${goal.title}`);
  }

  console.log(`✅ Created ${taskCount} tasks`);
}

async function createAdminUser() {
  console.log('\n👤 Setting up Admin User...');
  console.log('   Please enter your admin email (the Google account you\'ll use to sign in):');

  // In Node.js, we need to prompt for input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('   Admin email: ', async (email) => {
      readline.close();

      if (!email || !email.includes('@')) {
        console.log('❌ Invalid email. Skipping admin user creation.');
        console.log('   You can manually create your admin user later.');
        resolve();
        return;
      }

      try {
        // Note: We can't create Firebase Auth users via Admin SDK without a UID
        // The user will be created when they first sign in with Google
        // We'll just document this in the users collection

        console.log(`\n   ⚠️  Important: You need to sign in with ${email} first.`);
        console.log('   After signing in, run this command to make yourself admin:');
        console.log(`
   firebase firestore:update users/{YOUR_USER_ID} --data '{"role":"admin","status":"approved"}'
        `);
        console.log('   Or use the Firebase Console to manually update your user document.');

        resolve();
      } catch (error) {
        console.error('❌ Error setting up admin user:', error.message);
        resolve();
      }
    });
  });
}

async function createIndexes() {
  console.log('\n🔍 Creating Database Indexes...');
  console.log('   Note: Firestore indexes need to be created via Firebase Console or firebase.json');
  console.log(`
   Recommended indexes:

   Collection: goalsProgress
   - userId (Ascending) + goalId (Ascending)
   - userId (Ascending) + status (Ascending)

   Collection: tasks
   - goalId (Ascending) + order (Ascending)

   Collection: sessions
   - clientId (Ascending) + sessionDate (Descending)
   - status (Ascending) + sessionDate (Descending)

   Collection: schedules
   - userId (Ascending) + dayOfWeek (Ascending)

   Collection: formSubmissions
   - userId (Ascending) + formId (Ascending)
   - status (Ascending) + submittedAt (Descending)
  `);
}

async function seedDatabase() {
  console.log('🚀 Starting Firestore Database Seeding...\n');
  console.log('This will populate your database with default goals and tasks.');
  console.log('============================================================\n');

  try {
    // Seed goals first
    const goals = await seedGoals();

    // Seed tasks for each goal
    await seedTasks(goals);

    // Setup admin user
    await createAdminUser();

    // Show index recommendations
    await createIndexes();

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('2. Sign in to your portal with your Google account');
    console.log('3. Manually set your user role to "admin" in Firebase Console');
    console.log('4. Start using the portal!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
