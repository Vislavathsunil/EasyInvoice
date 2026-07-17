import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Save, User, LogOut, Settings, Building, Check, X, Mail, Phone, Hash, Menu } from 'lucide-react';

import { useInvoiceContext } from '../../context/InvoiceContext';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { HistoryPanel } from '../history/HistoryPanel';
import { Button } from '../ui/Button';

export const NavbarActions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isGeneratorPage = location.pathname === '/generator';
  const { 
    createNewInvoice, 
    saveInvoice, 
    companyProfile, 
    updateCompanyProfile,
    userSettings,
    updateUserSettings 
  } = useInvoiceContext();
  const { user, logOut } = useAuth();
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Modal display states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form states for modals
  const [profileName, setProfileName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');

  const [settingsCurrency, setSettingsCurrency] = useState('USD');
  const [settingsTaxRate, setSettingsTaxRate] = useState(0);
  const [settingsNotes, setSettingsNotes] = useState('');

  const [modalLoading, setModalLoading] = useState(false);

  const handleSave = async () => {
    await saveInvoice();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            setShowNewConfirm(true);
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'h':
            e.preventDefault();
            setIsHistoryOpen(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync form states with context data when modals open
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setProfileName(user.displayName || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, showProfileModal]);

  useEffect(() => {
    if (companyProfile) {
      const timer = setTimeout(() => {
        setCompanyName(companyProfile.name || '');
        setCompanyAddress(companyProfile.address || '');
        setCompanyEmail(companyProfile.email || '');
        setCompanyPhone(companyProfile.phone || '');
        setCompanyTaxId(companyProfile.taxId || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [companyProfile, showCompanyModal]);

  useEffect(() => {
    if (userSettings) {
      const timer = setTimeout(() => {
        setSettingsCurrency(userSettings.currency || 'USD');
        setSettingsTaxRate(userSettings.taxRate || 0);
        setSettingsNotes(userSettings.notes || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userSettings, showSettingsModal]);


  const handleNewConfirm = () => {
    createNewInvoice();
    setShowNewConfirm(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;
    setModalLoading(true);
    try {
      // 1. Update Firebase Auth displayName
      await updateProfile(auth.currentUser, { displayName: profileName });
      // 2. Update Firestore user details
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { fullName: profileName });
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await updateCompanyProfile({
        name: companyName,
        address: companyAddress,
        email: companyEmail,
        phone: companyPhone,
        taxId: companyTaxId,
        logoUrl: companyProfile?.logoUrl || '',
      });
      setShowCompanyModal(false);
      alert('Company details updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update company details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await updateUserSettings({
        currency: settingsCurrency,
        taxRate: Number(settingsTaxRate),
        notes: settingsNotes,
      });
      setShowSettingsModal(false);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    } finally {
      setModalLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return user.displayName[0].toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : 'U';
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-2">
        {isGeneratorPage && (
          <>
            <button
              onClick={() => setShowNewConfirm(true)}
              className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 text-sm font-medium rounded-xl hover:bg-muted transition-colors cursor-pointer"
              aria-label="New Invoice"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">New</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 text-sm font-medium rounded-xl hover:bg-muted transition-colors cursor-pointer"
              aria-label="History"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm transition-all relative overflow-hidden animate-in fade-in cursor-pointer"
              aria-label="Save Invoice"
            >
              {showSaveSuccess ? <Check className="w-4 h-4 shrink-0 animate-in zoom-in" /> : <Save className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{showSaveSuccess ? 'Saved!' : 'Save'}</span>
            </button>
          </>
        )}

        {/* Profile Dropdown */}
        {user && (
          <div className="relative ml-2">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-accent-foreground hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none overflow-hidden cursor-pointer"
              aria-label="Profile"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{getUserInitials()}</span>
              )}
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate text-foreground">{user.displayName || 'Invoice User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors font-medium cursor-pointer"
                    >
                      <span className="text-muted-foreground w-4 h-4 flex items-center justify-center text-xs">📊</span>
                      Billing Dashboard
                    </button>
                    <button 
                      onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => { setShowCompanyModal(true); setIsProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                    >
                      <Building className="w-4 h-4 text-muted-foreground" />
                      Company Information
                    </button>
                    <button 
                      onClick={() => { setShowSettingsModal(true); setIsProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                    </button>
                  </div>
                  <div className="p-1 border-t border-border">
                    <button 
                      onClick={() => { logOut(); setIsProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Hamburger Layout */}
      <div className="md:hidden relative flex items-center gap-2">
        {user && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer text-foreground"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {isMobileMenuOpen && user && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <div className="absolute right-[-40px] sm:right-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Navigation</p>
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    onClick={() => { navigate('/generator'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-left font-semibold cursor-pointer ${location.pathname === '/generator' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'}`}
                  >
                    📝 Invoice Editor
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-left font-semibold cursor-pointer ${location.pathname === '/dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'}`}
                  >
                    📊 Billing Dashboard
                  </button>
                </div>
              </div>

              {isGeneratorPage && (
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Editor Actions</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <button
                      onClick={() => { setShowNewConfirm(true); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      New Invoice
                    </button>
                    <button
                      onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Invoice History
                    </button>
                    <button
                      onClick={() => { handleSave(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-muted-foreground" />
                      Save Invoice
                    </button>
                  </div>
                </div>
              )}

              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account</p>
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    onClick={() => { setShowProfileModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { setShowCompanyModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                  >
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Company Info
                  </button>
                  <button
                    onClick={() => { setShowSettingsModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left font-medium text-foreground cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Preferences
                  </button>
                  <button
                    onClick={() => { logOut(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10 text-left font-semibold mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* History Panel */}
      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      {/* New Invoice Confirmation Modal */}
      {showNewConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewConfirm(false)} />
          <div className="relative bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2">Create New Invoice?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will clear your current form. Make sure you have saved your work.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowNewConfirm(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleNewConfirm}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Yes, Create New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold">My Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-muted text-muted-foreground rounded-lg text-sm select-none"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Account email addresses cannot be modified directly.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Information Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompanyModal(false)} />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold">Company Information</h3>
              <button onClick={() => setShowCompanyModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCompanyUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Billing Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="billing@acme.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Tax ID / VAT Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="TX-99887766"
                    value={companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  placeholder="123 Business Rd&#10;Cityville, ST 12345"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Company Details'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings / Preferences Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)} />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold">Preferences</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSettingsUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Default Currency</label>
                  <select
                    value={settingsCurrency}
                    onChange={(e) => setSettingsCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={settingsTaxRate}
                    onChange={(e) => setSettingsTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Default Invoice Notes</label>
                <textarea
                  placeholder="Thank you for your business!"
                  value={settingsNotes}
                  onChange={(e) => setSettingsNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
