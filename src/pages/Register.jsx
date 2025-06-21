import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, createUserProfile } = useAuth();
  const firstNameRef = useRef(null);

  useEffect(() => {
    // Focus first input on mount
    firstNameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus first field with error
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Register the user
      await register(formData.email, formData.password);
      
      // Create user profile in Firestore
      const userProfile = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: 'user',
      };
      
      await createUserProfile(userProfile);
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Please contact support.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/requests-blocked-by-rules') {
        setError('Sign-ups are currently blocked by Firebase Authentication rules. Please check your Firebase Authentication settings and authorized domains.');
      } else if (err.code && err.code.startsWith('auth/requests-from-referer')) {
        setError('Sign-in with Google is not allowed from this address. Please check your Firebase settings.');
      } else if (err.message) {
        setError(`Error: ${err.message} (code: ${err.code})`);
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* General Error Message */}
          {error && (
            <div 
              className="mb-4 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded" 
              role="alert"
              aria-live="polite"
            >
              {error}
              {error === 'An account with this email already exists.' && (
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    onClick={() => navigate('/login', { state: { email: formData.email } })}
                  >
                    Forgot password? Reset it here.
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Social login buttons */}
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded bg-white hover:bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Google"
            >
              <img src="/google-logo.svg" alt="" className="h-5 w-5" aria-hidden="true" />
              Sign up with Google
            </button>
          </div>
          
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200" aria-hidden="true" />
            <span className="mx-4 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-200" aria-hidden="true" />
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name *
                </label>
                <div className="mt-1">
                  <input
                    ref={firstNameRef}
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      fieldErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                    aria-invalid={fieldErrors.firstName ? "true" : "false"}
                  />
                  {fieldErrors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name *
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      fieldErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                    aria-invalid={fieldErrors.lastName ? "true" : "false"}
                  />
                  {fieldErrors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  aria-invalid={fieldErrors.email ? "true" : "false"}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  aria-describedby={fieldErrors.password ? "password-error" : "password-help"}
                  aria-invalid={fieldErrors.password ? "true" : "false"}
                />
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p id="password-help" className="mt-1 text-sm text-gray-500">
                    Must be at least 6 characters long
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : "confirmPassword-help"}
                  aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
                />
                {fieldErrors.confirmPassword ? (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : (
                  <p id="confirmPassword-help" className="mt-1 text-sm text-gray-500">
                    Re-enter your password to confirm
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={loading ? "register-status" : undefined}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" aria-hidden="true"></span>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
              {loading && (
                <span id="register-status" className="sr-only">
                  Creating your account, please wait
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 