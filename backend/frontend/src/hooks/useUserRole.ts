import { useState, useEffect } from 'react';

type UserRole = 'super_admin' | 'admin_offers' | 'admin_users' | 'company' | 'candidate' | null;

// Accept either a user object or a user id. If a user object is provided and contains
// `user_type`, derive role directly. Otherwise, return null.
export const useUserRole = (userOrId: any) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userOrId) {
      setRole(null);
      setLoading(false);
      return;
    }

    // If userOrId is an object with user_type, use it
    if (typeof userOrId === 'object' && userOrId?.user_type) {
      const ut = userOrId.user_type;
      if (ut === 'company') setRole('company');
      else if (ut === 'candidate') setRole('candidate');
      else setRole(null);
      setLoading(false);
      return;
    }

    // Fallback: unknown -> null
    setRole(null);
    setLoading(false);
  }, [userOrId]);

  return { role, loading };
};
