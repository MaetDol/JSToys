class ExplorManager {
  constructor( fileManager ) {
    this.fileManager = fileManager;
    this.exitSearch = false;
    this.cursorByDates = {};

    this.MOBILE_TIMESTAMP_FORM = `\\d{4}년 \\d{1,2}월 \\d{1,2}일 오(전|후) \\d{1,2}:\\d{2}`;
    this.MOBILE_TIMESTAMP_REGEX = new RegExp( this.MOBILE_TIMESTAMP_FORM );
  }

  set fileCursor( pos ) {
    this.fileManager.cursor = pos;
  }

  get fileCursor() { 
    return this.fileManager.cursor;
  }

  set fileManager( fileManager ) {
    this.fm = fileManager;
  }

  get fileManager() {
    return this.fm;
  }

  escapeRegExp( str ) {
    return str.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&').replace(/\n/g,'\\n');
  }

  generateMobileQuery({ timestamp={}, user='', chat='', useRegExp=false }={}) {
    let {
      year = '\\d{4}', 
      month = '\\d{1,2}', 
      date = '\\d{1,2}',
      amOrPm = '오(전|후)',
      hour = '\\d{1,2}',
      minute = '\\d{2}',
    } = timestamp;

    if( !useRegExp ) {
      chat = this.escapeRegExp( chat );
    }
    let withoutTimestamp = '';
    if( chat ) {
      withoutTimestamp = `|(.*\\n(?!${this.MOBILE_TIMESTAMP_FORM}))+.*${chat}`;
    }

    if( user ) {
      user = this.escapeRegExp( user );
    } else {
      user = '[^:\\n]+';
    }

    return new RegExp(
      `^${year}년 ${month}월 ${date}일 ${amOrPm} ${hour}:${minute}, `
      + `${user} : (.*${chat}${withoutTimestamp})`,
      'm'
    );
  }
  
  async searchAll( query ) {
    this.fileCursor = 0;
    let results = [];
    while( true ) {
      const matched = await this.fileManager.search( query );
      const isEnd = matched === null || this.exitSearch;
      if( isEnd ) {
        return results;
      }
      results.push( matched.position );
    }
  }

  async search( query ) {
    return await this.fileManager.search( query );
  }

  async readlines( n, isReverse, cursor=null ) {
    this.fileCursor = cursor ?? this.fileCursor;
    let index = 0;
    let readline = this.fileManager.nextLine.bind( this.fileManager );
    let isOutOfIndex = i => i >= n;
    let nextIndex = i => i +1;

    if( isReverse ) {
      readline = this.fileManager.previousLine.bind( this.fileManager );
      isOutOfIndex = i => i < 0;
      index = n -1;
      nextIndex = i => i -1;
    }

    const lines = [];
    while( !isOutOfIndex( index ) ) {
      const line = await readline();
      if( line === null ) {
        return null;
      }
      lines[index] = line;
      index = nextIndex( index );
    }
    return this.decodeLines( lines );
  }

  isMobileChat( line ) {
    return this.MOBILE_TIMESTAMP_REGEX.test( line );
  }

  async getNextChat( cursor ) {
    let line = await this.getNextLines( 1, cursor );
    let chat = [line[0]];
    let lastCursor = this.fileCursor;
    while( true ) {
      line = await this.getNextLines( 1 );
      if( line === null ) {
        break;
      }
      if( this.isMobileChat( line )) {
        this.fileCursor = lastCursor;
        return chat;
      }
      lastCursor = this.fileCursor;
      chat.push( line[0] );
    }

    return chat;
  }

  async getPreviousChat( cursor ) {
    await this.getPreviousLines( 0, cursor );
    let chat = [];
    while( true ) {
      const line = await this.getPreviousLines( 1 );
      if( line === null ) {
        return chat;
      }
      chat.unshift( line[0] );
      if( this.isMobileChat( line[0] )) {
        return chat;
      }
    }
    return chat;
  }

  async getPreviousLines( n, cursor ) {
    return await this.readlines( n, true, cursor );
  }

  async getNextLines( n, cursor ) {
    return await this.readlines( n, false, cursor );
  }

  async getWrappedLines( n, cursor=this.fileCursor ) {

    const previousLines = await this.getPreviousLines( n, cursor );
    const startCursor = this.fileCursor;

    const nextLines = await this.getNextLines( n, cursor );
    const endCursor = this.fileCursor;

    this.fileCursor = cursor;

    return {
      previousLines,
      nextLines,
      cursor: {
        start: startCursor,
        end: endCursor,
      }
    };
  }

  decodeLines( lines ) {
    return lines.map( l => this.fileManager.decodeUint8( l ) );
  }


  async indexingDates() {
    const dateRegExp = new RegExp(
      `\\n${this.MOBILE_TIMESTAMP_FORM}\\s\\n`
    );
    const positions = await this.searchAll( dateRegExp );
    for( let i=0; i < positions.length; i++ ) {
      const timestamp = await this.getNextLines( 1, positions[i] );
      const dateOnly = timestamp[0].split(/ (?=오)/)[0];
      this.cursorByDates[dateOnly] = positions[i];
    }
  }
}
