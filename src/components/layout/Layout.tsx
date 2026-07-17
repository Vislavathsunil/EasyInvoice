import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Sun, Moon } from 'lucide-react';
import { NavbarActions } from './NavbarActions';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

export const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border bg-card print:hidden shadow-sm shadow-black/[0.01]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary transition-opacity hover:opacity-90">
              <FileText className="w-6 h-6 text-primary" />
              <span className="tracking-tight hidden min-[400px]:inline">EasyInvoice</span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
                <Link
                  to="/generator"
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${location.pathname === '/generator' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                >
                  Editor
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${location.pathname === '/dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {(user || location.pathname === '/generator') && (
              <NavbarActions />
            )}
            {!user && !isAuthPage && (
              <Link to="/login">
                <Button size="sm" className="rounded-xl shadow-sm text-sm font-semibold">
                  Sign In
                </Button>
              </Link>
            )}
            <div className="w-px h-6 bg-border mx-0.5 sm:mx-1"></div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 mt-auto bg-card print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 text-center text-muted-foreground text-sm font-medium w-full">
          &copy; {new Date().getFullYear()} EasyInvoice. A professional business tool.
        </div>
      </footer>
    </div>
  );
};
