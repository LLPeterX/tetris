console.log("hello");

const TILE_SIZE = 20; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = 10; // внутренняя ширина стакана в блоках
const HEIGHT = 20; // внутренняя высота стакана в блоках
const INITIAL_SPEED = 600; // начальная скорость падения фигуры в ms - задержка перед переходом вниз
const SPEED_DECREMENT = 5; // с каждым удаленным рядом задержка будет уменьшаться на эту величину
const defaultColor = "black"; // цвет заливки стакана
let game = new Array(HEIGHT); // игровое поле. true - там есть блок, false - нет.
const container = document.querySelector('.container');
const cup = document.querySelector('.cup');
cup.style.width = `${(WIDTH + 2) * TILE_SIZE}px`;
cup.style.height = `${(HEIGHT + 1) * TILE_SIZE}px`;
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
      if (row === 0 || row === WIDTH + 1) { // боковые границы стакана
        block.classList.add("cup_block");
      } else {
        block.setAttribute("data-xy", `${col},${row - 1}`); // только для теста
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

// очистить игровое поле (внутренности стакана)
function clearGame() {
  game.forEach(row => new Array(WIDTH).fill(false));
}

// нарисовать 1 клетку
function drawBlock(row, col, color, border) {
  let x = cupInnerLeft + col * TILE_SIZE + 1;
  let y = cupInnerTop + row * TILE_SIZE + 1;
  let e = document.elementFromPoint(x, y);
  e.style.background = color;
  e.style.border = `1px solid ${border}`;
}

// нарисовать фигуру [состоящую из блоков]
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
drawTile(0, 0, tiles[0]);





