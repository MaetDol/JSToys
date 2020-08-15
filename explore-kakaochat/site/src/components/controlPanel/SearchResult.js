import React, { useContext } from 'react';
import styled from 'styled-components';
import ExplorerContext from '../../context/explorer.js';

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
  min-height: 100%;
`;

const TranslucentChat = styled( Chat )`
  opacity: 0.5;
`;

function SearchResult({ results, count }) {
  const explorer = useContext( ExplorerContext );

  return (
    <Wrapper>
      <Row>
        <span>검색 결과</span>
        <ResultCount>총 {count}건</ResultCount>
      </Row>
      <ScrollWrapper>
        <Results>
          { results.map(({ previous, current, next, cursor }, i) => (
            <div key={current[0].cursor+'#'}>
              <Notify text={current[0].timestamp} />
              { explorer.isChat( previous[0] ) &&
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
              { explorer.isChat( next[0] ) &&
              <TranslucentChat 
                name={next[0].name}
                texts={next[0].texts}
                timestamp={next[0].timestamp}
                cursor={next[0].cursor}
              />}
            </div>
          ))}
        </Results>
      </ScrollWrapper>
    </Wrapper>
  );
}


export default SearchResult;
