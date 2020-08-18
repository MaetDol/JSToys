import React, { createContext } from 'react';
import FileManager from '../lib/fileManager.js';
import ExploreManager from '../lib/exploreManager.js';

const fileManager = new FileManager();
const exploreManager = new ExploreManager( fileManager );
const ExplorerContext = createContext();

function ExplorerProvider({ children }) {
  return (
    <ExplorerContext.Provider value={exploreManager}>
      {children}
    </ExplorerContext.Provider>
  );
}

export {ExplorerProvider};
export default ExplorerContext;
