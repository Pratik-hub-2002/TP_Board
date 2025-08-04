import { Navigate } from 'react-router-dom';
import useStore from '../store';

const PublicOnlyRoute = ({ children }) => {
  const { isLoggedIn } = useStore();

  if (isLoggedIn) {
    return <Navigate to="/boards" replace />;
  }

  return children;
};

export default PublicOnlyRoute;