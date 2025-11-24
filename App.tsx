import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { MotorProvider } from './context/MotorContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {isAuthenticated ? <Dashboard /> : <Login />}
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MotorProvider>
        <AppContent />
      </MotorProvider>
    </AuthProvider>
  );
};

export default App;