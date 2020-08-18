export default class ExplorManager {
  constructor( fileManager ) {
    this.fileManager = fileManager;
    this.exitSearch = false;
    this.cursorByDates = {};

    this.MOBILE_TIMESTAMP_FORM = `\\d{4}년 \\d{1,2}월 \\d{1,2}일 오. \\d{1,2}:\\d{2}`;
    this.MOBILE_TIMESTAMP_REGEX = new RegExp( this.MOBILE_TIMESTAMP_FORM );
    this.chatType = {};
    this.chatType.CHAT = 0;
    this.chatType.SYSTEM_MESSAGE = 1;
    this.chatType.TIMESTAMP = 2;
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

  set file( file ) {
    this.fileManager.file = file;
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

  async getWrappedChats( n, cursor=this.fileCursor ) {

    this.fileCursor = cursor;
    const previous = [];
    for( let i=0; i < n; i++ ) {
      const chat = await this.getPreviousChat()
      const chatObject = this.parse( chat );
      chatObject.cursor = this.fileCursor;
      previous.unshift( chatObject );
    }

    const currentChat = await this.getNextChat( cursor );
    const current = this.parse( currentChat );
    current.cursor = cursor;

    const next = [];
    for( let i=0; i < n; i++ ) {
      const chat = await this.getNextChat();
      const chatObject = this.parse( chat );
      chatObject.cursor = this.fileCursor;
      next.push( chatObject );
    }

    return {
      previous,
      current: [current],
      next,
    };
  }

  decodeLines( lines ) {
    return lines.map( l => this.fileManager.decodeUint8( l ) );
  }

  parse( lines ) {
    const regex = new RegExp(`(${this.MOBILE_TIMESTAMP_FORM})(, ((.+) : )?(.+))?`);
    let matched = lines[0].match( regex );
    // Invalid format
    if( matched === null ) {
      return {
        type: -1
      };
    }
    lines.shift();
    const dataset = {
      timestamp: matched[1]
    };
    // Timestamp only
    if( matched[5] === undefined ) {
      dataset.type = this.chatType.TIMESTAMP;
    }
    // System message
    else if( matched[4] === undefined ) {
      dataset.texts = [matched[5], ...lines];
      dataset.type = this.chatType.SYSTEM_MESSAGE;
    }
    // User chat
    else if( matched[3] && matched[4] ) {
      dataset.name = matched[4];
      dataset.texts = [matched[5], ...lines];
      dataset.type = this.chatType.CHAT;
    }

    return dataset;
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

  isChat( type ) {
    return type === this.chatType.CHAT;
  }

  isTimestamp( type ) {
    return type === this.chatType.TIMESTAMP;
  }

  isSystemMessage( type ) {
    return type === this.chatType.SYSTEM_MESSAGE;
  }
}
