"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AppMode, DoorType } from "@/lib/types";
import type { Theme } from "@/lib/theme";

interface AppContextValue {
  appMode: AppMode;
  userProfile: object | null;
  theme: Theme | null;
  currentIntent: object | null;
  currentCallId: string | null;
  selectedDoor: DoorType | null;
  setAppMode: (mode: AppMode) => void;
  setUserProfile: (profile: object | null) => void;
  setTheme: (theme: Theme | null) => void;
  setCurrentIntent: (intent: object | null) => void;
  setCurrentCallId: (callId: string | null) => void;
  setSelectedDoor: (door: DoorType | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>("calm");
  const [userProfile, setUserProfile] = useState<object | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [currentIntent, setCurrentIntent] = useState<object | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<DoorType | null>(null);

  const setAppMode = useCallback((mode: AppMode) => {
    setAppModeState(mode);
  }, []);

  const value: AppContextValue = {
    appMode,
    userProfile,
    theme,
    currentIntent,
    currentCallId,
    selectedDoor,
    setAppMode,
    setUserProfile,
    setTheme,
    setCurrentIntent,
    setCurrentCallId,
    setSelectedDoor,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
