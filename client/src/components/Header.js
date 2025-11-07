import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/AuthService";
import "./Header.css";

const Header = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Finnovate Report Portal</h1>
        <nav className="nav-links">
          {loggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="btn-logout" aria-label="Logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link signup-link">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
