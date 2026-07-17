import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { FileText, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus, ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';
import { validateEmail } from '../utils/validators';

export const Login: React.FC = () => {
  const { 
    logIn, 
    logInWithGoogle, 
    linkAccountAfterError, 
    resetPassword, 
    error, 
    clearError,
    pendingGoogleUser,
    confirmGoogleRegistration,
    cancelGoogleRegistration
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Field validation visual triggers
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('error');

  // Non-existent account alert modal
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  
  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Linking state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');
  const [pendingCredential, setPendingCredential] = useState<any>(null);
  const [linkEmail, setLinkEmail] = useState('');

  const from = (location.state as any)?.from?.pathname || '/generator';

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    clearError();
    setEmailInvalid(false);
    setPasswordInvalid(false);

    if (!validateEmail(email)) {
      setEmailInvalid(true);
      triggerToast('Please enter a valid email address.', 'error');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setPasswordInvalid(true);
      triggerToast('Password must be at least 6 characters.', 'error');
      setIsLoading(false);
      return;
    }
    
    try {
      await logIn(email, password);
      triggerToast('Signed in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login catch handler:", err);
      const msg = err.message || '';
      
      if (msg.includes('Account does not exist') || msg.includes('sign up first')) {
        setEmailInvalid(true);
        triggerToast("Account does not exist. Please sign up to continue.", 'error');
        setShowNoAccountModal(true);
      } else if (msg.includes('password') || msg.includes('Incorrect password')) {
        setPasswordInvalid(true);
        triggerToast("Incorrect password. Please try again.", 'error');
      } else if (msg.includes('available')) {
        triggerToast("This account is no longer available.", 'error');
      } else {
        triggerToast(msg || "Failed to sign in. Please try again.", 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    clearError();
    try {
      const result = await logInWithGoogle();
      if (result.success) {
        triggerToast('Signed in successfully!', 'success');
        navigate(from, { replace: true });
      } else if (result.isNewGoogleUser) {
        // Pending registration state handled by prompt modal
        triggerToast('No account found for this Google account.', 'warning');
      } else if (result.linkRequired && result.credential) {
        setPendingCredential(result.credential);
        setLinkEmail(result.email || '');
        setShowLinkModal(true);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Google Authentication failed.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRegisterConfirm = async () => {
    setIsGoogleLoading(true);
    try {
      await confirmGoogleRegistration();
      triggerToast('Account registered successfully via Google!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      triggerToast(err.message || 'Failed to register Google account.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRegisterCancel = async () => {
    await cancelGoogleRegistration();
    triggerToast('Google sign-in cancelled.', 'warning');
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPassword || !pendingCredential) return;

    setIsLoading(true);
    try {
      await linkAccountAfterError(linkPassword, pendingCredential);
      setShowLinkModal(false);
      triggerToast('Google account linked successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Account linking failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotError('');
    setForgotSuccess(false);

    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
      triggerToast('Password reset link sent successfully!', 'success');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send password reset email.');
      triggerToast(err.message || 'Failed to reset password.', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/15 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-in zoom-in duration-300">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your account to save your work</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email Address</label>
            <div className="relative">
              <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", emailInvalid ? "text-destructive" : "text-muted-foreground")} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailInvalid(false); }}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 transition-all",
                  emailInvalid 
                    ? "border-destructive focus:ring-destructive/30" 
                    : "border-input focus:ring-ring"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium leading-none">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", passwordInvalid ? "text-destructive" : "text-muted-foreground")} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordInvalid(false); }}
                className={cn(
                  "w-full pl-10 pr-10 py-2 border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 transition-all",
                  passwordInvalid 
                    ? "border-destructive focus:ring-destructive/30" 
                    : "border-input focus:ring-ring"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground font-semibold">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full h-11 inline-flex items-center justify-center gap-3 px-4 py-2 border border-input bg-card text-foreground rounded-lg font-semibold text-sm hover:bg-accent hover:text-accent-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 relative group"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Signup Routing link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>

      {/* Unregistered Account Modal Alert */}
      {showNoAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Account Not Found</h3>
              <p className="text-sm text-muted-foreground leading-normal">
                Account does not exist. Please create an account to continue.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowNoAccountModal(false);
                  navigate('/signup');
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shadow"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
              <button 
                onClick={() => {
                  setShowNoAccountModal(false);
                  clearError();
                  setEmailInvalid(false);
                  setPasswordInvalid(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 py-2 border border-input bg-card text-foreground font-medium rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Google Account Registration Confirmation Modal */}
      {pendingGoogleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 10.24-4.15 10.24-10.24 0-.69-.08-1.35-.22-1.955H12.24z"/>
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Google Signup</h3>
              <p className="text-sm text-muted-foreground leading-normal">
                No account found for this Google account. Do you want to register a new account?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={handleGoogleRegisterConfirm}
                className="w-full h-10 inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shadow"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? 'Creating profile...' : 'Create New Account'}
              </button>
              <button 
                onClick={handleGoogleRegisterCancel}
                className="w-full h-10 inline-flex items-center justify-center border border-input bg-card text-foreground font-medium rounded-lg hover:bg-accent transition-colors text-sm"
                disabled={isGoogleLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2">Reset Password</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your email address and we'll send you a recovery link.
            </p>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Reset link sent! Please check your inbox.</span>
                </div>
                <Button onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }} className="w-full">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs font-medium hover:bg-muted rounded-lg"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">
                    Send Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Linking Confirmation Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2">Link Google Account</h3>
            <p className="text-xs text-muted-foreground mb-4">
              An account with the email <strong className="text-foreground">{linkEmail}</strong> already exists using an Email & Password login.
              <br/><br/>
              Please enter your password to link your Google account and log in securely.
            </p>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="Enter your existing account password"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLinkModal(false); clearError(); }}
                  className="px-3 py-1.5 text-xs font-medium hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? 'Linking...' : 'Confirm & Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
