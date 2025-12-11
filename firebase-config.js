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
let storage;

function initializeFirebase() {
    try {
        // Initialize Firebase app
        app = firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

        // Initialize Firestore Database
        db = firebase.firestore();

        // Initialize Firebase Storage (only if SDK is loaded)
        if (typeof firebase.storage === 'function') {
            storage = firebase.storage();
        }

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
async function checkUserApproval(uid) {
    console.log('🔵 [FIRESTORE] checkUserApproval() called for UID:', uid);

    try {
        console.log('🔵 [FIRESTORE] Querying Firestore for users/' + uid);
        const userDoc = await db.collection('users').doc(uid).get();
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
            approved: userData.status === 'approved',
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
        console.log('🔵 [FIRESTORE] Getting reference to users/' + user.uid);
        const userRef = db.collection('users').doc(user.uid);

        console.log('🔵 [FIRESTORE] Checking if user document exists...');
        const userDoc = await userRef.get();
        console.log('🔵 [FIRESTORE] User exists:', userDoc.exists);

        if (!userDoc.exists) {
            // Create new user record
            console.log('🔵 [FIRESTORE] Creating new user document...');
            const userData = {
                email: user.email,
                displayName: user.displayName || user.email,
                role: role,
                status: approved ? 'approved' : 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: approved ? firebase.firestore.FieldValue.serverTimestamp() : null,
                approvedBy: approved ? 'system' : null,
                settings: {
                    canAccessGoals: false,
                    canAccessSchedule: false,
                    canAccessSessions: false,
                    canAccessForms: false,
                    accessibleLevels: [],
                    hasCompletedIntake: false,
                    firstSessionCompleted: false
                }
            };
            console.log('🔵 [FIRESTORE] User data to write:', userData);

            await userRef.set(userData);
            console.log('✅ [FIRESTORE] New user created successfully in database!');
        } else {
            // User exists - don't update
            console.log('✅ [FIRESTORE] User already exists - no update needed');
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
async function getUserData(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();

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

    const userData = await getUserData(user.uid);
    return userData && userData.role === 'admin' && userData.status === 'approved';
}

// Get all users (admin only)
async function getAllUsers() {
    console.log('🔵 [ADMIN] getAllUsers() called');
    try {
        // Fetch all users without ordering (orderBy excludes docs without that field!)
        console.log('🔵 [ADMIN] Fetching all users...');
        const usersSnapshot = await db.collection('users').get();
        console.log('✅ [ADMIN] Successfully fetched users');

        console.log('🔵 [ADMIN] Processing snapshot...');
        console.log('🔵 [ADMIN] Snapshot size:', usersSnapshot.size);
        console.log('🔵 [ADMIN] Snapshot empty?', usersSnapshot.empty);

        const users = [];
        usersSnapshot.forEach(doc => {
            console.log('🔵 [ADMIN] Processing document:', doc.id);
            const userData = doc.data();
            console.log('🔵 [ADMIN] Document data:', userData);
            users.push({
                uid: doc.id,  // Document ID is now the UID
                ...userData   // This includes email, role, status, etc.
            });
        });

        console.log('🔵 [ADMIN] Total users collected:', users.length);

        // Sort by createdAt if it exists, otherwise by email
        users.sort((a, b) => {
            // If both have createdAt, sort by that (newest first)
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            // If only one has createdAt, put that one first
            if (a.createdAt) return -1;
            if (b.createdAt) return 1;
            // If neither has createdAt, sort alphabetically by email
            return a.email.localeCompare(b.email);
        });

        console.log(`✅ [ADMIN] Found ${users.length} users in database`);
        console.log('✅ [ADMIN] Users:', users);
        return users;
    } catch (error) {
        console.error('❌ [ADMIN] Error getting all users:', error);
        console.error('❌ [ADMIN] Error code:', error.code);
        console.error('❌ [ADMIN] Error message:', error.message);
        console.error('❌ [ADMIN] Full error:', error);
        return [];
    }
}

// Approve a user (admin only)
async function approveUser(uid) {
    try {
        await db.collection('users').doc(uid).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: auth.currentUser ? auth.currentUser.uid : 'system',
            settings: {
                canAccessGoals: false,
                canAccessSchedule: false,
                canAccessSessions: false,
                canAccessForms: false,
                accessibleLevels: [],
                hasCompletedIntake: false,
                firstSessionCompleted: false
            }
        });
        console.log('User approved with default settings:', uid);
        return { success: true };
    } catch (error) {
        console.error('Error approving user:', error);
        return { success: false, error: error.message };
    }
}

// Deny/remove user approval (admin only)
async function denyUser(uid) {
    try {
        await db.collection('users').doc(uid).update({
            status: 'rejected'
        });
        console.log('User denied:', uid);
        return { success: true };
    } catch (error) {
        console.error('Error denying user:', error);
        return { success: false, error: error.message };
    }
}

// Update user role (admin only)
async function updateUserRole(uid, role) {
    try {
        await db.collection('users').doc(uid).update({
            role: role
        });
        console.log('User role updated:', uid, role);
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
}

// Delete user from database (admin only)
async function deleteUser(uid) {
    try {
        await db.collection('users').doc(uid).delete();
        console.log('User deleted:', uid);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// DOCUMENT MANAGEMENT FUNCTIONS
// ==========================================

// Check if user has completed required documents (only checks assigned forms)
async function checkDocumentsComplete(email) {
    try {
        const userDoc = await db.collection('users').doc(email).get();
        if (!userDoc.exists) {
            return false;
        }

        // Get assigned forms for this user
        const assignedFormsDoc = await db.collection('users').doc(email)
            .collection('assignedForms').doc('forms').get();

        if (!assignedFormsDoc.exists) {
            // If no forms assigned, consider complete
            console.log('No forms assigned to user, considering complete');
            return true;
        }

        const assignedForms = assignedFormsDoc.data().forms || [];

        // If no forms assigned, consider complete
        if (assignedForms.length === 0) {
            console.log('Empty forms array, considering complete');
            return true;
        }

        // Check if all assigned forms are completed
        for (const formId of assignedForms) {
            const signedDoc = await db.collection('users').doc(email)
                .collection('signedDocuments').doc(formId).get();

            if (!signedDoc.exists) {
                console.log(`Form ${formId} not completed`);
                return false;
            }
        }

        console.log('All assigned forms completed');
        return true;
    } catch (error) {
        console.error('Error checking documents:', error);
        return false;
    }
}

// Get signed document for user
async function getSignedDocument(email, documentId = 'legal-agreement') {
    try {
        const docRef = db.collection('users').doc(email)
            .collection('signedDocuments').doc(documentId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        return doc.data();
    } catch (error) {
        console.error('Error getting signed document:', error);
        return null;
    }
}

// Get all signed documents for all users (admin only)
async function getAllSignedDocuments() {
    try {
        const users = await getAllUsers();
        const allDocuments = [];

        for (const user of users) {
            const docData = await getSignedDocument(user.email);
            if (docData) {
                allDocuments.push({
                    email: user.email,
                    fullName: docData.fullName || user.displayName,
                    signedAt: docData.signedAt,
                    pdfURL: docData.pdfURL,
                    ...docData
                });
            }
        }

        return allDocuments;
    } catch (error) {
        console.error('Error getting all signed documents:', error);
        return [];
    }
}
