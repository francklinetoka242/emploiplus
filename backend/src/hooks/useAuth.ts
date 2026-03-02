import { useState, useEffect } from 'react';
import { authHeaders, buildApiUrl } from '@/lib/headers';

// Backend-only auth hook: uses /api/register, /api/login and /api/users/me
export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to boot from localStorage for instant UI
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Always restore user from localStorage if available (for instant UI)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    // If no token, mark as not loading (user is guest)
    if (!token) {
      setLoading(false);
      return;
    }

    // If token exists, validate it and refresh user profile
    fetch(buildApiUrl("/users/me"), { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) {
          // If unauthorized, token likely invalid — clear auth. For other errors, keep stored user.
          if (r.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            console.warn('Profile fetch returned non-OK status:', r.status);
            // keep previously stored user for offline/temporary server errors
          }
          return;
        }
        try {
          const data = await r.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (e) {
          console.error('Error parsing profile JSON', e);
          // keep existing stored user instead of wiping it
        }
      })
      .catch((e) => {
        console.error('Fetch profile error', e);
        // network or server error — keep previously stored user to avoid logging out the UI
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const res = await fetch(buildApiUrl("/register"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...metadata }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user || null);
        }
        return { error: null, user: data.user || null };
      }
      return { error: { message: data.message || 'Erreur' } };
    } catch (err: any) {
      return { error: { message: err.message || 'Erreur' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(buildApiUrl("/login"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user || null);
        }
        return { error: null, user: data.user || null };
      }
      return { error: { message: data.message || 'Erreur de connexion' } };
    } catch (err: any) {
      return { error: { message: err.message || 'Erreur' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return { error: null };
  };

  return { user, loading, signUp, signIn, signOut };
};
