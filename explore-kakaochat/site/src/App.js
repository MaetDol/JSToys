import React from 'react';
import styled from 'styled-components';
import './index.css';

import { ExplorerProvider } from './context/explorer.js';
import { KakaoInterfaceProvider } from './context/kakaoInterface.js';

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
    <KakaoInterfaceProvider>
      <ExplorerProvider>
          <Wrapper>
            <KakaoInterface />
            <ControlPanel />
          </Wrapper>
      </ExplorerProvider>
    </KakaoInterfaceProvider>
  );
}

export default App;
