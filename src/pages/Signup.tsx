import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { FileText, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';
import { validateEmail, validatePassword } from '../utils/validators';

export const Signup: React.FC = () => {
  const { signUp, logInWithGoogle, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Field validation triggers
  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('error');

  const from = (location.state as any)?.from?.pathname || '/generator';

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    
    setIsLoading(true);
    clearError();
    setNameInvalid(false);
    setEmailInvalid(false);
    setPasswordInvalid(false);

    // Strict validation checks before calling Auth
    if (fullName.trim().length < 2) {
      setNameInvalid(true);
      triggerToast('Name must be at least 2 characters long.', 'error');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailInvalid(true);
      triggerToast('Please enter a valid email address.', 'error');
      setIsLoading(false);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setPasswordInvalid(true);
      triggerToast(passwordCheck.error || 'Invalid password.', 'error');
      setIsLoading(false);
      return;
    }
    
    try {
      await signUp(email, password, fullName);
      triggerToast('Account created successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email')) {
        setEmailInvalid(true);
      }
      triggerToast(msg || 'Failed to create account.', 'error');
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
        triggerToast('No account found for this Google account. Please log in first to sign up.', 'warning');
        navigate('/login');
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Google Authentication failed.', 'error');
    } finally {
      setIsGoogleLoading(false);
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
          <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground">Start creating and managing invoices in the cloud</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Full Name</label>
            <div className="relative">
              <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", nameInvalid ? "text-destructive" : "text-muted-foreground")} />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setNameInvalid(false); }}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 transition-all",
                  nameInvalid 
                    ? "border-destructive focus:ring-destructive/30" 
                    : "border-input focus:ring-ring"
                )}
              />
            </div>
          </div>

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
            <label className="text-sm font-medium leading-none">Password</label>
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

          <Button type="submit" className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
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

        {/* Login Routing link */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
