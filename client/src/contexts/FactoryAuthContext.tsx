import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Factory } from "@shared/schema";

interface FactoryAuthContextType {
  factory: Factory | null;
  login: (factory: Factory) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const FactoryAuthContext = createContext<FactoryAuthContextType | undefined>(undefined);

export function FactoryAuthProvider({ children }: { children: ReactNode }) {
  const [factory, setFactory] = useState<Factory | null>(null);

  useEffect(() => {
    const savedFactory = localStorage.getItem("factoryAuth");
    if (savedFactory) {
      try {
        setFactory(JSON.parse(savedFactory));
      } catch {
        localStorage.removeItem("factoryAuth");
      }
    }
  }, []);

  const login = (factoryData: Factory) => {
    setFactory(factoryData);
    localStorage.setItem("factoryAuth", JSON.stringify(factoryData));
  };

  const logout = () => {
    setFactory(null);
    localStorage.removeItem("factoryAuth");
  };

  return (
    <FactoryAuthContext.Provider value={{ factory, login, logout, isLoggedIn: !!factory }}>
      {children}
    </FactoryAuthContext.Provider>
  );
}

export function useFactoryAuth() {
  const context = useContext(FactoryAuthContext);
  if (!context) {
    throw new Error("useFactoryAuth must be used within FactoryAuthProvider");
  }
  return context;
}
