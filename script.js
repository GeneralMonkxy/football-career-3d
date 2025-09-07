// THREE.js 3D Football with AI

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("game").appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Field
const fieldGeometry = new THREE.PlaneGeometry(40, 20);
const fieldMaterial = new THREE.MeshPhongMaterial({ color: 0x0a5c0a });
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotation.x = -Math.PI / 2;
scene.add(field);

// Goals (white walls)
const goalMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const goalGeometry = new THREE.BoxGeometry(1, 5, 6);
const leftGoal = new THREE.Mesh(goalGeometry, goalMaterial);
leftGoal.position.set(-20.5, 2.5, 0);
scene.add(leftGoal);
const rightGoal = new THREE.Mesh(goalGeometry, goalMaterial);
rightGoal.position.set(20.5, 2.5, 0);
scene.add(rightGoal);

// Player (blue cube)
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(-10, 1, 0);
scene.add(player);

// Opponent (red cube)
const opponentMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const opponent = new THREE.Mesh(playerGeometry, opponentMaterial);
opponent.position.set(10, 1, 0);
scene.add(opponent);

// Ball (white sphere)
const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0.5, 0);
scene.add(ball);

// Camera setup
camera.position.set(0, 20, 30);
camera.lookAt(0, 0, 0);

// Controls
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Possession: "player", "opponent", or null
let possession = null;

function distance(a, b) {
  return Math.sqrt(
    (a.position.x - b.position.x) ** 2 +
    (a.position.z - b.position.z) ** 2
  );
}

function update() {
  let speed = 0.1;
  if (keys["1"]) speed = 0.2; // Sprint

  // Player movement
  if (keys["w"] || keys["ArrowUp"]) player.position.z -= speed;
  if (keys["s"] || keys["ArrowDown"]) player.position.z += speed;
  if (keys["a"] || keys["ArrowLeft"]) player.position.x -= speed;
  if (keys["d"] || keys["ArrowRight"]) player.position.x += speed;

  // Ball possession check
  if (distance(player, ball) < 1.5) possession = "player";
  else if (distance(opponent, ball) < 1.5) possession = "opponent";

  // Player actions
  if (possession === "player") {
    ball.position.x = player.position.x + 1; // ball sticks
    ball.position.z = player.position.z;

    if (keys["3"]) { // Shoot
      possession = null;
      ball.userData.vx = 0.5;
      ball.userData.vz = (Math.random() - 0.5) * 0.5;
    }
    if (keys["2"]) { // Pass
      possession = null;
      ball.userData.vx = 0.3;
      ball.userData.vz = 0;
    }
    if (keys["4"]) { // Lob
      possession = null;
      ball.userData.vx = 0.4;
      ball.userData.vz = -0.2;
    }
  }

  // Opponent AI
  if (possession === "opponent") {
    // Dribble towards left goal
    if (opponent.position.x > -19) opponent.position.x -= 0.08;
    ball.position.x = opponent.position.x - 1;
    ball.position.z = opponent.position.z;

    // Shoot when near goal
    if (opponent.position.x < -18) {
      possession = null;
      ball.userData.vx = -0.5;
      ball.userData.vz = (Math.random() - 0.5) * 0.3;
    }
  } else {
    // Chase ball when no possession
    if (ball.position.x > opponent.position.x) opponent.position.x += 0.05;
    if (ball.position.x < opponent.position.x) opponent.position.x -= 0.05;
    if (ball.position.z > opponent.position.z) opponent.position.z += 0.05;
    if (ball.position.z < opponent.position.z) opponent.position.z -= 0.05;
  }

  // Ball movement (if free)
  if (!ball.userData.vx) ball.userData.vx = 0;
  if (!ball.userData.vz) ball.userData.vz = 0;

  ball.position.x += ball.userData.vx;
  ball.position.z += ball.userData.vz;

  // Friction
  ball.userData.vx *= 0.98;
  ball.userData.vz *= 0.98;
}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

animate();

