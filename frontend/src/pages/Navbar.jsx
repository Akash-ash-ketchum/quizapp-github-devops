import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  // Don't render navbar if we're on login/signup page
  if (isLoginPage) {
    return null;
  }

  const navbarBackground = "bg-gray-900 text-white shadow-lg shadow-gray-800";
  const logoStyle = "text-gray-200";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`${navbarBackground} py-4 transition-all duration-300 relative z-50`}>
      <div className="max-w-full flex justify-between items-center px-6">
        <Link
          to="/"
          className={`text-5xl font-extrabold tracking-wide ${logoStyle} transition duration-300`}
        >
          Quiz Master
        </Link>

        {user && (
          <div className="flex items-center space-x-6">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="text-lg font-medium hover:text-gray-400 transition duration-300"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/quiz-type"
              className="text-lg font-medium hover:text-gray-400 transition duration-300"
            >
              Start Quiz
            </Link>
            <Link
              to="/profile"
              className="text-lg font-medium hover:text-gray-400 transition duration-300"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-full font-medium hover:bg-red-600 transition duration-300 shadow-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;