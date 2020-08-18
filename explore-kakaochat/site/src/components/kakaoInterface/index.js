import React, { useContext, useState, useRef } from 'react';
import styled from 'styled-components';

import ExplorerContext from '../../context/explorer.js';

import Chat from './Chat.js';
import Notify from './Notify.js';
import ScrollWrapperElem from '../ScrollWrapper.js';
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

const ScrollWrapper = styled( ScrollWrapperElem )`
  height: calc( 100% - 72px );
`;

const ChatContainer = styled.article`
  position: relative;
  padding: 16px 24px 24px;
  width: 100%;
  box-sizing: border-box;
`;

function KakaoInterface({ chatRoomTitle, numberOfPeople }) {
  
  // placeholder
  chatRoomTitle = '웹코딩 STUDY방';
  numberOfPeople = 523;
  //

  const explorer = useContext( ExplorerContext );
  const [loadedChats, setLoadedChats] = useState([]);
  const [loading, setLoading] = useState( false );
  const loadContents = async counts => {
    setLoading( true );
    const chats = [...loadedChats];
    for( let i=0; i < counts; i++ ) {
      const chatObj = {
        cursor: explorer.fileCursor,
        ...explorer.parse( await explorer.getNextChat() )
      };
      chats.push( chatObj );
    }
    setLoadedChats( chats );
    setLoading( false );
  };

  const changeFile = async e => {
    const files = e.target.files;
    if( files.length !== 0 ) {
      explorer.file = files[0];
      await explorer.indexingDates();
      const cursors = Object.values( explorer.cursorByDates );
      const startPosition = cursors.sort((a,b) => a-b)[0];
      explorer.fileCursor = startPosition;
      await loadContents( 20 );
    }
  };

  const [lastChatOffset, setLastChatOffset] = useState(0);
  const updateLastChatOffsetCurrying = ref => {
    setLastChatOffset( ref.current.offsetTop );
  };

  const loadByScroll = e => {
    if( loading ) {
      return;
    }
    const scrollPosition = e.target.scrollTop + e.target.offsetHeight;
    if( scrollPosition > lastChatOffset ) {
      loadContents( 10 );
    }
  };

  return (
    <Frame>
      <Header>
        <div style={{position:'relative', width:'100%'}}>
          <label htmlFor={'fileInput'}>
            {chatRoomTitle}
         </label>
          <NumberOfPeople>
            {numberOfPeople}
          </NumberOfPeople>
          <HamburgerIcon />
        </div>
      </Header>
      <ScrollWrapper onScroll={loadByScroll}>
        <ChatContainer>
          { loadedChats.map(({ texts, name, timestamp, cursor, type }, idx ) => {
            if( explorer.isChat( type )) {
              return (
                <Chat 
                  texts={texts}
                  name={name}
                  timestamp={timestamp}
                  cursor={cursor}
                  key={cursor}
                  onMount={updateLastChatOffsetCurrying}
                />);
            } else if( explorer.isSystemMessage( type )) {
              return <Notify key={cursor} text={texts.join('\n')} />;
            } else if( explorer.isTimestamp( type )) {
              return <Notify key={cursor} text={timestamp} />;
            }
          })}
        </ChatContainer>
      </ScrollWrapper>
      <input 
        id={'fileInput'} 
        type={'file'} 
        accept={'txt'} 
        hidden={true}
        onChange={changeFile}
      />
    </Frame>
  );
}

export default KakaoInterface;
