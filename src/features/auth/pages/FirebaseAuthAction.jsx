import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';

const passwordRequirements = [
  {
    label: 'At least 8 characters',
    test: (pw) => pw.length >= 8,
  },
  {
    label: 'At least one uppercase letter',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: 'At least one lowercase letter',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: 'At least one number',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: 'At least one special character',
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export default function FirebaseAuthAction() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const mode = query.get('mode');
  const oobCode = query.get('oobCode');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (mode === 'resetPassword' && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setLoading(false);
        })
        .catch((err) => {
          setError('Invalid or expired password reset link.');
          setLoading(false);
        });
    } else if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage('Email verified! You can now sign in.');
          setLoading(false);
        })
        .catch(() => {
          setError('Invalid or expired verification link.');
          setLoading(false);
        });
    } else {
      setError('Invalid action.');
      setLoading(false);
    }
  }, [mode, oobCode]);

  const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Password has been reset. You can now sign in.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Processing...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-600">{error}</div>;
  if (message) return <div className="flex justify-center items-center h-64 text-green-600">{message}</div>;

  if (mode === 'resetPassword' && email) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <p className="mb-4">Resetting password for <span className="font-mono">{email}</span></p>
        <form onSubmit={handlePasswordReset}>
          <label className="block mb-2 font-medium">New Password</label>
          <div className="relative mb-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full border px-3 py-2 rounded"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <ul className="mb-4 text-sm">
            {passwordRequirements.map((req) => (
              <li key={req.label} className={req.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                {req.test(newPassword) ? '✓' : '•'} {req.label}
              </li>
            ))}
          </ul>

          <label className="block mb-2 font-medium">Confirm New Password</label>
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full border px-3 py-2 rounded"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {!passwordsMatch && confirmPassword.length > 0 && (
            <div className="text-red-600 text-sm mb-2">Passwords do not match.</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!allRequirementsMet || !passwordsMatch || loading}
          >
            Set New Password
          </button>
        </form>
      </div>
    );
  }

  return null;
} 