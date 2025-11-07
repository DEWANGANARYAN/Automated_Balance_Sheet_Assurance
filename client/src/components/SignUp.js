import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/AuthService";
import "./SignUp.css";  // Import the CSS file

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup({ username, password });
      setMessage("Signup successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" id="signup-card">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-username" className="form-label">Username</label>
            <input
              id="signup-username"
              className="form-input"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">Password</label>
            <input
              type="password"
              id="signup-password"
              className="form-input"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn" id="signup-btn">Sign Up</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p className="footer-link">
          Already have an account? <Link to="/" className="signin-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
