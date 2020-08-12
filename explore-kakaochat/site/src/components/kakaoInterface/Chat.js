import React from 'react';
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

function Chat({ chats, name, className }) {

  chats = chats || [
    { 
      cursor: 1327,
      text: 'Qwerty',
      timestamp: '2019년 12월 9일 오전 5:32',
    },
    { 
      cursor: 1350,
      text: 'Qwerty qqq www erererty Very Longlong charaaaaaaacteeerrrrsss',
      timestamp: '2019년 12월 9일 오전 5:36',
    },
    { 
      cursor: 1390,
      text: 'Qwertyyyytt qwezds',
      timestamp: '2019년 12월 9일 오전 7:32',
    },
    { 
      cursor: 1465,
      text: 'Qwerty {\n\t\tsome words here\n};',
      timestamp: '2019년 12월 9일 오전 9:32',
    },
  ];

  name = name || '귀여운 어피치';
  const color = colorGenerator( name );

  return (
    <Wrapper className={className}>
      <Profile color={color}/>
      <AlignRight>
        <Username>{name}</Username>
        { chats.map( ({ text, timestamp, cursor }, i) => (
          <SpeechBubble 
            key={cursor*10+i}
            text={text}
            timestamp={timestamp}
          />
        ))}
      </AlignRight>
    </Wrapper>
  );
}

export default Chat;
