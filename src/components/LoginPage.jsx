import React, { useState } from 'react';
import { BookOpenIcon, UserIcon, LockIcon, GoogleIcon, EyeIcon, SparklesIcon } from './Icons';
import { loginUser, registerUser, loginWithGoogle } from '../services/authService';

export default function LoginPage({ onAuthSuccess, onBackToLibrary }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('aman'); // default demo username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // default demo password
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const user = registerUser(name, username, email, password);
        setSuccessMsg(`Welcome, ${user.name}! Your account has been created.`);
        setTimeout(() => onAuthSuccess(user), 400);
      } else {
        const user = loginUser(identifier, password);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => onAuthSuccess(user), 300);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    const user = loginWithGoogle('dadhichaman548@gmail.com');
    setSuccessMsg('Successfully signed in with Google (Gmail)!');
    setTimeout(() => onAuthSuccess(user), 350);
  };

  const handleFillDemoCreds = (demoUser, demoPass) => {
    setIdentifier(demoUser);
    setPassword(demoPass);
    setIsSignUp(false);
    setError('');
  };

  return (
    <div className="login-page-container">
      {/* Top Bar with Back to Library */}
      <div className="login-top-bar">
        <button className="back-library-btn" onClick={onBackToLibrary}>
          ← Back to Library
        </button>
      </div>

      <div className="login-split-card">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="login-banner-side">
          <div className="login-brand-header">
            <div className="login-brand-icon">
              <BookOpenIcon size={28} />
            </div>
            <h2>BookMatch AI</h2>
          </div>

          <div className="login-banner-content">
            <h3>Discover Books Like Never Before.</h3>
            <p>
              Sign in to manage your private reading list, contribute your own book 
              details, and get explainable content-based recommendations powered by 
              weighted feature similarity.
            </p>

            <div className="login-feature-list">
              <div className="feature-bullet">
                <SparklesIcon size={16} />
                <span>Client-Side Content Similarity Algorithm</span>
              </div>
              <div className="feature-bullet">
                <SparklesIcon size={16} />
                <span>Instant Google (Gmail) One-Click Access</span>
              </div>
              <div className="feature-bullet">
                <SparklesIcon size={16} />
                <span>Custom Books with LocalStorage Persistence</span>
              </div>
            </div>
          </div>

          <div className="login-banner-footer">
            <p className="developer-tag">Engineered by <strong>Aman Dadhich</strong> • VIT Bhopal</p>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="login-form-side">
          <div className="form-side-header">
            <h2>{isSignUp ? 'Create your account' : 'Sign in to your account'}</h2>
            <p>{isSignUp ? 'Enter your details below to get started' : 'Sign in with your Gmail or username & password'}</p>
          </div>

          {/* 1. Google (Gmail) One-Click Sign In */}
          <button 
            type="button" 
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon size={20} />
            <span>Continue with Google (Gmail)</span>
          </button>

          <div className="auth-or-divider">
            <span>or sign in with credentials</span>
          </div>

          {/* Quick Demo Credentials Pill */}
          {!isSignUp && (
            <div className="demo-credentials-card">
              <div className="demo-cred-label">
                <span>⚡ Test with Preloaded Account:</span>
              </div>
              <div className="demo-cred-badges">
                <button
                  type="button"
                  className="cred-badge-btn"
                  onClick={() => handleFillDemoCreds('aman', 'password123')}
                >
                  Username: <strong>aman</strong> | Pass: <strong>password123</strong>
                </button>
              </div>
            </div>
          )}

          {error && <div className="form-error-banner">{error}</div>}
          {successMsg && <div className="form-success-banner">{successMsg}</div>}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="login-main-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="auth-input-wrapper">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Aman Dadhich"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <div className="auth-input-wrapper">
                    <span className="input-icon">@</span>
                    <input
                      type="text"
                      placeholder="e.g. amandadhich"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email / Gmail *</label>
                  <div className="auth-input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="e.g. dadhichaman548@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {!isSignUp && (
              <div className="form-group">
                <label>Email / Gmail or Username *</label>
                <div className="auth-input-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter email (e.g. dadhichaman548@gmail.com) or username (aman)"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Password *</label>
              <div className="auth-input-wrapper">
                <LockIcon size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon size={18} show={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">
              {isSignUp ? 'Create Account & Sign In' : 'Sign In to Account'}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="toggle-auth-prompt">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="toggle-link"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                >
                  Sign In directly
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="toggle-link"
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
