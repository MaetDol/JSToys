import React from 'react';
import styled from 'styled-components';

const ScrollWrapperElem = styled.div`
  width: calc( 100% + 17px );
  height: 100%;
  overflow-y: scroll;
`;

function ScrollWrapper({ className, children, onScroll=()=>0 }) {
  return (
    <ScrollWrapperElem 
      className={className}
      onScroll={onScroll}
    >
        { children }
    </ScrollWrapperElem>
  );
}

export default ScrollWrapper;
