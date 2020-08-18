import React from 'react';
import styled from 'styled-components';
import './index.css';

import { ExplorerProvider } from './context/explorer.js';
import AppProvider from './context/appContext.js';

import KakaoInterface from './components/kakaoInterface';
import ControlPanel from './components/controlPanel';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  max-width: 1520px;
  justify-content: space-between;
  margin: auto;
`;

function App() {
  return (
    <ExplorerProvider>
        <Wrapper>
          <KakaoInterface />
          <ControlPanel />
        </Wrapper>
    </ExplorerProvider>
  );
}

export default App;
