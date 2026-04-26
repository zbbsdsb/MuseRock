import React, { useState } from 'react';
import { oasisAuthService } from '../services/oasisAuth';
import { Loader2 } from 'lucide-react';

interface ContinueWithOasisButtonProps {
  scope?: string;
  onError?: (error: Error) => void;
  className?: string;
}

export function ContinueWithOasisButton({
  scope = 'profile email',
  onError,
  className = '',
}: ContinueWithOasisButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const authUrl = await oasisAuthService.getAuthorizationUrl(scope);
      window.location.href = authUrl;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Error initiating Oasis authorization:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-3 px-5 py-3 bg-black text-white rounded-xl transition-all duration-300 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      style={{
        minHeight: '40px',
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontWeight: 500,
      }}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <img 
          src="https://oasisbio.com/assets/oasis_logo.svg" 
          width="20" 
          height="17" 
          alt="Oasis" 
          style={{ minWidth: '16px', minHeight: '14px' }}
        />
      )}
      {isLoading ? 'Connecting...' : 'Continue with Oasis'}
    </button>
  );
}

export default ContinueWithOasisButton;