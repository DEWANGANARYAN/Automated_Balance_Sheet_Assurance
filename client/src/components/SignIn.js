import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin } from "../services/AuthService";
import "./SignIn.css";  // Import your CSS file

const SignIn = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signin({ username, password });
      setLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" id="signin-card">
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="signin-username" className="form-label">Username</label>
            <input
              id="signin-username"
              className="form-input"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="signin-password" className="form-label">Password</label>
            <input
              type="password"
              id="signin-password"
              className="form-input"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-btn" id="signin-btn">Login</button>
        </form>
        {error && <p className="auth-message">{error}</p>}
        <p className="footer-link">
          Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
