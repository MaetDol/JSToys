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
      const stringify = this.textDecoder.decode( uint8Array );
      const queryIndex = stringify.indexOf( query );
      if( queryIndex > -1 ) {
        const uselessString = stringify.slice( 0, queryIndex );
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
    
    let buffers = [];
    let i = 0;
    while( true ) {
      
      const uint8Array = await this.readBySize( this.BUF_SIZE ); 
      if( uint8Array === null ) {
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

    return new Uint8Array( ...buffers );
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
    
    let buffers = [];
    let i = 0;
    while( this.cursor >= 0 ) {

      this.cursor -= this.BUF_SIZE;
      const uint8Array = await this.readBySize( this.BUF_SIZE );
      if( uint8Array === null ) {
        return null;
      }
      const lastIndex = this.lastIndexOf( uint8Array, this.NEW_LINE );
      if( lastIndex != -1 ) {
        let cursor = this.cursor;
        this.cursor += lastIndex + 1;
        const prevLine = await this.nextLins();
        this.cursor = cursor + lastIndex;
        return prevLine;
      }
    }

    return null;
  }

}
