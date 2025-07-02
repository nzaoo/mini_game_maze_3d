import * as THREE from 'three';
import './style.css';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// =============== MAZE GENERATOR ===============
class MazeGenerator {
  constructor (width, height) {
    // Ensure odd dimensions for proper maze generation
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.maze = [];
    this.visited = [];
  }

  generate () {
    // Initialize maze with walls
    for (let y = 0; y < this.height; y++) {
      this.maze[y] = [];
      this.visited[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.maze[y][x] = 1; // Wall
        this.visited[y][x] = false;
      }
    }

    // Start from (1,1) and use recursive backtracking
    this.carvePath(1, 1);

    // Set start and end points
    this.maze[1][1] = 'S'; // Start
    this.maze[this.height - 2][this.width - 2] = 'E'; // End

    // Add some rewards and traps randomly
    this.addRewardsAndTraps();

    return this.maze;
  }

  carvePath (x, y) {
    this.visited[y][x] = true;
    this.maze[y][x] = 0; // Path

    const directions = [
      [0, -2], // North
      [2, 0],  // East
      [0, 2],  // South
      [-2, 0],  // West
    ];

    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX > 0 && newX < this.width - 1 && newY > 0 && newY < this.height - 1 && !this.visited[newY][newX]) {
        this.maze[y + dy / 2][x + dx / 2] = 0; // Carve wall between cells
        this.carvePath(newX, newY);
      }
    }
  }

  addRewardsAndTraps () {
    const pathCells = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.maze[y][x] === 0) {
          pathCells.push([x, y]);
        }
      }
    }

    // Add rewards (10% of path cells)
    const rewardCount = Math.floor(pathCells.length * 0.1);
    for (let i = 0; i < rewardCount; i++) {
      const randomIndex = Math.floor(Math.random() * pathCells.length);
      const [x, y] = pathCells.splice(randomIndex, 1)[0];
      this.maze[y][x] = 'R';
    }

    // Add traps (5% of path cells)
    const trapCount = Math.floor(pathCells.length * 0.05);
    for (let i = 0; i < trapCount; i++) {
      const randomIndex = Math.floor(Math.random() * pathCells.length);
      const [x, y] = pathCells.splice(randomIndex, 1)[0];
      this.maze[y][x] = 'T';
    }
  }
}

// =============== PROFESSIONAL 3D MAZE GAME ===============
class ProfessionalMazeGame {
  constructor () {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.orbitControls = null;
    this.maze = null;
    this.player = null;
    this.walls = [];
    this.rewards = [];
    this.traps = [];
    this.lights = [];
    this.particles = [];
    this.score = 0;
    this.isGameOver = false;
    this.isGameWon = false;
    this.currentLevel = 0;
    this.mazeSize = 25;
    this.tileSize = 4;
    this.playerHeight = 2;
    this.playerRadius = 0.8;
    this.moveSpeed = 20;
    this.runSpeed = 30;
    this.jumpPower = 8;
    this.gravity = 20;
    this.velocity = new THREE.Vector3();
    this.moveState = { forward: false, backward: false, left: false, right: false };
    this.canJump = false;
    this.isRunning = false;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.ambientLight = null;
    this.directionalLight = null;
    this.spotLight = null;
    this.fog = null;
    this.textureLoader = new THREE.TextureLoader();
    this.materials = {};
    this.geometries = {};
    this.soundManager = null;
    this.ui = null;
    this.minimap = null;
    this.isPaused = false;
    this.cameraMode = 'firstPerson'; // 'firstPerson' or 'orbit'

    this.init();
  }

  init () {
    this.createScene();
    this.createLights();
    this.createMaterials();
    this.createUI();
    this.createMinimap();
    this.setupEventListeners();
    this.loadLevel(0);
    this.animate();
  }

  createScene () {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e0eafc');

    // Fog for atmosphere (sáng)
    this.fog = new THREE.Fog('#e0eafc', 50, 200);
    this.scene.fog = this.fog;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, this.playerHeight, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new PointerLockControls(this.camera, document.body);
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enabled = false;
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.maxDistance = 100;
    this.orbitControls.minDistance = 10;
  }

  createLights () {
    // Ambient light (sáng hơn)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(this.ambientLight);

    // Directional light (sun, sáng hơn)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.scene.add(this.directionalLight);

    // Spot light for player (sáng hơn)
    this.spotLight = new THREE.SpotLight(0xffffff, 1.2, 40, Math.PI / 5, 0.4);
    this.spotLight.position.copy(this.camera.position);
    this.spotLight.target.position.set(0, 0, -10);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
  }

  createMaterials () {
    // Wall material with normal mapping
    const wallTexture = this.textureLoader.load('public/tuong.jpg');
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);

    this.materials.wall = new THREE.MeshStandardMaterial({
      map: wallTexture,
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5),
    });

    // Floor material
    const floorTexture = this.textureLoader.load('public/cỏ.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    this.materials.floor = new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: 0x4a5d23,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Reward material
    this.materials.reward = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0x444400,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Trap material
    this.materials.trap = new THREE.MeshStandardMaterial({
      color: 0xFF4444,
      emissive: 0x440000,
      metalness: 0.3,
      roughness: 0.7,
    });

    // Finish material
    this.materials.finish = new THREE.MeshStandardMaterial({
      color: 0x00FF00,
      emissive: 0x004400,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Player material
    this.materials.player = new THREE.MeshStandardMaterial({
      color: 0x4A90E2,
      metalness: 0.2,
      roughness: 0.8,
    });
  }

  createUI () {
    this.ui = document.createElement('div');
    this.ui.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      color: #222;
      font-family: 'Arial', sans-serif;
      font-size: 18px;
      z-index: 100;
      background: rgba(255,255,255,0.92);
      padding: 15px;
      border-radius: 10px;
      border: 2px solid #4CAF50;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    `;
    this.ui.innerHTML = `
      <div style="margin-bottom: 10px; font-size: 24px; font-weight: bold; color: #2196F3; text-shadow: 0 2px 8px #e0eafc;">
        🏰 MAZE EXPLORER
      </div>
      <div style="margin-bottom: 5px;">🏆 Score: <span id="score">0</span></div>
      <div style="margin-bottom: 5px;">🎮 Level: <span id="level">1</span></div>
      <div style="margin-bottom: 10px; color: #333;">💡 Controls: WASD to move, Mouse to look, Space to jump, C to change camera</div>
      <div style="font-size: 14px; color: #1976D2;">Click to start exploring!</div>
    `;
    document.body.appendChild(this.ui);
  }

  createMinimap () {
    this.minimap = document.createElement('canvas');
    this.minimap.width = 200;
    this.minimap.height = 200;
    this.minimap.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255,255,255,0.92);
      border: 2px solid #4CAF50;
      border-radius: 10px;
      z-index: 100;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    `;
    document.body.appendChild(this.minimap);
    this.minimapCtx = this.minimap.getContext('2d');
  }

  setupEventListeners () {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse events
    document.addEventListener('click', () => {
      if (!this.isPaused && this.cameraMode === 'firstPerson' && !this.controls.isLocked) {
        this.controls.lock();
      }
    });

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onKeyDown (e) {
    if (this.isGameOver || this.isGameWon || this.isPaused) {return;}

    switch (e.code) {
    case 'KeyW': this.moveState.forward = true; break;
    case 'KeyS': this.moveState.backward = true; break;
    case 'KeyA': this.moveState.left = true; break;
    case 'KeyD': this.moveState.right = true; break;
    case 'Space': this.jump(); break;
    case 'KeyC': this.toggleCameraMode(); break;
    case 'Escape': this.togglePause(); break;
    }
  }

  onKeyUp (e) {
    switch (e.code) {
    case 'KeyW': this.moveState.forward = false; break;
    case 'KeyS': this.moveState.backward = false; break;
    case 'KeyA': this.moveState.left = false; break;
    case 'KeyD': this.moveState.right = false; break;
    }
  }

  onWindowResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  toggleCameraMode () {
    this.cameraMode = this.cameraMode === 'firstPerson' ? 'orbit' : 'firstPerson';

    if (this.cameraMode === 'firstPerson') {
      this.controls.enabled = true;
      this.orbitControls.enabled = false;
      this.camera.position.copy(this.player.position);
      this.camera.position.y += this.playerHeight;
    } else {
      this.controls.enabled = false;
      this.orbitControls.enabled = true;
      this.orbitControls.target.copy(this.player.position);
      this.camera.position.set(50, 50, 50);
    }
  }

  togglePause () {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.controls.unlock();
    }
  }

  jump () {
    if (this.canJump) {
      this.velocity.y = this.jumpPower;
      this.canJump = false;
    }
  }

  loadLevel (level) {
    this.currentLevel = level;
    this.clearLevel();

    // Generate maze
    const generator = new MazeGenerator(this.mazeSize, this.mazeSize);
    this.maze = generator.generate();

    this.buildMaze();
    this.createPlayer();
    // Đảm bảo controls.getObject() luôn ở ô trống đầu tiên
    let found = false;
    for (let y = 1; y < this.maze.length - 1 && !found; y++) {
      for (let x = 1; x < this.maze[y].length - 1 && !found; x++) {
        if (this.maze[y][x] === 0 || this.maze[y][x] === 'S') {
          const px = (x - this.mazeSize / 2) * this.tileSize;
          const pz = (y - this.mazeSize / 2) * this.tileSize;
          this.controls.getObject().position.set(px, this.playerHeight / 2, pz);
          
          found = true;
        }
      }
    }
    this.updateUI();
    this.updateMinimap();
  }

  clearLevel () {
    // Remove all objects
    this.walls.forEach(wall => this.scene.remove(wall));
    this.rewards.forEach(reward => this.scene.remove(reward));
    this.traps.forEach(trap => this.scene.remove(trap));
    if (this.player) {this.scene.remove(this.player);}

    this.walls = [];
    this.rewards = [];
    this.traps = [];
    this.player = null;
    this.score = 0;
    this.isGameOver = false;
    this.isGameWon = false;
  }

  buildMaze () {
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(
      this.mazeSize * this.tileSize,
      this.mazeSize * this.tileSize,
    );
    const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Build maze walls and objects
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const posX = (x - this.mazeSize / 2) * this.tileSize;
        const posZ = (y - this.mazeSize / 2) * this.tileSize;

        if (cell === 1) {
          // Wall (liền mạch)
          const wallGeometry = new THREE.BoxGeometry(
            this.tileSize,
            this.tileSize * 1.5,
            this.tileSize,
          );
          const wall = new THREE.Mesh(wallGeometry, this.materials.wall);
          wall.position.set(posX, this.tileSize * 0.75, posZ);
          wall.castShadow = true;
          wall.receiveShadow = true;
          this.scene.add(wall);
          this.walls.push(wall);
        } else if (cell === 'R') {
          // Reward
          const rewardGeometry = new THREE.SphereGeometry(0.5, 16, 16);
          const reward = new THREE.Mesh(rewardGeometry, this.materials.reward);
          reward.position.set(posX, 1, posZ);
          reward.castShadow = true;
          reward.userData.type = 'reward';
          this.scene.add(reward);
          this.rewards.push(reward);
        } else if (cell === 'T') {
          // Trap
          const trapGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
          const trap = new THREE.Mesh(trapGeometry, this.materials.trap);
          trap.position.set(posX, 0.1, posZ);
          trap.receiveShadow = true;
          trap.userData.type = 'trap';
          this.scene.add(trap);
          this.traps.push(trap);
        } else if (cell === 'E') {
          // Finish
          const finishGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
          const finish = new THREE.Mesh(finishGeometry, this.materials.finish);
          finish.position.set(posX, 0.25, posZ);
          finish.castShadow = true;
          finish.userData.type = 'finish';
          this.scene.add(finish);
        }
      }
    }
  }

  createPlayer () {
    const playerGeometry = new THREE.CapsuleGeometry(this.playerRadius, this.playerHeight - this.playerRadius * 2, 8, 16);
    this.player = new THREE.Mesh(playerGeometry, this.materials.player);
    this.player.castShadow = true;
    this.scene.add(this.player);
  }

  updatePlayerMovement (delta) {
    if (this.isGameOver || this.isGameWon || this.isPaused) {return;}
    const speed = this.isRunning ? this.runSpeed : this.moveSpeed;
    // Apply gravity
    this.velocity.y -= this.gravity * delta;
    // Calculate movement
    const moveVector = new THREE.Vector3();
    if (this.moveState.forward || this.moveState.backward) {
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      moveVector.add(forward.multiplyScalar(
        (this.moveState.forward ? 1 : -1) * speed * delta,
      ));
    }
    if (this.moveState.left || this.moveState.right) {
      const right = new THREE.Vector3();
      this.camera.getWorldDirection(right);
      right.cross(new THREE.Vector3(0, 1, 0));
      right.y = 0;
      right.normalize();
      moveVector.add(right.multiplyScalar(
        (this.moveState.right ? 1 : -1) * speed * delta,
      ));
    }
    // Di chuyển controls.getObject() thay vì player mesh
    const obj = this.controls.getObject();
    const nextPosition = obj.position.clone().add(moveVector);
    const collision = this.checkCollision(nextPosition);
    if (!collision) {
      obj.position.copy(nextPosition);
    }
    // Apply vertical movement
    obj.position.y += this.velocity.y * delta;
    // Ground collision
    if (obj.position.y < this.playerHeight / 2) {
      obj.position.y = this.playerHeight / 2;
      this.velocity.y = 0;
      this.canJump = true;
    }
    // Nếu có player mesh, sync vị trí mesh với controls.getObject()
    if (this.player) {
      this.player.position.copy(obj.position);
    }
    // Update spot light
    this.spotLight.position.copy(this.camera.position);
    const target = new THREE.Vector3();
    this.camera.getWorldDirection(target);
    this.spotLight.target.position.copy(this.camera.position).add(target.multiplyScalar(10));
  }

  checkCollision (position) {
    const playerRadius = this.playerRadius;
    const checks = [
      [position.x + playerRadius, position.z],
      [position.x - playerRadius, position.z],
      [position.x, position.z + playerRadius],
      [position.x, position.z - playerRadius],
      [position.x + playerRadius * 0.7, position.z + playerRadius * 0.7],
      [position.x - playerRadius * 0.7, position.z - playerRadius * 0.7],
      [position.x + playerRadius * 0.7, position.z - playerRadius * 0.7],
      [position.x - playerRadius * 0.7, position.z + playerRadius * 0.7],
    ];
    for (const [x, z] of checks) {
      const mazeX = Math.floor((x + this.mazeSize * this.tileSize / 2) / this.tileSize);
      const mazeZ = Math.floor((z + this.mazeSize * this.tileSize / 2) / this.tileSize);
      const cell = (mazeZ >= 0 && mazeZ < this.maze.length && mazeX >= 0 && mazeX < this.maze[mazeZ].length) ? this.maze[mazeZ][mazeX] : 'OUT';
      if (mazeX < 0 || mazeX >= this.mazeSize || mazeZ < 0 || mazeZ >= this.mazeSize) {
        return true; // Out of bounds
      }
      if (cell === 1) {
        return true; // Wall collision
      }
    }
    return false;
  }

  checkInteractions () {
    // Dùng vị trí controls.getObject() để kiểm tra va chạm
    const obj = this.controls.getObject();
    // Check rewards
    for (let i = this.rewards.length - 1; i >= 0; i--) {
      const reward = this.rewards[i];
      if (obj.position.distanceTo(reward.position) < 1.5) {
        this.scene.remove(reward);
        this.rewards.splice(i, 1);
        this.score += 10;
        this.createParticleEffect(reward.position, 0xFFD700);
        this.updateUI();
      }
    }
    // Check traps
    for (const trap of this.traps) {
      if (obj.position.distanceTo(trap.position) < 1.5) {
        this.gameOver();
        return;
      }
    }
    // Check finish
    const finishPosition = new THREE.Vector3(
      (this.mazeSize - 2 - this.mazeSize / 2) * this.tileSize,
      0.25,
      (this.mazeSize - 2 - this.mazeSize / 2) * this.tileSize,
    );
    if (obj.position.distanceTo(finishPosition) < 2) {
      this.gameWon();
    }
  }

  createParticleEffect (position, color) {
    const particleCount = 20;
    const particles = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      particle.position.copy(position);
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 10,
      );
      particle.userData.life = 1.0;

      particles.add(particle);
    }

    this.scene.add(particles);
    this.particles.push(particles);
  }

  updateParticles (delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particleGroup = this.particles[i];

      particleGroup.children.forEach(particle => {
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(delta));
        particle.userData.velocity.y -= 20 * delta; // Gravity
        particle.userData.life -= delta;
        particle.material.opacity = particle.userData.life;
      });

      if (particleGroup.children[0].userData.life <= 0) {
        this.scene.remove(particleGroup);
        this.particles.splice(i, 1);
      }
    }
  }

  gameOver () {
    this.isGameOver = true;
    this.controls.unlock();
    alert('Game Over! You hit a trap!');
    this.loadLevel(this.currentLevel);
  }

  gameWon () {
    this.isGameWon = true;
    this.controls.unlock();
    alert(`Congratulations! You completed level ${this.currentLevel + 1}!`);
    this.loadLevel(this.currentLevel + 1);
  }

  updateUI () {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    if (scoreElement) {scoreElement.textContent = this.score;}
    if (levelElement) {levelElement.textContent = this.currentLevel + 1;}
  }

  updateMinimap () {
    if (!this.minimapCtx || !this.maze) {return;}

    const ctx = this.minimapCtx;
    const size = this.minimap.width;
    const cellSize = size / this.mazeSize;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    // Draw maze
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        const cell = this.maze[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        if (cell === 1) {
          ctx.fillStyle = '#555';
          ctx.fillRect(px, py, cellSize, cellSize);
        } else if (cell === 'R') {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 'T') {
          ctx.fillStyle = '#FF4444';
          ctx.fillRect(px + cellSize / 4, py + cellSize / 4, cellSize / 2, cellSize / 2);
        } else if (cell === 'E') {
          ctx.fillStyle = '#00FF00';
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw player
    if (this.player) {
      const playerX = (this.player.position.x + this.mazeSize * this.tileSize / 2) / this.tileSize;
      const playerZ = (this.player.position.z + this.mazeSize * this.tileSize / 2) / this.tileSize;

      ctx.fillStyle = '#4A90E2';
      ctx.beginPath();
      ctx.arc(
        playerX * cellSize,
        playerZ * cellSize,
        cellSize / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
  }

  animate () {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    if (!this.isPaused) {
      this.updatePlayerMovement(delta);
      this.checkInteractions();
      this.updateParticles(delta);
      this.updateMinimap();

      if (this.orbitControls.enabled) {
        this.orbitControls.update();
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
  game = new ProfessionalMazeGame();
});

// Export for debugging
window.game = game;
