import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setMessage({ 
          type: 'success', 
          text: 'Check your email for the confirmation link!' 
        });
      } else {
        setMessage({ type: 'success', text: 'Account created successfully!' });
      }
      
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Signed in successfully!' });
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setMessage({ type: 'success', text: 'Signed out successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '' });
  };

  // If user is logged in, show welcome screen
  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1 className="auth-title">Employee Portal</h1>
          <div className="auth-welcome">
            <p>Welcome, {user.user_metadata?.full_name || user.email}!</p>
            <p className="auth-email">Signed in as: {user.email}</p>
            <button 
              className="auth-button" 
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Employee Portal</h1>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => !loading && toggleMode()}
            disabled={!isSignUp}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => !loading && toggleMode()}
            disabled={isSignUp}
          >
            Sign Up
          </button>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <p className="auth-note">
          This portal is for Excel Care Solutions employees only.
        </p>
      </div>
    </div>
  );
};

export default Auth;
