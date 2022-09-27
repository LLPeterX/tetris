/* 
TODO: 
- при опускании фигуры не удаляется ряд
- при повороте фигура снова вверху по центру.
- периодически зависает - проверить цикл do/while

*/

const cupRect = document.querySelector('.cup_wall_left');
const gameRect = document.querySelector('.game_field');
const scoreElement = document.getElementById("score");
const nextElement = document.querySelector('.next-shape');
// ниже все размеры берутся из CSS. Главное чтобы ТАМ было правильно
const TILE_SIZE = cupRect.getBoundingClientRect().width; // размер одного блока в пикселях (см. --size в style.css)
const WIDTH = gameRect.getBoundingClientRect().width / TILE_SIZE // внутренняя ширина стакана в блоках
const HEIGHT = gameRect.getBoundingClientRect().height / TILE_SIZE // внутренняя высота стакана в блоках
const button = document.querySelector('.start-button__btn');
// выровнять стакан по центру
const cup = document.querySelector('.cup');
cup.style.width = `${(WIDTH + 2) * TILE_SIZE}px`;
cup.style.height = `${(HEIGHT + 1) * TILE_SIZE}px`;
const INITIAL_SPEED = 800; // начальная скорость падения фигуры в ms - задержка перед переходом вниз
const SPEED_DECREMENT = 5; // с каждым удаленным рядом задержка будет уменьшаться на эту величину

let intervalId = null;
let inGame = false; // признак что мы в игре
let game = null; // игровое поле. true - там есть блок, false - нет. Иницифлизируется в initGame()
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
    drawNextTile();
    drawGame();
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
  if (top < 0 || top >= HEIGHT || left < 0 || left + currentTile.shape[0].length >= WIDTH) {
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
  console.log(`can place ${currentTile.id} => true`);
  return true;
}

// Определить, можно ли переместить текщую фигуру с текущими координатами [top,left]
// в заданном направлении (left, right, down, cw, ccw)
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

// нарисовать текущую фигуру (впихнуть в массив game)
// left/top - координаты левого верхнего угла фигуры.
// если y<0 (при повороте), сместить вниз пока не будет видна вся фигура
function removeTile(tile = currentTile) {

  for (let i = 0; i < tile.shape.length; i++) {
    for (let j = 0; j < tile.shape[0].length; j++) {
      if (tile.shape[i][j]) {
        let row = i + tile.top;
        let col = j + tile.left;
        game[row][col] = 0;
      }
    }
  }
}

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
function drawNextTile() {
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
          // } else {
          //   e.style.backgroundColor = tiles[0].color;
          //   e.style.border = `1px solid ${tiles[0].border}`;
        }
        nextElement.appendChild(e);
      }
    }
  }
}

const copyObject = (obj) => JSON.parse(JSON.stringify(obj));

// вращение массива по часовой стрелке
const rotateArray = (array) => array[0].map((_, j) => array.map(row => row[j]).reverse());
// повернуть текущую фигуру по часовой стрелке (вправо)
// возвращает true, если успешно, или false если нет.

function rotateCW() {
  let oldTile = copyObject(currentTile);
  currentTile.shape = rotateArray(currentTile.shape);
  if (!canPlace()) {
    currentTile = oldTile;
    return false;
  } else {
    removeTile(oldTile);
    placeTile(); // тут косяк!
  }
  return true;
}

// повернуть фигуру против часовой столки (влево)
function rotateCCW() {
  let oldTile = copyObject(currentTile);
  currentTile.shape = rotateArray(currentTile.shape);
  currentTile.shape = rotateArray(currentTile.shape);
  currentTile.shape = rotateArray(currentTile.shape);
  if (!canPlace()) {
    currentTile = oldTile;
    return false;
  } else {
    removeTile(oldTile);
    placeTile();
  }
  return true;
}

// сместить фигуру вниз
function moveDown() {
  if (canMove("down")) {
    removeTile();
    placeTile(currentTile.top + 1, currentTile.left);
  } else {
    hitBottom = true;
  }
}
function moveLeft() {
  if (canMove('left')) {
    removeTile();
    placeTile(currentTile.top, currentTile.left - 1);
  }
}
function moveRight() {
  if (canMove('right')) {
    removeTile();
    placeTile(currentTile.top, currentTile.left + 1);
  }

}


function setScore(s) {
  score = s;
  scoreElement.innerHTML = s;
}

function drawGame() {
  let blocks = gameRect.children;
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      let x = row * WIDTH + col;
      let e = blocks[x];
      e.innerHTML = game[row][col]; // TODO: REMOVE !!!
      if (game[row][col]) {
        // e.style.backgroundColor = currentTile.color;
        // e.style.border = `1px solid ${currentTile.border}`;
        e.style.backgroundColor = tiles[game[row][col]].color;
        e.style.border = `1px solid ${tiles[game[row][col]].border}`;
      } else {
        e.style.backgroundColor = tiles[0].color;
        e.style.border = `1px solid ${tiles[0].border}`;
      }


    }
  }
  blocks = null;
}

// удалить ряд из game[], у которого все ячейки заполнены
function checkAndRemoveRows() {
  let found;
  do {
    found = false;
    for (let row = HEIGHT - 1; row >= 0; row--) {
      if (game[row].every(cell => cell !== 0)) {
        console.log('remove row', row);
        // сдвигаем содержимое game[row-1][i] вниз
        for (let y = row - 1; y >= 0; y--) {
          for (let x = 0; x < WIDTH; x++) {
            game[row][x] = game[row - 1][x];
          }
        }
        // зануляем первую строку
        for (let x = 0; x < WIDTH; x++) {
          game[0][x] = 0;
        }
        found = true;
        setScore(score + 10);
        break;
      }
    }
  } while (found);
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

function handleClick() {
  inGame = !inGame;
  if (!inGame) {
    initGame(true);
  }
  button.innerHTML = inGame ? "STOP" : "START";
}

function handleKey(event) {
  // console.log(event);
  switch (event.code) {
    case 'ArrowDown': // rotate CW
      console.log(`move down to Y=${currentTile.top} x=${currentTile.left}`);
      moveDown();
      break;
    case 'ArrowUp': // rotate CCW
      console.log(`rotate left`);
      rotateCCW();
      break;
    case 'ArrowLeft':
      console.log(`move left to Y=${currentTile.top} x=${currentTile.left}`);
      moveLeft();
      break;
    case 'ArrowRight':
      console.log(`move left to Y=${currentTile.top} x=${currentTile.left}`);
      moveRight();
      break;
    case 'Space':
      while (!hitBottom) {
        moveDown();
        drawGame();
      }
      break;
    case 'Escape':
      inGame = false;
      initGame(true);
      inGame = true;
      drawGame();
      currentTile = getRandomTile();
      placeTile();
      nextTile = getRandomTile();
      drawNextTile();
      drawGame();
      break;
  }
  console.log('hit bottom:', hitBottom, 'inGame:', inGame);
  if (hitBottom && inGame) {
    hitBottom = false;
    checkAndRemoveRows();
    currentTile = { ...nextTile };
    if (canPlace()) {
      placeTile();
    } else {
      // конец игры
      console.log('GAME OVER');
      inGame = false;
      return;
    }
    nextTile = getRandomTile();
    drawNextTile();
  }
  drawGame();
}

button.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKey);

/// ---------------- TESTING -----------------

initGame(false);
// начальные блоки
currentTile = { ...tiles[1] };
nextTile = tiles[3];
placeTile(19, 0);
currentTile = { ...tiles[2] };
placeTile(17, 2);

currentTile = tiles[3];
placeTile();
drawGame();
drawNextTile();
inGame = true;

