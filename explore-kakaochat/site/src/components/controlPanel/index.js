import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import ExplorerContext from '../../context/explorer.js';

import QueryPanel from './QueryPanel.js';
import Bookmark from './Bookmark.js';
import SearchResult from './SearchResult.js';

const Wrapper = styled.div`
  background: var(--color-light);
  box-shadow: 2px 4px 20px rgba(0,0,0,0.05) inset;
  padding: 32px;
  flex: 1;
  display: flex;
  justify-content: space-between;
  max-width: 920px;
`;

const Column = styled.div`
  width: ${ props => props.width || '50%' };
  height: 100%;
  overflow: hidden;
  display: inline-block;
  position: relative;
`;

const initQuery = {
  chat: '',
  user: '',
  date: '',
  useRegExp: false,
  useDateRange: '' ,
};

const initCursor = {
  cursors: [],
  head: 0,
  current: 0,
  tail: 0,
};

function ControlPanel() {

  const explorer = useContext( ExplorerContext );
  const [query, setQuery] = useState( initQuery );
  const [resultCursor, setResultCursor] = useState( initCursor );
  const [result, setResult] = useState([]);

  const getResultPreview = async cursor => {

    let previous = await explorer.getPreviousChat( cursor );
    previous = previous.invalid ? null : previous;
    
    let matched = {
      cursor: cursor,
      ...explorer.lineToObject( await explorer.getNextChat( cursor ))
    };

    let next = { 
      cursor: explorer.cursor,
      ...explorer.lineToObject( await explorer.getNextChat() )
    };
    next = next.invalid ? null : next;

    return { previous, matched, next };
  }

  const search = async e => {
    e.preventDefault();
    setResult([]);
    setResultCursor( initCursor );
    const isEmpty = ( query.chat + query.user + query.date ).length === 0;
    if( isEmpty ) {
      return;
    }

    const regexp = explorer.generateMobileQuery( query );
    const cursors = await explorer.searchAll( regexp );
    let previews = [];
    let tail = 0;
    for( let i=0; i < 5; i++ ) {
      if( cursors.length === i ) {
        break;
      }
      previews.push( await explorer.getWrappedChats( 1, cursors[i] ));
      tail = i;
    }

    setResultCursor({
      cursors,
      head: 0,
      current: 0,
      tail,
    });

    setResult( previews );
  };

  useEffect(() => {
    
  }, [resultCursor.current]);
  
  const [loading, setLoading] = useState(false);
  const [lastTop, setTop] = useState(0);
  const scrollSearchResult = e => {
    if( loading ) {
      return;
    }
    if( resultCursor.cursors.length <= resultCursor.tail ) {
      return;
    }
    const currentTop = e.target.scrollTop;
    const scrollDown = currentTop > lastTop;
    if( !scrollDown ) {
      return;
    }
    const view = e.target;
    const resultView = e.target.children[0];
    const bottomOfScroll = resultView.offsetHeight - view.offsetHeight * 1.2;
    if( currentTop <= bottomOfScroll ) {
      return;
    }

    const loadResult = async () => {
      const cursorsLength = resultCursor.cursors.length;
      let previews = [];
      let tail = resultCursor.tail + 1;
      for( let i=0; i < 3; i++ ) {
        if( tail >= cursorsLength ) {
          break;
        }
        previews.push( await explorer.getWrappedChats( 1, resultCursor.cursors[tail] ));
        tail++;
      }

      setResultCursor({
        ...resultCursor,
        tail
      });

      setResult([...result, ...previews]);
      setLoading( false );
    };
    setLoading( true );
    loadResult();
  };

  return (
    <Wrapper>
      <Column width={'320px'}>
        <QueryPanel query={query} setQuery={setQuery} search={search} />
        <Bookmark />
      </Column>
      <Column width={'472px'} onScroll={scrollSearchResult}>
        <SearchResult results={result} count={resultCursor.cursors.length} />
      </Column>
    </Wrapper>
  );
}

export default ControlPanel;
