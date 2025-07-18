import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // You can return a loading spinner here if you want
    return null;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login,
    // which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // If the user's role is not in the allowed roles, redirect to a 'not authorized' page
    // or simply back to the home page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
