import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;
