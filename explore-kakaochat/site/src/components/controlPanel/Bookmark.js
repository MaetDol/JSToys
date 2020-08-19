import React, { useContext } from 'react';
import styled from 'styled-components';
import KakaoInterfaceContext from '../../context/kakaoInterface.js';

import SpeechBubble from '../kakaoInterface/SpeechBubble.js';

const Wrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
`;

const ScrollWrapper = styled.div`
  width: calc( 100% + 17px );
  max-height: 480px;
  overflow-y: scroll;
  margin-top: 8px;
`;

const BookmarkElem = styled.div`
  background: white;
  padding: 8px;
  min-height: 320px;
`;

const BookmarkBubble = styled( SpeechBubble )`
  span {
    background: var(--text-light-medium);
  }
  time {
    color: var(--text-dark-medium);
  }
`;

const ClickWrapper = styled.div`
  cursor: pointer;
`;

function Bookmark() {

  const {navigateKakaoInterface, bookmarks} = useContext( KakaoInterfaceContext );
  const navigateTo = cursor => {
    navigateKakaoInterface({ cursor, count: 15 });
  };

  return (
    <Wrapper>
      <span>북마크</span>
      <ScrollWrapper>
        <BookmarkElem>
          { bookmarks.map(({text, timestamp, cursor}) => (
            <ClickWrapper
              onClick={() => navigateTo( cursor )}
              key={cursor}
            >
              <BookmarkBubble
                text={text}
                timestamp={timestamp}
                cursor={cursor}
              />
            </ClickWrapper>
          ))}
        </BookmarkElem>
      </ScrollWrapper>
    </Wrapper>
  );
}

export default Bookmark;
