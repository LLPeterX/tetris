const gameRect = document.querySelector('.game_field');
const scoreElement = document.querySelector(".score");
const nextElement = document.querySelector('.next-shape');
const nextTileElement = document.querySelector('.next-tile');
const gameOverElement = document.querySelector('.gameover');
const BLOCK_SIZE = 20; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = 10 // внутренняя ширина стакана в блоках
const HEIGHT = 20 // внутренняя высота стакана в блоках
const INITIAL_SPEED = 700; // начальная скорость падения фигуры в ms - задержка перед переходом вниз
const SPEED_DECREMENT = 5; // с каждым удаленным рядом задержка будет уменьшаться на эту величину

let speed = INITIAL_SPEED;
let intervalId = null;
let tick = 0;
let logging = true; // режим отладки
let inGame = false; // признак что мы в игре
let game = null; // игровое поле. 
let currentTile = null; // текущая падающая фигура
let nextTile = null; // следующая фигура
let score = 0; // текущий счет
let hitBottom = false;

// в начале пофиксить размеры:
//1. Контейнер
document.querySelector('.container').style.width = `${BLOCK_SIZE * WIDTH + (BLOCK_SIZE * 24)}px`;
nextTileElement.style.height = `${BLOCK_SIZE * 7}px`;
nextTileElement.style.width = `${BLOCK_SIZE * 10}px`;
document.querySelector('.score').style.height = nextTileElement.style.height; // чтобы была одинаковая высота - для красоты
// 2. окно "game over"
const go = gameOverElement.getBoundingClientRect(),
  gr = gameRect.getBoundingClientRect();
gameOverElement.style.top = `${Math.floor(gr.top + gr.height / 2 - go.height / 2)}px`;
gameOverElement.style.left = `${Math.floor(gr.left + gr.width / 2 - go.width / 2)}px`;


// Массив фигур. Первый элемент массива - ячейка фона
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
function initGame() {
  game = new Array(HEIGHT).fill().map(row => new Array(WIDTH).fill(0));
  /* 
    здесь не самый оптимальный вариант с созданием элементов. 
    Лучше бы заранее создать 200 div'ов .block и менять их стили.
    Но тогда это лишило бы возможности менять размеры стакана (WIDTH и HEIGHT) - вдруг захочется.
  */
  gameRect.innerHTML = null;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let cell = document.createElement('div');
      cell.classList.add('block');
      cell.style.left = `${col * BLOCK_SIZE}px`;
      cell.style.top = `${row * BLOCK_SIZE}px`;
      cell.style.width = `${BLOCK_SIZE}px`;
      cell.style.height = `${BLOCK_SIZE}px`;
      cell.style.backgroundColor = tiles[0].color;
      cell.style.border = `1px solid ${tiles[0].border}`;
      gameRect.appendChild(cell);
    }
  }
  setScore(0);
  currentTile = getRandomTile();
  placeTile();
  nextTile = getRandomTile();
  showNextTile();
  drawGame();
}

function getRandomTile() {
  const index = Math.floor(Math.random() * (tiles.length - 1)) + 1;
  // let tile = { ...tiles[index] };
  const tile = copyObject(tiles[index]);
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
  top > 0 && removeTile(); // если фигура уже есть, убираем её, чтобы избежать своих же клеток.
  // Находим пересечения с другими имеющимися фигурами
  for (let i = 0; i < tileHeight; i++) {
    for (let j = 0; j < tileWidth; j++) {
      if (currentTile.shape[i][j]) {
        let row = i + top;
        let col = j + left;
        if (game[row][col]) {
          top > 0 && placeTile(currentTile.top, currentTile.left); // возвращаем фигуру назад где была
          return false;
        }
      }
    }
  }
  top > 0 && placeTile(currentTile.top, currentTile.left); // возвращаем фигуру назад где была
  return true;
}


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

// показать следующую фигуру
function showNextTile() {
  if (nextTile) {
    let bound = nextTileElement.getBoundingClientRect();
    const tileWidth = nextTile.shape[0].length;
    const tileHeight = nextTile.shape.length;
    let offset = Math.floor(bound.width / 2 - tileWidth * BLOCK_SIZE / 2);

    nextElement.innerHTML = null;
    for (let row = 0; row < tileHeight; row++) {
      for (let col = 0; col < tileWidth; col++) {
        let e = document.createElement('div');
        e.classList.add('block');
        // расположить по центру
        e.style.left = `${offset + col * BLOCK_SIZE}px`;
        e.style.top = `${BLOCK_SIZE * 3 + row * BLOCK_SIZE}px`;
        e.style.width = `${BLOCK_SIZE}px`;
        e.style.height = `${BLOCK_SIZE}px`;
        if (nextTile.shape[row][col]) {
          e.style.backgroundColor = nextTile.color;
          e.style.border = `1px solid ${nextTile.border}`;
        } else {
          e.style.backgroundColor = tiles[0].color;
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
    currentTile = oldTile;
  }
  placeTile(currentTile.top, currentTile.left);
  oldTile = null;
  log(`rotate ${count}`);
}

// сместить фигуру вниз
function moveDown() {
  if (!inGame) return;
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
  if (canPlace(currentTile.top, currentTile.left - 1)) {
    removeTile();
    placeTile(currentTile.top, currentTile.left - 1);
    log('left');
  }
}
function moveRight() {
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

// нарисовать блоки в зависимости от значений game[]
function drawGame() {
  let blocks = gameRect.children;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let e = blocks[row * WIDTH + col];
      if (game[row][col]) {
        e.style.backgroundColor = tiles[game[row][col]].color;
        e.style.border = `1px solid ${tiles[game[row][col]].border}`;
      } else {
        e.style.backgroundColor = tiles[0].color;
        e.style.border = `1px solid ${tiles[0].border}`;
      }
    }
  }
}

// проверка касания нижней части фигуры дна стакана или другой низлежащей фигуры. Учитвая рельеф.
function checkBottom() {
  if (hitBottom && inGame) {
    hitBottom = false;
    checkAndRemoveRows();
    currentTile = { ...nextTile };
    // попробовать разместить новую фигуру вверху по центру. Если неуспешно - конец игры
    if (canPlace(0)) {
      placeTile();
    } else {
      gameOverElement.style.visibility = 'visible';
      clearInterval(intervalId);
      intervalId = null;
      inGame = false;
      tick = 0;
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

// сброс скорости
function resetSpeed(newSpeed) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (newSpeed > 0) {
    intervalId = setInterval(moveDown, newSpeed);
  }
}

// запуск новой игры: очистка поля, инициализация таймера, убирание окна gameover
function newGame() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  initGame();
  gameOverElement.style.visibility = 'hidden';
  inGame = true;
  speed = INITIAL_SPEED;
  resetSpeed(speed);
  tick = 0;
  log('new Game');
}

// Обработка нажатий клавищ
function handleKey(event) {
  if (!inGame && event.code !== 'Escape') return;
  switch (event.code) {
    case 'ArrowDown': // поворот CW
    case 'Numpad2':
      rotate(1);
      break;
    case 'ArrowUp': // поворот CCW
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
      logging = !logging;
      console.log(`logging ${logging ? "enabled" : "disabled"}`);
      break;
    // default:
    //   console.log(event.code);
  }
  resetSpeed(speed);
  drawGame();

}

// заголовок вверху.
// Нужные div'ы уже есть в html
function drawTitle() {
  const letters = [
    // T   E   T   Р   И  С 
    '111 222 333 444 5  5 666',
    ' 1  2    3  4 4 5 55 6  ',
    ' 1  22   3  444 55 5 6  ',
    ' 1  2    3  4   5  5 6  ',
    ' 1  222  3  4   5  5 666'
  ];
  const titleTiles = document.querySelector('.title').children;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 24; j++) {
      if (letters[i][j] !== ' ') {
        let e = titleTiles[i * 24 + j];
        e.style.backgroundColor = tiles[letters[i][j]].color;
        e.style.border = `1px solid ${tiles[letters[i][j]].border}`;
      }
    }
  }
}

// -------------- START GAME -----------------
drawTitle();
document.addEventListener('keydown', handleKey);
newGame();

/// ---------------- TESTING -----------------
/* 
ниже - функция записи в лог. 
Т.к. тестирование игры в дабагере затруднено из-за проблем отображения в консоли массива game[][],
я написал сервер на php, который пишет в файл текущее состояние игры при каждом тике таймера
или нажатии клавиш.
Клавишей "P" логирование останавливается

*/
function log(text) {
  /*
  if (!logging) return;
  const body = new FormData();
  body.append('text', text);
  body.append('time', new Date().toLocaleTimeString());
  body.append('tick', tick);
  body.append('game', JSON.stringify(game));
  body.append('tile', JSON.stringify(currentTile));
  body.append('logging', logging);
  fetch("https://test.ru/tetrislog.php",
    {
      method: 'POST',
      mode: 'no-cors',
      body,
      headers: {
        'Content-Type': 'application/form-data',
      }

    }
  )
  */
}

