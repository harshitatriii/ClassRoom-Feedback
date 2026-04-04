import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, getProfile, microsoftLogin } from '../api/auth';
import { msalInstance, msalReady, loginRequest } from '../msalConfig';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      getProfile()
        .then((res) => { if (!cancelled) setUser(res.data); })
        .catch(() => {
          localStorage.removeItem('token');
          if (!cancelled) setToken(null);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [token]);

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

    // Clear any stuck interaction state
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }

    let msResult;
    try {
      // Try silent token acquisition first (if user previously logged in)
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msResult = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
      }
    } catch {
      // Silent failed, will use popup below
    }

    if (!msResult) {
      msResult = await msalInstance.loginPopup(loginRequest);
    }

    const res = await microsoftLogin(msResult.accessToken);
    const { token: newToken, user: userData, requires_profile } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return { user: userData, requires_profile };
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* token may already be invalid */ }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithMicrosoft, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
