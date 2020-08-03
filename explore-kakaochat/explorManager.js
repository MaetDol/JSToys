class ExplorManager {
  constructor( fileManager ) {
    this.fileManager = fileManager;
  }

  set fileManager( fm ) {
    this.fm = fileManager;
  }

  get fileManager() {
    return this.fm;
  }

  escapeRegExp( str ) {
    return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
  }

  generateMobileQuery({ timestamp, nickname, chat }) {
    let {
      year = '\d{4}', 
      month = '\d{1,2}', 
      date = '\d{1,2}',
      amOrPm = '오(전|후)',
      hour = '\d{1,2}',
      minute = '\d{1,2}',
    } = timestamp;

    chat = this.escapeRegExp( chat );
    if( nickname ) {
      nickname = this.escapeRegExp( nickname );
    } else {
      nickname = '[^:\n]+';
    }

    return new RegExp(`^${year}년 ${month}월 ${date}일 ${amOrPm} ${hour}:${minute}, ${nickname} : ${chat}`);
  }

  async searchChat( chat ) {
    const fm = this.fileManager;
  }
}
