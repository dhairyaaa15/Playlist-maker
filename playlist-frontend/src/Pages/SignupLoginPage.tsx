import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Lock, Headphones } from 'lucide-react';

interface SignupLoginPageProps {
  onLogin: () => void;
}

const SignupLoginPage: React.FC<SignupLoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <User
                  className="absolute top-3 left-3 text-accent animate-bounce-short"
                  style={{ animationDuration: '1s' }}
                />
                <input
                  type="text"
                  placeholder="Username"
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
                placeholder="Email"
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
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary text-inputText placeholder-inputPlaceholder transition-all duration-300 hover:shadow-crazy"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 transform font-semibold shadow-lg hover:shadow-crazy"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-textSecondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:text-secondary focus:outline-none font-semibold transition duration-300 transform hover:rotate-6 hover:scale-125"
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