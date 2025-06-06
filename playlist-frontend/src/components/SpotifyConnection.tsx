import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, CheckCircle, AlertCircle, Loader, RefreshCw, Eye } from 'lucide-react';
import { spotifyAPI } from '../services/api';

const SpotifyConnection: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spotifyData, setSpotifyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await spotifyAPI.getStatus();
      
      console.log('🔍 Full Spotify status response:', response);
      console.log('🔗 Is connected:', response.isConnected);
      console.log('🆔 Spotify ID:', response.spotifyId);
      
      setIsConnected(response.isConnected);
      setSpotifyData(response);
    } catch (error: any) {
      console.error('❌ Error checking Spotify status:', error);
      setError('Failed to check Spotify connection status');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectToSpotify = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Requesting Spotify auth URL...');
      const response = await spotifyAPI.getAuthUrl();
      console.log('🔗 Auth URL response:', response);
      
      if (response.success && response.authUrl) {
        console.log('✅ Redirecting to Spotify auth:', response.authUrl);
        // Redirect to Spotify auth
        window.location.href = response.authUrl;
      } else {
        setError('Failed to get Spotify authorization URL');
      }
    } catch (error: any) {
      console.error('❌ Error connecting to Spotify:', error);
      setError('Failed to connect to Spotify');
    } finally {
      setLoading(false);
    }
  };

  const disconnectSpotify = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔌 Disconnecting from Spotify...');
      const response = await spotifyAPI.disconnect();
      console.log('✅ Disconnect response:', response);
      
      setIsConnected(false);
      setSpotifyData(null);
    } catch (error: any) {
      console.error('❌ Error disconnecting Spotify:', error);
      setError('Failed to disconnect Spotify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-lg border border-inputBorder">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Music className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-text">Spotify Integration</h3>
            <p className="text-sm text-textSecondary">
              {isConnected 
                ? `✅ Connected to Spotify ${spotifyData?.spotifyId ? `(${spotifyData.spotifyId})` : ''}` 
                : '❌ Connect to create playlists in Spotify'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Debug Toggle */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            title="Toggle Debug Info"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Refresh Status Button */}
          <button
            onClick={checkSpotifyStatus}
            disabled={loading}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Connection Status and Action Button */}
          {isConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={disconnectSpotify}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center space-x-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              onClick={connectToSpotify}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span>Connect to Spotify</span>
            </button>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-xs font-mono text-gray-300">
          <div className="mb-2 font-semibold text-white">🔍 Debug Information:</div>
          <div>Connected: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>{String(isConnected)}</span></div>
          <div>Spotify ID: <span className="text-blue-400">{spotifyData?.spotifyId || 'null'}</span></div>
          <div>Loading: <span className="text-yellow-400">{String(loading)}</span></div>
          <div>Error: <span className="text-red-400">{error || 'null'}</span></div>
          <div className="mt-2">
            <div className="text-white">Full Response:</div>
            <pre className="text-xs overflow-x-auto bg-gray-900 p-2 rounded mt-1">
              {JSON.stringify(spotifyData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-sm text-red-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Connection Instructions */}
      {!isConnected && !loading && (
        <div className="mt-3 p-2 bg-blue-500 bg-opacity-20 border border-blue-500 rounded text-xs text-blue-400">
          <strong>Note:</strong> Connecting to Spotify will allow you to create actual playlists in your Spotify account.
        </div>
      )}

      {/* Success Instructions */}
      {isConnected && (
        <div className="mt-3 p-2 bg-green-500 bg-opacity-20 border border-green-500 rounded text-xs text-green-400">
          <strong>✅ Ready!</strong> You can now create playlists directly in your Spotify account after saving them.
        </div>
      )}
    </div>
  );
};

export default SpotifyConnection;