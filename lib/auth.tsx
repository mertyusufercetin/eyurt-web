'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Kullanici } from './types';

interface AuthState {
  user: Kullanici | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const tc = authUser.email.replace('@eyurt.com', '');
        const { data } = await supabase
          .from('kullanicilar')
          .select('*')
          .eq('tc_kimlik', tc)
          .single();
        setState({ user: data, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    }
    load();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
