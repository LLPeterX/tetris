const rotateArray = (array) => array[0].map((_, colIndex) => array.map(row => row[colIndex]).reverse());

const print2DArray = (array, print = false) => {
  let res = array.map(row => row.map(cell => String(cell || '.')).join('')).join("\n");
  if (print) {
    console.log(res);
  }
  return res;
}

let shape = [
  [0, 0, 1],
  [1, 1, 1]
];
console.log('before:');
print2DArray(shape, true);
shape = rotateArray(shape);
console.log('after:');
print2DArray(shape, true);
console.log(shape);
