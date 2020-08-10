import React from 'react';
import styled from 'styled-components';

import Chat from '../kakaoInterface/Chat.js';
import Notify from '../kakaoInterface/Notify.js';

const Wrapper = styled.div`
  height: 100%;
  margin-left: 32px;
`;

const Row = styled.div`
`;

const ResultCount = styled.span`
  float: right;
`;

const ScrollWrapper = styled.div`
  width: calc( 100% + 17px );
  height: calc( 100% - 1em - 8px);
  margin-top: 8px;
  overflow-y: scroll;
`;

const Results = styled.div`
  background: var(--text-dark-medium);
  padding: 24px;
  height: 100%;
`;

const TranslucentChat = styled( Chat )`
  opacity: 0.5;
`;

function SearchResult({ results }) {

  results = results || [
    {
      previous: {
        name: '말 많은 라이언',
        cursor: 1307,
        text: 'Qwerty',
        timestamp: '2019년 12월 9일 오전 5:32',
      },
      matched: {
        name: '귀여운 어피치',
        cursor: 1327,
        text: '이게 메인 텍스트!',
        timestamp: '2019년 12월 9일 오전 5:34',
      },
      next: {
        name: '귀여운 어피치',
        cursor: 1377,
        text: '이건 다음 텍스트!',
        timestamp: '2019년 12월 9일 오전 5:39',
      },
    },
    {
      previousa: {
        name: '삼이',
        cursor: 1407,
        text: '너어는 정말',
        timestamp: '2019년 12월 10일 오전 5:32',
      },
      matched: {
        name: '멍한 무지',
        cursor: 1427,
        text: '퇴사하고 싶다..',
        timestamp: '2019년 12월 10일 오전 5:34',
      },
      next: {
        name: '귀여운 어피치',
        cursor: 1477,
        text: '어 너두?',
        timestamp: '2019년 12월 10일 오전 5:39',
      },
    }
  ];

  return (
    <Wrapper>
      <Row>
        <span>검색 결과</span>
        <ResultCount>총 {results.length}건</ResultCount>
      </Row>
      <ScrollWrapper>
        <Results>
          { results.map(({ previous, matched, next }) => (
            <div key={matched.cursor}>
              <Notify text={matched.timestamp} />
              { previous &&
              <TranslucentChat 
                chats={[previous]}
                name={previous.name}
              />}
              <Chat 
                chats={[matched]}
                name={matched.name}
              />
              { next &&
              <TranslucentChat 
                chats={[next]}
                name={next.name}
              />}
            </div>
          ))}
        </Results>
      </ScrollWrapper>
    </Wrapper>
  );
}


export default SearchResult;
