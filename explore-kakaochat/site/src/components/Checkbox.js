import React, { useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as BlankCheckbox } from '../checkbox_blank.svg';
import { ReactComponent as CheckedCheckbox } from '../checkbox_checked.svg';

const CheckboxInput = styled.input`
  display: none;
`;

const WrapperLabel = styled.label`
  svg {
    vertical-align: bottom;
    margin-left: 8px;
  }
`;

function Checkbox({ onChange: toggleCallback, label, id, style }) {

  const [checked, setChecked] = useState(false);
  const toggle = e => {
    e.preventDefault();
    const state = !checked;
    setChecked( state );
    toggleCallback({
      target: {
        id: id,
        value: state,
      },
    });
  }

  return (
    <WrapperLabel onClick={toggle} style={style}>
      {label}
      <CheckboxInput 
        id={id}
        type={'checkbox'} 
        defaultChecked={checked}
      />
      { checked ? <CheckedCheckbox /> : <BlankCheckbox /> }
    </WrapperLabel>
  );
}

export default Checkbox;
