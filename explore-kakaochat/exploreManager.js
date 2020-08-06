class ExplorManager {
  constructor( fileManager ) {
    this.fileManager = fileManager;
    this.exitSearch = false;
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
      const defaultDateSet = `\d{4}년 \d{1,2}월 \d{1,2}일`;
      withoutTimestamp = `|(.*\\n(?!${defaultDateSet}))+.*${chat}`;
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
    this.fileManager.cursor = 0;
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
    this.fileManager.cursor = cursor || this.fileManager.cursor;
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
        return lines;
      }
      lines[index] = line;
      index = nextIndex( index );
    }
    return this.decodeLines( lines );
  }

  async getPreviousLines( n, cursor ) {
    return await this.readlines( n, true, cursor );
  }

  async getNextLines( n, cursor ) {
    return await this.readlines( n, false, cursor );
  }

  async getWrappedLines( n, cursor=this.fileManager.cursor ) {

    const previousLines = await this.getPreviousLines( n, cursor );
    const startCursor = this.fileManager.cursor;

    const nextLines = await this.getNextLines( n, cursor );
    const endCursor = this.fileManager.cursor;

    this.fileManager.cursor = cursor;

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

}
