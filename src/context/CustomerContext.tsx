import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Customer } from '../types/customer';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const MOCK_KEY_PREFIX = 'mock_customers_';
const LOCAL_KEY = 'customers_anonymous';

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) {
        try { setCustomers(JSON.parse(saved)); } catch (e) {}
      } else {
        setCustomers([]);
      }
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      const key = `${MOCK_KEY_PREFIX}${user.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try { setCustomers(JSON.parse(saved)); } catch (e) {}
      } else {
        setCustomers([]);
      }
      setIsLoading(false);
      return;
    }

    const ref = collection(db, 'users', user.uid, 'customers');
    const unsub = onSnapshot(ref, (snap) => {
      const docs: Customer[] = [];
      snap.forEach(d => docs.push(d.data() as Customer));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomers(docs);
      setIsLoading(false);
    }, (err) => {
      console.error('CustomerContext: Firestore error', err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const persist = (updated: Customer[]) => {
    if (!user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    } else if (!isFirebaseConfigured) {
      localStorage.setItem(`${MOCK_KEY_PREFIX}${user.uid}`, JSON.stringify(updated));
    }
  };

  const addCustomer = async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const now = new Date().toISOString();
    const customer: Customer = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    if (user && isFirebaseConfigured) {
      await setDoc(doc(db, 'users', user.uid, 'customers', customer.id), customer);
    } else {
      const updated = [customer, ...customers];
      setCustomers(updated);
      persist(updated);
    }
    return customer;
  };

  const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    if (user && isFirebaseConfigured) {
      await setDoc(doc(db, 'users', user.uid, 'customers', id), { ...data, updatedAt: now }, { merge: true });
    } else {
      const updated = customers.map(c => c.id === id ? { ...c, ...data, updatedAt: now } : c);
      setCustomers(updated);
      persist(updated);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (user && isFirebaseConfigured) {
      await deleteDoc(doc(db, 'users', user.uid, 'customers', id));
    } else {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      persist(updated);
    }
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, isLoading }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider');
  return ctx;
};
