import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  AuthErrorCodes
} from 'firebase/auth';
import { auth } from '../firebase';

// Register a new user
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    switch (error.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        throw new Error('Email already in use');
      case AuthErrorCodes.WEAK_PASSWORD:
        throw new Error('Password should be at least 6 characters');
      case AuthErrorCodes.INVALID_EMAIL:
        throw new Error('Invalid email format');
      default:
        throw new Error(error.message);
    }
  }
};

// Sign in existing user
export const login = async (email, password) => {
  try {
    console.log("🔑 Attempting to log in...");
    console.log("Email:", email);
    console.log("Auth instance:", auth);
    console.log("Firebase config loaded:", !!auth.app.options.apiKey);
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Trim whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    console.log("Attempting Firebase signIn...");
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    console.log("✅ Login successful", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Authentication error:", {
      code: error.code,
      message: error.message,
      email: email
    });
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      case 'auth/invalid-email':
        throw new Error('Invalid email format');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your internet connection');
      case AuthErrorCodes.USER_DELETED:
        throw new Error('User not found');
      case AuthErrorCodes.INVALID_PASSWORD:
        throw new Error('Invalid password');
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        throw new Error('Too many attempts. Please try again later');
      default:
        throw new Error(`Authentication failed: ${error.message}`);
    }
  }
};

// Sign out user
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.message);
  }
};
