export default class FileManager {
  constructor() {
    this.NEW_LINE = '\n'.charCodeAt(0);
    this.BUF_SIZE = 128;
    this.MAX_CHUNK = 2**16;
    this.UTF8_FILE_SIGNATURE = new Uint8Array([239, 187, 191]);
    this.MAX_UNICODE_LENGTH = 3;
    this.UTF8_ERROR = '\uFFFD';

    this.textDecoder = new TextDecoder();
    this._cursor = 0;
    this.startFilePosition = 0;
    this.initialCursorPosition = 0;
  }

  isUTF8() {
    const tempCursor = this.cursor;
    this.cursor = 0;
    const uint8Array = this.sliceFile(3);
    this.cursor = tempCursor;

    return this.isContainsArray( uint8Array, this.UTF8_FILE_SIGNATURE );
  }
  
  isContainsArray( subset, union ) {
    for( let i=0; i < subset.length; i++ ) {
      if( subset[i] !== union[i] ) {
        return false;
      }
    }
    return true;
  }

  decodeUint8( array ) {
    return this.textDecoder.decode( array );
  }

  sizeof( str ) {
    return new Blob([ str ]).size;
  }

  set cursor( pos ) {
    this._cursor = pos - this.initialCursorPosition;
    if( this._cursor < 0 ) {
      this._cursor = 0;
    }
  }

  get cursor() {
    return this._cursor + this.initialCursorPosition;
  }

  set file( newFile ) {
    this.cursor = 0;
    this._file = newFile;
    this.initialCursorPosition = this.isUTF8() ? this.UTF8_FILE_SIGNATURE.length : 0;
    this.startFilePosition = this.initialCursorPosition;
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

  validUTF8Position( arrayBuffer ) {
    let i = -1;
    let ch = this.UTF8_ERROR;
    while( ch === this.UTF8_ERROR ) {
      i++;
      if( i >= arrayBuffer.length ) {
        return -1;
      }
      let slicedBuffer = new Uint8Array([
        arrayBuffer[i],
        arrayBuffer[i+1],
        arrayBuffer[i+2],
        arrayBuffer[i+3],
      ]);
      ch = this.decodeUint8( slicedBuffer )[0];
    }
    return i;
  }

  async search( query ) {
    const querySize = this.sizeof( query );
    this.cursor += querySize;
    while( true ) {
      this.cursor -= querySize + this.MAX_UNICODE_LENGTH;
      const uint8Array = await this.readBySize( this.MAX_CHUNK );
      if( uint8Array === null ) {
        return null;
      }
      const validPosition = this.validUTF8Position( uint8Array );
      if( validPosition === -1 ) {
        this.cursor += this.MAX_CHUNK;
        continue;
      } else if( validPosition !== 0 ) {
        this.cursor += validPosition;
        continue;
      }

      const stringify = this.decodeUint8( uint8Array );
      const match = stringify.match( query );
      if( match !== null ) {
        const uselessString = stringify.slice( 0, match.index );
        const matchedIndex = this.sizeof( uselessString ) + this.cursor;
        const sizeofQuery = this.sizeof( match[0] );
        this.cursor = matchedIndex + sizeofQuery;
        return { 
          position: matchedIndex,
          query 
        };
      }
      this.cursor += this.MAX_CHUNK;
    }
  }

  async nextLine() {
    
    let lineSize = this.BUF_SIZE;
    while( true ) {
      
      const uint8Array = await this.readBySize( lineSize ); 
      if( uint8Array === null ) {
        return null;
      }

      const sliced = this.sliceUint8ByCharCode( uint8Array, this.NEW_LINE );
      const onlyHasNewline = sliced.array.length === 1 && sliced.end === 0;
      const startWithNewline = sliced.end === 0;
      const isEndOfLine = ( sliced.end !== -1 && !startWithNewline ) || onlyHasNewline;
      if( startWithNewline ) {
        this.cursor++;
      }
      if( isEndOfLine ) {
        this.cursor += sliced.end + 1;
        return uint8Array.slice( 0, sliced.end );
      }

      const isLastLine = uint8Array.length < lineSize;
      if( isLastLine ) {
        this.cursor += uint8Array.length;
        return uint8Array;
      }

      lineSize += this.BUF_SIZE;
    }
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
    
    let cursorEnd = this.cursor;
    while( this.cursor > this.startFilePosition ) {

      this.cursor -= this.BUF_SIZE;
      const uint8Array = await this.readBySize( cursorEnd - this.cursor );
      if( uint8Array === null ) {
        break;
      }
      const lastIndex = this.lastIndexOf( uint8Array, this.NEW_LINE );
      const onlyHasNewline = uint8Array.length === 0 && lastIndex === 0;
      const startWithNewline = lastIndex === uint8Array.length -1 ;
      const isFoundNewline = (lastIndex !== -1 && !startWithNewline) || onlyHasNewline ;
      if( startWithNewline ) {
        cursorEnd--;
      }
      if( isFoundNewline ) {
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
