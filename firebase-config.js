// Firebase Configuration and Initialization
// This file handles Firebase setup and authentication

// Firebase configuration object
// CanineKind Client Portal Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCL6xXmXT0XSNOd-v2iGEApFYFF9FI6tQs",
    authDomain: "caninekind-client-portal.firebaseapp.com",
    projectId: "caninekind-client-portal",
    storageBucket: "caninekind-client-portal.firebasestorage.app",
    messagingSenderId: "934622852125",
    appId: "1:934622852125:web:0cec9fcf3be24efc1c02f4"
};

// Initialize Firebase
let app;
let auth;
let provider;
let db;

function initializeFirebase() {
    try {
        // Initialize Firebase app
        app = firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

        // Initialize Firestore Database
        db = firebase.firestore();

        // Initialize Google Auth Provider
        provider = new firebase.auth.GoogleAuthProvider();

        // Configure provider to always show account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('User signed in:', user.email);

        // Store user info in sessionStorage
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.displayName);
        sessionStorage.setItem('userPhoto', user.photoURL);
        sessionStorage.setItem('isAuthenticated', 'true');

        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('Error during sign-in:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();

        // Clear session storage
        sessionStorage.clear();

        console.log('User signed out');
        return true;
    } catch (error) {
        console.error('Error during sign-out:', error);
        return false;
    }
}

// Check authentication state
function onAuthStateChanged(callback) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            callback({
                isAuthenticated: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            });
        } else {
            // User is signed out
            callback({
                isAuthenticated: false,
                user: null
            });
        }
    });
}

// Check if user is currently authenticated
function isUserAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true' && auth.currentUser !== null;
}

// Get current user
function getCurrentUser() {
    if (auth.currentUser) {
        return {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL
        };
    }
    return null;
}

// Protect page - redirect to login if not authenticated
function protectPage(redirectUrl = 'portal-login.html') {
    // Wait for Firebase to initialize and check auth state
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // User is not signed in, redirect to login
            window.location.href = redirectUrl;
        }
    });
}

// ==========================================
// FIRESTORE USER MANAGEMENT FUNCTIONS
// ==========================================

// Check if user exists and is approved in Firestore
async function checkUserApproval(email) {
    console.log('🔵 [FIRESTORE] checkUserApproval() called for:', email);

    try {
        console.log('🔵 [FIRESTORE] Querying Firestore for users/' + email);
        const userDoc = await db.collection('users').doc(email).get();
        console.log('🔵 [FIRESTORE] Query complete. User exists:', userDoc.exists);

        if (!userDoc.exists) {
            // User doesn't exist in database
            console.log('🔵 [FIRESTORE] User does not exist in database');
            return {
                exists: false,
                approved: false,
                role: null
            };
        }

        const userData = userDoc.data();
        console.log('🔵 [FIRESTORE] User data retrieved:', userData);

        const result = {
            exists: true,
            approved: userData.approved || false,
            role: userData.role || 'client'
        };
        console.log('🔵 [FIRESTORE] Returning approval result:', result);
        return result;
    } catch (error) {
        console.error('❌ [FIRESTORE] Error checking user approval:', error);
        console.error('❌ [FIRESTORE] Error code:', error.code);
        console.error('❌ [FIRESTORE] Error message:', error.message);
        return {
            exists: false,
            approved: false,
            role: null,
            error: error.message
        };
    }
}

// Create or update user in Firestore after Google sign-in
async function createOrUpdateUser(user, approved = false, role = 'client') {
    console.log('🔵 [FIRESTORE] createOrUpdateUser() called');
    console.log('🔵 [FIRESTORE] User email:', user.email);
    console.log('🔵 [FIRESTORE] Approved:', approved);
    console.log('🔵 [FIRESTORE] Role:', role);

    try {
        console.log('🔵 [FIRESTORE] Getting reference to users/' + user.email);
        const userRef = db.collection('users').doc(user.email);

        console.log('🔵 [FIRESTORE] Checking if user document exists...');
        const userDoc = await userRef.get();
        console.log('🔵 [FIRESTORE] User exists:', userDoc.exists);

        if (!userDoc.exists) {
            // Create new user record
            console.log('🔵 [FIRESTORE] Creating new user document...');
            const userData = {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                uid: user.uid,
                approved: approved,
                role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.log('🔵 [FIRESTORE] User data to write:', userData);

            await userRef.set(userData);
            console.log('✅ [FIRESTORE] New user created successfully in database!');
        } else {
            // Update last login
            console.log('🔵 [FIRESTORE] User exists - updating last login...');
            const updateData = {
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: user.displayName,
                photoURL: user.photoURL
            };
            console.log('🔵 [FIRESTORE] Update data:', updateData);

            await userRef.update(updateData);
            console.log('✅ [FIRESTORE] User last login updated successfully!');
        }

        return { success: true };
    } catch (error) {
        console.error('❌ [FIRESTORE] Error creating/updating user:', error);
        console.error('❌ [FIRESTORE] Error code:', error.code);
        console.error('❌ [FIRESTORE] Error message:', error.message);
        console.error('❌ [FIRESTORE] Full error:', error);
        return { success: false, error: error.message };
    }
}

// Get user data from Firestore
async function getUserData(email) {
    try {
        const userDoc = await db.collection('users').doc(email).get();

        if (!userDoc.exists) {
            return null;
        }

        return userDoc.data();
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Check if current user is admin
async function isUserAdmin() {
    const user = auth.currentUser;
    if (!user) return false;

    const userData = await getUserData(user.email);
    return userData && userData.role === 'admin';
}

// Get all users (admin only)
async function getAllUsers() {
    try {
        // Try to get users ordered by creation date
        let usersSnapshot;
        try {
            usersSnapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .get();
        } catch (indexError) {
            // If ordering fails (no index), just get all users unordered
            console.log('Firestore index not available, fetching users without ordering');
            usersSnapshot = await db.collection('users').get();
        }

        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({
                email: doc.id,
                ...doc.data()
            });
        });

        // Sort manually if we couldn't use orderBy
        users.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
        });

        console.log(`Found ${users.length} users in database`);
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

// Approve a user (admin only)
async function approveUser(email) {
    try {
        await db.collection('users').doc(email).update({
            approved: true,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('User approved:', email);
        return { success: true };
    } catch (error) {
        console.error('Error approving user:', error);
        return { success: false, error: error.message };
    }
}

// Deny/remove user approval (admin only)
async function denyUser(email) {
    try {
        await db.collection('users').doc(email).update({
            approved: false
        });
        console.log('User denied:', email);
        return { success: true };
    } catch (error) {
        console.error('Error denying user:', error);
        return { success: false, error: error.message };
    }
}

// Update user role (admin only)
async function updateUserRole(email, role) {
    try {
        await db.collection('users').doc(email).update({
            role: role
        });
        console.log('User role updated:', email, role);
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
}

// Delete user from database (admin only)
async function deleteUser(email) {
    try {
        await db.collection('users').doc(email).delete();
        console.log('User deleted:', email);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
}
