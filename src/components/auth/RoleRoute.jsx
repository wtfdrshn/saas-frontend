import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    if (user) {
      return <Navigate to={user.role === 'organizer' ? '/organizer/dashboard' : '/user/dashboard'} />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleRoute; 