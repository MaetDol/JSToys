class FileManager {
  constructor() {
    this.NEW_LINE = '\n'.charCodeAt(0);
    this.BUF_SIZE = 128;
    this.MAX_CHUNK = 2**16;
    this.textDecoder = new TextDecoder();
    this._cursor = -1;
  }

  decodeUint8( array ) {
    return this.textDecoder.decode( array );
  }

  sizeof( str ) {
    return new Blob([ str ]).size;
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

  async readBySize( size ) {
    const buffer = await this.sliceFile( this.cursor + size );
    const uint8Array = new Uint8Array( buffer );
    const isEmpty = uint8Array.length === 0;
    if( isEmpty ) {
      return null;
    }
    return uint8Array;
  }

  async search( query ) {
    while( true ) {
      const uint8Array = await this.readBySize( this.MAX_CHUNK );
      if( uint8Array === null ) {
        return null;
      }
      const stringify = this.decodeUint8( uint8Array );
      const match = stringify.match( query );
      if( match !== null ) {
        const uselessString = stringify.slice( 0, match.index );
        const resultPosition = this.sizeof( uselessString ) + this.cursor;
        this.cursor = resultPosition + this.sizeof( query );
        return { 
          position: resultPosition,
          query 
        };
      }
      this.cursor += this.MAX_CHUNK - query.length;
    }
  }

  async nextLine() {
    
    let size = this.BUF_SIZE;
    while( true ) {
      
      const uint8Array = await this.readBySize( size ); 
      if( uint8Array === null ) {
        return null;
      }

      const sliced = this.sliceUint8ByCharCode( uint8Array, this.NEW_LINE );
      const isEndOfLine = sliced.end !== -1;
      if( isEndOfLine ) {
        this.cursor += sliced.end + 1;
        return uint8Array.slice( 0, sliced.end );
      }

      const isLastLine = uint8Array.length < size;
      if( isLastLine ) {
        this.cursor += uint8Array.length;
        return uint8Array;
      }

      size += this.BUF_SIZE;
    }

    return null;
  }

  lastIndexOf( array, value, start ) {
    let i = start || array.length - 1;
    while( i >= 0 ) {
      if( array[i] === value ) {
        return i;
      }
      i--;
    }
    return -1;
  }

  async previousLine() {
    
    while( this.cursor >= 0 ) {

      this.cursor -= this.BUF_SIZE;
      const uint8Array = await this.readBySize( this.BUF_SIZE );
      if( uint8Array === null ) {
        break;
      }
      const lastIndex = this.lastIndexOf( uint8Array, this.NEW_LINE );
      if( lastIndex != -1 ) {
        let cursor = this.cursor;
        this.cursor += lastIndex + 1;
        const prevLine = await this.nextLine();
        this.cursor = cursor + lastIndex;
        return prevLine;
      }
    }
    this.cursor = 0;
    return null;
  }

}
