import React, { createContext } from 'react';
import FileManager from '../lib/fileManager.js';
import ExploreManager from '../lib/exploreManager.js';

const fileManager = new FileManager();
const exploreManager = new ExploreManager( fileManager );
const ExplorerContext = createContext();

const ExplorerProvider = ({ children }) => {

  return (
    <ExplorerContext.Provider value={{explorer: exploreManager}}>
      {children}
    </ExplorerContext.Provider>
  );
};

const { Consumer: ExploreConsumer } = ExplorerContext;

export { ExplorerProvider, ExploreConsumer };
export default ExplorerContext;
