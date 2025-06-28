import { createContext, useState, useEffect } from "react";
import { getUserProfile } from "../api/authApi";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const userData = await getUserProfile(token);
      setUser(userData);
      // Record login after successful profile fetch
      // In fetchUserProfile function
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const login = async (token) => {
    localStorage.setItem("token", token);
    
    // Record login time immediately after successful credential login
    try {
      await axios.post('http://localhost:5000/api/users/record-login', { 
        loginTime: new Date() 
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    } catch (err) {
      console.error("Login recording failed:", err);
    }
    
    // Then fetch profile
    await fetchUserProfile(token); 
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;