import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, getProfile, microsoftLogin } from '../api/auth';
import { msalInstance, msalReady, loginRequest } from '../msalConfig';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [msRedirectPath, setMsRedirectPath] = useState(null);

  // Handle Microsoft redirect response on page load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      await msalReady;

      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response && response.accessToken && !cancelled) {
          const res = await microsoftLogin(response.accessToken);
          const { token: newToken, user: userData, requires_profile } = res.data;
          localStorage.setItem('token', newToken);
          if (!cancelled) {
            setToken(newToken);
            setUser(userData);
            setLoading(false);
            if (requires_profile) {
              toast.success('Account created! Please complete your profile.');
              setMsRedirectPath('/profile');
            } else {
              toast.success('Welcome back!');
              setMsRedirectPath('/');
            }
          }
          return;
        }
      } catch (err) {
        console.error('Microsoft redirect error:', err);
        const msg = err.response?.data?.detail || err.message || 'Microsoft sign-in failed';
        toast.error(msg);
      }

      // Normal token-based session restore
      if (!cancelled) {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          try {
            const res = await getProfile();
            if (!cancelled) setUser(res.data);
          } catch {
            localStorage.removeItem('token');
            if (!cancelled) setToken(null);
          }
        }
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    await msalReady;
    await msalInstance.loginRedirect(loginRequest);
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* token may already be invalid */ }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithMicrosoft, logout, setUser, msRedirectPath, setMsRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}
