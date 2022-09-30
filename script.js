/* 
TODO:
- где-то ошибка в drop() или rotate()+drop(): Внизу перемешиваются фигуры.
- если быстро давить на пробел, то полная жопа. всё сливается внизу.
- избавиться от inGame. Бесполезно.
*/

const cupRect = document.querySelector('.cup_wall_left');
const gameRect = document.querySelector('.game_field');
const scoreElement = document.getElementById("score");
const nextElement = document.querySelector('.next-shape');
//const button = document.querySelector('.start-button__btn');
// ниже все размеры берутся из CSS. Главное чтобы ТАМ было правильно
const TILE_SIZE = cupRect.getBoundingClientRect().width; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = gameRect.getBoundingClientRect().width / TILE_SIZE // внутренняя ширина стакана в блоках
const HEIGHT = gameRect.getBoundingClientRect().height / TILE_SIZE // внутренняя высота стакана в блоках

// выровнять стакан по центру
const cup = document.querySelector('.cup');
cup.style.width = `${(WIDTH + 2) * TILE_SIZE}px`;
cup.style.height = `${(HEIGHT + 1) * TILE_SIZE}px`;
const INITIAL_SPEED = 700; // начальная скорость падения фигуры в ms - задержка перед переходом вниз
const SPEED_DECREMENT = 20; // с каждым удаленным рядом задержка будет уменьшаться на эту величину

let speed = INITIAL_SPEED;
let intervalId = null;
let tick = 0;
let logging = true;
let inGame = false; // признак что мы в игре
let game = null; // игровое поле. true - там есть блок, false - нет. Иницифлизируется в initGame()
// let blocks = null; // коллекция gameRect.children. Инициализируется в initGame();
let currentTile = null; // текущая падающая фигура
let nextTile = null; // следующая фигура
let score = 0; // текущий счет
let oldTop, oldLeft;
let hitBottom = false;

// первый элемент массива - ячейка фона
const tiles = [
  {
    shape: [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: "#000000",
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
function initGame(withStartTile = false) {
  game = new Array(HEIGHT).fill().map(row => new Array(WIDTH).fill().map(x => 0));
  gameRect.innerHTML = null;
  // удалить блоки внтури стакана
  // if (blocks) {
  //   blocks.forEach(e => e.remove());
  // }
  // let blocks = gameRect.children;
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
  if (withStartTile) {
    currentTile = getRandomTile();
    placeTile();
    nextTile = getRandomTile();
    showNextTile();
    drawGame(); // ?
  }
}

function getRandomTile() {
  let index = Math.floor(Math.random() * (tiles.length - 1)) + 1;
  let tile = { ...tiles[index] };
  tile.top = 0;
  tile.left = Math.floor(WIDTH / 2 - tile.shape[0].length / 2);
  return tile;
}

// проверка - можно ли разместить текущую фигуру по указанным координатам
function canPlace(top = 0, left = Math.floor(WIDTH / 2 - currentTile.shape[0].length / 2)) {
  const tileWidth = currentTile.shape[0].length;
  const tileHeight = currentTile.shape.length;

  // границы стакана
  if (top < 0 || top + tileHeight > HEIGHT || left < 0 || left + tileWidth > WIDTH) {
    return false;
  }
  removeTile(); // убираем фигуру, чтобы избежать своих же клеток.
  // есть ли пересечения с другими имеющимися фигурами?
  for (let i = 0; i < tileHeight; i++) {
    for (let j = 0; j < tileWidth; j++) {
      if (currentTile.shape[i][j]) {
        let row = i + top;
        let col = j + left;
        if (game[row][col]) {
          placeTile(currentTile.top, currentTile.left); // возвращаем фигуру назад где была
          return false;
        }
      }
    }
  }
  placeTile(currentTile.top, currentTile.left); // возвращаем фигуру назад где была
  return true;
}

// Определить, можно ли переместить текщую фигуру с текущими координатами [top,left]
// в заданном направлении (left, right, down, cw, ccw)
/*
function canMove(direction) {
  const shapeWidth = currentTile.shape[0].length;
  const shapeHeight = currentTile.shape.length;
  switch (direction) {
    case 'down':
      // проверяем касание нижнего края фигуры дна стакана или существущей фигуры (gamy[bottom+1][x]===1)
      if (currentTile.top + shapeHeight >= HEIGHT) {
        return false;
      }
      for (let x = 0; x < shapeWidth; x++) {
        if (currentTile.shape[shapeHeight - 1][x]) {
          if (game[currentTile.top + shapeHeight][currentTile.left + x]) {
            return false;
          }
        }
      }
      break;
    case 'left':
      // проверяем касание левого края фигуры бока стакана или существущей фигуры (gamy[y][left-1]===1)
      if (currentTile.left <= 0) {
        return false;
      }
      for (let y = 0; y < shapeHeight; y++) {
        if (currentTile.shape[y][0]) {
          if (game[y + currentTile.top][currentTile.left - 1]) {
            return false;
          }
        }
      }
      break;
    case 'right':
      // проверяем касание правого края фигуры бока стакана или существущей фигуры (gamy[y][right+1]===1)
      if (currentTile.left + shapeWidth > WIDTH - 1) {
        return false;
      }
      for (let y = 0; y < shapeHeight; y++) { // по правому боку
        if (currentTile.shape[y][currentTile.left + shapeWidth - 1]) {
          if (game[y + currentTile.top][currentTile.left + shapeWidth]) {
            return false;
          }
        }
      }
      break;
    case 'cw':
    // поворачиваем матрицу и проверяем, не пересекаются ли фигуры




  }
  return true;

}
*/
// удалить фигуру (в game[] нарисовать на ее месте 0 )
// пол умолчанию - текущую фигуру (currentTile)
function removeTile(tile = currentTile) {
  for (let i = 0; i < tile.shape.length; i++) {
    for (let j = 0; j < tile.shape[0].length; j++) {
      if (tile.shape[i][j]) {
        game[i + tile.top][j + tile.left] = 0;
      }
    }
  }
}

// разместить фигуру. Если координаты не указаны, то вверху по центру
function placeTile(top = 0, left = Math.floor(WIDTH / 2 - currentTile.shape[0].length / 2)) {
  currentTile.top = top;
  currentTile.left = left;
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
function showNextTile() {
  if (nextTile) {
    nextElement.innerHTML = null;
    for (let row = 0; row < nextTile.shape.length; row++) {
      for (let col = 0; col < nextTile.shape[0].length; col++) {
        let e = document.createElement('div');
        e.classList.add('block');
        e.style.left = `${TILE_SIZE * 3 + TILE_SIZE * col}px`;
        e.style.top = `${TILE_SIZE * 2 + TILE_SIZE * row}px`;
        if (nextTile.shape[row][col]) {
          e.style.backgroundColor = nextTile.color;
          e.style.border = `1px solid ${nextTile.border}`;
        } else {
          e.style.backgroundColor = tiles[0].color;
          e.style.border = `1px solid ${tiles[0].border}`;
        }
        nextElement.appendChild(e);
      }

    }
  }
}


const copyObject = (obj) => JSON.parse(JSON.stringify(obj));

// вращение массива по часовой стрелке на 90
const rotateArray = (array) => array[0].map((_, j) => array.map(row => row[j]).reverse());
// повернуть фигуру по часовой столке
// для поворота против - поворачиваем 3 раза
function rotate(count = 1) {
  if (currentTile.top === 0) return false;
  let oldTile = copyObject(currentTile);
  removeTile();
  for (let i = 0; i < count; i++) {
    currentTile.shape = rotateArray(currentTile.shape);
  }
  if (!canPlace(currentTile.top, currentTile.left)) {
    // console.log('cannot rotate!');
    currentTile = oldTile;
  }
  placeTile(currentTile.top, currentTile.left);
  oldTile = null;
  log(`rotate ${count}`);
}

// сместить фигуру вниз
function moveDown() {
  //if (canMove("down")) {
  if (canPlace(currentTile.top + 1, currentTile.left)) {
    removeTile();
    placeTile(currentTile.top + 1, currentTile.left);
    log("down");
  } else {
    log("hit bottom");
    hitBottom = true;
  }
  checkBottom();
  drawGame();
  tick++;
}
function moveLeft() {
  //if (canMove('left')) {
  if (canPlace(currentTile.top, currentTile.left - 1)) {
    removeTile();
    placeTile(currentTile.top, currentTile.left - 1);
    log('left');
  }
}
function moveRight() {
  //if (canMove('right')) {
  //debugger;
  if (canPlace(currentTile.top, currentTile.left + 1)) {
    removeTile();
    placeTile(currentTile.top, currentTile.left + 1);
    log('right');
  }
}
function drop() {
  while (canPlace(currentTile.top + 1, currentTile.left)) {
    removeTile();
    placeTile(currentTile.top + 1, currentTile.left);
  }
  log('drop');
}


function setScore(s) {
  score = s;
  scoreElement.innerHTML = s;
}

function drawGame() {
  let blocks = gameRect.children;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let e = blocks[row * WIDTH + col];
      e.innerHTML = game[row][col]; // внутренний текст для отладкиTODO: REMOVE !!!
      if (game[row][col]) {
        e.style.backgroundColor = tiles[game[row][col]].color;
        e.style.border = `1px solid ${tiles[game[row][col]].border}`;
      } else {
        e.style.backgroundColor = tiles[0].color;
        e.style.border = `1px solid ${tiles[0].border}`;
      }
    }
  }
  blocks = null; // for GC
}

function checkBottom() {
  if (hitBottom && inGame) {
    hitBottom = false;
    checkAndRemoveRows();
    currentTile = { ...nextTile };
    if (canPlace()) { // at top/center new tile
      placeTile();
    } else {
      // конец игры
      console.log('GAME OVER');
      clearInterval(intervalId);
      tick = 0;
      intervalId = null;
      inGame = false;
      nextTile = tiles[0];
      showNextTile();
      return; // и ждем Esc
    }
    nextTile = getRandomTile();
    showNextTile();
  }
}

// удалить ряд из game[], у которого все ячейки заполнены
function checkAndRemoveRows() {
  let found;
  do {
    found = false;
    for (let row = HEIGHT - 1; row >= 0; row--) {
      if (game[row].every(cell => cell !== 0)) {
        log(`remove row ${row}`);
        // console.log('remove row', row);
        // сдвигаем содержимое выше row вниз на 1 ряд
        for (let y = row; y > 0; y--) {
          for (let x = 0; x < WIDTH; x++) {
            game[y][x] = game[y - 1][x];
          }
        }
        // зануляем первую строку
        for (let x = 0; x < WIDTH; x++) {
          game[0][x] = 0;
        }
        found = true;
        setScore(score + 10);
        speed -= SPEED_DECREMENT;
        break;
      }
    }
  } while (found);
  resetSpeed(speed);
}

function resetSpeed(newSpeed) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (newSpeed > 0) {
    intervalId = setInterval(moveDown, newSpeed);
  }
}

function newGame() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  initGame(true);
  inGame = true;
  speed = INITIAL_SPEED;
  resetSpeed(speed);
  tick = 0;
  log('new Game');
}

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


function handleKey(event) {
  switch (event.code) {
    case 'ArrowDown': // rotate CW
    case 'Numpad2':
      rotate(1);
      break;
    case 'ArrowUp': // rotate CCW
    case 'Numpad8':
      rotate(3);
      break;
    case 'ArrowLeft':
    case 'Numpad4':
      moveLeft();
      break;
    case 'ArrowRight':
    case 'Numpad6':
      moveRight();
      break;
    case 'Space':
      drop();
      break;
    case 'Escape':
      newGame();
      break;
    case 'KeyP':
      logging = false;
      break;
    default:
      console.log(event.code);
  }
  resetSpeed(speed);
  drawGame();

}

document.addEventListener('keydown', handleKey);
newGame();
/// ---------------- TESTING -----------------
function log(text) {
  if (!logging) return;
  const body = new FormData();
  body.append('text', text);
  body.append('time', new Date().toLocaleTimeString());
  body.append('tick', tick);
  body.append('game', JSON.stringify(game));
  body.append('tile', JSON.stringify(currentTile));
  body.append('logging', logging);
  fetch("https://test.ru/tetlog.php",
    {
      method: 'POST',
      mode: 'no-cors',
      body,
      headers: {
        'Content-Type': 'application/form-data',
      }

    }
  )
}


// // начальные блоки
// currentTile = { ...tiles[1] };
// nextTile = tiles[3];
// placeTile(19, 0);
// currentTile = { ...tiles[2] };
// placeTile(17, 2);

// currentTile = tiles[3];
// placeTile();
// drawGame();
// showNextTile();
// inGame = true;

