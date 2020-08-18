import React, { createContext, useState } from 'react';

const KakaoInterfaceContext = createContext();

function KakaoInterfaceProvider({ children }) {

  const [loadedChats, setLoadedChats] = useState([]);
  const [loading, setLoading] = useState( false );

  const value = {
    loadedChats,
    loading,
    setLoadedChats,
    setLoading,
  };

  return (
    <KakaoInterfaceContext.Provider value={value}>
      {children}
    </KakaoInterfaceContext.Provider>
  );
}

export { KakaoInterfaceProvider };
export default KakaoInterfaceContext;
