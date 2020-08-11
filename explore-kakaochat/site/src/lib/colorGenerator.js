export default function colorGenerator( string ) {
  const valueFromString = string.split('').reduce(( acc, value ) => {
    const charCode = value.charCodeAt(0);
    return acc + charCode**2;
  }, 0);
  const FFFFFF = 16777215;
  const decimalColorCode = valueFromString & FFFFFF;
  let colorCode = decimalColorCode.toString(16);
  const blanks = '0'.repeat( 6 - colorCode.length );
  return `#${blanks}${colorCode}`;
};

