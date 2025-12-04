import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

const AuthPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    try {
      setLoading(true);
      setError('');
      const data = await loginWithGoogle(response.credential);
      setAuth({ user: data.user, token: data.token });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-10 shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-semibold text-white">Harate</h1>
        <p className="text-slate-300">
          Private WhatsApp-like chat exclusively for&nbsp;
          <span className="font-semibold text-brand-primary">@sode-edu.in</span> accounts.
        </p>
        <div className="flex justify-center">
          <GoogleLogin
            width="260"
            onSuccess={handleSuccess}
            onError={() => setError('Google Sign-In failed.')}
            useOneTap
          />
        </div>
        {loading && <p className="text-sm text-slate-400">Signing you in...</p>}
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <p className="text-xs text-slate-500">
          We strictly block non @sode-edu.in accounts for security.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

