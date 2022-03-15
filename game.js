const gameboard = document.getElementById("gameBoard"); // to fetch canvas from DOM
const ctx = gameboard.getContext("2d"); // to get the context of the canvas (2d model)

const frame = new Image();
frame.src ="./assets/bg2.png"




//size of gameboard
gameboard.width = 1000;
gameboard.height = 600;

//grid variables (for each item to be placed on field)
const cellSize = 100;
const cellGapping = 4;
let gridcount = 0;
const Grid = [];

//defenders on the left side to stop the enemies
const defenders = [];
const resources = [];
const beams = []; //to hold all the projectile beams for all defender objects
let chosenDefender = 1;

//attackers coming from the right side to defeat defenders
const enemies = [];
let enemyPosition = [];
let enemy__interval = 85;

//handling game stats
 gameOver = false;
let score = 0;
const win_score = 1000;

//getting mouse properties
const mouse = {
  x: 0,
  y: 0,
  width: 0.1,
  height: 0.1,
  clicked: false,
};
//function to drop defenders
gameboard.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
gameboard.addEventListener("mouseup", function () {
  mouse.clicked = false;
});

//function to place grid over mouse over
let gameboardposition = gameboard.getBoundingClientRect();
gameboard.addEventListener("mousemove", function (e) {
  mouse.x = e.x - gameboardposition.left;
  mouse.y = e.y - gameboardposition.top;
});
gameboard.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

//bar that displays score and controls
const displayBar = {
  width: gameboard.width,
  height: cellSize,
};

//class to call each cell
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  // drawing girds
  draw() {
    if (mouse.x && mouse.y && test__collision(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
//pushing grids to the canvas
function gridpush() {
  for (let y = cellSize; y < gameboard.height; y += cellSize)
    for (let x = 0; x < gameboard.width; x += cellSize) {
      Grid.push(new Cell(x, y));
    }
}
//gridpush();

function grid__generate() {
  for (i = 0; i < Grid.length; i++) Grid[i].draw();
}
// to check collision between any two objects

function test__collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

//beams
const beam1 = new Image();
beam1.src = "./assets/beam1a1.png";
const beam2 = new Image();
beam2.src = "./assets/beam2a2.png";
class Beams {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 34;
    this.power = 20;
    this.speed = 1;
    this.animationX = 0;
    this.animationY = 0;
    this.animationwidth = 34;
    this.animationheight = 34;
    this.minframe = 0;
    this.maxframe = 10;
  }
  move() {
    for (let i = 0; i < defenders.length; i++) {
      if (defenders[i].chosenDefender === 1) {
        this.x += this.speed;
      } else if (defenders.length > 5 ) {
        this.x += this.speed * 2;
      } else if (defenders.length > 15 ) {
        this.x += this.speed * 3;
        this.power += 0.5
      }else if (defenders.length > 30 ) {
        this.x += this.speed * 5;
        this.power += 2
      }
      else if (defenders[i].chosenDefender === 2) {
        this.x += this.speed;}
    }
  }

  draw() {
    // ctx.fillStyle = "black";
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    // ctx.fill();

    //conditions to match ammo as per the chosen defender
    if (chosenDefender === 1) {
      ctx.drawImage(
        beam1,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (chosenDefender === 2) {
      ctx.drawImage(
        beam2,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}
function handleBeams() {
  let audio = new Audio('./audio/hit2.mp3')
  let audio1 = new Audio('./audio/hit1.mp3')
  for (let i = 0; i < beams.length; i++) {
    //checking number of shots
    console.log(beams.length);
    beams[i].move();
    beams[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      // checking number of enenmies passed
      //console.log(enemies.length);


      if (enemies[j] && beams[i] && test__collision(beams[i], enemies[j])) {
        enemies[j].health -= beams[i].power;
        beams.splice(i, 1);
        i--;
        audio.play();
        audio.volume = 0.1;


      }
    }
    if (beams[i] && beams[i].x > gameboard.width - cellSize) {
      beams.splice(i, 1);
      i--; //no beam gets skipped (updating index)
    }
  }
}

//defenders
let numberOfResources = 500;

//making types of defenders
const defender1 = new Image();
defender1.src = "./assets/attack1a.png";
const defender2 = new Image();
defender2.src = "./assets/attack4a.png";

class defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGapping * 2; //to prevent collision of defenders and enemies from adjacent rows
    this.height = cellSize - cellGapping * 2;
    this.shooting = false;
    this.health = 200;
    this.timer = 0;
    this.animationX = 0;
    this.animationY = 0;
    this.animationwidth = 128;
    this.animationheight = 128;
    this.minframe = 0;
    this.maxframe = 10;
    this.chosenDefender = chosenDefender;
  }
  draw() {
    // ctx.fillStyle = "blue";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    // ctx.fillStyle = "gold";
    // ctx.font = "30px arial";
    // ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    if (this.chosenDefender === 1) {
      ctx.drawImage(
        defender1,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (this.chosenDefender === 2) {
      ctx.drawImage(
        defender2,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  update_beam() {
    if (gridcount % 6 === 0) {
      if (this.animationX < this.maxframe) this.animationX++;
      else this.animationX = this.minframe;
    }
    if (this.shooting) {
      //checking timer for beams
      //  console.log(this.timer);
      this.timer++;
      if (this.timer % 100 === 0) {
        beams.push(new Beams(this.x + 50, this.y + 50));
      }
    } else {
      this.timer = 0;
    }
  }

}

//switching units for defenders
const layout1 = {
  x: 10,
  y: 10,
  width: 80,
  height: 85,
};
const layout2 = {
  x: 90,
  y: 10,
  width: 80,
  height: 85,
};



function selectDefender() {
  let layout1stroke = "black";
  let layout2stroke = "black";
  if (test__collision(mouse, layout1) && mouse.clicked) {
    chosenDefender = 1;
  } else if (test__collision(mouse, layout2) && mouse.clicked) {
    chosenDefender = 2;
  }

  if (chosenDefender === 1) {
    layout1stroke = "gold";
    layout2stroke = "black";
  } else if (chosenDefender === 2) {
    layout2stroke = "gold";
    layout1stroke = "black";
  } else {
    layout1stroke = "black";
    layout2stroke = "black";
  }

  ctx.linewidth = 1;
  ctx.fillStyle = "rgba(66,0,0,0.2)";
  ctx.fillRect(layout1.x, layout1.y, layout1.width, layout1.height);
  ctx.strokeStyle = layout1stroke;
  ctx.strokeRect(layout1.x, layout1.y, layout1.width, layout1.height);
  ctx.drawImage(defender1, 0, 0, 128, 128, 20, 15, 128 / 2, 128 / 2);
  ctx.fillRect(layout2.x, layout2.y, layout2.width, layout2.height);
  ctx.strokeStyle = layout2stroke;
  ctx.strokeRect(layout2.x, layout2.y, layout2.width, layout2.height);
  ctx.drawImage(defender2, 0, 0, 128, 128, 90, 15, 128 / 2, 128 / 2);
  ctx.drawImage(frame, 400, 0, 644, 139);

}

//Messages
const messages = [];
class message {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }
  change_y() {
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.001) this.opacity -= 0.01;
  }
  draw() {
    ctx.globalAlpha = this.opacity; //sets current transparency value
    ctx.fillStyle = this.color;
    ctx.font = this.size + "px arial";
    ctx.fillText(this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
function handlemessages() {
  for (let i = 0; i < messages.length; i++) {
    messages[i].change_y();
    messages[i].draw();
    if (messages[i].lifeSpan >= 50) {
      messages.splice(i, 1);
      i--;
    }
  }
}

//Enemies

const EnemyTypes = [];
const enemy1 = new Image();
enemy1.src = "./assets/incoming1.png";
EnemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = "./assets/incoming2.png";
EnemyTypes.push(enemy2);
const enemy3 = new Image();
enemy3.src = "./assets/incoming3.png";
EnemyTypes.push(enemy3);

class Enemy {
  constructor(verticalPosition) {
    this.x = gameboard.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGapping * 2;
    this.height = cellSize - cellGapping * 2;
    // this.speed = Math.random() * 0.3 + 0.3;
    this.speed = Math.random() * 0.3 + 0.2;
    this.movement = this.speed;
    this.health = 160;
    this.maxHealth = this.health;
    this.EnemyType = EnemyTypes[Math.floor(Math.random() * EnemyTypes.length)];
    this.animationX = 0;
    this.animationY = 0;
    this.minframe = 0;
    this.maxframe = 4;
    this.animationwidth = 128;
    this.animationheight = 128;
  }

  change1() {
    console.log(this.x);
    this.x -= this.movement;
    if (gridcount % 10 === 0) {
      if (this.animationX < this.maxframe) this.animationX++;
      else this.animationX = this.minframe;
    }
  }
  draw() {
    // ctx.fillStyle = "red"; Khối cắt của Enemy
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    // ctx.fillStyle = "black";
    // ctx.font = "30px arial";
    //  ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    ctx.drawImage(
      this.EnemyType,
      this.animationX * this.animationwidth,
      0,
      this.animationwidth,
      this.animationheight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
let counter = 0;

function enemy() {
  document.getElementById("index").innerHTML =`SỐ ZOMBIE ĐANG TẤN CÔNG LÀ : `+ enemies.length
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].change1();
    enemies[i].draw();

    if (enemies[i].x<0) {
      gameOver = true;
      console.log(enemies[i].x);
    }
    //lose();
    if (enemies[i].health <= 0) {
      let earnedResources = enemies[i].maxHealth / 40;
      messages.push(new message("+ " + earnedResources, 250, 20, 20, "gold"));
      messages.push(
          new message(
              "+ " + earnedResources,
              enemies[i].x,
              enemies[i].y,
              20,
              "black"
          )
      );
      numberOfResources += earnedResources;
      score += earnedResources;
      const index_position = enemyPosition.indexOf(enemies[i].y);
      enemyPosition.splice(index_position, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (gridcount % enemy__interval === 0 && score < win_score) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGapping;
    enemies.push(new Enemy(verticalPosition));
    enemyPosition.push(verticalPosition);
    if(score>win_score/3 && numberOfResources> 200) {
      numberOfResources = 220;
      if (enemy__interval > 30) enemy__interval -= 50;
    }
  }
}
//add status


//additional resources
const value = [20, 30, 40, 50, 60];
class Resource {
  constructor() {
    this.x = Math.random() * (gameboard.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.value = value[Math.floor(Math.random() * value.length)];
  }
  draw() {
    ctx.fillStyle = "#ffc821";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle ='white'
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "20px arial";
    ctx.fillText(this.value, this.x - 12, this.y + 5);
  }
}
function handleResources() {
  if (gridcount % 300 === 0 && score < win_score) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (
      resources[i] &&
      mouse.x &&
      mouse.y &&
      test__collision(resources[i], mouse)
    ) {
      numberOfResources += resources[i].value;
      messages.push(
        new message(
          "+ " + resources[i].value,
          resources[i].x,
          resources[i].y,
          20,
          "black"
        )
      );
      messages.push(
        new message("+ " + resources[i].value, 300, 55, 20, "gold")
      );
      resources.splice(i, 1);
      i--;
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update_beam();

    if (enemyPosition.indexOf(defenders[i].y) !== -1) {
      // beam wont be fired untill enemy occurs
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (test__collision(defenders[i], enemies[j])) {
        enemies[i].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}
function gameStatus() {
  ctx.fillStyle = "black";
  ctx.font = "30px arial";
  ctx.fillText("Score: " + score, 170, 40);
  ctx.fillText("Resources: " + numberOfResources, 170, 80);
  if (gameOver) {
    fillStyle = "black";
    ctx.font = "90px arial";
    ctx.fillText("Game Over", 250, 330);
  }
  if (score > win_score) enemies.length = 0;

  if (score > win_score && enemies.length === 0) {
    ctx.fillStyle = "#ffc821";
    ctx.font = "60px arial";
    ctx.fillText("VIỆT NAM VÔ ĐỊCH", 230, 300);
    ctx.font = "30px arial";
    ctx.fillText("You win with " + score + " points", 334, 340);
  }
}

//event listener for creating defenders
gameboard.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGapping;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGapping;
  // to avoid placing the defenders at the same position
  if (gridPositionY < cellSize) return;
  // to restrict placing defenders after 5 vertical lines
  if (gridPositionX > 5 * cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderPower1 = 100;
  let defenderPower2 = 120;
  if (numberOfResources >= defenderPower1 && chosenDefender === 1 ) {
    defenders.push(new defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderPower1;
  } else if (numberOfResources >= defenderPower2 && chosenDefender === 2 ) {
    defenders.push(new defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderPower2;
  }
  else {
    messages.push(
      new message("Need more Resources", mouse.x, mouse.y, 20, "blue")
    );
  }
});

  function main__animation() {
    //to update ControlBar and grid after every change
    ctx.clearRect(0, 0, gameboard.width, gameboard.height);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(0, 0, displayBar.width, displayBar.height);
    grid__generate();
    handleDefenders();
    handleResources();
    handleBeams();
    enemy();
    selectDefender();
    gameStatus();
    handlemessages();
    gridcount++;
    if (!gameOver) requestAnimationFrame(main__animation);
  }
window.addEventListener('resize', ()=>{
  gameboardposition = gameboard.getBoundingClientRect();
});







//cc
