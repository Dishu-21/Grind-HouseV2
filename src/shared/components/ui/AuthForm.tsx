import React, { useState } from 'react';
import { CheckCircle, Eye, EyeOff, Loader, WifiOff } from 'lucide-react';
import { useRemoteAuth } from '../../../core/context/RemoteAuthContext';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import {
  validatePassword,
  formatAuthError,
  validateUsername,
} from '../../utils/auth';

interface AuthFormProps {
  onSuccess?: () => void;
  onOffline?: () => void;
  onPendingConfirmationChange?: (pending: boolean) => void;
  showOfflineOption?: boolean;
  initialMode?: 'signin' | 'signup';
  className?: string;
}

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}

function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  required = true,
}: FormInputProps) {
  return (
    <div className="auth-input-group ob-input-group">
      <label className="auth-label ob-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="auth-input ob-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  children?: React.ReactNode;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  required = true,
  children,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-input-group ob-input-group">
      <label className="auth-label ob-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-password-wrapper ob-password-wrapper">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className="auth-input ob-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="auth-password-toggle ob-password-toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {children}
    </div>
  );
}

interface SignInFlowProps {
  onSuccess?: () => void;
  onPendingConfirmationChange?: (pending: boolean) => void;
}

function SignInFlow({ onSuccess, onPendingConfirmationChange }: SignInFlowProps) {
  const { signInWithPassword } = useRemoteAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) return;

    setError(null);
    setLoading(true);

    try {
      const result = await signInWithPassword(username.trim(), password);

      if (result.error) {
        setError(formatAuthError(result.error));
        setLoading(false);
        return;
      }

      onPendingConfirmationChange?.(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form ob-email-form">
      <FormInput
        id="signin-username"
        label="Username"
        type="text"
        placeholder="username"
        value={username}
        onChange={setUsername}
        disabled={loading}
        autoComplete="username"
      />

      <PasswordInput
        id="signin-password"
        label="Password"
        placeholder="Enter password"
        value={password}
        onChange={setPassword}
        disabled={loading}
        autoComplete="current-password"
      />

      {error && (
        <div className="auth-error ob-auth-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <button
        className="primary-btn auth-btn ob-auth-btn"
        type="submit"
        disabled={loading || !username.trim() || !password}
      >
        {loading ? <Loader size={18} className="spin-icon" /> : 'Sign in'}
      </button>
    </form>
  );
}

interface SignUpFlowProps {
  onSuccess?: () => void;
  onPendingConfirmationChange?: (pending: boolean) => void;
}

function SignUpFlow({ onSuccess, onPendingConfirmationChange }: SignUpFlowProps) {
  const { signUpWithEmail } = useRemoteAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { score } = usePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) return;

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    setLoading(true);

    try {
      const result = await signUpWithEmail(username.trim(), password, displayName.trim() || undefined);

      if (result.error) {
        setError(formatAuthError(result.error));
        setLoading(false);
        return;
      }

      onPendingConfirmationChange?.(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    !username.trim() ||
    !password ||
    score < 2 ||
    password !== confirmPassword ||
    !confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="auth-form ob-email-form">
      <FormInput
        id="signup-username"
        label="Username"
        type="text"
        placeholder="username"
        value={username}
        onChange={setUsername}
        disabled={loading}
        autoComplete="username"
      />

      <FormInput
        id="signup-display-name"
        label="Display name"
        type="text"
        placeholder="Your display name"
        value={displayName}
        onChange={setDisplayName}
        disabled={loading}
        autoComplete="name"
      />

      <PasswordInput
        id="signup-password"
        label="Password"
        placeholder="Create password (min 8 chars)"
        value={password}
        onChange={setPassword}
        disabled={loading}
        autoComplete="new-password"
      >
        <PasswordStrengthMeter password={password} />
      </PasswordInput>

      <PasswordInput
        id="signup-confirm-password"
        label="Confirm password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={loading}
        autoComplete="new-password"
      />

      {error && (
        <div className="auth-error ob-auth-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <button
        className="primary-btn auth-btn ob-auth-btn"
        type="submit"
        disabled={isSubmitDisabled}
      >
        {loading ? <Loader size={18} className="spin-icon" /> : 'Sign up'}
      </button>
    </form>
  );
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSuccess,
  onOffline,
  onPendingConfirmationChange,
  showOfflineOption = false,
  initialMode = 'signin',
  className = '',
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleTabChange = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
  };

  const hasOffline = showOfflineOption || Boolean(onOffline);

  return (
    <div className={`auth-options ob-auth-options ${className}`.trim()}>
      <div className="auth-divider ob-auth-divider">or</div>

      <div className="auth-tabs ob-auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'signin'}
          className={`auth-tab ob-auth-tab ${authMode === 'signin' ? 'active' : ''}`}
          onClick={() => handleTabChange('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'signup'}
          className={`auth-tab ob-auth-tab ${authMode === 'signup' ? 'active' : ''}`}
          onClick={() => handleTabChange('signup')}
        >
          Sign up
        </button>
      </div>

      {authMode === 'signin' ? (
        <SignInFlow onSuccess={onSuccess} onPendingConfirmationChange={onPendingConfirmationChange} />
      ) : (
        <SignUpFlow onSuccess={onSuccess} onPendingConfirmationChange={onPendingConfirmationChange} />
      )}

      {hasOffline && (
        <>
          <div className="auth-divider ob-auth-divider">or</div>
          <button
            className="auth-btn ob-auth-btn auth-offline-btn ob-offline-btn"
            onClick={onOffline}
            disabled={loadingGoogle}
            type="button"
          >
            <WifiOff size={16} />
            Continue offline
          </button>
        </>
      )}
    </div>
  );
};
