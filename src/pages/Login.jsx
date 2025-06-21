import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendPasswordReset } = useAuth();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const resetEmailRef = useRef(null);

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Focus management
  useEffect(() => {
    if (showReset) {
      resetEmailRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  }, [showReset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      emailRef.current?.focus();
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password.');
      passwordRef.current?.focus();
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Login error:', err);
      // Focus back to email for retry
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      resetEmailRef.current?.focus();
      return;
    }

    setResetMessage('');
    setError('');
    try {
      await sendPasswordReset(resetEmail);
      setResetMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email. Please check the email address.');
      resetEmailRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Status Messages */}
          {error && (
            <div 
              className="mb-4 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded" 
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
          {resetMessage && (
            <div 
              className="mb-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded"
              role="status"
              aria-live="polite"
            >
              {resetMessage}
            </div>
          )}

          {!showReset ? (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address *
                </label>
                <div className="mt-1">
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(''); // Clear error on input
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-describedby={error && !password ? "email-error" : undefined}
                    aria-invalid={error && !password ? "true" : "false"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(''); // Clear error on input
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-describedby={error && password ? "password-error" : undefined}
                    aria-invalid={error && password ? "true" : "false"}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={() => {
                    setShowReset(true);
                    setResetMessage('');
                    setError('');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-describedby={loading ? "login-status" : undefined}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
                {loading && (
                  <span id="login-status" className="sr-only">
                    Signing you in, please wait
                  </span>
                )}
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handlePasswordReset} noValidate>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Reset your password
                </h2>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Enter your email address *
                </label>
                <div className="mt-1">
                  <input
                    ref={resetEmailRef}
                    id="resetEmail"
                    name="resetEmail"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setError(''); // Clear error on input
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                    aria-describedby={error ? "reset-email-error" : "reset-email-help"}
                    aria-invalid={error ? "true" : "false"}
                  />
                  <p id="reset-email-help" className="mt-1 text-sm text-gray-500">
                    We'll send you a link to reset your password.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={() => {
                    setShowReset(false);
                    setResetEmail('');
                    setError('');
                    setResetMessage('');
                  }}
                >
                  Back to sign in
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send reset email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 