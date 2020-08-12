import React from 'react';
import styled from 'styled-components';
import './index.css';

import ExplorerProvider from './context/explorer.js';

import KakaoInterface from './components/kakaoInterface';
import ControlPanel from './components/controlPanel';

import FileManager from './lib/fileManager.js';
import ExploreManager from './lib/exploreManager.js';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  max-width: 1520px;
  justify-content: space-between;
  margin: auto;
`;

const fileManager = new FileManager();
const exploreManager = new ExploreManager( fileManager );

function App() {
  return (
    <ExplorerProvider.Provider value={exploreManager}>
      <Wrapper>
        <KakaoInterface />
        <ControlPanel />
      </Wrapper>
    </ExplorerProvider.Provider>
  );
}

export default App;
