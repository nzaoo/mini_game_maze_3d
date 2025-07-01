import * as THREE from 'three';
import './style.css';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { mazeMaps, MazeUtils } from './maze-data.js';

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
        fontSize: '18px',
        zIndex: '100',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)',
        padding: '20px 30px',
        borderRadius: '15px',
        fontFamily: '"Orbitron", "Arial", sans-serif',
        border: '2px solid #4CAF50',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(76,175,80,0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '300px',
      },
    });
    
    this.hud.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px; font-size: 22px; font-weight: bold; color: #4CAF50; text-shadow: 0 0 10px rgba(76,175,80,0.5);">
        🏰 MAZE RUNNER
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <div style="background: rgba(76,175,80,0.2); padding: 8px 15px; border-radius: 8px; border: 1px solid #4CAF50;">
          🏆 <span id="score">0</span> pts
        </div>
        <div style="background: rgba(255,193,7,0.2); padding: 8px 15px; border-radius: 8px; border: 1px solid #FFC107;">
          ⏰ <span id="timer">90</span>s
        </div>
      </div>
      <div style="font-size: 12px; color: #ccc; line-height: 1.4; margin-bottom: 10px;">
        <div>🎮 <strong>Điều khiển:</strong></div>
        <div>W/A/S/D: Di chuyển | Chuột: Nhìn</div>
        <div>Giữ chuột trái: Chạy | Space: Nhảy</div>
      </div>
      <div style="font-size: 11px; color: #FFD700; text-align: center; padding: 8px; background: rgba(255,215,0,0.1); border-radius: 5px; border: 1px solid rgba(255,215,0,0.3);">
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
      width: 220,
      height: 220,
    });
    Object.assign(this.minimapCanvas.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)',
      border: '3px solid #4CAF50',
      borderRadius: '20px',
      zIndex: '150',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(76,175,80,0.3)',
      backdropFilter: 'blur(10px)',
    });
    
    // Add minimap title
    const minimapContainer = this.createElement('div', {
      style: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: '150',
      },
    });
    
    const minimapTitle = this.createElement('div', {
      textContent: '🗺️ BẢN ĐỒ',
      style: {
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)',
        color: '#4CAF50',
        padding: '8px 15px',
        borderRadius: '10px 10px 0 0',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '3px solid #4CAF50',
        borderBottom: 'none',
        fontFamily: '"Orbitron", "Arial", sans-serif',
        textShadow: '0 0 10px rgba(76,175,80,0.5)',
      },
    });
    
    minimapContainer.appendChild(minimapTitle);
    minimapContainer.appendChild(this.minimapCanvas);
    document.body.appendChild(minimapContainer);
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }
  
  createLevelSelector () {
    const selector = this.createElement('div', {
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '200',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)',
        color: '#fff',
        padding: '20px 25px',
        borderRadius: '15px',
        fontSize: '16px',
        fontFamily: '"Orbitron", "Arial", sans-serif',
        border: '2px solid #4CAF50',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(76,175,80,0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '200px',
      },
    });
    
    selector.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #4CAF50; text-shadow: 0 0 10px rgba(76,175,80,0.5);">
        🎮 CHỌN MÀN
      </div>
    `;
    
    const buttonContainer = this.createElement('div', {
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '8px',
        maxWidth: '180px',
      },
    });
    
    mazeMaps.forEach((_, i) => {
      const btn = this.createElement('button', {
        textContent: (i + 1).toString(),
        style: {
          padding: '12px 8px',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        },
      });
      
      btn.addEventListener('mouseover', () => {
        btn.style.background = 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)';
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 20px rgba(76,175,80,0.5)';
      });
      btn.addEventListener('mouseout', () => {
        btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(76,175,80,0.3)';
      });
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.98) 100%)',
        padding: '50px 100px',
        borderRadius: '30px',
        display: 'none',
        zIndex: '999',
        textAlign: 'center',
        fontFamily: '"Orbitron", "Arial", sans-serif',
        textShadow: '0 0 20px rgba(255,255,255,0.8)',
        border: '4px solid #4CAF50',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(76,175,80,0.5)',
        backdropFilter: 'blur(15px)',
        minWidth: '400px',
        fontWeight: 'bold',
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)',
        color: '#fff',
        padding: '25px',
        borderRadius: '15px',
        fontSize: '14px',
        zIndex: '180',
        border: '2px solid #4CAF50',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(76,175,80,0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '180px',
        fontFamily: '"Orbitron", "Arial", sans-serif',
      },
    });
    
    settings.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; font-size: 16px; font-weight: bold; color: #4CAF50; text-shadow: 0 0 10px rgba(76,175,80,0.5);">
        ⚙️ CÀI ĐẶT
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; color: #FFC107;">🔊 Âm lượng:</label>
        <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5" style="width: 100%; height: 6px; border-radius: 3px; background: #333; outline: none; -webkit-appearance: none;">
        <style>
          #volumeSlider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(76,175,80,0.3);
          }
          #volumeSlider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(76,175,80,0.3);
          }
        </style>
      </div>
      <div style="text-align: center;">
        <button id="pauseBtn" style="
          padding: 12px 20px; 
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(33,150,243,0.3);
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">⏸️ TẠM DỪNG</button>
      </div>
    `;
    
    document.body.appendChild(settings);
    
    // Event listeners
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
      this.audioManager.setVolume(parseFloat(e.target.value));
    });
    
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.addEventListener('mouseover', () => {
      pauseBtn.style.background = 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)';
      pauseBtn.style.transform = 'translateY(-2px)';
      pauseBtn.style.boxShadow = '0 6px 20px rgba(33,150,243,0.5)';
    });
    pauseBtn.addEventListener('mouseout', () => {
      pauseBtn.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      pauseBtn.style.transform = 'translateY(0)';
      pauseBtn.style.boxShadow = '0 4px 15px rgba(33,150,243,0.3)';
    });
    pauseBtn.addEventListener('click', () => {
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
    this.normalSpeed = 4;
    this.runMultiplier = 1.7;
    this.jumpPower = 6;
    this.gravity = 18;
    this.friction = 8;
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
    // Lighting ... (giữ nguyên)
    // ...
    // Controls
    this.gameState.controls = new PointerLockControls(this.gameState.camera, document.body);
    document.addEventListener('click', () => {
      if (!this.isPaused) {this.gameState.controls.lock();}
    });
    this.gameState.scene.add(this.gameState.controls.getObject());
    // --- Sửa vị trí xuất phát ---
    let start = { x: 1, z: 1 };
    if (this.gameState.mazeMap) {
      if (typeof MazeUtils !== 'undefined' && typeof MazeUtils.getStartPosition === 'function') {
        start = MazeUtils.getStartPosition(this.gameState.mazeMap);
      }
      // Nếu vị trí này là tường, tìm ô trống đầu tiên
      if (!MazeUtils.isValidPosition(this.gameState.mazeMap, start.x, start.z)) {
        outer: for (let z = 0; z < this.gameState.mazeMap.length; z++) {
          for (let x = 0; x < this.gameState.mazeMap[z].length; x++) {
            if (this.gameState.mazeMap[z][x] !== '1') {
              start = { x, z };
              break outer;
            }
          }
        }
      }
    }
    this.gameState.camera.position.set(
      start.x * this.gameState.tileSize + this.gameState.tileSize / 2,
      1.6,
      start.z * this.gameState.tileSize + this.gameState.tileSize / 2,
    );

    // Floor - procedural checkerboard
    const size = 200;
    const tile = 2; // mỗi ô gạch 2x2 đơn vị
    const tiles = size / tile;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < tiles; y++) {
      for (let x = 0; x < tiles; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#bca16b' : '#7c5e3c';
        ctx.fillRect(x * (512 / tiles), y * (512 / tiles), (512 / tiles), (512 / tiles));
      }
    }
    const checkerTexture = new THREE.CanvasTexture(canvas);
    checkerTexture.wrapS = checkerTexture.wrapT = THREE.RepeatWrapping;
    checkerTexture.repeat.set(1, 1);
    const floorGeometry = new THREE.PlaneGeometry(size, size);
    const floorMaterial = new THREE.MeshLambertMaterial({ map: checkerTexture });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.gameState.scene.add(floor);

    // Sky gradient background
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    const grad = skyCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#87ceeb'); // xanh trời
    grad.addColorStop(1, '#e0eafc'); // trắng nhạt
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, 1024, 512);
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    this.gameState.scene.background = skyTexture;
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
    
    // Create brick texture
    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 256;
    brickCanvas.height = 128;
    const brickCtx = brickCanvas.getContext('2d');
    
    // Brick pattern
    const brickWidth = 32;
    const brickHeight = 16;
    const mortarColor = '#8B7355';
    const brickColor1 = '#CD853F';
    const brickColor2 = '#D2691E';
    
    brickCtx.fillStyle = mortarColor;
    brickCtx.fillRect(0, 0, 256, 128);
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const offset = y % 2 === 0 ? 0 : brickWidth / 2;
        const brickX = x * brickWidth + offset;
        const brickY = y * brickHeight;
        
        if (brickX < 256 && brickY < 128) {
          brickCtx.fillStyle = (x + y) % 2 === 0 ? brickColor1 : brickColor2;
          brickCtx.fillRect(brickX + 1, brickY + 1, brickWidth - 2, brickHeight - 2);
          
          // Add brick details
          brickCtx.fillStyle = '#A0522D';
          brickCtx.fillRect(brickX + 2, brickY + 2, brickWidth - 4, 2);
        }
      }
    }
    
    const brickTexture = new THREE.CanvasTexture(brickCanvas);
    brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(2, 3);
    
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      map: brickTexture,
      color: 0xFFFFFF,
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