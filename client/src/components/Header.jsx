import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" style={{ color: '#ff0000', textDecoration: 'none' }}>
          StreamTube
        </Link>
      </div>
      
      <nav className="nav-links">
        <Link to="/">Home</Link>
        {isAuthenticated && (
          <>
            <Link to="/upload">Upload</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/playlists">Playlists</Link>
          </>
        )}
      </nav>

      <div className="auth-buttons">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.username}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
