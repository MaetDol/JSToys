import Ascii from './Ascii.mjs';

export default class Box extends Ascii {
  constructor( args ) {
    super(args);
    this.props = args;
  }

  render() {
    const {cornor, horizental, vertical, blank} = Ascii.components;
    const {w, h} = this.props;

    const top = [cornor[0], ...Array(w-2).fill(horizental), cornor[1]];
    const bottom = [cornor[3], ...Array(w-2).fill(horizental), cornor[2]];
    const body = Array(h-2).fill(0).map(_=> [vertical, ...Array(w-2).fill(blank), vertical]).flatMap(a => `${a.join('')}\n`);

    return `${top.join('')}\n${body.join('')}${bottom.join('')}`;
  }
}