import React, { createContext, useState } from 'react';

const KakaoInterfaceContext = createContext();

function KakaoInterfaceProvider({ children }) {

  const [loadedChats, setLoadedChats] = useState([]);
  const [loading, setLoading] = useState( false );
  const [scroll, setScroll] = useState(-1);

  const value = {
    loadedChats,
    loading,
    scroll,
    setLoadedChats,
    setLoading,
    setScroll,
  };

  return (
    <KakaoInterfaceContext.Provider value={value}>
      {children}
    </KakaoInterfaceContext.Provider>
  );
}

export { KakaoInterfaceProvider };
export default KakaoInterfaceContext;
