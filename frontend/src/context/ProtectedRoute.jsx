import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  // Add admin route protection
  if (window.location.pathname.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return children;
};

export default ProtectedRoute;
