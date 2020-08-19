import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  min-height: 24px;
  width: fit-content;
  padding: 4px 16px;
  background: var(--text-dark);
  border-radius: 14px;
  color: var(--text-light);
  position: relative;
  left: 50%;
  margin: 16px 0;
  transform: translateX(-50%);
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
`;

function Notify({ text }) {
  return (
    <Wrapper>
      {text}
    </Wrapper>
  );
}

export default Notify;
