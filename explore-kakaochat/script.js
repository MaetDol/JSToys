const input = select('input');
input.addEventListener('change', upload );
const fm = new FileManager();
const em = new ExplorManager( fm );

function upload(e) {
  fm.file = e.target.files[0];
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
