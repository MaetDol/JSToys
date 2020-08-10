import React from 'react';
import styled from 'styled-components';

import Chat from './Chat.js';
import Notify from './Notify.js';
import { ReactComponent as HamburgerSvg } from '../../menu.svg';

const Frame = styled.div`
  width: 440px;
  background: var(--color-dark);
  box-shadow: 2px 4px 16px rgba(0,0,0,0.25);
  overflow: hidden;
`;

const Header = styled.header`
  width: 100%;
  position: relative;
  height: 72px;
  background: var(--color-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  color: var(--text-dark);
  font-weight: bold;
`;

const NumberOfPeople = styled.span`
  color: var(--text-dark);
  margin-left: 8px;
  opacity: 0.4;
`;

const HamburgerIcon = styled( HamburgerSvg )`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`;

const ChatContainer = styled.article`
  position: relative;
  padding: 16px 24px 24px;
  overflow-y: scroll;
  width: calc(100% + 17px);
  height: 100%;
  box-sizing: border-box;
`;

function KakaoInterface({ chatRoomTitle, numberOfPeople }) {
  
  chatRoomTitle = '웹코딩 STUDY방';
  numberOfPeople = 523;

  return (
    <Frame>
      <Header>
        <div style={{position:'relative', width:'100%'}}>
          {chatRoomTitle}
          <NumberOfPeople>
            {numberOfPeople}
          </NumberOfPeople>
          <HamburgerIcon />
        </div>
      </Header>
      <ChatContainer>
        <Notify text={'2020. 08. 07. 월'}/>
        <Chat/>
        <Chat/>
        <Chat/>
        <Chat/>
        <Chat/>
      </ChatContainer>
    </Frame>
  );
}

export default KakaoInterface;
