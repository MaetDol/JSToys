import React from 'react';
import styled from 'styled-components';

const Holder = styled.div`
  width: 100%;
  height: 8px;
  background: ${ props => props.background || 'white' };
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.1) inset,
              2px 2px 8px rgba(0,0,0,0.1);
`;
const Progress = styled.div`
  width: ${ props => props.percentage || 0 }%;
  height: 100%;
  background: ${ props => props.background || 'var(--text-dark)' };
  border-radius: 32px;
  box-shadow: 2px 1px 4px rgba(0,0,0,0.15);
  transition: width ease-out .1s;
`;


function ProgressBar({ progress }) {
  
  return (
    <Holder>
      <Progress percentage={progress} />
    </Holder>
  );
}

export default ProgressBar;
