import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 16px 0;
  display: block;
`;

const InputElem = styled.input`
  background: white;
  width: 100%;
  height: 48px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  border: 2px solid transparent;
  padding-left: 8px;
  margin: 8px 0;
  &:focus {
    border: 2px solid var(--text-dark);
  }
`;

function Input({ label, id, placeholder, children }) {

  return (
    <Wrapper>
      { label && (
        <label htmlFor={id}>
          <span>{label}</span>
        </label>
      )}
      {children}
      <InputElem id={id} placeholder={placeholder} />
    </Wrapper>
  );
}

export default Input;
