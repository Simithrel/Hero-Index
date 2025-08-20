import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HeroAuthContext = createContext({ token: null, setToken: () => {} });

// context for the hero api
// persist a string in AsyncStorage under SUPERHERO_TOKEN

export const HeroAuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('SUPERHERO_TOKEN');
        if (saved) setTokenState(saved);
      } catch {}
    })();
  }, []);

  const setToken = (t) => {
    setTokenState(t);
    AsyncStorage.setItem('SUPERHERO_TOKEN', t).catch(() => {});
  };

  return (
    <HeroAuthContext.Provider value={{ token, setToken }}>
      {children}
    </HeroAuthContext.Provider>
  );
};

export const useHeroAuth = () => useContext(HeroAuthContext);
