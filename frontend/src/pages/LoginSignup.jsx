import { useState, useContext, useEffect } from "react";
import { login, signup } from "../api/authApi";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const { user, login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ Redirect to profile if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await login(loginData);
      authLogin(response.token); // ✅ Store token and set user
      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      // ✅ Redirect to profile after successful login
      setTimeout(() => navigate("/profile"), 1000);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Login failed!" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await signup(signupData);
      setMessage({ type: "success", text: "Signup successful! You can now log in." });
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Signup failed!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700">
      <div className="w-full max-w-6xl flex">
        {/* Login Form */}
        <div className="w-1/2 flex justify-center">
          <div className="w-96 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-blue-600">Welcome Back</h2>
            {message.type && <p className={`text-center text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>{message.text}</p>}

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="Enter your password"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 mt-4" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Signup Form */}
        <div className="w-1/2 flex justify-center">
          <div className="w-96 bg-blue-50 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-blue-600">Create Account</h2>

            <form onSubmit={handleSignupSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  placeholder="Enter your name"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  placeholder="Create a password"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 mt-4" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
