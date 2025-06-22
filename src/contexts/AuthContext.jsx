import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirebaseError, validateUserPermissions, retryOperation } from '../utils/errorHandler';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Create user profile in Firestore
  const createUserProfile = async (userData) => {
    const userRef = doc(db, 'users', userData.uid);
    
    // Sanitize user data - only include safe fields
    const sanitizedData = {
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      userType: 'user', // Default role
      emailVerified: userData.emailVerified || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    try {
      await setDoc(userRef, sanitizedData);
      return sanitizedData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  };

  // Register new user
  const register = async (email, password) => {
    try {
      const userCredential = await retryOperation(async () => {
        return await createUserWithEmailAndPassword(auth, email, password);
      });
      return userCredential.user;
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'UserRegistration', { email });
      throw new Error(errorDetails.message);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await retryOperation(async () => {
        return await signInWithEmailAndPassword(auth, email, password);
      });
      return userCredential.user;
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'UserLogin', { email });
      throw new Error(errorDetails.message);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'UserLogout');
      throw new Error(errorDetails.message);
    }
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await retryOperation(async () => {
        return await getDoc(userRef);
      });
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'GetUserProfile', { uid });
      throw new Error(errorDetails.message);
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (uid, data) => {
    try {
      // Validate user permissions
      validateUserPermissions({ uid }, 'update-profile');
      
      // Sanitize data
      const sanitizedData = {
        displayName: data.displayName?.substring(0, 100) || '',
        photoURL: data.photoURL || '',
        // Only allow specific fields to be updated
        ...(data.preferences && { preferences: data.preferences }),
        updatedAt: serverTimestamp(),
      };
      
      const userRef = doc(db, 'users', uid);
      await retryOperation(async () => {
        return await setDoc(userRef, sanitizedData, { merge: true });
      });
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'UpdateUserProfile', { uid });
      throw new Error(errorDetails.message);
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email) => {
    try {
      await retryOperation(async () => {
        return await firebaseSendPasswordResetEmail(auth, email);
      });
    } catch (error) {
      const errorDetails = handleFirebaseError(error, 'PasswordReset', { email });
      throw new Error(errorDetails.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userProfile = await getUserProfile(user.uid);
        setUser({
          ...user,
          ...userProfile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 