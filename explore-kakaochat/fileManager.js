class FileManager {
  constructor() {
    this.NEW_LINE = '\n'.charCodeAt(0);
    this.BUF_SIZE = 128;
    this.MAX_CHUNK = 2**16;
    this.textDecoder = new TextDecoder();
    this._cursor = -1;
  }

  set cursor( pos ) {
    this._cursor = pos;
  }

  get cursor() {
    return this._cursor;
  }

  set file( newFile ) {
    this.cursor = 0;
    this._file = newFile;
  }

  get file() {
    return this._file;
  }

  async sliceFile( end ) {
    return await this.file.slice( this.cursor, end ).arrayBuffer();
  }

  sliceUint8ByCharCode( array, charCode ) {
    const end = array.indexOf( charCode );
    return { end, array: array.slice( 0, end ) };
  }

  // TODO: REFACTORING
  // should support regex
  // filtering for date, user
  // multiple result
  async search( query ) {
    const queryLength = query.length || query.source.length;
    let i=0;
    while( true ) {
      const buffer = await this.sliceFile( this.cursor + this.MAX_CHUNK );
      const uint8Array = new Uint8Array( buffer );
      const isEmpty = uint8Array.length === 0;
      if( isEmpty ) {
        return null;
      }
      const str = this.textDecoder.decode( uint8Array );
      const result = str.indexOf( query );
      if( result > -1 ) {
        const position = new Blob([ str.slice( 0, result ) ]).size;
        this.cursor += position;
        return { result: str.slice(result, result + 300), position: this.cursor, query };
      }
      if( i++ > 450 ) {
        console.log( buffer, query, this.cursor );
        return false;
      }
      this.cursor += this.MAX_CHUNK - queryLength;
    }
  }

  async readline() {
    
    let buffers = [];
    let i = 0;
    while( true ) {
      
      const buffer = await this.sliceFile( this.cursor + this.BUF_SIZE );
      const uint8Array = new Uint8Array( buffer );
      const isEmpty = uint8Array.length === 0;
      if( isEmpty ) {
        return null;
      }

      const sliced = this.sliceUint8ByCharCode( uint8Array, this.NEW_LINE );
      buffers[i] = sliced.array;
      const isEndOfLine = sliced.end !== -1;
      if( isEndOfLine ) {
        this.cursor += sliced.end + 1;
        break;
      }

      const isLastLine = uint8Array.length < this.BUF_SIZE;
      if( isLastLine ) {
        this.cursor += uint8Array.length;
        buffers[i] = uint8Array;
        break;
      }

      this.cursor += this.BUF_SIZE;
      i++;
    }

    const blob = new Blob( buffers );
    return blob.text();
  }

}