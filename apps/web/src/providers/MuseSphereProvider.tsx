import { createContext, useContext, useCallback, ReactNode } from 'react';

interface MuseSphereContextType {
  isAiActive: boolean;
  setAiActive: (active: boolean) => void;
  onQuickAction: (action: string) => void;
  onDropContent: (content: string, type: 'text' | 'image' | 'url' | 'files') => void;
}

const MuseSphereContext = createContext<MuseSphereContextType | null>(null);

export interface MuseSphereProviderProps {
  children: ReactNode;
  isAiActive?: boolean;
  onQuickAction?: (action: string) => void;
  onDropContent?: (content: string, type: 'text' | 'image' | 'url' | 'files') => void;
}

export function MuseSphereProvider({ 
  children, 
  isAiActive = false, 
  onQuickAction,
  onDropContent 
}: MuseSphereProviderProps) {
  const handleQuickAction = useCallback((action: string) => {
    onQuickAction?.(action);
  }, [onQuickAction]);

  const handleDropContent = useCallback((content: string, type: 'text' | 'image' | 'url' | 'files') => {
    onDropContent?.(content, type);
  }, [onDropContent]);

  const setAiActive = useCallback((active: boolean) => {
    // Parent controls isAiActive via prop
  }, []);

  return (
    <MuseSphereContext.Provider
      value={{
        isAiActive,
        setAiActive,
        onQuickAction: handleQuickAction,
        onDropContent: handleDropContent,
      }}
    >
      {children}
    </MuseSphereContext.Provider>
  );
}

export function useMuseSphereContext() {
  const context = useContext(MuseSphereContext);
  if (!context) {
    throw new Error('useMuseSphereContext must be used within a MuseSphereProvider');
  }
  return context;
}