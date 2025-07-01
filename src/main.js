import * as THREE from 'three';
import './style.css'; // 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { mazeMaps } from './maze-data.js';

// Đảm bảo các biến toàn cục có thể gán lại đều là let
let scene, camera, renderer, controls, rewards, traps, endPosition, score, isGameOver, isGameWin, tileSize;
let currentLevel = 0;

// Thêm biến cho đèn pin
let flashlight;

// HUD hướng dẫn
const hud = document.getElementById('hud');
const scoreSpan = document.getElementById('score');
const guide = document.createElement('div');
guide.innerHTML = `Điều khiển: W/A/S/D di chuyển, Chuột để nhìn, Nhấn giữ chuột trái để chạy, Space để nhảy`;
guide.style.fontSize = '14px';
guide.style.marginTop = '8px';
hud.appendChild(guide);

// === Timer ===
let timeLeft = 90; // 90 giây cho mỗi màn
const timerDiv = document.createElement('div');
timerDiv.style.fontSize = '20px';
timerDiv.style.marginTop = '8px';
timerDiv.style.color = '#fff';
timerDiv.innerText = '⏰ 90';
hud.appendChild(timerDiv);
let timerInterval;
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 90;
  timerDiv.innerText = '⏰ ' + timeLeft;
  timerInterval = setInterval(() => {
    if (isGameOver || isGameWin) return;
    timeLeft--;
    timerDiv.innerText = '⏰ ' + timeLeft;
    if (timeLeft <= 0) {
      isGameOver = true;
      loseAudio.currentTime = 0; loseAudio.play();
      showMessage('Hết giờ! Bạn đã thua!');
      setTimeout(() => loadLevel(currentLevel), 2500);
      clearInterval(timerInterval);
    }
  }, 1000);
}

// Scene setup
scene = new THREE.Scene();

// Camera & renderer
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x222233, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 10, 7.5);
scene.add(light);

// Bỏ hoàn toàn code skybox, chỉ dùng màu nền trời đơn giản

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Controls
controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());
camera.position.set(1.5, 1.6, 1.5);

// Brick texture for walls
// Không dùng texture ngoài, chỉ dùng màu gạch sáng

// Maze rendering
tileSize = 3;
score = 0;
isGameOver = false;
isGameWin = false;
rewards = [];
traps = [];
endPosition = { x: (mazeMaps[0][0].length - 2) * tileSize, z: (mazeMaps[0].length - 2) * tileSize };

// === Minimap ===
const minimapCanvas = document.createElement('canvas');
minimapCanvas.width = 180;
minimapCanvas.height = 180;
minimapCanvas.style.position = 'fixed';
minimapCanvas.style.bottom = '20px';
minimapCanvas.style.left = '20px';
minimapCanvas.style.background = 'rgba(0,0,0,0.7)';
minimapCanvas.style.border = '2px solid #fff';
minimapCanvas.style.borderRadius = '10px';
minimapCanvas.style.zIndex = '150';
document.body.appendChild(minimapCanvas);
const minimapCtx = minimapCanvas.getContext('2d');

function drawMinimap(mazeMap, playerPos) {
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;
  minimapCtx.clearRect(0, 0, w, h);
  const rows = mazeMap.length;
  const cols = mazeMap[0].length;
  const cellW = w / cols;
  const cellH = h / rows;
  // Vẽ mê cung
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      if (mazeMap[z][x] === '1') {
        minimapCtx.fillStyle = '#444';
        minimapCtx.fillRect(x * cellW, z * cellH, cellW, cellH);
      } else if (mazeMap[z][x] === 'R') {
        minimapCtx.fillStyle = '#ff0';
        minimapCtx.beginPath();
        minimapCtx.arc((x+0.5)*cellW, (z+0.5)*cellH, cellW/4, 0, 2*Math.PI);
        minimapCtx.fill();
      } else if (mazeMap[z][x] === 'T') {
        minimapCtx.fillStyle = '#f00';
        minimapCtx.fillRect(x * cellW + cellW/4, z * cellH + cellH/4, cellW/2, cellH/2);
      }
    }
  }
  // Vẽ điểm kết thúc
  minimapCtx.fillStyle = '#0f0';
  minimapCtx.fillRect((cols-2)*cellW+cellW/4, (rows-2)*cellH+cellH/4, cellW/2, cellH/2);
  // Vẽ người chơi
  minimapCtx.fillStyle = '#0af';
  const px = playerPos.x / tileSize;
  const pz = playerPos.z / tileSize;
  minimapCtx.beginPath();
  minimapCtx.arc((px+0.5)*cellW, (pz+0.5)*cellH, cellW/4, 0, 2*Math.PI);
  minimapCtx.fill();
}

// === Thêm UI chọn màn chơi ===
function createLevelSelector() {
  const selector = document.createElement('div');
  selector.style.position = 'fixed';
  selector.style.top = '20px';
  selector.style.right = '20px';
  selector.style.zIndex = '200';
  selector.style.background = 'rgba(0,0,0,0.7)';
  selector.style.color = '#fff';
  selector.style.padding = '10px 20px';
  selector.style.borderRadius = '10px';
  selector.style.fontSize = '18px';
  selector.innerHTML = 'Chọn màn: ';
  mazeMaps.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.innerText = i + 1;
    btn.style.margin = '0 4px';
    btn.onclick = () => { loadLevel(i); };
    selector.appendChild(btn);
  });
  document.body.appendChild(selector);
}
createLevelSelector();

// Movement logic
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, backward: false, left: false, right: false };
let canJump = false;
let mouseDown = false;
const normalSpeed = 30;
const runMultiplier = 2;

// Sử dụng âm thanh nội bộ (bạn cần đặt file vào public/audio/)
const rewardAudio = new Audio('/audio/reward.mp3');
const trapAudio = new Audio('/audio/trap.mp3');
const winAudio = new Audio('/audio/win.mp3');
const loseAudio = new Audio('/audio/lose.mp3');

// Thông báo thắng/thua
const messageDiv = document.createElement('div');
messageDiv.style.position = 'fixed';
messageDiv.style.top = '50%';
messageDiv.style.left = '50%';
messageDiv.style.transform = 'translate(-50%, -50%)';
messageDiv.style.fontSize = '40px';
messageDiv.style.color = '#fff';
messageDiv.style.background = 'rgba(0,0,0,0.8)';
messageDiv.style.padding = '30px 60px';
messageDiv.style.borderRadius = '20px';
messageDiv.style.display = 'none';
messageDiv.style.zIndex = '999';
document.body.appendChild(messageDiv);

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
    case 'Space':
      if (canJump) {
        velocity.y += 7;
        canJump = false;
      }
      break;
  }
});
document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
  }
});
document.addEventListener('mousedown', () => { mouseDown = true; });
document.addEventListener('mouseup', () => { mouseDown = false; });

const clock = new THREE.Clock();

// Animation chuyển động mượt hơn
let jumpAnim = 0;
let runAnim = 0;

let mazeMap = null; // Khai báo toàn cục

const playerRadius = 0.3; // bán kính người chơi

// Đơn giản hóa kiểm tra va chạm
function isWallSimple(x, z) {
  if (!mazeMap) return false;
  const col = Math.floor(x / tileSize);
  const row = Math.floor(z / tileSize);
  if (row < 0 || row >= mazeMap.length || col < 0 || col >= mazeMap[0].length) return true;
  return mazeMap[row][col] === '1';
}

function animate() {
  if (isGameOver || isGameWin) return;
  const delta = clock.getDelta();
  const speed = normalSpeed * (mouseDown ? runMultiplier : 1.0);

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 30.0 * delta; // gravity

  direction.z = Number(move.forward) - Number(move.backward);
  direction.x = Number(move.right) - Number(move.left);
  direction.normalize();

  if (controls.isLocked) {
    // Tính toán vị trí mới
    let moveX = 0, moveZ = 0;
    if (move.forward || move.backward) moveZ -= direction.z * speed * delta;
    if (move.left || move.right) moveX -= direction.x * speed * delta;
    // Kiểm tra va chạm tường đơn giản
    const obj = controls.getObject();
    const nextX = obj.position.x + moveX;
    const nextZ = obj.position.z + moveZ;
    if (!isWallSimple(nextX, obj.position.z)) obj.position.x += moveX;
    if (!isWallSimple(obj.position.x, nextZ)) obj.position.z += moveZ;
    obj.position.y += velocity.y * delta;
    // Prevent falling below floor
    if (obj.position.y < 1.6) {
      velocity.y = 0;
      obj.position.y = 1.6;
      canJump = true;
    }

    // Kiểm tra va chạm phần thưởng
    for (let i = rewards.length - 1; i >= 0; i--) {
      if (checkCollision(controls.getObject(), rewards[i])) {
        scene.remove(rewards[i]);
        rewards.splice(i, 1);
        score += 10;
        scoreSpan.innerText = score;
        rewardAudio.currentTime = 0; rewardAudio.play();
      }
    }
    // Kiểm tra va chạm bẫy
    for (let i = 0; i < traps.length; i++) {
      if (checkCollision(controls.getObject(), traps[i], 1.5)) {
        isGameOver = true;
        loseAudio.currentTime = 0; loseAudio.play();
        showMessage('Bạn đã thua!');
        setTimeout(() => loadLevel(currentLevel), 2500);
        return;
      }
    }
    // Kiểm tra thắng
    if (checkEnd()) {
      isGameWin = true;
      winAudio.currentTime = 0; winAudio.play();
      showMessage('Bạn đã thắng!');
      setTimeout(() => loadLevel((currentLevel + 1) % mazeMaps.length), 2500);
      return;
    }
  }

  // Vẽ minimap và các logic khác chỉ khi mazeMap đã có
  if (mazeMap) {
    drawMinimap(mazeMap, controls.getObject().position);
  }

  renderer.render(scene, camera);

  // Cập nhật vị trí đèn pin theo camera
  if (flashlight) {
    flashlight.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    flashlight.target.position.copy(camera.position.clone().add(dir.multiplyScalar(10)));
  }

  // Animation khi nhảy
  if (!canJump) {
    jumpAnim += 0.15;
    camera.position.y += Math.sin(jumpAnim) * 0.03;
  } else {
    jumpAnim = 0;
  }
  // Animation khi chạy
  if (mouseDown && (move.forward || move.backward || move.left || move.right)) {
    runAnim += 0.25;
    camera.position.x += Math.sin(runAnim) * 0.03;
  } else {
    runAnim = 0;
  }

  requestAnimationFrame(animate);
}

function checkCollision(obj1, obj2, threshold = 1.2) {
  return obj1.position.distanceTo(obj2.position) < threshold;
}

function checkEnd() {
  const playerPos = controls.getObject().position;
  return (
    Math.abs(playerPos.x - endPosition.x) < 1.5 &&
    Math.abs(playerPos.z - endPosition.z) < 1.5
  );
}

function showMessage(msg, color = '#fff') {
  messageDiv.innerText = msg;
  messageDiv.style.color = color;
  messageDiv.style.display = 'block';
}

function hideMessage() {
  messageDiv.style.display = 'none';
}

// Đặt tileSize mặc định
function getTileSize() {
  return 3;
}

function loadLevel(levelIdx) {
  // Xóa scene cũ nếu có
  if (renderer) {
    renderer.dispose && renderer.dispose();
    renderer.domElement.remove();
  }
  // Reset biến
  tileSize = getTileSize();
  score = 0;
  isGameOver = false;
  isGameWin = false;
  rewards = [];
  traps = [];
  currentLevel = levelIdx;
  if (scoreSpan) scoreSpan.innerText = score;
  hideMessage && hideMessage();

  // Khởi tạo lại scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0x222233, 0.5));
  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // Đèn pin gắn vào camera
  flashlight = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 6, 0.5, 1.5);
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, 0, -1);
  camera.add(flashlight);
  camera.add(flashlight.target);
  scene.add(camera);

  // KHÔNG dùng skybox, chỉ dùng màu nền
  scene.background = new THREE.Color(0x87ceeb);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Controls
  controls = new PointerLockControls(camera, document.body);
  document.addEventListener('click', () => controls.lock());
  scene.add(controls.getObject());
  camera.position.set(1.5, 1.6, 1.5);

  // Maze rendering
  mazeMap = mazeMaps[levelIdx];
  endPosition = { x: (mazeMap[0].length - 2) * tileSize, z: (mazeMap.length - 2) * tileSize };
  mazeMap.forEach((row, z) => {
    row.forEach((tile, x) => {
      const posX = x * tileSize;
      const posZ = z * tileSize;
      if (tile === '1') {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize, 3, tileSize),
          new THREE.MeshStandardMaterial({ color: 0xf5e1b0, roughness: 0.4, metalness: 0.1 })
        );
        wall.position.set(posX, 1.5, posZ);
        scene.add(wall);
      }
      if (tile === 'R') {
        const reward = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xffff00 })
        );
        reward.position.set(posX, 0.5, posZ);
        scene.add(reward);
        rewards.push(reward);
      }
      if (tile === 'T') {
        const trap = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize, 0.1, tileSize),
          new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        trap.position.set(posX, 0.05, posZ);
        scene.add(trap);
        traps.push(trap);
      }
    });
  });

  // Lưu mazeMap ra biến toàn cục để minimap dùng
  window.mazeMap = mazeMap;

  // Khởi động lại animate
  animate();

  // Trong loadLevel, sau khi animate:
  startTimer();

  // Trong loadLevel, sau khi tạo scene:
  scene.background = new THREE.Color(0x87ceeb);
}

// Gọi loadLevel(0) khi khởi động
loadLevel(0);