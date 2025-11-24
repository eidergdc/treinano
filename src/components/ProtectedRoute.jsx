import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import LoadingScreen from './LoadingScreen';
import Layout from './Layout';

const ProtectedRoute = () => {
  const { user, initialized, initialize } = useFirebaseAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;