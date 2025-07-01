import * as THREE from 'three';
import './style.css';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { mazeMaps } from './maze-data.js';

// Import new components and utilities
import { configManager } from './config/game-config.js';
import { AudioManager } from './managers/AudioManager.js';



// =============== ENHANCED GAME STATE MANAGEMENT ===============
class GameState {
  constructor () {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.rewards = [];
    this.traps = [];
    this.walls = [];
    this.endPosition = { x: 0, z: 0 };
    this.score = 0;
    this.isGameOver = false;
    this.isGameWin = false;
    this.currentLevel = 0;
    this.tileSize = 3;
    this.timeLeft = 90;
    this.timerInterval = null;
    this.flashlight = null;
    this.mazeMap = null;
    
    // Enhanced player physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.move = { forward: false, backward: false, left: false, right: false };
    this.canJump = false;
    this.mouseDown = false;
    this.playerRadius = configManager.get('physics.playerRadius');
    
    // Performance
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    
    // Animation
    this.jumpAnim = 0;
    this.runAnim = 0;
    
    // New systems
    this.particleSystem = null;
    this.postProcessing = null;
    this.inventory = null;
    this.achievements = null;
    this.audioManager = null;
    
    // Statistics
    this.statistics = {
      totalPlayTime: 0,
      levelsCompleted: 0,
      totalScore: 0,
      rewardsCollected: 0,
      trapsHit: 0,
      deaths: 0,
      jumps: 0,
      distanceTraveled: 0,
      perfectLevels: 0,
      speedRuns: 0,
    };
    
    // Level tracking
    this.levelStartTime = 0;
    this.levelPerfect = true;
  }
  
  reset () {
    this.rewards = [];
    this.traps = [];
    this.walls = [];
    this.score = 0;
    this.isGameOver = false;
    this.isGameWin = false;
    this.velocity.set(0, 0, 0);
    this.jumpAnim = 0;
    this.runAnim = 0;
    this.canJump = false;
    this.levelPerfect = true;
    clearInterval(this.timerInterval);
  }
  
  dispose () {
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    if (this.scene) {
      this.scene.clear();
    }
    if (this.particleSystem) {
      this.particleSystem.dispose();
    }
    if (this.postProcessing) {
      this.postProcessing.dispose();
    }
    if (this.audioManager) {
      this.audioManager.dispose();
    }
    clearInterval(this.timerInterval);
  }
}

// =============== UI MANAGER ===============
class UIManager {
  constructor (gameState, audioManager) {
    this.gameState = gameState;
    this.audioManager = audioManager;
    this.createHUD();
    this.createMinimap();
    this.createLevelSelector();
    this.createMessage();
    this.createSettings();
  }
  
  createHUD () {
    this.hud = document.getElementById('hud') || this.createElement('div', {
      id: 'hud',
      style: {
        position: 'fixed',
        top: '20px',
        left: '20px',
        color: '#fff',
        fontSize: '20px',
        zIndex: '100',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 25px',
        borderRadius: '10px',
        fontFamily: 'monospace',
      },
    });
    
    this.hud.innerHTML = `
      <div>🏆 Điểm: <span id="score">0</span></div>
      <div id="timer">⏰ 90</div>
      <div style="font-size: 14px; margin-top: 8px;">
        W/A/S/D: Di chuyển | Chuột: Nhìn | Giữ chuột trái: Chạy | Space: Nhảy
      </div>
      <div style="font-size: 12px; margin-top: 5px; color: #FFD700;">
        💡 Click để bắt đầu chơi
      </div>
    `;
    
    if (!document.body.contains(this.hud)) {
      document.body.appendChild(this.hud);
    }
    
    this.scoreSpan = document.getElementById('score');
    this.timerDiv = document.getElementById('timer');
  }
  
  createMinimap () {
    this.minimapCanvas = document.createElement('canvas');
    Object.assign(this.minimapCanvas, {
      width: 200,
      height: 200,
    });
    Object.assign(this.minimapCanvas.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      border: '3px solid #fff',
      borderRadius: '15px',
      zIndex: '150',
    });
    document.body.appendChild(this.minimapCanvas);
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }
  
  createLevelSelector () {
    const selector = this.createElement('div', {
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '200',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '15px 25px',
        borderRadius: '15px',
        fontSize: '16px',
        fontFamily: 'monospace',
      },
    });
    
    selector.innerHTML = '<div style="margin-bottom: 10px;">🎮 Chọn màn:</div>';
    
    const buttonContainer = this.createElement('div', {
      style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    });
    
    mazeMaps.forEach((_, i) => {
      const btn = this.createElement('button', {
        textContent: (i + 1).toString(),
        style: {
          padding: '8px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'background-color 0.3s',
        },
      });
      
      btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#45a049');
      btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#4CAF50');
      btn.addEventListener('click', () => game.loadLevel(i));
      
      buttonContainer.appendChild(btn);
    });
    
    selector.appendChild(buttonContainer);
    document.body.appendChild(selector);
  }
  
  createMessage () {
    this.messageDiv = this.createElement('div', {
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '48px',
        color: '#fff',
        background: 'rgba(0,0,0,0.9)',
        padding: '40px 80px',
        borderRadius: '25px',
        display: 'none',
        zIndex: '999',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        border: '3px solid #fff',
      },
    });
    document.body.appendChild(this.messageDiv);
  }
  
  createSettings () {
    const settings = this.createElement('div', {
      style: {
        position: 'fixed',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '20px',
        borderRadius: '15px',
        fontSize: '14px',
        zIndex: '180',
      },
    });
    
    settings.innerHTML = `
      <div style="margin-bottom: 15px; font-weight: bold;">⚙️ Cài đặt</div>
      <div style="margin-bottom: 10px;">
        <label>🔊 Âm lượng:</label>
        <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5">
      </div>
      <div>
        <button id="pauseBtn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">⏸️ Tạm dừng</button>
      </div>
    `;
    
    document.body.appendChild(settings);
    
    // Event listeners
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
      this.audioManager.setVolume(parseFloat(e.target.value));
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
      game.togglePause();
    });
  }
  
  createElement (tag, options = {}) {
    const element = document.createElement(tag);
    if (options.textContent) {element.textContent = options.textContent;}
    if (options.innerHTML) {element.innerHTML = options.innerHTML;}
    if (options.id) {element.id = options.id;}
    if (options.style) {Object.assign(element.style, options.style);}
    return element;
  }
  
  updateScore (score) {
    if (this.scoreSpan) {this.scoreSpan.textContent = score;}
  }
  
  updateTimer (time) {
    if (this.timerDiv) {this.timerDiv.textContent = `⏰ ${time}`;}
  }
  
  showMessage (msg, color = '#fff', duration = 2500) {
    this.messageDiv.textContent = msg;
    this.messageDiv.style.color = color;
    this.messageDiv.style.display = 'block';
    
    if (duration > 0) {
      setTimeout(() => this.hideMessage(), duration);
    }
  }
  
  hideMessage () {
    this.messageDiv.style.display = 'none';
  }
  
  drawMinimap (mazeMap, playerPos) {
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    this.minimapCtx.clearRect(0, 0, w, h);
    
    if (!mazeMap) {return;}
    
    const rows = mazeMap.length;
    const cols = mazeMap[0].length;
    const cellW = w / cols;
    const cellH = h / rows;
    
    // Draw maze
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const cell = mazeMap[z][x];
        if (cell === '1') {
          this.minimapCtx.fillStyle = '#555';
          this.minimapCtx.fillRect(x * cellW, z * cellH, cellW, cellH);
        } else if (cell === 'R') {
          this.minimapCtx.fillStyle = '#FFD700';
          this.minimapCtx.beginPath();
          this.minimapCtx.arc((x + 0.5) * cellW, (z + 0.5) * cellH, cellW / 3, 0, 2 * Math.PI);
          this.minimapCtx.fill();
        } else if (cell === 'T') {
          this.minimapCtx.fillStyle = '#FF4444';
          this.minimapCtx.fillRect(x * cellW + cellW / 4, z * cellH + cellH / 4, cellW / 2, cellH / 2);
        }
      }
    }
    
    // Draw finish
    this.minimapCtx.fillStyle = '#00FF00';
    this.minimapCtx.fillRect((cols - 2) * cellW + cellW / 4, (rows - 2) * cellH + cellH / 4, cellW / 2, cellH / 2);
    
    // Draw player
    this.minimapCtx.fillStyle = '#00BFFF';
    const px = playerPos.x / this.gameState.tileSize;
    const pz = playerPos.z / this.gameState.tileSize;
    this.minimapCtx.beginPath();
    this.minimapCtx.arc((px + 0.5) * cellW, (pz + 0.5) * cellH, cellW / 3, 0, 2 * Math.PI);
    this.minimapCtx.fill();
    
    // Add border
    this.minimapCtx.strokeStyle = '#FFF';
    this.minimapCtx.lineWidth = 2;
    this.minimapCtx.strokeRect(1, 1, w - 2, h - 2);
  }
}

// =============== PHYSICS MANAGER ===============
class PhysicsManager {
  constructor (gameState) {
    this.gameState = gameState;
    this.normalSpeed = 35;
    this.runMultiplier = 1.8;
    this.jumpPower = 8;
    this.gravity = 35;
    this.friction = 12;
  }
  
  isWall (x, z) {
    if (!this.gameState.mazeMap) {return false;}
    const col = Math.floor(x / this.gameState.tileSize);
    const row = Math.floor(z / this.gameState.tileSize);
    if (row < 0 || row >= this.gameState.mazeMap.length || 
        col < 0 || col >= this.gameState.mazeMap[0].length) {return true;}
    return this.gameState.mazeMap[row][col] === '1';
  }
  
  checkWallCollision (position, radius = 0.3) {
    const points = [
      { x: position.x + radius, z: position.z },
      { x: position.x - radius, z: position.z },
      { x: position.x, z: position.z + radius },
      { x: position.x, z: position.z - radius },
      { x: position.x + radius * 0.7, z: position.z + radius * 0.7 },
      { x: position.x - radius * 0.7, z: position.z - radius * 0.7 },
      { x: position.x + radius * 0.7, z: position.z - radius * 0.7 },
      { x: position.x - radius * 0.7, z: position.z + radius * 0.7 },
    ];
    
    return points.some(point => this.isWall(point.x, point.z));
  }
  
  updateMovement (delta) {
    const { velocity, direction, move, controls, mouseDown } = this.gameState;
    const speed = this.normalSpeed * (mouseDown ? this.runMultiplier : 1.0);
    
    // Apply friction
    velocity.x *= Math.max(0, 1 - this.friction * delta);
    velocity.z *= Math.max(0, 1 - this.friction * delta);
    velocity.y -= this.gravity * delta; // gravity
    
    // Calculate movement direction
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();
    
    // Debug movement state
    if (move.forward || move.backward || move.left || move.right) {
      console.log('Movement state:', {
        forward: move.forward,
        backward: move.backward,
        left: move.left,
        right: move.right,
        direction: { x: direction.x, z: direction.z },
        controlsLocked: controls.isLocked,
      });
    }
    
    // Auto-lock controls if not locked and player is trying to move
    if (!controls.isLocked && (move.forward || move.backward || move.left || move.right)) {
      
      controls.lock();
    }
    
    // Allow movement even if controls are not locked (for testing)
    const obj = controls.getObject();
    const currentPos = obj.position.clone();
    
    // Calculate intended movement
    const moveVector = new THREE.Vector3();
    if (move.forward || move.backward) {
      const forward = new THREE.Vector3();
      if (controls.isLocked) {
        controls.getDirection(forward);
      } else {
        // Default forward direction when not locked
        forward.set(0, 0, -1);
      }
      forward.y = 0;
      forward.normalize();
      moveVector.add(forward.multiplyScalar(-direction.z * speed * delta));
    }
    if (move.left || move.right) {
      const right = new THREE.Vector3();
      if (controls.isLocked) {
        controls.getDirection(right);
        right.cross(new THREE.Vector3(0, 1, 0));
      } else {
        // Default right direction when not locked
        right.set(1, 0, 0);
      }
      right.y = 0;
      right.normalize();
      moveVector.add(right.multiplyScalar(-direction.x * speed * delta));
    }
    
    // Check collision for X movement
    const nextX = currentPos.x + moveVector.x;
    if (!this.checkWallCollision(new THREE.Vector3(nextX, currentPos.y, currentPos.z))) {
      obj.position.x = nextX;
    }
    
    // Check collision for Z movement
    const nextZ = currentPos.z + moveVector.z;
    if (!this.checkWallCollision(new THREE.Vector3(obj.position.x, currentPos.y, nextZ))) {
      obj.position.z = nextZ;
    }
    
    // Handle jumping and vertical movement
    obj.position.y += velocity.y * delta;
    
    // Ground collision
    if (obj.position.y < 1.6) {
      velocity.y = 0;
      obj.position.y = 1.6;
      this.gameState.canJump = true;
    }
  }
  
  jump () {
    if (this.gameState.canJump) {
      this.gameState.velocity.y = this.jumpPower;
      this.gameState.canJump = false;
    }
  }
}

// =============== COLLISION MANAGER ===============
class CollisionManager {
  constructor (gameState, audioManager) {
    this.gameState = gameState;
    this.audioManager = audioManager;
  }
  
  checkCollision (obj1, obj2, threshold = 1.2) {
    return obj1.position.distanceTo(obj2.position) < threshold;
  }
  
  checkRewards () {
    const player = this.gameState.controls.getObject();
    for (let i = this.gameState.rewards.length - 1; i >= 0; i--) {
      if (this.checkCollision(player, this.gameState.rewards[i])) {
        // Remove from scene and array
        this.gameState.scene.remove(this.gameState.rewards[i]);
        this.gameState.rewards.splice(i, 1);
        
        // Update score
        this.gameState.score += 10;
        this.audioManager.play('reward');
        
        // Add particle effect
        this.createParticleEffect(player.position, 0xFFD700);
        
        return true;
      }
    }
    return false;
  }
  
  checkTraps () {
    const player = this.gameState.controls.getObject();
    for (const trap of this.gameState.traps) {
      if (this.checkCollision(player, trap, 1.5)) {
        this.audioManager.play('trap');
        return true;
      }
    }
    return false;
  }
  
  checkWin () {
    const playerPos = this.gameState.controls.getObject().position;
    const endPos = this.gameState.endPosition;
    return Math.abs(playerPos.x - endPos.x) < 1.5 && 
           Math.abs(playerPos.z - endPos.z) < 1.5;
  }
  
  createParticleEffect (position, color) {
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 4, 4),
        new THREE.MeshBasicMaterial({ color }),
      );
      
      particle.position.copy(position);
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 10,
      );
      
      particles.add(particle);
    }
    
    this.gameState.scene.add(particles);
    
    // Animate particles
    const startTime = Date.now();
    const animateParticles = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 1000) {
        this.gameState.scene.remove(particles);
        return;
      }
      
      particles.children.forEach(particle => {
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
        particle.userData.velocity.y -= 20 * 0.016; // gravity
        particle.material.opacity = 1 - elapsed / 1000;
      });
      
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }
}

// =============== MAIN GAME CLASS ===============
class MazeGame {
  constructor () {
    this.gameState = new GameState();
    this.audioManager = new AudioManager();
    this.ui = new UIManager(this.gameState, this.audioManager);
    this.physics = new PhysicsManager(this.gameState);
    this.collision = new CollisionManager(this.gameState, this.audioManager);
    this.isPaused = false;
    
    this.init();
  }
  
  init () {
    this.setupEventListeners();
  }
  
  setupEventListeners () {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    
    // Mouse events
    document.addEventListener('mousedown', () => { this.gameState.mouseDown = true; });
    document.addEventListener('mouseup', () => { this.gameState.mouseDown = false; });
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Prevent context menu
    document.addEventListener('contextmenu', e => e.preventDefault());
  }
  
  onKeyDown (e) {
    if (this.gameState.isGameOver || this.gameState.isGameWin) {return;}
    
    switch (e.code) {
    case 'KeyW': 
      this.gameState.move.forward = true; 
      console.log('W pressed - forward movement enabled');
      break;
    case 'KeyS': 
      this.gameState.move.backward = true; 
      console.log('S pressed - backward movement enabled');
      break;
    case 'KeyA': 
      this.gameState.move.left = true; 
      console.log('A pressed - left movement enabled');
      break;
    case 'KeyD': 
      this.gameState.move.right = true; 
      console.log('D pressed - right movement enabled');
      break;
    case 'Space':
      e.preventDefault();
      this.physics.jump();
      console.log('Space pressed - jump');
      break;
    case 'Escape':
      this.togglePause();
      break;
    }
  }
  
  onKeyUp (e) {
    switch (e.code) {
    case 'KeyW': 
      this.gameState.move.forward = false; 
      console.log('W released - forward movement disabled');
      break;
    case 'KeyS': 
      this.gameState.move.backward = false; 
      console.log('S released - backward movement disabled');
      break;
    case 'KeyA': 
      this.gameState.move.left = false; 
      console.log('A released - left movement disabled');
      break;
    case 'KeyD': 
      this.gameState.move.right = false; 
      console.log('D released - right movement disabled');
      break;
    }
  }
  
  onWindowResize () {
    if (!this.gameState.camera || !this.gameState.renderer) {return;}
    
    this.gameState.camera.aspect = window.innerWidth / window.innerHeight;
    this.gameState.camera.updateProjectionMatrix();
    this.gameState.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  togglePause () {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('pauseBtn');
    if (btn) {
      btn.textContent = this.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
    }
    
    if (this.isPaused) {
      clearInterval(this.gameState.timerInterval);
      this.ui.showMessage('⏸️ TẠM DỪNG', '#FFF', 0);
    } else {
      this.startTimer();
      this.ui.hideMessage();
      this.animate();
    }
  }
  
  startTimer () {
    clearInterval(this.gameState.timerInterval);
    this.gameState.timeLeft = 90;
    this.ui.updateTimer(this.gameState.timeLeft);
    
    this.gameState.timerInterval = setInterval(() => {
      if (this.gameState.isGameOver || this.gameState.isGameWin || this.isPaused) {return;}
      
      this.gameState.timeLeft--;
      this.ui.updateTimer(this.gameState.timeLeft);
      
      if (this.gameState.timeLeft <= 0) {
        this.gameOver('⏰ Hết giờ! Bạn đã thua!');
      }
    }, 1000);
  }
  
  gameOver (message) {
    this.gameState.isGameOver = true;
    this.audioManager.play('lose');
    this.ui.showMessage(message, '#FF4444');
    setTimeout(() => this.loadLevel(this.gameState.currentLevel), 2500);
    clearInterval(this.gameState.timerInterval);
  }
  
  gameWin () {
    this.gameState.isGameWin = true;
    this.audioManager.play('win');
    this.ui.showMessage('🎉 Bạn đã thắng!', '#00FF00');
    setTimeout(() => {
      const nextLevel = (this.gameState.currentLevel + 1) % mazeMaps.length;
      this.loadLevel(nextLevel);
    }, 2500);
    clearInterval(this.gameState.timerInterval);
  }
  
  createScene () {
    // Scene
    this.gameState.scene = new THREE.Scene();
    this.gameState.scene.background = new THREE.Color(0x87CEEB);
    
    // Camera
    this.gameState.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000,
    );
    
    // Renderer
    this.gameState.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    this.gameState.renderer.shadowMap.enabled = true;
    this.gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.gameState.renderer.domElement);
    
    // Enhanced Lighting - Much brighter
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased from 0.4 to 0.8
    this.gameState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased from 0.8 to 1.2
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.gameState.scene.add(directionalLight);
    
    // Additional lights for better visibility
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.gameState.scene.add(hemisphereLight);
    
    // Flashlight - reduced intensity since scene is brighter
    this.gameState.flashlight = new THREE.SpotLight(0xffffff, 1, 25, Math.PI / 8, 0.3, 1.5);
    this.gameState.flashlight.position.set(0, 0, 0);
    this.gameState.flashlight.target.position.set(0, 0, -1);
    this.gameState.camera.add(this.gameState.flashlight);
    this.gameState.camera.add(this.gameState.flashlight.target);
    this.gameState.scene.add(this.gameState.camera);
    
    // Floor - brighter color
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 }); // Brighter from 0x444444
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.gameState.scene.add(floor);
    
    // Controls
    this.gameState.controls = new PointerLockControls(this.gameState.camera, document.body);
    document.addEventListener('click', () => {
      if (!this.isPaused) {this.gameState.controls.lock();}
    });
    this.gameState.scene.add(this.gameState.controls.getObject());
    this.gameState.camera.position.set(1.5, 1.6, 1.5);
  }
  
  loadLevel (levelIdx) {
    console.log('Loading level:', levelIdx);
    console.log('Available mazeMaps:', mazeMaps);
    
    // Cleanup
    this.gameState.dispose();
    this.gameState.reset();
    this.gameState.currentLevel = levelIdx;
    
    // Create new scene
    this.createScene();
    
    // Load maze
    this.gameState.mazeMap = mazeMaps[levelIdx];
    console.log('Loaded mazeMap:', this.gameState.mazeMap);
    
    if (!this.gameState.mazeMap) {
      console.error('Failed to load mazeMap for level:', levelIdx);
      return;
    }
    
    this.gameState.endPosition = {
      x: (this.gameState.mazeMap[0].length - 2) * this.gameState.tileSize,
      z: (this.gameState.mazeMap.length - 2) * this.gameState.tileSize,
    };
    
    this.buildMaze();
    this.ui.updateScore(this.gameState.score);
    this.startTimer();
    this.animate();
  }
  
  buildMaze () {
    // Validate mazeMap
    if (!this.gameState.mazeMap || !Array.isArray(this.gameState.mazeMap)) {
      console.error('Invalid mazeMap:', this.gameState.mazeMap);
      return;
    }
    
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xD2B48C, // Lighter brown color
    });
    
    const rewardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700,
      emissive: 0x444400,
      metalness: 0.1,
      roughness: 0.3,
    });
    
    const trapMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFF4444,
      emissive: 0x440000,
    });
    
    // Use instanced rendering for walls for better performance
    const wallGeometry = new THREE.BoxGeometry(this.gameState.tileSize, 3, this.gameState.tileSize);
    const rewardGeometry = new THREE.SphereGeometry(0.4, 12, 8);
    const trapGeometry = new THREE.BoxGeometry(this.gameState.tileSize * 0.8, 0.2, this.gameState.tileSize * 0.8);
    
    this.gameState.mazeMap.forEach((row, z) => {
      // Validate row
      if (!Array.isArray(row) && typeof row !== 'string') {
        console.error('Invalid row at index', z, ':', row);
        return;
      }
      
      // Convert string to array if needed
      const rowArray = typeof row === 'string' ? row.split('') : row;
      
      rowArray.forEach((tile, x) => {
        const posX = x * this.gameState.tileSize;
        const posZ = z * this.gameState.tileSize;
        
        if (tile === '1') {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(posX, 1.5, posZ);
          wall.castShadow = true;
          wall.receiveShadow = true;
          this.gameState.scene.add(wall);
          this.gameState.walls.push(wall);
        }
        
        if (tile === 'R') {
          const reward = new THREE.Mesh(rewardGeometry, rewardMaterial);
          reward.position.set(posX, 0.6, posZ);
          reward.castShadow = true;
          // Add floating animation
          reward.userData.originalY = 0.6;
          reward.userData.floatSpeed = Math.random() * 2 + 1;
          this.gameState.scene.add(reward);
          this.gameState.rewards.push(reward);
        }
        
        if (tile === 'T') {
          const trap = new THREE.Mesh(trapGeometry, trapMaterial);
          trap.position.set(posX, 0.1, posZ);
          trap.receiveShadow = true;
          // Add pulsing animation
          trap.userData.pulseSpeed = Math.random() * 3 + 2;
          this.gameState.scene.add(trap);
          this.gameState.traps.push(trap);
        }
      });
    });
    
    // Add finish marker
    const finishGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 8);
    const finishMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00FF00,
      emissive: 0x004400,
      metalness: 0.2,
      roughness: 0.4,
    });
    const finish = new THREE.Mesh(finishGeometry, finishMaterial);
    finish.position.set(this.gameState.endPosition.x, 0.15, this.gameState.endPosition.z);
    finish.castShadow = true;
    this.gameState.scene.add(finish);
  }
  
  animate () {
    if (this.isPaused || this.gameState.isGameOver || this.gameState.isGameWin) {return;}
    
    const delta = this.gameState.clock.getDelta();
    
    // Update physics
    this.physics.updateMovement(delta);
    
    // Update flashlight
    if (this.gameState.flashlight && this.gameState.camera) {
      this.gameState.flashlight.position.copy(this.gameState.camera.position);
      const direction = new THREE.Vector3();
      this.gameState.camera.getWorldDirection(direction);
      this.gameState.flashlight.target.position.copy(
        this.gameState.camera.position.clone().add(direction.multiplyScalar(15)),
      );
    }
    
    // Animate rewards (floating)
    this.gameState.rewards.forEach(reward => {
      if (reward.userData.originalY !== undefined) {
        reward.position.y = reward.userData.originalY + 
          Math.sin(Date.now() * 0.001 * reward.userData.floatSpeed) * 0.3;
        reward.rotation.y += 0.02;
      }
    });
    
    // Animate traps (pulsing)
    this.gameState.traps.forEach(trap => {
      if (trap.userData.pulseSpeed !== undefined) {
        const pulse = Math.sin(Date.now() * 0.001 * trap.userData.pulseSpeed) * 0.5 + 0.5;
        trap.material.emissive.setRGB(0.2 + pulse * 0.3, 0, 0);
      }
    });
    
    // Camera animations
    this.updateCameraEffects(delta);
    
    // Check collisions
    if (this.collision.checkRewards()) {
      this.ui.updateScore(this.gameState.score);
    }
    
    if (this.collision.checkTraps()) {
      this.gameOver('💀 Bạn đã bị bẫy!');
      return;
    }
    
    if (this.collision.checkWin()) {
      this.gameWin();
      return;
    }
    
    // Update minimap
    this.ui.drawMinimap(this.gameState.mazeMap, this.gameState.controls.getObject().position);
    
    // Render
    this.gameState.renderer.render(this.gameState.scene, this.gameState.camera);
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateCameraEffects (delta) {
    const { move, canJump, mouseDown, camera } = this.gameState;
    
    // Jump animation
    if (!canJump) {
      this.gameState.jumpAnim += delta * 8;
      const jumpOffset = Math.sin(this.gameState.jumpAnim) * 0.02;
      camera.position.y += jumpOffset;
    } else {
      this.gameState.jumpAnim = 0;
    }
    
    // Running animation (head bob)
    const isMoving = move.forward || move.backward || move.left || move.right;
    if (mouseDown && isMoving && canJump) {
      this.gameState.runAnim += delta * 15;
      const bobX = Math.sin(this.gameState.runAnim) * 0.015;
      const bobY = Math.abs(Math.sin(this.gameState.runAnim * 2)) * 0.01;
      camera.position.x += bobX;
      camera.position.y += bobY;
    } else {
      this.gameState.runAnim = 0;
    }
    
    // Walking animation (subtle bob)
    if (isMoving && canJump && !mouseDown) {
      this.gameState.runAnim += delta * 8;
      const walkBobY = Math.abs(Math.sin(this.gameState.runAnim)) * 0.005;
      camera.position.y += walkBobY;
    }
  }
}

// =============== PERFORMANCE OPTIMIZATION ===============
class PerformanceMonitor {
  constructor () {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.createFPSDisplay();
  }
  
  createFPSDisplay () {
    this.fpsDisplay = document.createElement('div');
    Object.assign(this.fpsDisplay.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      zIndex: '100',
    });
    document.body.appendChild(this.fpsDisplay);
  }
  
  update () {
    this.frameCount++;
    const now = performance.now();
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      const color = this.fps >= 50 ? '#00ff00' : this.fps >= 30 ? '#ffff00' : '#ff0000';
      this.fpsDisplay.innerHTML = `📊 FPS: <span style="color: ${color}">${this.fps}</span>`;
    }
  }
}

// =============== ENHANCED MAZE DATA (if not exists) ===============
// Fallback maze data in case maze-data.js is not available
const fallbackMazeMaps = [
  [
    '111111111111111111111111111111',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100R00100010001000100010001001',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000R00100010001000101',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000100T00010001000101',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000100010001R001000101',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000100010001000100T01',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000100010001000100001',
    '111011101110111011101110111011',
    '100000000000000000000000000001',
    '101110111011101110111011101101',
    '100010001000100010001000100001',
    '111111111111111111111111111101',
    '111111111111111111111111111111',
  ],
];

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
  // Check if mazeMaps exists, otherwise use fallback
  console.log('Checking mazeMaps availability...');
  if (typeof mazeMaps === 'undefined') {
    console.log('mazeMaps is undefined, using fallback');
    window.mazeMaps = fallbackMazeMaps;
  } else {
    console.log('mazeMaps is available:', mazeMaps);
  }
  
  // Create performance monitor
  const perfMonitor = new PerformanceMonitor();
  
  // Override requestAnimationFrame to include performance monitoring
  const originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return originalRAF.call(window, function (time) {
      perfMonitor.update();
      callback(time);
    });
  };
  
  // Initialize game
  game = new MazeGame();
  
  // Load first level
  try {
    console.log('Available mazeMaps:', mazeMaps);
    console.log('Loading level 0...');
    game.loadLevel(0);
  } catch (error) {
    console.error('Error loading level:', error);
  }
  
  // Add loading screen
  const loadingScreen = document.createElement('div');
  Object.assign(loadingScreen.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    zIndex: '9999',
  });
  loadingScreen.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 20px;">🏃‍♂️</div>
      <div>Đang tải trò chơi mê cung...</div>
      <div style="margin-top: 20px;">
        <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;">
          <div style="width: 0%; height: 100%; background: #fff; border-radius: 2px; animation: loading 2s ease-in-out infinite;"></div>
        </div>
      </div>
    </div>
    <style>
      @keyframes loading {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }
    </style>
  `;
  document.body.appendChild(loadingScreen);
  
  // Remove loading screen after game loads
  setTimeout(() => {
    document.body.removeChild(loadingScreen);
  }, 2000);
});

// Export for debugging
window.game = game;