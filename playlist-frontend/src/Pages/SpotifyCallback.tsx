import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAPI } from '../services/api';
import { Loader, CheckCircle, AlertCircle, Home } from 'lucide-react';
import Layout from '../components/Layout';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Spotify...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');

        console.log('🔄 Spotify callback received:', { code: !!code, error, state });

        if (error) {
          console.error('❌ Spotify authorization error:', error);
          setStatus('error');
          setMessage(`Spotify authorization failed: ${error}`);
          setTimeout(() => navigate('/'), 5000);
          return;
        }

        if (!code) {
          console.error('❌ No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from Spotify');
          setTimeout(() => navigate('/'), 5000);
          return;
        }

        console.log('📤 Sending code to backend...');
        // Send code to backend
        const response = await spotifyAPI.handleCallback(code);
        console.log('📥 Backend response:', response);
        
        if (response.success) {
          setStatus('success');
          setMessage('Successfully connected to Spotify!');
          setDetails(response.spotifyProfile);
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Failed to connect to Spotify');
          setTimeout(() => navigate('/'), 5000);
        }
      } catch (error: any) {
        console.error('❌ Callback handling error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to connect to Spotify');
        setTimeout(() => navigate('/'), 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="mb-6">
            {status === 'loading' && (
              <Loader className="w-16 h-16 text-primary animate-spin mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-text mb-4">
            {status === 'loading' && 'Connecting to Spotify...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-textSecondary mb-4">{message}</p>

          {/* Success Details */}
          {status === 'success' && details && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded p-3 mb-4">
              <div className="text-green-400 text-sm">
                <div>Connected as: <strong>{details.display_name}</strong></div>
                <div>Spotify ID: <strong>{details.id}</strong></div>
                {details.email && <div>Email: <strong>{details.email}</strong></div>}
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-background rounded-md hover:bg-secondary transition duration-300 flex items-center space-x-2 mx-auto"
          >
            <Home size={20} />
            <span>Return to App</span>
          </button>

          {/* Auto redirect countdown */}
          <p className="text-xs text-textSecondary mt-4">
            {status === 'success' ? 'Redirecting in 3 seconds...' : 'Redirecting in 5 seconds...'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SpotifyCallback;