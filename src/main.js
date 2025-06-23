import * as THREE from 'three';
import './style.css'; // 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { mazeMap } from './maze-data.js';

// Scene setup
const scene = new THREE.Scene();

// Camera & renderer
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 10, 7.5);
scene.add(light);

// Skybox
const loader = new THREE.CubeTextureLoader();
const skyTexture = loader.load([
  'https://threejs.org/examples/textures/cube/skybox/px.jpg',
  'https://threejs.org/examples/textures/cube/skybox/nx.jpg',
  'https://threejs.org/examples/textures/cube/skybox/py.jpg',
  'https://threejs.org/examples/textures/cube/skybox/ny.jpg',
  'https://threejs.org/examples/textures/cube/skybox/pz.jpg',
  'https://threejs.org/examples/textures/cube/skybox/nz.jpg',
]);
scene.background = skyTexture;

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());
camera.position.set(1.5, 1.6, 1.5);

// Brick texture for walls
const textureLoader = new THREE.TextureLoader();
const brickTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;
brickTexture.repeat.set(1, 1);

// Maze rendering
const tileSize = 3;
mazeMap.forEach((row, z) => {
  row.forEach((tile, x) => {
    const posX = x * tileSize;
    const posZ = z * tileSize;

    if (tile === '1') {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, 3, tileSize),
        new THREE.MeshStandardMaterial({ map: brickTexture })
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
    }

    if (tile === 'T') {
      const trap = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, 0.1, tileSize),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      trap.position.set(posX, 0.05, posZ);
      scene.add(trap);
    }
  });
});

// Movement logic
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, backward: false, left: false, right: false };
let canJump = false;
let mouseDown = false;
const normalSpeed = 30;
const runMultiplier = 2;

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
function animate() {
  const delta = clock.getDelta();
  const speed = normalSpeed * (mouseDown ? runMultiplier : 1.0);

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 30.0 * delta; // gravity

  direction.z = Number(move.forward) - Number(move.backward);
  direction.x = Number(move.right) - Number(move.left);
  direction.normalize();

  if (controls.isLocked) {
    if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta;

    // Prevent falling below floor
    if (controls.getObject().position.y < 1.6) {
      velocity.y = 0;
      controls.getObject().position.y = 1.6;
      canJump = true;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();