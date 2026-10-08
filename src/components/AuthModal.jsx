import React, { useState } from 'react';
import { CloseIcon, UserIcon, LockIcon, SparklesIcon } from './Icons';
import { loginUser, registerUser, loginAsDemo } from '../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      let user;
      if (isSignUp) {
        user = registerUser(name, email, password);
      } else {
        user = loginUser(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemoLogin = () => {
    setError('');
    const demo = loginAsDemo();
    onAuthSuccess(demo);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-box">
            <UserIcon size={22} />
            <h2>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="auth-modal-body">
          {/* Quick Demo Login Option */}
          <div className="demo-login-box">
            <button 
              type="button" 
              className="demo-login-btn"
              onClick={handleDemoLogin}
            >
              <SparklesIcon size={16} />
              <span>⚡ One-Click Demo Sign In (Aman Dadhich)</span>
            </button>
            <div className="auth-separator">
              <span>or continue with email</span>
            </div>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          {/* Tab Switcher */}
          <div className="auth-tab-row">
            <button
              type="button"
              className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Aman Dadhich"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <LockIcon size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              {isSignUp ? 'Sign Up & Continue' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer-prompt">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(false)}>
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(true)}>
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
