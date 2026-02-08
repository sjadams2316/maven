'use client';

import { useState } from 'react';
import { useSignUp, useSignIn, useUser } from '@clerk/nextjs';

interface ProgressiveSignupProps {
  email: string;
  firstName: string;
  lastName: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export default function ProgressiveSignup({ 
  email, 
  firstName, 
  lastName, 
  onSuccess, 
  onSkip 
}: ProgressiveSignupProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  // If already signed in, just continue
  if (isSignedIn) {
    onSuccess();
    return null;
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const sendVerificationCode = async () => {
    if (!isLoaded || !signUp || !email) return;
    
    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSending(true);
    setError('');
    
    try {
      // Start the sign up process with password
      await signUp.create({
        emailAddress: email,
        password: password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setCodeSent(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      // Handle specific errors
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        setError('This email is already registered. Please sign in instead.');
        setMode('signin');
      } else if (err.errors?.[0]?.code === 'form_password_pwned') {
        setError('This password has been found in a data breach. Please choose a different password.');
      } else {
        setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSignIn = async () => {
    if (!signIn || !email || !password) return;
    
    setIsSending(true);
    setError('');
    
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      
      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'Invalid email or password.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!isLoaded || !signUp) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete' && setActive) {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else if (result.status === 'complete') {
        // Fallback if setActive not available
        onSuccess();
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!codeSent ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔐
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-[var(--muted)]">
                {mode === 'signup' 
                  ? 'Secure your financial data with a free Maven account.'
                  : 'Sign in to access your saved data.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Google Sign In - Quick Option */}
            <button
              onClick={handleGoogleSignUp}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl transition flex items-center justify-center gap-3 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--card)] text-[var(--muted)]">or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email (pre-filled) */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--muted)] cursor-not-allowed"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-[var(--primary)]"
                    placeholder={mode === 'signup' ? 'Create a password (8+ characters)' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
              )}

              <button
                onClick={mode === 'signup' ? sendVerificationCode : handleSignIn}
                disabled={isSending || !password || (mode === 'signup' && !confirmPassword)}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  mode === 'signup' ? 'Create Account & Continue' : 'Sign In'
                )}
              </button>
              
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    setError('');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  {mode === 'signup' ? 'Already have an account?' : 'Need an account?'}
                </button>
                <button
                  onClick={onSkip}
                  className="text-[var(--muted)] hover:text-white transition"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                ✉️
              </div>
              <h3 className="text-2xl font-bold mb-2">Check Your Email</h3>
              <p className="text-[var(--muted)]">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[var(--primary)]"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                onClick={verifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={sendVerificationCode}
                  disabled={isSending}
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  Resend code
                </button>
                <button
                  onClick={() => setCodeSent(false)}
                  className="text-[var(--muted)] hover:text-white transition"
                >
                  Change email
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
