'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, type User, type Auth } from 'firebase/auth';
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, app: null, auth: null, firestore: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);


  useEffect(() => {
    // This check ensures firebase is only initialized on the client side
    if (typeof window !== 'undefined') {
      const appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const authInstance = getAuth(appInstance);
      const firestoreInstance = getFirestore(appInstance);

      setApp(appInstance);
      setAuth(authInstance);
      setFirestore(firestoreInstance);

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, app, auth, firestore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
