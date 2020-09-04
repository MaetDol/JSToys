import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';

import ExplorerContext from '../../context/explorer.js';
import KakaoInterfaceContext from '../../context/kakaoInterface.js';

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
  const {
    loadedChats, setLoadedChats,
    scroll, setScroll,
    navigateInfo, initNavigateInfo,
  } = useContext( KakaoInterfaceContext );

  const changeFile = async e => {
    const files = e.target.files;
    if( files.length !== 0 ) {
      explorer.file = files[0];
      await explorer.indexingDates();
      const cursors = Object.values( explorer.cursorByDates );
      const startPosition = cursors.sort((a,b) => a-b)[0];
      explorer.fileCursor = startPosition;
      setLoadedChats( await explorer.getParsedChats('NEXT', 20) );
    }
  };

  const loadByScroll = e => {
    if( explorer.isReading ) {
      return;
    }
    const scrollBottom = e.target.scrollTop + e.target.offsetHeight;
    const chatContainerHeight = e.target.children[0].offsetHeight;
    const isScrollEnd = scrollBottom * 1.3 > chatContainerHeight;
    if( isScrollEnd ) {
      explorer.getParsedChats('NEXT', 10).then( chats => {
        setLoadedChats([
          ...loadedChats,
          ...chats
        ]);
      });
    }
  };
  
  const scrollRef = useRef( null );
  useEffect(() => {
    if( scroll >= 0 ) {
      scrollRef.current.scrollTop = scroll;
      setScroll(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll]);

  const scrollTo = ({ current: elem }) => {
    const parentHeight = elem.parentElement.parentElement.offsetHeight;
    const refHeight = elem.offsetHeight;
    let scrollTop = elem.offsetTop + refHeight / 2 - parentHeight / 2;
    scrollTop = scrollTop < 0 ? 0 : scrollTop;

    setScroll( scrollTop );
  };

  useEffect(() => {
    if( navigateInfo.count > 0 ) {
      const { count, cursor } = navigateInfo;
      explorer.getWrappedChats( count, cursor )
        .then(({ previous, current, next }) => {
          current[0].onMount = scrollTo;
          setLoadedChats([]);
          setLoadedChats([...previous, ...current, ...next]);
          initNavigateInfo();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateInfo]);


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
      <ScrollWrapper onScroll={loadByScroll} ref={scrollRef}>
        <ChatContainer>
          { loadedChats.map(({ texts, name, timestamp, cursor, type, onMount }, idx ) => {
            if( explorer.isChat( type )) {
              return (
                <Chat 
                  texts={texts}
                  name={name}
                  timestamp={timestamp}
                  cursor={cursor}
                  key={cursor}
                  onMount={onMount}
                />);
            } else if( explorer.isSystemMessage( type )) {
              return <Notify key={cursor} text={texts.join('\n')} />;
            } else if( explorer.isTimestamp( type )) {
              return <Notify key={cursor} text={timestamp} />;
            }
            return null;
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
