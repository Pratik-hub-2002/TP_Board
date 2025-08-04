import { Navigate } from "react-router-dom";
import useStore from "../../store";

const PublicOnlyRoute = ({ children }) => {
  const { isLoggedIn } = useStore();
  return isLoggedIn ? <Navigate to="/boards" replace /> : children;
};

export default PublicOnlyRoute;
