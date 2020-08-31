import React from 'react';
import styled from 'styled-components';

const Holder = styled.div`
  width: 80%;
  height: 16px;
  background: ${ props => props.background || 'white' };
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.1) inset;
`;
const Progress = styled.div`
  width: ${ props => props.percentage || 0 }%;
  height: 100%;
  background: ${ props => props.background || 'var(--color-point)' };
  border-radius: 32px;
  box-shadow: 2px 1px 4px rgba(0,0,0,0.15);
  transition: width ease-out .2s;
`;


function ProgressBar({ cursor, end }) {
  
  return (
    <Holder>
      <Progress percentage={ cursor / end * 100 } />
    </Holder>
  );
}

export default ProgressBar;
