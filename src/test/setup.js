// Test setup file for Vitest
import { vi } from 'vitest';

// Mock Three.js for testing
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    background: null,
  })),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn() },
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: document.createElement('canvas'),
    shadowMap: { enabled: false, type: null },
  })),
  AmbientLight: vi.fn(() => ({})),
  DirectionalLight: vi.fn(() => ({
    position: { set: vi.fn() },
    castShadow: false,
    shadow: { mapSize: { width: 0, height: 0 } },
  })),
  SpotLight: vi.fn(() => ({
    position: { set: vi.fn() },
    target: { position: { set: vi.fn() } },
  })),
  PlaneGeometry: vi.fn(() => ({})),
  BoxGeometry: vi.fn(() => ({})),
  SphereGeometry: vi.fn(() => ({})),
  CylinderGeometry: vi.fn(() => ({})),
  MeshLambertMaterial: vi.fn(() => ({})),
  MeshStandardMaterial: vi.fn(() => ({})),
  MeshBasicMaterial: vi.fn(() => ({})),
  Mesh: vi.fn(() => ({
    position: { set: vi.fn() },
    rotation: { x: 0 },
    castShadow: false,
    receiveShadow: false,
    material: {},
    userData: {},
  })),
  Vector3: vi.fn(() => ({
    set: vi.fn(),
    copy: vi.fn(() => ({})),
    clone: vi.fn(() => ({})),
    add: vi.fn(),
    multiplyScalar: vi.fn(() => ({})),
    normalize: vi.fn(),
    cross: vi.fn(() => ({})),
    distanceTo: vi.fn(() => 0),
  })),
  Color: vi.fn(() => ({})),
  Clock: vi.fn(() => ({
    getDelta: vi.fn(() => 0.016),
  })),
  Raycaster: vi.fn(() => ({})),
  Group: vi.fn(() => ({
    add: vi.fn(),
    children: [],
  })),
  PCFSoftShadowMap: 'PCFSoftShadowMap',
}));

// Mock PointerLockControls
vi.mock('three/examples/jsm/controls/PointerLockControls.js', () => ({
  PointerLockControls: vi.fn(() => ({
    lock: vi.fn(),
    unlock: vi.fn(),
    isLocked: false,
    getObject: vi.fn(() => ({
      position: { x: 0, y: 0, z: 0, set: vi.fn(), clone: vi.fn(() => ({ x: 0, y: 0, z: 0 })) },
    })),
    getDirection: vi.fn(() => ({ x: 0, y: 0, z: -1 })),
  })),
}));

// Mock Audio API
global.Audio = vi.fn(() => ({
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  volume: 0.5,
  currentTime: 0,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
};

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock sessionStorage
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock WebGL context
const mockWebGLContext = {
  canvas: document.createElement('canvas'),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(() => ({})),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
  getUniformLocation: vi.fn(() => ({})),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  uniform3f: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  viewport: vi.fn(),
  enable: vi.fn(),
  depthFunc: vi.fn(),
  blendFunc: vi.fn(),
  createTexture: vi.fn(() => ({})),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  generateMipmap: vi.fn(),
};

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockWebGLContext);

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
global.matchMedia = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
  writable: true,
});

// Mock innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true,
});

Object.defineProperty(window, 'innerHeight', {
  value: 1080,
  writable: true,
}); 