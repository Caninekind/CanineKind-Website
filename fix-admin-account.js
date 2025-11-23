// Fix Admin Account Script
// This script ensures the admin account has proper role, status, and settings

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// IMPORTANT: Replace this with your admin email
const ADMIN_EMAIL = 'caninekindtraining@gmail.com';

async function fixAdminAccount() {
  try {
    console.log('🔍 Finding admin user...');

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', ADMIN_EMAIL)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No user found with email:', ADMIN_EMAIL);
      console.log('   Please update ADMIN_EMAIL in this script with the correct admin email.');
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const uid = userDoc.id;
    const currentData = userDoc.data();

    console.log('✓ Found user:', uid);
    console.log('  Current data:', JSON.stringify(currentData, null, 2));

    // Update with admin role, approved status, and default settings
    const updates = {
      role: 'admin',
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: 'system',
      settings: {
        canAccessGoals: true,
        canAccessSchedule: true,
        canAccessSessions: true,
        canAccessForms: true,
        accessibleLevels: [1, 2, 3, 4],
        hasCompletedIntake: true,
        firstSessionCompleted: true
      }
    };

    console.log('💾 Updating admin account with:', JSON.stringify(updates, null, 2));

    await db.collection('users').doc(uid).update(updates);

    console.log('✅ Admin account fixed successfully!');
    console.log('   You should now be able to access all portal features.');

  } catch (error) {
    console.error('❌ Error fixing admin account:', error);
    process.exit(1);
  }

  process.exit(0);
}

fixAdminAccount();
