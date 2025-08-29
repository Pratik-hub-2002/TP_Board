import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

// Register a new user
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with default display name
    await updateProfile(userCredential.user, {
      displayName: email.split('@')[0] // Use the part before @ as display name
    });

    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    switch (error.code) {
      case 'auth/email-already-in-use':
        error.message = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        error.message = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        error.message = 'Password should be at least 6 characters.';
        break;
      case 'auth/network-request-failed':
        error.message = 'Network error. Please check your internet connection.';
        break;
    }
    
    throw error;
  }
};

// Sign in existing user
export const login = async (email, password) => {
  try {
    console.log("🔑 Attempting to log in...");
    console.log("Email:", email);
    
    // Validate and trim inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    console.log("✅ Login successful", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Authentication error:", error);
    
    // Handle specific error cases
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        error.message = 'Invalid email or password. Please check your credentials and try again.';
        break;
      case 'auth/too-many-requests':
        error.message = 'Too many failed login attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        error.message = 'Network error. Please check your internet connection.';
        break;
      case 'auth/user-disabled':
        error.message = 'This account has been disabled.';
        break;
    }
    
    throw error;
  }
};

// Sign out user
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("👋 User signed out");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("📧 Password reset email sent");
  } catch (error) {
    console.error("❌ Password reset error:", error);
    
    // Handle specific error cases
    switch (error.code) {
      case 'auth/user-not-found':
        error.message = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        error.message = 'Please enter a valid email address.';
        break;
      case 'auth/network-request-failed':
        error.message = 'Network error. Please check your internet connection.';
        break;
    }
    
    throw error;
  }
};
