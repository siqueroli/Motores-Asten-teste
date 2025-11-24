import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthContextType } from '../types';
import { ADMIN_USER } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Simulating a database of users in localStorage
  const getUsersFromStorage = (): Record<string, string> => {
    const users = localStorage.getItem('app_users');
    return users ? JSON.parse(users) : {};
  };

  const saveUserToStorage = (username: string, pass: string) => {
    const users = getUsersFromStorage();
    users[username] = pass;
    localStorage.setItem('app_users', JSON.stringify(users));
    refreshUserList();
  };

  // Atualiza a lista de usuários no estado para a UI
  const refreshUserList = () => {
    const usersObj = getUsersFromStorage();
    const userList: User[] = Object.keys(usersObj).map(username => ({
      username,
      role: 'user'
    }));
    
    // Sempre adiciona o admin no topo da lista
    setAllUsers([ADMIN_USER, ...userList]);
  };

  useEffect(() => {
    // Check if user is logged in (session persistence simulation)
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setAuth({
        user: JSON.parse(storedUser),
        isAuthenticated: true
      });
    }
    refreshUserList();
  }, []);

  const login = (username: string, pass: string): boolean => {
    // Admin check
    if (username === 'admin' && pass === 'admin') {
      const user = ADMIN_USER;
      setAuth({ user, isAuthenticated: true });
      localStorage.setItem('current_user', JSON.stringify(user));
      return true;
    }

    // Regular user check
    const users = getUsersFromStorage();
    if (users[username] && users[username] === pass) {
      const user: User = { username, role: 'user' };
      setAuth({ user, isAuthenticated: true });
      localStorage.setItem('current_user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const register = (username: string, pass: string, autoLogin: boolean = true): boolean => {
    if (username === 'admin') return false; // Cannot re-register admin
    
    const users = getUsersFromStorage();
    if (users[username]) {
      return false; // User already exists
    }

    saveUserToStorage(username, pass);
    
    // Only auto-login if requested (defaults to true)
    if (autoLogin) {
        const user: User = { username, role: 'user' };
        setAuth({ user, isAuthenticated: true });
        localStorage.setItem('current_user', JSON.stringify(user));
    }
    
    return true;
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('current_user');
  };

  // --- NOVAS FUNÇÕES DE GESTÃO ---

  const removeUser = (username: string) => {
    if (username === 'admin') return; // Proteção extra
    const users = getUsersFromStorage();
    delete users[username];
    localStorage.setItem('app_users', JSON.stringify(users));
    refreshUserList();
  };

  const updateUserPassword = (username: string, newPass: string) => {
    if (username === 'admin') return; // Não altera senha do admin por aqui
    const users = getUsersFromStorage();
    if (users[username]) {
      users[username] = newPass;
      localStorage.setItem('app_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, allUsers, removeUser, updateUserPassword }}>
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