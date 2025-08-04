import { Navigate } from "react-router-dom";
import useStore from "../../store";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useStore();
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
