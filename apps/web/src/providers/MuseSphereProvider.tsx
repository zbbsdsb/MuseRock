import { createContext, useContext, useCallback, ReactNode } from 'react';

interface MuseSphereContextType {
  isAiActive: boolean;
  setAiActive: (active: boolean) => void;
  onQuickAction: (action: string) => void;
}

const MuseSphereContext = createContext<MuseSphereContextType | null>(null);

export interface MuseSphereProviderProps {
  children: ReactNode;
  isAiActive?: boolean;
  onQuickAction?: (action: string) => void;
}

export function MuseSphereProvider({ children, isAiActive = false, onQuickAction }: MuseSphereProviderProps) {
  const handleQuickAction = useCallback((action: string) => {
    onQuickAction?.(action);
  }, [onQuickAction]);

  const setAiActive = useCallback(() => {
    // Placeholder - parent controls isAiActive via prop
  }, []);

  return (
    <MuseSphereContext.Provider
      value={{
        isAiActive,
        setAiActive,
        onQuickAction: handleQuickAction
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
