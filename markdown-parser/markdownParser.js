function parseMarkdown(page) {

  let paragraphs = page.split('\n')
  let tag = {}
  tag.list = []
  tag.close = _ => {
    if( tag.list.lastItem() != undefined ) {
      return '</'+tag.list.pop()+'>'
    }
    return ''
  }
  tag.open = (t, c) => {
    if( t == tag.list.lastItem() ) {
      return ''
    }
    tag.list.push(t)
    return `<${t}${ c != null ? ` class="${c}"`:'' }>`
  }
  tag.isOpened  = t => tag.list.includes(t)
  tag.current   = _ => tag.list.lastItem()
  tag.isEmpty   = _ => tag.list.length == 0

  for( let i=0; i < paragraphs.length; i++ ) {

    let p = paragraphs[i]
    let parsed = parseParagraph( p, tag )
    
    paragraphs[i] = parsed.p
  }

  while( !tag.isEmpty ) {
    paragraphs.push( tag.close() )
  }

  return paragraphs.join('\n')
}

// Implemented markdown
// \      New line(Back slash)
// =      Embed tag
// #      Heading tag
// -      list item tag
// [0-9]  list item tag
// (),[]  anchor tag
// `      mark tag
// ```    code block(pre > code)
function parseParagraph(p, tag) {
  const parsed = {p, tag}
  parsed.p = parsed.p.trim()

  // New line
  let brCount = parsed.p.match(/\\+$/)
  if( brCount != null ) {
    brCount = brCount[0].length
    parsed.p = parsed.p.slice(0, -brCount) + '<br>'.repeat(brCount)
  }

  if( parsed.p.replace('<br>', '') == '' ) {
    parsed.p = parsed.tag.close() + parsed.p
    return parsed
  }

  // Wrap code block
  const codeblockReg = /`{3}/
  const isOpened  = parsed.tag.isOpened('pre') && parsed.tag.isOpened('code')
  const matched   = parsed.p.match( codeblockReg )
  let preClass  = ''
  let langClass = ''
  let content   = ''
  if( matched != null ) {
    // Block code block
    if( isOpened ) {
      parsed.p = '\n' + parsed.tag.close() + parsed.tag.close()
    } else {
      parsed.p = parsed.tag.open('pre') + parsed.tag.open('code', parsed.p.slice(3) )
    }
    return parsed
  }
  if( isOpened ) {
    return parsed
  }
  
  switch( parsed.p[0] ) {
    // Create Embed tag
    case '=':
      parsed.p = `${ parsed.tag.close() }
        <div class="embed-wrapper">
          <embed type="text/html" src="/JSToys/${ parsed.p.slice(1) }/index.html"></embed>
        </div>`
      return parsed
    
    // Wrap heading tag
    case '#':
      let nth = parsed.p.match(/^#+/)[0].length
      parsed.p = parsed.tag.close() + '<h'+nth+'>' + parsed.p.slice(nth).trim() + '</h'+nth+'>'
      break
    
    // Open unordered list
    case '-':
      parsed.p = wrapListItem('ul', parsed.p, parsed.tag)
      break
      
    // Open ordered list
    case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9':
      if( !parsed.tag.isOpened('ol') ) {
        break
      }
    case '0': case '1':
      parsed.p = wrapListItem('ol', parsed.p, parsed.tag )
    break
    
    // Open or close p tag
    default:
      if( !parsed.tag.isOpened('p') ) {
        parsed.p = parsed.tag.close() + parsed.tag.open('p') + parsed.p
      }
  }
    

  // Wrap Mark tag
  let markIsOpend = false
  while( /`/.test(parsed.p) ) {
    let wrapTag = '<mark>'
    if( markIsOpend ) {
      wrapTag = '</mark>'
    }
    parsed.p = parsed.p.replace(/`/, wrapTag )
    markIsOpend = !markIsOpend
  }

  // Wrap anchor tag
  parsed.p = parseAnchor( parsed.p, parsed.tag )
  // Replace escape character
  parsed.p = parsed.p.replace(/\\/gm, '')

  return parsed
}
  
function parseAnchor(p, tag) {
  const ANCHOR_REGEX = /(\[((\\[\[\]])|[^\[\]])*[^\\]\])|(\([^\(\)]*[^\\]\))/g
  let anchors = p.match( ANCHOR_REGEX )
  while( anchors != null && anchors.length != 0 ) {
    let link = anchors.shift()
    let text = link
    let originText = link

    if( link[0] == '[' ) {
      link = anchors.shift()
      originText = text + link
    }
    let aTag = wrapAnchor(link, text)
    p = p.replace( originText, aTag )
  }
  return p
}

function wrapListItem(listType, p, tag) {
  let otherType = listType == 'ol' ? 'ul' : 'ol'
  let prevTags = ''
  if( !tag.isOpened( otherType ) || tag.isOpened(listType) ) {
    prevTags = tag.close()
  }

  let isOpenedOtherList = tag.isOpened(listType) && (tag.current() == otherType)
  if( isOpenedOtherList ) {
    prevTags += tag.close() + tag.close()
  } else {
    prevTags += tag.open(listType)
  }

  return prevTags + tag.open('li') + p.replace( /^((\d+\.?)|-)\s*/m, '')
}

function wrapAnchor(link, text) {
  return `<a href="${ link.slice(1, link.length-1) }">${ text.slice(1, text.length-1) }</a>`
}

function readLine( str, startIdx=0 ) {
  let r = { line:'', lastIdx:0 }
  for( let i=startIdx; i < str.length; i++ ) {
    if( str[i] == '\n' ) {
      break
    }
    r.line += str[i]
    r.lastIdx = i
  }
  return r
}

Array.prototype.lastItem = function() {
  if( this.length != 0 )
    return this[ this.length-1 ]
}
