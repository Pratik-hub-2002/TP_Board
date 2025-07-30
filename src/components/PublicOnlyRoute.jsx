import { Navigate } from 'react-router-dom';
import useStore from '../store';

const PublicOnlyRoute = ({ component: Component }) => {
  const { isLoggedIn } = useStore();

  if (isLoggedIn) {
    return <Navigate to="/boards" replace />;
  }

  return <Component />;
};

export default PublicOnlyRoute;