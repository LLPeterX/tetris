console.log("hello");

const TILE_SIZE = 20; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = 10; // внутренняя ширина стакана в блоках
const HEIGHT = 20; // внутренняя высота стакана в блоках
const defaultColor = "black";
let game = new Array(HEIGHT); // игровое поле
// game = game.map(row => new Array(WIDTH).fill(false)); // in clearGame()
const container = document.querySelector('.container');
container.style.width = `${(WIDTH + 2) * TILE_SIZE}px`;
container.style.height = `${(HEIGHT + 1) * TILE_SIZE}px`;
const cup = document.querySelector('.cup');
let cupInnerLeft, cupInnerTop, cupInnterBottom, cupInnerRight;


const tiles = [
  {
    shape: ['XXXX'],
    color: "#00F0F0",
    border: "#00D0D0",
  },
  {
    shape: [
      'X  ',
      'XXX'
    ],
    color: "#C0C0FF",
    border: "#8080D0"
  },
  {
    shape: [
      '  X',
      'XXX'
    ],
    color: "#F0A000",
    border: "#C08800",
  },
  {
    shape: ['XX', 'XX'],
    color: "#F0F000",
    border: "#d8d800"
  },
  {
    shape: [
      ' XX',
      'XX '
    ],
    color: "#00F000",
    border: "#00d800"
  },
  {
    shape: [
      ' X ',
      'XXX'
    ],
    color: "#ff93ff",
    border: "#C000F0"
  },
  {
    shape: [
      'XX ',
      ' XX'
    ],
    color: "#f00000",
    border: "#C80000"
  }

];

// нарисовать "стакан"
function drawCup() {
  const cup = document.querySelector(".cup");
  for (let col = 0; col < HEIGHT; col++) {
    for (let row = 0; row < WIDTH + 2; row++) {
      let block = document.createElement('div');
      block.classList.add("block");
      block.style.left = `${row * TILE_SIZE}px`;
      block.style.top = `${col * TILE_SIZE}px`;
      if (row === 0 || row === WIDTH + 1) {
        block.classList.add("cup_block");
      } else {
        // block.setAttribute("data-x", row - 1);
        // block.setAttribute("data-y", col);
        block.setAttribute("data-xy", `${col},${row - 1}`);
        block.style.background = defaultColor;
      }
      cup.appendChild(block);
    }
  }
  // bottom
  for (let row = 0; row < WIDTH + 2; row++) {
    let block = document.createElement('div');
    block.classList.add("block");
    block.classList.add("cup_block");
    block.style.left = `${row * TILE_SIZE}px`;
    block.style.top = `${(HEIGHT) * TILE_SIZE}px`;
    cup.appendChild(block);
  }
  const cupSizes = cup.getBoundingClientRect();
  cupInnerLeft = cupSizes.left + TILE_SIZE;
  cupInnerTop = cupSizes.top;
  cupInnterBottom = cupSizes.top + TILE_SIZE * HEIGHT;
  cupInnerRight = cupSizes.right - TILE_SIZE;
}



function clearGame() {
  game.forEach(row => new Array(WIDTH).fill(false));
}

function drawBlock(row, col, color, border) {
  let x = cupInnerLeft + col * TILE_SIZE + 1;
  let y = cupInnerTop + row * TILE_SIZE + 1;
  let e = document.elementFromPoint(x, y);
  e.style.background = color;
  e.style.border = `1px solid ${border}`;
}

function drawTile(top, left, tile) {
  for (let i = 0; i < tile.shape.length; i++) {
    for (let j = 0; j < tile.shape[0].length; j++) {
      if (tile.shape[i][j] === 'X') {
        let row = i + top;
        let col = j + left;
        drawBlock(row, col, tile.color, tile.border);
      }
    }
  }

}

drawCup();
clearGame();
drawTile(0, 0, tiles[5]);

// let x =
//console.log('cupL:', cup.getBoundingClientRect().left);
//  console.log(cupInnerLeft, cupInnerRight, cupInnerTop, cupInnterBottom);
//drawBlock(0, 0, 'red');




