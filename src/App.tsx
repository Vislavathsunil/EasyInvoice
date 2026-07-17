import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Generator } from './pages/Generator';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CustomerProvider>
            <InvoiceProvider>
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route 
                    path="generator" 
                    element={
                      <ProtectedRoute>
                        <Generator />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </InvoiceProvider>
          </CustomerProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
