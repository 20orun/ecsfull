import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/ecs-logo.png" alt="Excel Care Solutions Logo" className="logo-image" />
        </Link>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {!user && (
            <>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${isActive('/about')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className={`nav-link ${isActive('/services')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/collaborators" 
                className={`nav-link ${isActive('/collaborators')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Collaborators
              </Link>
              <Link 
                to="/team" 
                className={`nav-link ${isActive('/team')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Team
              </Link>
              <Link 
                to="/contact" 
                className={`nav-link ${isActive('/contact')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Employee Login
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-user-name">
                Hi, {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <Link 
                to="/invoice" 
                className={`nav-link ${isActive('/invoice')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Invoice Generate
              </Link>
              <Link 
                to="/invoice-history" 
                className={`nav-link ${isActive('/invoice-history')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Invoice History
              </Link>
              <Link 
                to="/purchase-order" 
                className={`nav-link ${isActive('/purchase-order')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                PO Generate
              </Link>
              <Link 
                to="/purchase-order-history" 
                className={`nav-link ${isActive('/purchase-order-history')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                PO History
              </Link>
              <button 
                className="nav-link nav-signout"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
