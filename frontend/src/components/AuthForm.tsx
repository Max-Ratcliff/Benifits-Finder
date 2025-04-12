import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createUser, signIn } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Extra state fields for profile questions (only for sign-up)
  const [isStudent, setIsStudent] = useState('');
  const [hasJob, setHasJob] = useState('');
  const [hasDependents, setHasDependents] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // Validate that the extra profile fields are answered.
        if (!isStudent || !hasJob || !hasDependents) {
          setError('Please answer all profile questions.');
          return;
        }
        // Pass the extra profile data into createUser.
        await createUser(email, password, { isStudent, hasJob, hasDependents });
      } else {
        await signIn(email, password);
      }
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Show extra profile fields only on Sign-Up */}
        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Are you currently enrolled as a student?
              </label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option}
                      checked={isStudent === option}
                      onChange={(e) => setIsStudent(e.target.value)}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Do you currently have a job?
              </label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option}
                      checked={hasJob === option}
                      onChange={(e) => setHasJob(e.target.value)}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Do you have any dependents?
              </label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option}
                      checked={hasDependents === option}
                      onChange={(e) => setHasDependents(e.target.value)}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        {/* Toggle between Sign-Up and Sign-In */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </motion.div>
  );
}
