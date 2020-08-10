import React from 'react';
import styled from 'styled-components';

import QueryPanel from './QueryPanel.js';
import Bookmark from './Bookmark.js';
import SearchResult from './SearchResult.js';

const Wrapper = styled.div`
  background: var(--color-light);
  box-shadow: 2px 4px 20px rgba(0,0,0,0.05) inset;
  padding: 32px;
  flex: 1;
  display: flex;
  justify-content: space-between;
  max-width: 920px;
`;

const Column = styled.div`
  width: ${ props => props.width || '50%' };
  height: 100%;
  overflow: hidden;
  display: inline-block;
  position: relative;
`;

function ControlPanel() {
  
  return (
    <Wrapper>
      <Column width={'320px'}>
        <QueryPanel />
        <Bookmark />
      </Column>
      <Column width={'472px'}>
        <SearchResult />
      </Column>
    </Wrapper>
  );
}

export default ControlPanel;
