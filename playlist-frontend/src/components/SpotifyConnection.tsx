import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, CheckCircle, AlertCircle, Loader, RefreshCw, X } from 'lucide-react';
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
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">Spotify Integration</h3>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? ' text-green-400' 
                  : ' text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              {isConnected && spotifyData?.spotifyId && (
                <span className="text-xs text-gray-400 truncate">
                  {spotifyData.spotifyId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Refresh Button */}
          <button
            onClick={checkSpotifyStatus}
            disabled={loading}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Main Action Button */}
          {isConnected ? (
            <button
              onClick={disconnectSpotify}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span className="hidden sm:inline">Disconnect</span>
              <span className="sm:hidden">Disconnect</span>
            </button>
          ) : (
            <button
              onClick={connectToSpotify}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Connect to Spotify</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Status Information */}
      {!isConnected && !loading && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-400 leading-relaxed">
                <span className="font-medium">Connect your Spotify account</span> to create and save playlists directly to your music library.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Information */}
      {isConnected && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-400 leading-relaxed">
                <span className="font-medium">Successfully connected!</span> Your generated playlists can now be saved directly to your Spotify account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {showDebug && (
        <div className="mt-4 p-4 bg-slate-900/50 border border-slate-600/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Debug Information</h4>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Connected:</span>{' '}
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {String(isConnected)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Loading:</span>{' '}
                <span className="text-yellow-400">{String(loading)}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400">Spotify ID:</span>{' '}
                <span className="text-blue-400 break-all">{spotifyData?.spotifyId || 'null'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400">Error:</span>{' '}
                <span className="text-red-400 break-all">{error || 'null'}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-gray-400 mb-2">Full Response:</div>
              <div className="bg-slate-900/70 p-3 rounded border border-slate-700/30 overflow-x-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
                  {JSON.stringify(spotifyData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Toggle (Hidden by default, uncomment to enable) */}
      {/* 
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center space-x-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>{showDebug ? 'Hide' : 'Show'} Debug Info</span>
        </button>
      </div>
      */}
    </div>
  );
};

export default SpotifyConnection;