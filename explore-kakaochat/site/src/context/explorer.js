import React, { createContext, useState } from 'react';
import FileManager from '../lib/fileManager.js';
import ExploreManager from '../lib/exploreManager.js';

const fileManager = new FileManager();
const exploreManager = new ExploreManager( fileManager );
const ExploreContext = createContext();

const ExplorerProvider = ({ children }) => {

  return (
    <ExploreContext.Provider value={{explorer: exploreManager}}>
      {children}
    </ExploreContext.Provider>
  );
};

const { Consumer: ExploreConsumer } = ExploreContext;

export { ExplorerProvider, ExploreConsumer };
export default ExploreContext;
