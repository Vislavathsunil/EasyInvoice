import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  linkWithCredential,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import type { User, AuthCredential } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { generateInvoiceNumber } from '../utils/formatters';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logInWithGoogle: () => Promise<{
    success: boolean;
    isNewGoogleUser?: boolean;
    linkRequired?: boolean;
    email?: string;
    credential?: AuthCredential
  }>;
  linkAccountAfterError: (password: string, credential: AuthCredential) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
  pendingGoogleUser: User | null;
  confirmGoogleRegistration: () => Promise<void>;
  cancelGoogleRegistration: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flag to track active email/password registration to bypass authn change listener check
let isRegistering = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const savedUser = sessionStorage.getItem('mock_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse mock user', e);
        }
      }
      setLoading(false);
      return;
    }

    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Error setting auth persistence:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isRegistering) {
        // Sign-up handles setting the state manually after Firestore profile creation
        return;
      }

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(currentUser);
          } else {
            const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
            if (isGoogle) {
              setPendingGoogleUser(currentUser);
              setUser(null);
            } else {
              // Self-healing: If user is authenticated but has no profile, initialize it!
              console.log("Profile missing on auth state change, initializing profile for uid:", currentUser.uid);
              await initializeUserProfile(currentUser, currentUser.displayName || undefined, 'password');
              setUser(currentUser);
            }
          }
        } catch (err) {
          console.error('Error checking profile on auth state change:', err);
          setUser(currentUser); // fallback
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  // Initialize Firestore for new users (if not exists)
  const initializeUserProfile = async (currentUser: User, fullName?: string, authProvider: string = 'password') => {
    if (!isFirebaseConfigured) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        fullName: fullName || currentUser.displayName || 'Invoice User',
        email: currentUser.email,
        photoURL: currentUser.photoURL || '',
        authProvider,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      await setDoc(doc(db, 'users', currentUser.uid, 'company', 'profile'), {
        name: 'Acme Corp',
        address: '123 Business Rd\nCityville, ST 12345',
        email: currentUser.email || '',
        phone: '',
        taxId: ''
      });

      await setDoc(doc(db, 'users', currentUser.uid, 'settings', 'preferences'), {
        currency: 'USD',
        taxRate: 10,
        notes: 'Thank you for your business!'
      });

      const initialInvoiceId = crypto.randomUUID();
      await setDoc(doc(db, 'users', currentUser.uid, 'invoices', initialInvoiceId), {
        id: initialInvoiceId,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        company: {
          name: 'Acme Corp',
          address: '123 Business Rd\nCityville, ST 12345',
          email: currentUser.email || '',
        },
        client: {
          name: 'Globex Corporation',
          address: '456 Client Ave\nTownsburg, ST 67890',
          email: 'accounts@globex.com',
        },
        items: [
          { id: '1', name: 'Web Design Project', quantity: 1, price: 1500 },
          { id: '2', name: 'Consulting Hours', quantity: 10, price: 75 },
        ],
        taxRate: 10,
        notes: 'Thank you for choosing EasyInvoice. Edit this template to start branding your invoices!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', currentUser.uid, 'customers', crypto.randomUUID()), {
        name: 'Globex Corporation',
        email: 'accounts@globex.com',
        address: '456 Client Ave\nTownsburg, ST 67890',
        phone: '',
        createdAt: new Date().toISOString()
      });
    } else {
      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  };

  const checkEmailExists = async (emailAddress: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      // In Mock mode, check if a profile already exists for this email
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('mock_profile_')) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || '{}');
            if (profile.email === emailAddress) return true;
          } catch (e) { }
        }
      }
      return emailAddress === 'google.user@example.com' || emailAddress === 'existing@example.com';
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, emailAddress);
      return methods.length > 0;
    } catch (err) {
      console.warn("fetchSignInMethodsForEmail failed or blocked:", err);
      // Fallback: continue and let signInWithEmailAndPassword handle validation
      return true;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    isRegistering = true;
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUserObj = {
          uid: 'mock-' + Math.random().toString(36).substring(2, 11),
          email,
          displayName: fullName,
          photoURL: null,
          emailVerified: true
        } as any;

        localStorage.setItem(`mock_profile_${mockUserObj.uid}`, JSON.stringify({
          name: 'Acme Corp',
          address: '123 Business Rd\nCityville, ST 12345',
          email: email,
          phone: '',
          taxId: ''
        }));
        localStorage.setItem(`mock_settings_${mockUserObj.uid}`, JSON.stringify({
          currency: 'USD',
          taxRate: 10,
          notes: 'Thank you for your business!'
        }));
        localStorage.setItem(`mock_password_${email.toLowerCase()}`, password);
        sessionStorage.setItem('mock_user', JSON.stringify(mockUserObj));

        setUser(mockUserObj);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await initializeUserProfile(userCredential.user, fullName, 'password');
      setUser(userCredential.user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
      throw err;
    } finally {
      isRegistering = false;
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        // 1. Strict validation: check if email exists in Auth
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
          const err = new Error("Account does not exist. Please create an account to continue.");
          (err as any).code = 'auth/user-not-found';
          throw err;
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock password check
        const storedPassword = localStorage.getItem(`mock_password_${email.toLowerCase()}`);
        if (email.toLowerCase() === 'existing@example.com') {
          if (password !== 'password') {
            const err = new Error("Incorrect password. Please try again.");
            (err as any).code = 'auth/wrong-password';
            throw err;
          }
        } else if (storedPassword && password !== storedPassword) {
          const err = new Error("Incorrect password. Please try again.");
          (err as any).code = 'auth/wrong-password';
          throw err;
        }

        // Mock authentication
        const mockUserObj = {
          uid: 'mock-user-123',
          email,
          displayName: email.split('@')[0].toUpperCase(),
          photoURL: null,
          emailVerified: true
        } as any;

        sessionStorage.setItem('mock_user', JSON.stringify(mockUserObj));
        setUser(mockUserObj);
        return;
      }

      // 2. Real Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 3. Strict validation: check if Firestore profile doc exists (with self-healing fallback)
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log("Profile missing on login, initializing profile for uid:", userCredential.user.uid);
        await initializeUserProfile(userCredential.user, userCredential.user.displayName || undefined, 'password');
      }

      setUser(userCredential.user);
    } catch (err: any) {
      let friendlyMessage = err.message;
      if (err.code === 'auth/user-not-found') {
        friendlyMessage = "Account does not exist. Please create an account to continue.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Incorrect password. Please try again.";
      } else if (err.code === 'auth/user-disabled') {
        friendlyMessage = "This account is no longer available.";
      } else if (err.code === 'firestore/profile-missing') {
        friendlyMessage = "User profile could not be found. Please contact support or create a new account.";
      }
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const logInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUserObj = {
          uid: 'mock-google-789',
          email: 'google.user@example.com',
          displayName: 'Google User',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          emailVerified: true
        } as any;

        const profileExists = localStorage.getItem('mock_profile_mock-google-789');
        if (profileExists) {
          sessionStorage.setItem('mock_user', JSON.stringify(mockUserObj));
          setUser(mockUserObj);
          return { success: true };
        } else {
          setPendingGoogleUser(mockUserObj);
          setUser(null);
          return { success: false, isNewGoogleUser: true };
        }
      }

      const result = await signInWithPopup(auth, googleProvider);

      // Strict check: if Firestore user profile doc doesn't exist, hold login state
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser(result.user);
        return { success: true };
      } else {
        setPendingGoogleUser(result.user);
        setUser(null);
        return { success: false, isNewGoogleUser: true };
      }
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        const email = err.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(err);
        return {
          success: false,
          linkRequired: true,
          email,
          credential: credential || undefined
        };
      }
      setError(err.message || 'Google Authentication failed.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const confirmGoogleRegistration = async () => {
    if (!pendingGoogleUser) return;
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 600));
        localStorage.setItem(`mock_profile_${pendingGoogleUser.uid}`, JSON.stringify({
          name: 'Acme Corp',
          address: '123 Business Rd\nCityville, ST 12345',
          email: pendingGoogleUser.email,
          phone: '',
          taxId: ''
        }));
        localStorage.setItem(`mock_settings_${pendingGoogleUser.uid}`, JSON.stringify({
          currency: 'USD',
          taxRate: 10,
          notes: 'Thank you for your business!'
        }));
        sessionStorage.setItem('mock_user', JSON.stringify(pendingGoogleUser));
        setUser(pendingGoogleUser);
        setPendingGoogleUser(null);
        return;
      }

      await initializeUserProfile(pendingGoogleUser, undefined, 'google');
      setUser(pendingGoogleUser);
      setPendingGoogleUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google profile.');
    } finally {
      setLoading(false);
    }
  };

  const cancelGoogleRegistration = async () => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 400));
      } else {
        await signOut(auth);
      }
      setPendingGoogleUser(null);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  const linkAccountAfterError = async (password: string, credential: AuthCredential) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return;
      }
      if (!credential) throw new Error("No pending credential found.");
      const email = (credential as any).email || auth.currentUser?.email;
      if (!email) throw new Error("Could not find account email.");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await linkWithCredential(userCredential.user, credential);
      await initializeUserProfile(userCredential.user, undefined, 'google');
    } catch (err: any) {
      setError(err.message || 'Account linking failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
      throw err;
    }
  };

  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 500));
        sessionStorage.removeItem('mock_user');
        setUser(null);
        return;
      }
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        logIn,
        logInWithGoogle,
        linkAccountAfterError,
        resetPassword,
        logOut,
        clearError,
        pendingGoogleUser,
        confirmGoogleRegistration,
        cancelGoogleRegistration
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
