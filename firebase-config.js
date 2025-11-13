// Firebase Configuration and Initialization
// This file handles Firebase setup and authentication

// Firebase configuration object
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let auth;
let provider;

function initializeFirebase() {
    try {
        // Initialize Firebase app
        app = firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

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
