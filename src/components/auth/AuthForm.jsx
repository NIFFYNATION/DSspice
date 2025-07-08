import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import authService from '../../api/authService';

export default function AuthForm({ onAuthSuccess, initialMode = 'login' }) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password.trim()) newErrors.password = 'Password is required';
    if (!form.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      let response;
      if (authMode === 'login') {
        response = await authService.login(form.email, form.password);
      } else {
        if (!validateSignup()) {
          setIsLoading(false);
          return;
        }
        response = await authService.signup({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password
        });
      }
      if (response.code === 200) {
        onAuthSuccess && onAuthSuccess();
      } else {
        setErrors({ general: response.message || 'Authentication failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Authentication failed' });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setErrors({});
    setResetMessage('');
    try {
      const response = await authService.forgotPassword(resetEmail);
      if (response.code === 200) {
        setResetMessage('Reset instructions sent to your email.');
        setTimeout(() => {
          setResetMessage('');
          setIsForgotPassword(false);
        }, 5000);
        setResetEmail('');
      } else {
        setErrors({ resetEmail: response.message || 'Failed to send reset instructions' });
      }
    } catch (error) {
      setErrors({ resetEmail: error.message || 'An error occurred' });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl text-center font-bold mb-6">
        {isForgotPassword ? 'Forgot Password' : authMode === 'login' ? 'Login' : 'Create an Account'}
      </h2>
      <div className="space-y-4">
        {isForgotPassword ? (
          <>
            <input
              type="email"
              name="resetEmail"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            {errors.resetEmail && <p className="text-red-500 text-xs">{errors.resetEmail}</p>}
            {resetMessage && <p className="text-green-500 text-xs">{resetMessage}</p>}
            <Button variant="primary" onClick={handleForgotPassword} className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
            <button type="button" className="text-xs text-accent mt-2" onClick={() => setIsForgotPassword(false)}>
              Back to Login
            </button>
          </>
        ) : (
          <>
            {authMode === 'signup' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                      required
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                      required
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+2341234567890"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                    required
                  />
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Type your number after +234</p>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 border-secondary/20 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary"
                  required
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}
            {errors.general && <p className="text-red-500 text-xs mt-2">{errors.general}</p>}
            <Button
              variant="primary"
              onClick={handleAuth}
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Create Account'}
            </Button>
            <button
              type="button"
              className="text-xs text-accent mt-2"
              onClick={() => setIsForgotPassword(true)}
              style={{ display: authMode === 'login' ? 'block' : 'none' }}
            >
              Forgot password?
            </button>
          </>
        )}
        {/* Login/Signup and T&C/Policy links */}
        <div className="flex flex-col items-center space-y-2 text-xs mt-2">
          <span>
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button className="text-accent hover:underline" onClick={() => setAuthMode('signup')}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button className="text-accent hover:underline" onClick={() => setAuthMode('login')}>
                  Login
                </button>
              </>
            )}
          </span>
          <span>
            <Link to="/terms" className="text-accent hover:underline" target="_blank">Terms & Conditions</Link> {' | '}
            <Link to="/policy" className="text-accent hover:underline" target="_blank">Privacy Policy</Link>
          </span>
        </div>
      </div>
    </div>
  );
} 