class ExplorManager {
  constructor( fileManager ) {
    this.fileManager = fileManager;
  }

  set fileManager( fileManager ) {
    this.fm = fileManager;
  }

  get fileManager() {
    return this.fm;
  }

  escapeRegExp( str ) {
    return str.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&');
  }

  generateMobileQuery({ timestamp={}, user='', chat='', isRegExp=false }={}) {
    let {
      year = '\\d{4}', 
      month = '\\d{1,2}', 
      date = '\\d{1,2}',
      amOrPm = '오(전|후)',
      hour = '\\d{1,2}',
      minute = '\\d{1,2}',
    } = timestamp;

    if( !isRegExp ) {
      chat = this.escapeRegExp( chat );
    }
    if( user ) {
      user = this.escapeRegExp( user );
    } else {
      user = '[^:\n]+';
    }

    return new RegExp(
      `^${year}년 ${month}월 ${date}일 ${amOrPm} ${hour}:${minute}, ${user} : .*${chat}.*`,
      'm'
    );
  }
  
  async searchAll( query ) {
    let results = [];
    while( true ) {
      const matched = await this.fileManager.search( query );
      const isEnd = matched === null;
      if( isEnd ) {
        return results;
      }
      results.push( matched.position );
    }
  }

  indexOf( query ) {
    return this.fileManager.search( query );
  }

  async searchChat( chat ) {
    const fm = this.fileManager;
  }
}
