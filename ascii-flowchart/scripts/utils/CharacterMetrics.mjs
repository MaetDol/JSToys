export default class CharacterMetrics {
  constructor( fontFamily ) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setFontFamily( fontFamily );
  }
  
  setFontFamily( fontFamily ) {
    this.fontFamily = fontFamily;
    this.metrics = this.getMetrics();
  }
  
  getMetrics( str='A' ) {
    return this.ctx.measureText(str);
  }

  getHeight( str='A' ) {
    const {
      fontBoundingBoxAscent: ascent,
      fontBoundingBoxDescent: descent,
    } = this.metrics;
    return ascent + descent;
  }
};