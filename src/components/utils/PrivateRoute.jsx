import { Navigate } from "react-router-dom";
import useStore from "../../store"; // ✅ Corrected import

const PrivateRoute = ({ component: Component }) => {
  const { isLoggedIn } = useStore();

  return isLoggedIn ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
