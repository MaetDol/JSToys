import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import colorGenerator from '../../lib/colorGenerator.js';

import SpeechBubble from './SpeechBubble';
import { ReactComponent as ProfileSvg } from '../../profile.svg';

const Wrapper = styled.div`
`;

const Profile = styled( ProfileSvg )`
  fill: ${ props => props.color };
  margin-right: 8px;
  vertical-align: top;
  opacity: 0.7;
`;

const Username = styled.span`
  color: var(--text-light);
  display: inline-block;
  margin-bottom: 8px;
`;

const AlignRight = styled.div`
  width: calc(100% - 64px);
  margin: 0;
  display: inline-block;
`;

function Chat({ texts, name, timestamp, cursor, className, onMount=()=>{} }) {

  const ref = useRef(null);
  const color = colorGenerator( name );
  useEffect( () => {
    onMount( ref );
  }, []);

  return (
    <Wrapper className={className} ref={ref}>
      <Profile color={color}/>
      <AlignRight>
        <Username>{name}</Username>
        <SpeechBubble 
          text={texts.join('\n')}
          timestamp={timestamp}
        />
      </AlignRight>
    </Wrapper>
  );
}

export default Chat;
