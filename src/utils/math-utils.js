// =============== MATH UTILITIES ===============
// Mathematical utilities for game calculations

import * as THREE from 'three';

export class MathUtils {
  // =============== VECTOR OPERATIONS ===============
  
  // Clamp value between min and max
  static clamp (value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  // Linear interpolation
  static lerp (start, end, factor) {
    return start + (end - start) * factor;
  }
  
  // Smooth interpolation
  static smoothStep (edge0, edge1, x) {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }
  
  // Convert degrees to radians
  static toRadians (degrees) {
    return degrees * (Math.PI / 180);
  }
  
  // Convert radians to degrees
  static toDegrees (radians) {
    return radians * (180 / Math.PI);
  }
  
  // Get distance between two points
  static distance (p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  // Get distance squared (faster for comparisons)
  static distanceSquared (p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return dx * dx + dy * dy + dz * dz;
  }
  
  // =============== COLLISION DETECTION ===============
  
  // Check if point is inside sphere
  static pointInSphere (point, sphereCenter, sphereRadius) {
    return MathUtils.distanceSquared(point, sphereCenter) <= sphereRadius * sphereRadius;
  }
  
  // Check if point is inside box
  static pointInBox (point, boxMin, boxMax) {
    return point.x >= boxMin.x && point.x <= boxMax.x &&
           point.y >= boxMin.y && point.y <= boxMax.y &&
           point.z >= boxMin.z && point.z <= boxMax.z;
  }
  
  // Check sphere-sphere collision
  static sphereSphereCollision (center1, radius1, center2, radius2) {
    const distance = MathUtils.distance(center1, center2);
    return distance <= radius1 + radius2;
  }
  
  // Check sphere-box collision
  static sphereBoxCollision (sphereCenter, sphereRadius, boxMin, boxMax) {
    const closestPoint = new THREE.Vector3();
    
    closestPoint.x = MathUtils.clamp(sphereCenter.x, boxMin.x, boxMax.x);
    closestPoint.y = MathUtils.clamp(sphereCenter.y, boxMin.y, boxMax.y);
    closestPoint.z = MathUtils.clamp(sphereCenter.z, boxMin.z, boxMax.z);
    
    return MathUtils.distanceSquared(sphereCenter, closestPoint) <= sphereRadius * sphereRadius;
  }
  
  // =============== RANDOM UTILITIES ===============
  
  // Random float between min and max
  static randomFloat (min, max) {
    return Math.random() * (max - min) + min;
  }
  
  // Random integer between min and max (inclusive)
  static randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Random choice from array
  static randomChoice (array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Random point on unit sphere
  static randomPointOnSphere () {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }
  
  // Random point inside unit sphere
  static randomPointInSphere () {
    const point = MathUtils.randomPointOnSphere();
    const radius = Math.cbrt(Math.random()); // Cube root for uniform distribution
    return point.multiplyScalar(radius);
  }
  
  // =============== EASING FUNCTIONS ===============
  
  // Ease in (quadratic)
  static easeIn (t) {
    return t * t;
  }
  
  // Ease out (quadratic)
  static easeOut (t) {
    return t * (2 - t);
  }
  
  // Ease in-out (quadratic)
  static easeInOut (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  // Bounce easing
  static bounce (t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
  
  // Elastic easing
  static elastic (t) {
    if (t === 0) {return 0;}
    if (t === 1) {return 1;}
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  }
  
  // =============== NOISE FUNCTIONS ===============
  
  // Simple noise function
  static noise (x, y = 0, z = 0) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = MathUtils.fade(x);
    const v = MathUtils.fade(y);
    const w = MathUtils.fade(z);
    
    const A = MathUtils.p[X] + Y;
    const AA = MathUtils.p[A] + Z;
    const AB = MathUtils.p[A + 1] + Z;
    const B = MathUtils.p[X + 1] + Y;
    const BA = MathUtils.p[B] + Z;
    const BB = MathUtils.p[B + 1] + Z;
    
    return MathUtils.lerp(
      MathUtils.lerp(
        MathUtils.lerp(MathUtils.grad(MathUtils.p[AA], x, y, z), MathUtils.grad(MathUtils.p[BA], x - 1, y, z), u),
        MathUtils.lerp(MathUtils.grad(MathUtils.p[AB], x, y - 1, z), MathUtils.grad(MathUtils.p[BB], x - 1, y - 1, z), u),
        v,
      ),
      MathUtils.lerp(
        MathUtils.lerp(MathUtils.grad(MathUtils.p[AA + 1], x, y, z - 1), MathUtils.grad(MathUtils.p[BA + 1], x - 1, y, z - 1), u),
        MathUtils.lerp(MathUtils.grad(MathUtils.p[AB + 1], x, y - 1, z - 1), MathUtils.grad(MathUtils.p[BB + 1], x - 1, y - 1, z - 1), u),
        v,
      ),
      w,
    );
  }
  
  // Fade function for noise
  static fade (t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  // Gradient function for noise
  static grad (hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  // Permutation table for noise
  static p = new Array(512);
  
  // Initialize permutation table
  static initNoise () {
    for (let i = 0; i < 256; i++) {
      MathUtils.p[i] = Math.floor(Math.random() * 256);
    }
    for (let i = 0; i < 256; i++) {
      MathUtils.p[256 + i] = MathUtils.p[i];
    }
  }
  
  // =============== GEOMETRY UTILITIES ===============
  
  // Get angle between two vectors
  static angleBetween (v1, v2) {
    const dot = v1.dot(v2);
    const mag1 = v1.length();
    const mag2 = v2.length();
    return Math.acos(dot / (mag1 * mag2));
  }
  
  // Reflect vector around normal
  static reflect (incident, normal) {
    const dot = incident.dot(normal);
    return incident.clone().sub(normal.clone().multiplyScalar(2 * dot));
  }
  
  // Project vector onto plane
  static projectOnPlane (vector, normal) {
    const dot = vector.dot(normal);
    return vector.clone().sub(normal.clone().multiplyScalar(dot));
  }
  
  // =============== COLOR UTILITIES ===============
  
  // Convert HSL to RGB
  static hslToRgb (h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (h < 1 / 6) {
      r = c; g = x; b = 0;
    } else if (h < 2 / 6) {
      r = x; g = c; b = 0;
    } else if (h < 3 / 6) {
      r = 0; g = c; b = x;
    } else if (h < 4 / 6) {
      r = 0; g = x; b = c;
    } else if (h < 5 / 6) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }
  
  // Convert RGB to HSL
  static rgbToHsl (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s; const l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }
  
  // Interpolate between two colors
  static interpolateColor (color1, color2, factor) {
    const r = MathUtils.lerp(color1.r, color2.r, factor);
    const g = MathUtils.lerp(color1.g, color2.g, factor);
    const b = MathUtils.lerp(color1.b, color2.b, factor);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }
}

// Initialize noise when module loads
MathUtils.initNoise(); 