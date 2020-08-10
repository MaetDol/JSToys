import React from 'react';
import styled from 'styled-components';

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

function Bookmark({ bookmarks }) {

  bookmarks = bookmarks || [
    {
      cursor: 1320,
      text: '이거 되게 중요한 정보인데',
      timestamp: '2020년 3월 5일 오후 7:12',
    },
    {
      cursor: 1370,
      text: 'https://naver.com으로 가시면',
      timestamp: '2020년 3월 19일 오전 9:04',
    },
  ];

  return (
    <Wrapper>
      <span>북마크</span>
      <ScrollWrapper>
        <BookmarkElem>
          { bookmarks.map(({text, timestamp, cursor}) => (
            <BookmarkBubble
              key={cursor}
              text={text}
              timestamp={timestamp}
            />
          ))}
        </BookmarkElem>
      </ScrollWrapper>
    </Wrapper>
  );
}

export default Bookmark;
