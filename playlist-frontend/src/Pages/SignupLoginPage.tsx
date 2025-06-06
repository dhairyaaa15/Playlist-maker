import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Lock, Headphones, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignupLoginPageProps {
  onLogin: () => void;
}

const SignupLoginPage: React.FC<SignupLoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const { login, register, loading, error } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (isLogin) {
      success = await login(formData.email, formData.password);
    } else {
      success = await register(formData.username, formData.email, formData.password);
    }

    if (success) {
      onLogin();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-surface">
        {/* Header Section */}
        <div
          className={`text-center mb-12 transform transition-all duration-1000 ${
            animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Headphones
            className="w-24 h-24 text-primary mx-auto mb-4 animate-spin-slow"
            style={{ animationDuration: '5s' }}
          />
          <h1 className="text-5xl font-bold text-text mb-2">Melody Maker</h1>
          <p className="text-xl text-textSecondary">Your AI-powered playlist generator</p>
        </div>

        {/* Form Section */}
        <div
          className={`bg-surface p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-1000 ${
            animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">
            {isLogin ? 'Welcome Back!' : 'Join the Melody'}
          </h2>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <User
                  className="absolute top-3 left-3 text-accent animate-bounce-short"
                  style={{ animationDuration: '1s' }}
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  required={!isLogin}
                  className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary text-inputText placeholder-inputPlaceholder transition-all duration-300 hover:shadow-crazy"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail
                className="absolute top-3 left-3 text-accent animate-wiggle"
                style={{ animationDuration: '1.5s' }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary text-inputText placeholder-inputPlaceholder transition-all duration-300 hover:shadow-crazy"
              />
            </div>
            
            <div className="relative">
              <Lock
                className="absolute top-3 left-3 text-accent animate-shake"
                style={{ animationDuration: '1s' }}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary text-inputText placeholder-inputPlaceholder transition-all duration-300 hover:shadow-crazy"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 transform font-semibold shadow-lg hover:shadow-crazy disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? 'Logging in...' : 'Signing up...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Login' : 'Sign Up'}</span>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-textSecondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              disabled={loading}
              className="ml-1 text-primary hover:text-secondary focus:outline-none font-semibold transition duration-300 transform hover:rotate-6 hover:scale-125 disabled:opacity-50"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignupLoginPage;