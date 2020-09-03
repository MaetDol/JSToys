import React, { createContext, useState } from 'react';

const KakaoInterfaceContext = createContext();

function KakaoInterfaceProvider({ children }) {

  const [loadedChats, setLoadedChats] = useState([]);
  const [loading, setLoading] = useState( false );
  const [scroll, setScroll] = useState(-1);
  const initNavigateData = {
    cursor: 0,
    count: 0
  };
  const [navigateInfo, navigateKakaoInterface] = useState( initNavigateData );
  const initNavigateInfo = () => navigateKakaoInterface( initNavigateData );
  
  const [bookmarks, setBookmarks] = useState([]);
  const toggleBookmark = bookmark => {
    const index = bookmarks.findIndex( b => b.cursor === bookmark.cursor );
    if( index !== -1 ) {
      setBookmarks([].concat(
        bookmarks.slice(0, index),
        bookmarks.slice(index+1, bookmarks.length)
      ));
    } else {
      setBookmarks([...bookmarks, bookmark]);
    }
  };

  const value = {
    loadedChats,
    loading,
    scroll,
    navigateInfo,
    bookmarks,

    setLoadedChats,
    setLoading,
    setScroll,
    navigateKakaoInterface,
    initNavigateInfo,
    toggleBookmark,
  };

  return (
    <KakaoInterfaceContext.Provider value={value}>
      {children}
    </KakaoInterfaceContext.Provider>
  );
}

export { KakaoInterfaceProvider };
export default KakaoInterfaceContext;
