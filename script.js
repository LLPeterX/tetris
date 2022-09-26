console.log("hello");

const cupRect = document.querySelector('.cup_wall_left');
const gameRect = document.querySelector('.game_field');
const scoreElement = document.getElementById("score");
const nextElement = document.querySelector('.next-tile');

const TILE_SIZE = cupRect.getBoundingClientRect().width; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = gameRect.getBoundingClientRect().width / TILE_SIZE // внутренняя ширина стакана в блоках
const HEIGHT = gameRect.getBoundingClientRect().height / TILE_SIZE // внутренняя высота стакана в блоках
const INITIAL_SPEED = 600; // начальная скорость падения фигуры в ms - задержка перед переходом вниз
const SPEED_DECREMENT = 5; // с каждым удаленным рядом задержка будет уменьшаться на эту величину
const defaultColor = window.getComputedStyle(gameRect).backgroundColor; // цвет заливки стакана
const button = document.querySelector('.start-button');
// выровнять стакан по центру
const cup = document.querySelector('.cup');
cup.style.width = `${(WIDTH + 2) * TILE_SIZE}px`;
cup.style.height = `${(HEIGHT + 1) * TILE_SIZE}px`;
let intervalId = null;
let inGame = false;
let game = null; // игровое поле. true - там есть блок, false - нет. Иницифлизируется в initGame()
let currentTile = null; // текущая падающая фигура
let nextTile = null; // следующая фигура
let score = 0; // текущий счет

// первый элемент - ячейка фона
const tiles = [
  {
    shape: [],
    color: defaultColor,
    border: "#484848",
    id: 0
  },
  {
    shape: [[1, 1, 1, 1]],
    color: "#00F0F0",
    border: "#00D0D0",
    id: 1
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "#C0C0FF",
    border: "#8080D0",
    id: 2
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "#F0A000",
    border: "#C08800",
    id: 3
  },
  {
    shape: [[1, 1], [1, 1]],
    color: "#F0F000",
    border: "#d8d800",
    id: 4
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "#00F000",
    border: "#00d800",
    id: 5
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "#ff93ff",
    border: "#C000F0",
    id: 6
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "#f00000",
    border: "#C80000",
    id: 7
  }

];



// очистить игровое поле (внутренности стакана). 
// содержимое - индекс tiles[]. Если фон, то 0
function initGame() {
  game = new Array(HEIGHT).fill().map(row => new Array(WIDTH).fill().map(x => 0));
  gameRect.innerHTML = null;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let cell = document.createElement('div');
      cell.classList.add('block');
      cell.style.left = `${col * TILE_SIZE}px`;
      cell.style.top = `${row * TILE_SIZE}px`;
      cell.style.backgroundColor = tiles[0].color;
      cell.style.border = `1px solid ${tiles[0].border}`;
      gameRect.appendChild(cell);
    }
  }
  setScore(0);
}

function getRandomTile() {
  let index = Math.floor(Math.random() * (tiles.length - 1)) + 1;
  return tiles[index];
}

// проверка - можно ли разместить текущую фигуру по указанным координатам
function canPlace(top, left) {
  if (top < 0 || top >= HEIGHT || left < 0 || left + currentTile.shape[0].length) {
    return false;
  }
  // есть ли пересечения с другими фигурами?
  for (let i = 0; i < currentTile.shape.length; i++) {
    for (let j = 0; j < currentTile.shape[0].length; j++) {
      if (currentTile.shape[i][j]) {
        let row = i + top;
        let col = j + left;
        if (game[row][col]) {
          return false;
        }
      }
    }
  }
  return true;
}

// нарисовать текущую фигуру (впихнуть в массив game)
// left/top - координаты левого верхнего угла фигуры.
// если y<0 (при повороте), сместить вниз пока не будет видна вся фигура
function placeTile(top, left) {
  for (let i = 0; i < currentTile.shape.length; i++) {
    for (let j = 0; j < currentTile.shape[0].length; j++) {
      if (currentTile.shape[i][j]) {
        let row = i + top;
        let col = j + left;
        game[row][col] = currentTile.id;
      }
    }
  }
}

// показать следующую фигуру в блоке 'next'
function drawNextTile() {
  if (nextTile) {
    nextTile.innerHTML = null;
    for (let row = 0; row < nextTile.shape.length; row++) {
      for (let col = 0; col < nextTile.shape[0].length; col++) {
        if (nextTile.shape[row][col]) {
          let e = document.createElement('div');
          e.classList.add('block');
          e.style.backgroundColor = nextTile.color;
          e.style.border = `1px solid ${nextTile.border}`;
          e.style.left = `${TILE_SIZE * 3 + TILE_SIZE * col}px`;
          e.style.top = `${TILE_SIZE * 2 + TILE_SIZE * row}px`;
          nextElement.appendChild(e);
        }
      }
    }

  }
}

// повернуть фигуру по часовой стрелке (вправо)
// top/left - координаты левого верхнего угла фигуры
function rotateTileCW(top, left, tile) {
  const newShape = [...tile.shape];



}

// повернуть фигуру против часовой столки (влево)
function totateTileCCW(top, left, tile) {

}

function setScore(s) {
  score = s;
  scoreElement.innerHTML = s;
}

function grawGame() {
  let blocks = gameRect.children;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let x = row * WIDTH + col;
      let e = blocks[x];
      e.innerHTML = game[row][col]; // TODO: REMOVE !!!
      if (game[row][col]) {
        e.style.backgroundColor = currentTile.color;
        e.style.border = `1px solid ${currentTile.border}`;
      }


    }
  }
  blocks = null;
}

initGame();
currentTile = getRandomTile();
nextTile = getRandomTile();
placeTile(0, Math.floor(WIDTH / 2 - currentTile.shape[0].length / 2));
grawGame();
drawNextTile();

/* 
  --- Игоровой процесс: ----
  1. Нарисовать случайную фигуру вверху по центру
     1.1. Если её нельзя разместить - конец игры
  2. Если есть нажатие клавиш (свдиг/поворот/дроп) - обработать:
    2.1 - если влево, проверить левую границу стакана или фигуру (game[row][col-1] != defaultColor)
    2.2 - вправо аналогично: game[row][col+1] != defaultColor
    2.3 - вниз: 
      - если game[row+1][col] != defaultColor то оставить на месте (также должно сработать на дне стакана)
      - иначе сдвинуть вниз
   3. Переместить фигуру вниз на 1 клетку
     3.1 - если нельзя разместить - конец игры
     3.2 - если разместили, проверить наличие заполненных рядов и удалить их:
        -- опустить вышестоящие ряды вниз на 1 клетку.
   4. Перерисовать игровое поле     
   5. Повторить п.1    
      
 */

function handleClick() {
  inGame = !inGame;
  if (!inGame) {
    initGame();
  }
  button.innerHTML = inGame ? "STOP" : "START";

}

button.addEventListener('click', handleClick);

