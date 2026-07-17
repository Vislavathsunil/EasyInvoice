import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { InvoiceData, SavedInvoice, CompanyDetails } from '../types/invoice';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { generateInvoiceNumber } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

interface InvoiceContextType {
  methods: UseFormReturn<InvoiceData>;
  history: SavedInvoice[];
  saveInvoice: () => Promise<void>;
  loadInvoice: (invoice: SavedInvoice) => void;
  createNewInvoice: () => void;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: 'paid' | 'pending' | 'overdue') => Promise<void>;
  currentInvoiceId: string | null;
  companyProfile: CompanyDetails | null;
  updateCompanyProfile: (profile: CompanyDetails) => Promise<void>;
  userSettings: any | null;
  updateUserSettings: (settings: any) => Promise<void>;
  getNextInvoiceNumber: () => string;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const methods = useInvoiceForm();
  const [history, setHistory] = useState<SavedInvoice[]>([]);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyDetails | null>(null);
  const [userSettings, setUserSettings] = useState<any | null>(null);

  // Auto-generate next invoice number based on history
  const getNextInvoiceNumber = useCallback((): string => {
    if (history.length === 0) return generateInvoiceNumber();
    
    // Find highest number from existing invoices
    const numbers = history
      .map(inv => {
        const match = inv.invoiceNumber?.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    if (numbers.length === 0) return generateInvoiceNumber();
    const nextNum = Math.max(...numbers) + 1;
    return `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
  }, [history]);

  // Load from local storage or Firestore on mount/auth change
  useEffect(() => {
    if (!user) {
      // Offline fallback: load from local storage
      const saved = localStorage.getItem('invoice_history');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse local history', e);
        }
      } else {
        setHistory([]);
      }
      
      const savedProfile = localStorage.getItem('mock_profile_anonymous');
      if (savedProfile) {
        try {
          setCompanyProfile(JSON.parse(savedProfile));
        } catch (e) { }
      } else {
        setCompanyProfile(null);
      }
      setUserSettings(null);
      return;
    }

    if (!isFirebaseConfigured) {
      // Local Mock DB Fallback
      const mockInvoicesKey = `mock_db_invoices_${user.uid}`;
      const mockProfileKey = `mock_profile_${user.uid}`;
      const mockSettingsKey = `mock_settings_${user.uid}`;

      // Invoices
      const savedInvoices = localStorage.getItem(mockInvoicesKey);
      let loadedInvoices: SavedInvoice[] = [];
      if (savedInvoices) {
        try {
          loadedInvoices = JSON.parse(savedInvoices);
        } catch (e) { }
      } else {
        const initialInvoiceId = crypto.randomUUID();
        loadedInvoices = [{
          id: initialInvoiceId,
          invoiceNumber: generateInvoiceNumber(),
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currency: 'USD',
          company: {
            name: 'Acme Corp',
            address: '123 Business Rd\nCityville, ST 12345',
            email: user.email || '',
          },
          client: {
            name: 'Globex Corporation',
            address: '456 Client Ave\nTownsburg, ST 67890',
            email: 'accounts@globex.com',
          },
          items: [
            { id: '1', name: 'Web Design Project (Demo)', quantity: 1, price: 1500 },
            { id: '2', name: 'Consulting Hours', quantity: 10, price: 75 },
          ],
          taxRate: 10,
          status: 'pending',
          template: 'modern',
          notes: 'Thank you for choosing EasyInvoice. Edit this template to start branding your invoices!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
        localStorage.setItem(mockInvoicesKey, JSON.stringify(loadedInvoices));
      }
      setHistory(loadedInvoices);

      // Company details
      const savedProfile = localStorage.getItem(mockProfileKey);
      let profileData = { name: 'Acme Corp', address: '123 Business Rd\nCityville, ST 12345', email: user.email || '', phone: '', taxId: '', logoUrl: '' };
      if (savedProfile) {
        try { profileData = JSON.parse(savedProfile); } catch (e) { }
      } else {
        localStorage.setItem(mockProfileKey, JSON.stringify(profileData));
      }
      setCompanyProfile(profileData);

      const currentVals = methods.getValues();
      if (!currentVals.company.name || currentVals.company.name === 'Acme Corp') {
        methods.setValue('company', profileData);
      }

      // Settings preferences
      const savedSettings = localStorage.getItem(mockSettingsKey);
      let settingsData = { currency: 'USD', taxRate: 10, notes: 'Thank you for your business!' };
      if (savedSettings) {
        try { settingsData = JSON.parse(savedSettings); } catch (e) { }
      } else {
        localStorage.setItem(mockSettingsKey, JSON.stringify(settingsData));
      }
      setUserSettings(settingsData);

      if (currentVals.taxRate === 10 && settingsData.taxRate !== undefined) {
        methods.setValue('taxRate', settingsData.taxRate);
      }
      if (currentVals.currency === 'USD' && settingsData.currency) {
        methods.setValue('currency', settingsData.currency as any);
      }
      if (currentVals.notes === 'Thank you for your business!' && settingsData.notes) {
        methods.setValue('notes', settingsData.notes);
      }

      // Handle migration of anonymous data if exists
      const localData = localStorage.getItem('invoice_history');
      if (localData) {
        try {
          const localInvoices: SavedInvoice[] = JSON.parse(localData);
          if (localInvoices.length > 0) {
            const merged = [...localInvoices, ...loadedInvoices.filter(li => !localInvoices.some(i => i.id === li.id))];
            localStorage.setItem(mockInvoicesKey, JSON.stringify(merged));
            setHistory(merged);
            localStorage.removeItem('invoice_history');
          }
        } catch (e) { }
      }

      return;
    }

    // 1. Listen to Firestore Invoices
    const invoicesRef = collection(db, 'users', user.uid, 'invoices');
    const unsubscribeInvoices = onSnapshot(invoicesRef, (snapshot) => {
      const docs: SavedInvoice[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as SavedInvoice);
      });
      docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setHistory(docs);
    }, (error) => {
      console.error('Error fetching invoices from Firestore:', error);
    });

    // 2. Listen to Company Profile
    const profileRef = doc(db, 'users', user.uid, 'company', 'profile');
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyDetails;
        setCompanyProfile(data);

        const currentVals = methods.getValues();
        if (!currentVals.company.name || currentVals.company.name === 'Acme Corp') {
          methods.setValue('company', {
            name: data.name || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            taxId: data.taxId || '',
            logoUrl: data.logoUrl || '',
          });
        }
      }
    });

    // 3. Listen to User Settings
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserSettings(data);

        const currentVals = methods.getValues();
        if (currentVals.taxRate === 10 && data.taxRate !== undefined) {
          methods.setValue('taxRate', data.taxRate);
        }
        if (currentVals.currency === 'USD' && data.currency) {
          methods.setValue('currency', data.currency);
        }
        if (currentVals.notes === 'Thank you for your business!' && data.notes) {
          methods.setValue('notes', data.notes);
        }
      }
    });

    // 4. Migrate local history to Firestore
    const localData = localStorage.getItem('invoice_history');
    if (localData) {
      try {
        const localInvoices: SavedInvoice[] = JSON.parse(localData);
        if (localInvoices.length > 0) {
          localInvoices.forEach(async (inv) => {
            await setDoc(doc(db, 'users', user.uid, 'invoices', inv.id), inv);
          });
          localStorage.removeItem('invoice_history');
        }
      } catch (e) {
        console.error('Failed to parse and migrate local history', e);
      }
    }

    return () => {
      unsubscribeInvoices();
      unsubscribeProfile();
      unsubscribeSettings();
    };
  }, [user, methods]);

  const saveInvoice = async () => {
    const data = methods.getValues();
    const id = currentInvoiceId || crypto.randomUUID();
    const now = new Date().toISOString();

    const existing = history.find(i => i.id === id);
    const savedInvoice: SavedInvoice = {
      ...data,
      id,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (user) {
      if (!isFirebaseConfigured) {
        const mockInvoicesKey = `mock_db_invoices_${user.uid}`;
        const currentInvoices = JSON.parse(localStorage.getItem(mockInvoicesKey) || '[]');
        const updatedInvoices = [savedInvoice, ...currentInvoices.filter((i: any) => i.id !== id)];
        localStorage.setItem(mockInvoicesKey, JSON.stringify(updatedInvoices));
        setHistory(updatedInvoices);
        setCurrentInvoiceId(id);
        showToast('Invoice saved successfully!', 'success');
        return;
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'invoices', id), savedInvoice);
        setCurrentInvoiceId(id);
        showToast('Invoice saved to cloud!', 'success');
      } catch (err) {
        console.error('Firestore save failed:', err);
        showToast('Failed to save invoice to cloud.', 'error');
      }
    } else {
      // Offline LocalStorage fallback
      const updatedHistory = [savedInvoice, ...history.filter(i => i.id !== id)];
      setHistory(updatedHistory);
      localStorage.setItem('invoice_history', JSON.stringify(updatedHistory));
      setCurrentInvoiceId(id);
      showToast('Invoice saved locally!', 'success');
    }
  };

  const loadInvoice = (invoice: SavedInvoice) => {
    const { id, createdAt, updatedAt, ...invoiceData } = invoice;
    methods.reset(invoiceData);
    setCurrentInvoiceId(id);
  };

  const createNewInvoice = () => {
    methods.reset({
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: userSettings?.currency || 'USD',
      status: 'pending',
      template: 'modern',
      company: {
        name: companyProfile?.name || '',
        address: companyProfile?.address || '',
        email: companyProfile?.email || '',
        phone: companyProfile?.phone || '',
        taxId: companyProfile?.taxId || '',
        logoUrl: companyProfile?.logoUrl || '',
      },
      client: {
        name: '',
        address: '',
        email: '',
        phone: '',
      },
      items: [],
      taxRate: userSettings?.taxRate ?? 0,
      notes: userSettings?.notes || '',
    });
    setCurrentInvoiceId(null);
  };

  const deleteInvoice = async (id: string) => {
    if (user) {
      if (!isFirebaseConfigured) {
        const mockInvoicesKey = `mock_db_invoices_${user.uid}`;
        const currentInvoices = JSON.parse(localStorage.getItem(mockInvoicesKey) || '[]');
        const updatedInvoices = currentInvoices.filter((i: any) => i.id !== id);
        localStorage.setItem(mockInvoicesKey, JSON.stringify(updatedInvoices));
        setHistory(updatedInvoices);
        if (currentInvoiceId === id) {
          createNewInvoice();
        }
        showToast('Invoice deleted.', 'success');
        return;
      }

      try {
        await deleteDoc(doc(db, 'users', user.uid, 'invoices', id));
        showToast('Invoice deleted.', 'success');
      } catch (err) {
        console.error('Firestore delete failed:', err);
        showToast('Failed to delete invoice.', 'error');
        return;
      }
    } else {
      const updatedHistory = history.filter(i => i.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('invoice_history', JSON.stringify(updatedHistory));
      showToast('Invoice deleted.', 'success');
    }

    if (currentInvoiceId === id) {
      createNewInvoice();
    }
  };

  const updateInvoiceStatus = async (id: string, status: 'paid' | 'pending' | 'overdue') => {
    const now = new Date().toISOString();
    
    if (user) {
      if (!isFirebaseConfigured) {
        const mockInvoicesKey = `mock_db_invoices_${user.uid}`;
        const currentInvoices: SavedInvoice[] = JSON.parse(localStorage.getItem(mockInvoicesKey) || '[]');
        const updated = currentInvoices.map(inv => inv.id === id ? { ...inv, status, updatedAt: now } : inv);
        localStorage.setItem(mockInvoicesKey, JSON.stringify(updated));
        setHistory(updated);
        showToast(`Invoice marked as ${status}.`, 'success');
        return;
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'invoices', id), { status, updatedAt: now }, { merge: true });
        showToast(`Invoice marked as ${status}.`, 'success');
      } catch (err) {
        console.error('Status update failed:', err);
        showToast('Failed to update status.', 'error');
      }
    } else {
      const updated = history.map(inv => inv.id === id ? { ...inv, status, updatedAt: now } : inv);
      setHistory(updated);
      localStorage.setItem('invoice_history', JSON.stringify(updated));
      showToast(`Invoice marked as ${status}.`, 'success');
    }

    // If editing the current invoice, update the form
    if (currentInvoiceId === id) {
      methods.setValue('status', status);
    }
  };

  const updateCompanyProfile = async (profile: CompanyDetails) => {
    const profileKey = user ? `mock_profile_${user.uid}` : `mock_profile_anonymous`;
    if (!user || !isFirebaseConfigured) {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setCompanyProfile(profile);
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'company', 'profile'), profile);
      setCompanyProfile(profile);
    } catch (err) {
      console.error('Error updating company profile:', err);
      throw err;
    }
  };

  const updateUserSettings = async (settings: any) => {
    if (!user) return;
    if (!isFirebaseConfigured) {
      localStorage.setItem(`mock_settings_${user.uid}`, JSON.stringify(settings));
      setUserSettings(settings);
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), settings);
      setUserSettings(settings);
    } catch (err) {
      console.error('Error updating user settings:', err);
      throw err;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        methods,
        history,
        saveInvoice,
        loadInvoice,
        createNewInvoice,
        deleteInvoice,
        updateInvoiceStatus,
        currentInvoiceId,
        companyProfile,
        updateCompanyProfile,
        userSettings,
        updateUserSettings,
        getNextInvoiceNumber,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};
