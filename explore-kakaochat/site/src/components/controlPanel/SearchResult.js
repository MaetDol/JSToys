import React, { useContext } from 'react';
import styled from 'styled-components';

import KakaoInterfaceContext from '../../context/kakaoInterface.js';
import ExplorerContext from '../../context/explorer.js';

import Chat from '../kakaoInterface/Chat.js';
import Notify from '../kakaoInterface/Notify.js';
import ScrollWrapperElem from '../ScrollWrapper.js';
import ProgressBar from '../ProgressBar.js';

const Wrapper = styled.div`
  height: 100%;
  margin-left: 32px;
`;

const Row = styled.div`
`;

const ResultCount = styled.span`
  float: right;
`;

const ScrollWrapper = styled( ScrollWrapperElem )`
  height: calc( 100% - 1em - 8px);
  margin-top: 8px;
`;

const Results = styled.div`
  background: var(--text-dark-medium);
  padding: 24px;
  min-height: 100%;
`;

const Result = styled.div`
  cursor: pointer;
`;

const TranslucentChat = styled( Chat )`
  opacity: 0.5;
`;

function SearchResult({ results, count, progress }) {
  const explorer = useContext( ExplorerContext );
  const {navigateKakaoInterface} = useContext( KakaoInterfaceContext );
  const navigateTo = cursor => {
    navigateKakaoInterface({ cursor, count: 15 });
  };

  return (
    <Wrapper>
      <Row>
        <span>검색 결과</span>
        <ResultCount>총 {count}건</ResultCount>
      </Row>
      <ScrollWrapper>
        <Results>
          { progress !== -1 && (
            <>
              <p style={{color: 'var(--text-light)'}}>일치하는 채팅을 찾아내는중..</p>
              <ProgressBar progress={progress}/>
            </>
          )}
          { results.map(({ previous, current, next }, i) => (
            <Result key={current[0].cursor} onClick={() => navigateTo( current[0].cursor )}>
              <Notify text={current[0].timestamp} />
              { explorer.isChat( previous[0]?.type ) &&
              <TranslucentChat 
                name={previous[0].name}
                texts={previous[0].texts}
                timestamp={previous[0].timestamp}
                cursor={previous[0].cursor}
              />}
              <Chat 
                name={current[0].name}
                texts={current[0].texts}
                timestamp={current[0].timestamp}
                cursor={current[0].cursor}
              />
              { explorer.isChat( next[0]?.type ) &&
              <TranslucentChat 
                name={next[0].name}
                texts={next[0].texts}
                timestamp={next[0].timestamp}
                cursor={next[0].cursor}
              />}
            </Result>
          ))}
        </Results>
      </ScrollWrapper>
    </Wrapper>
  );
}


export default SearchResult;
