console.log("hello");

const TILE_SIZE = 20; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = 10; // внутренняя ширина стакана в блоках
const HEIGHT = 20; // внутренняя высота стакана в блоках
const defaultColor = "white";
let game = new Array(HEIGHT); // игровое поле

const tiles = [
  {
    shape: ['XXXX'],
    color: "darkcyan",

  },
  {
    shape: [
      'X  ',
      'XXX'
    ],
    color: "darkblue"
  },
  {
    shape: [
      '  X',
      'XXX'
    ],
    color: "pink"
  },
  {
    shape: ['XX', 'XX'],
    color: "yellow"
  },
  {
    shape: [
      ' XX',
      'XX '
    ],
    color: "green"
  },
  {
    shape: [
      ' X ',
      'XXX'
    ],
    color: "black"
  },
  {
    shape: [
      'XX ',
      ' XX'
    ],
    color: "red"
  }

];

// нарисовать "стакан"
function drawCup() {
  const cup = document.querySelector(".cup");
  for (let col = 0; col < HEIGHT + 1; col++) {
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
    block.style.top = `${(HEIGHT + 1) * TILE_SIZE}px`;
    cup.appendChild(block);
  }
}

function drawTile(id, col = Math.floor(WIDTH / 2), row = 0) {
  const t = tiles[id];
  for (let y = 0; y < t.length; y++) {
    for (let x = 0; x < t[0].length; x++) {
      if (t[y][x] === 'X') {
        // получить нужный DIV и происвоить ему цвет t.color, также game[y][x] = true
        // const selector = `[data-x="${x}"][data-y="${y}"]`;
        const selector = `[data-xy="${col},${row - 1}"]`;
        const e = document.querySelector(selector);
        if (e) {
          e.style.backgroundColor = t.color;
        }
      }
    }
  }
}

function clearGame() {
  for (let y = 0; y < HEIGHT; y++) {
    game[y] = new Array(WIDTH).map(x => false);
  }
}

drawCup();
clearGame();
drawTile(1);



