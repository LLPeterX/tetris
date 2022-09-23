console.log("hello");

const TILE_SIZE = 20; // размер одного блока в пикселях
const WIDTH = 10; // внутренняя ширина стакана в блоках (см. style!)
const HEIGHT = 20; // внутренняя высота стакана в блоках



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


drawCup();



