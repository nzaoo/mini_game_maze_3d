// =============== PARTICLE SYSTEM COMPONENT ===============
// Advanced particle system for visual effects

import * as THREE from 'three';
import { MathUtils } from '../utils/math-utils.js';

export class ParticleSystem {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.particles = [];
    this.config = {
      maxParticles: 100,
      particleLifetime: 2000,
      emissionRate: 10,
      gravity: { x: 0, y: -9.8, z: 0 },
      wind: { x: 0, y: 0, z: 0 },
      ...config,
    };

    this.emissionTimer = 0;
    this.isActive = false;
  }

  // Create particle geometry and material
  createParticleGeometry() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.maxParticles * 3);
    const colors = new Float32Array(this.config.maxParticles * 3);
    const sizes = new Float32Array(this.config.maxParticles);
    const alphas = new Float32Array(this.config.maxParticles);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    return geometry;
  }

  // Create particle material
  createParticleMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        texture: { value: this.createParticleTexture() },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          vAlpha = alpha;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D texture;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          vec4 texColor = texture2D(texture, gl_PointCoord);
          gl_FragColor = vec4(vColor, vAlpha * texColor.a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  // Create particle texture
  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Initialize particle system
  init() {
    this.geometry = this.createParticleGeometry();
    this.material = this.createParticleMaterial();
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Initialize particle data
    this.positions = this.geometry.attributes.position.array;
    this.colors = this.geometry.attributes.color.array;
    this.sizes = this.geometry.attributes.size.array;
    this.alphas = this.geometry.attributes.alpha.array;

    // Initialize particles
    for (let i = 0; i < this.config.maxParticles; i++) {
      this.particles.push({
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 0,
        alpha: 0,
        life: 0,
        maxLife: 0,
      });
    }
  }

  // Start particle emission
  start(position, options = {}) {
    this.isActive = true;
    this.emissionPosition = position.clone();
    this.emissionOptions = {
      color: new THREE.Color(0xffffff),
      size: { min: 0.1, max: 0.5 },
      speed: { min: 1, max: 5 },
      life: { min: 1000, max: 3000 },
      ...options,
    };
  }

  // Stop particle emission
  stop() {
    this.isActive = false;
  }

  // Emit a single particle
  emitParticle() {
    // Find inactive particle
    const particle = this.particles.find(p => !p.active);
    if (!particle) {
      return;
    }

    // Initialize particle
    particle.active = true;
    particle.position.copy(this.emissionPosition);
    particle.position.add(MathUtils.randomPointInSphere().multiplyScalar(0.1));

    // Set velocity
    const speed = MathUtils.randomFloat(
      this.emissionOptions.speed.min,
      this.emissionOptions.speed.max,
    );
    particle.velocity.copy(
      MathUtils.randomPointInSphere().multiplyScalar(speed),
    );

    // Set color
    particle.color.copy(this.emissionOptions.color);

    // Set size
    particle.size = MathUtils.randomFloat(
      this.emissionOptions.size.min,
      this.emissionOptions.size.max,
    );

    // Set life
    particle.maxLife = MathUtils.randomFloat(
      this.emissionOptions.life.min,
      this.emissionOptions.life.max,
    );
    particle.life = particle.maxLife;
    particle.alpha = 1.0;
  }

  // Update particle system
  update(deltaTime) {
    if (!this.mesh) {
      return;
    }

    const time = Date.now();
    this.material.uniforms.time.value = time * 0.001;

    // Emit new particles
    if (this.isActive) {
      this.emissionTimer += deltaTime * 1000;
      const emissionInterval = 1000 / this.config.emissionRate;

      while (this.emissionTimer >= emissionInterval) {
        this.emitParticle();
        this.emissionTimer -= emissionInterval;
      }
    }

    // Update particles
    let activeCount = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const index = i * 3;

      if (particle.active) {
        // Update life
        particle.life -= deltaTime * 1000;

        if (particle.life <= 0) {
          particle.active = false;
          this.positions[index] = 0;
          this.positions[index + 1] = 0;
          this.positions[index + 2] = 0;
          this.alphas[i] = 0;
          continue;
        }

        // Update position
        particle.velocity.x += this.config.gravity.x * deltaTime;
        particle.velocity.y += this.config.gravity.y * deltaTime;
        particle.velocity.z += this.config.gravity.z * deltaTime;

        particle.velocity.x += this.config.wind.x * deltaTime;
        particle.velocity.y += this.config.wind.y * deltaTime;
        particle.velocity.z += this.config.wind.z * deltaTime;

        particle.position.add(
          particle.velocity.clone().multiplyScalar(deltaTime),
        );

        // Update alpha based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.alpha = MathUtils.smoothStep(0, 1, lifeRatio);

        // Update geometry attributes
        this.positions[index] = particle.position.x;
        this.positions[index + 1] = particle.position.y;
        this.positions[index + 2] = particle.position.z;

        this.colors[index] = particle.color.r;
        this.colors[index + 1] = particle.color.g;
        this.colors[index + 2] = particle.color.b;

        this.sizes[i] = particle.size;
        this.alphas[i] = particle.alpha;

        activeCount++;
      }
    }

    // Update geometry
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;

    // Hide mesh if no active particles
    this.mesh.visible = activeCount > 0;
  }

  // Create explosion effect
  createExplosion(position, options = {}) {
    const explosionConfig = {
      maxParticles: 50,
      particleLifetime: 1500,
      emissionRate: 50,
      gravity: { x: 0, y: -5, z: 0 },
      ...options,
    };

    const explosion = new ParticleSystem(this.scene, explosionConfig);
    explosion.init();

    // Emit all particles at once
    for (let i = 0; i < explosionConfig.maxParticles; i++) {
      explosion.emitParticle();
    }

    // Stop emission after initial burst
    explosion.stop();

    return explosion;
  }

  // Create fire effect
  createFire(position, options = {}) {
    const fireConfig = {
      maxParticles: 30,
      particleLifetime: 2000,
      emissionRate: 15,
      gravity: { x: 0, y: 2, z: 0 },
      ...options,
    };

    const fire = new ParticleSystem(this.scene, fireConfig);
    fire.init();
    fire.start(position, {
      color: new THREE.Color(0xff6600),
      size: { min: 0.2, max: 0.8 },
      speed: { min: 0.5, max: 2 },
      life: { min: 1500, max: 2500 },
    });

    return fire;
  }

  // Create sparkle effect
  createSparkle(position, options = {}) {
    const sparkleConfig = {
      maxParticles: 20,
      particleLifetime: 1000,
      emissionRate: 10,
      gravity: { x: 0, y: -1, z: 0 },
      ...options,
    };

    const sparkle = new ParticleSystem(this.scene, sparkleConfig);
    sparkle.init();
    sparkle.start(position, {
      color: new THREE.Color(0xffff00),
      size: { min: 0.05, max: 0.2 },
      speed: { min: 0.5, max: 1.5 },
      life: { min: 800, max: 1200 },
    });

    return sparkle;
  }

  // Create smoke effect
  createSmoke(position, options = {}) {
    const smokeConfig = {
      maxParticles: 25,
      particleLifetime: 3000,
      emissionRate: 8,
      gravity: { x: 0, y: 1, z: 0 },
      ...options,
    };

    const smoke = new ParticleSystem(this.scene, smokeConfig);
    smoke.init();
    smoke.start(position, {
      color: new THREE.Color(0x666666),
      size: { min: 0.5, max: 2.0 },
      speed: { min: 0.2, max: 0.8 },
      life: { min: 2500, max: 3500 },
    });

    return smoke;
  }

  // Dispose of particle system
  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.geometry.dispose();
      this.material.dispose();
      this.mesh = null;
    }
  }
}
