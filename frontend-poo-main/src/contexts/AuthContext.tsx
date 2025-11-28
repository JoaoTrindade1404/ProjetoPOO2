import React, { createContext, useContext, useEffect, useState } from 'react';
import { userAPI, User as SpringBootUser } from '@/services/springboot-api';

interface User extends SpringBootUser {
  id: number;
  email: string;
  nome: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserBalance: (newBalance: number) => void;
  loading: boolean;
  isAuthenticated: boolean;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'springboot_user';
const SESSION_TIMESTAMP_KEY = 'springboot_session_timestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const validateSession = async (): Promise<boolean> => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const sessionTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    if (!storedUser || !sessionTimestamp) {
      console.log('🔒 AuthContext.validateSession - No stored session found');
      return false;
    }
    const now = Date.now();
    const sessionTime = parseInt(sessionTimestamp);
    const isExpired = (now - sessionTime) > SESSION_DURATION;

    if (isExpired) {
      console.log('⏰ AuthContext.validateSession - Session expired, clearing storage');
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      setUser(null);
      return false;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      try {
        await userAPI.getById(parsedUser.id);
        console.log('✅ AuthContext.validateSession - Session valid, user exists in backend');
        return true;
      } catch (error) {
        console.log('❌ AuthContext.validateSession - User not found in backend, clearing session');
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext.validateSession - Error parsing stored user:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext.initializeAuth - Initializing authentication');
      
      const isValid = await validateSession();
      
      if (isValid) {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('👤 AuthContext.initializeAuth - User session restored:', { id: parsedUser.id, email: parsedUser.email });
          } catch (error) {
            console.error('❌ AuthContext.initializeAuth - Error parsing stored user:', error);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('📝 AuthContext.signUp - Creating user:', email);
    try {
      setLoading(true);
      const newUser = await userAPI.create({
        nome: fullName || email.split('@')[0],
        email,
        senha: password,
      });
      
      const userWithId = { ...newUser, id: newUser.id! };
      setUser(userWithId);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithId));
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      console.log('✅ AuthContext.signUp - User created successfully:', { id: userWithId.id, email: userWithId.email });
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ AuthContext.signUp - Error:', error);
      return { error: error.message || 'Erro ao cadastrar usuário' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext.signIn - Logging in user:', email);
    try {
      setLoading(true);
      const loggedUser = await userAPI.login(email, password);
      
      const userWithId = { ...loggedUser, id: loggedUser.id! };
      setUser(userWithId);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithId));
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      console.log('✅ AuthContext.signIn - User logged in successfully:', { id: userWithId.id, email: userWithId.email, saldo: userWithId.saldo });
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ AuthContext.signIn - Error:', error);
      return { error: error.message || 'Credenciais inválidas' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 AuthContext.signOut - Logging out user');
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  };

  const updateUserBalance = (newBalance: number) => {
    console.log('💰 AuthContext.updateUserBalance - Updating balance to:', newBalance);
    if (user) {
      const updatedUser = { ...user, saldo: newBalance };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      console.log('✅ AuthContext.updateUserBalance - Balance updated in state and localStorage');
    } else {
      console.log('❌ AuthContext.updateUserBalance - No user to update');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      signUp, 
      signIn, 
      signOut, 
      updateUserBalance, 
      loading, 
      isAuthenticated,
      validateSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
