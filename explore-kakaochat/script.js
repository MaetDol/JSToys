const input = document.querySelector('input');
input.addEventListener('change', upload);
const fm = new FileManager();
const em = new ExplorManager( fm );

function upload(e) {
  fm.file = e.target.files[0];
  /*
  const reader = new FileReader();
  reader.onload = initialReader;
  reader.readAsText( e.target.files[0] )
  */
}

async function search( query, startIndex=0 ) {

  fm.cursor = startIndex;
  while( true ) {
    const str = await fm.readline();
    if( str === null ) {
      return false;
    }
    const found = str.indexOf( query ) > -1;
    if( found ) {
      return str;
    }
  }
}

// It will gonna blow up your Chrome tab
// Cause use way too large memory
function initialReader( file ) {
  
  const result = file.target.result;
  const inputs = result.split('\n');
  const readLine = readLineFactory( inputs );
  const db = {};

  let done = false;
  let index = 0;
  while( !done ) {
    const info = readLine.next();
    const data = stringAsData( info.value, {id: index++});
    if( data.id === -1 ) {
      index--;
      continue;
    }
    done = info.done;
    db[ data.id ] = data;
  }
}


function* readLineFactory( inputs ) {
  const lastIndex = inputs.length-1;
  let index = 0;
  while( index < lastIndex ) {
    yield inputs[index];
    index++;
  }
  return inputs[index];
}

function stringAsData( string, {id=-1, date}) {
  const DESKTOP_REGEXP = /^\[(.+)\] \[(..) (\d+:\d+)\] ([^\n]+)$/;
  const data = string.match( DESKTOP_REGEXP );
  if( data && data[1] && data[2] && data[3] && data[4] ) {
    return new Chat({
      id: id,
      text: data[4],
      timestamp: data[2] + data[3],
      user: data[1],
    });
  } else {
    return {id:-1};
  }
}

function Chat({id, text, timestamp, user}) {
  this.id = id;
  this.text = text;
  this.timestamp = timestamp;
  this.user = user;
}
