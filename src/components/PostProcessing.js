// =============== POST PROCESSING COMPONENT ===============
// Advanced post-processing effects for enhanced visuals

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.composer = null;
    this.passes = {};
    this.enabled = true;
    
    this.init();
  }
  
  // Initialize post-processing pipeline
  init() {
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Add render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.passes.render = renderPass;
    
    // Add bloom pass
    this.addBloomPass();
    
    // Add vignette pass
    this.addVignettePass();
    
    // Add color correction pass
    this.addColorCorrectionPass();
    
    // Add output pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
    this.passes.output = outputPass;
  }
  
  // Add bloom effect
  addBloomPass() {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    
    this.composer.addPass(bloomPass);
    this.passes.bloom = bloomPass;
  }
  
  // Add vignette effect
  addVignettePass() {
    const vignetteShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'offset': { value: 0.5 },
        'darkness': { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
          gl_FragColor = vec4(mix(texel.rgb, vec3(1.0 - darkness), dot(uv, uv)), texel.a);
        }
      `
    };
    
    const vignettePass = new ShaderPass(vignetteShader);
    this.composer.addPass(vignettePass);
    this.passes.vignette = vignettePass;
  }
  
  // Add color correction
  addColorCorrectionPass() {
    const colorCorrectionShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'brightness': { value: 0.0 },
        'contrast': { value: 1.0 },
        'saturation': { value: 1.0 },
        'gamma': { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform float gamma;
        varying vec2 vUv;
        
        vec3 adjustBrightness(vec3 color, float brightness) {
          return color + brightness;
        }
        
        vec3 adjustContrast(vec3 color, float contrast) {
          return 0.5 + (contrast * (color - 0.5));
        }
        
        vec3 adjustSaturation(vec3 color, float saturation) {
          float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
          return mix(vec3(luminance), color, saturation);
        }
        
        vec3 adjustGamma(vec3 color, float gamma) {
          return pow(color, vec3(1.0 / gamma));
        }
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec3 color = texel.rgb;
          
          color = adjustBrightness(color, brightness);
          color = adjustContrast(color, contrast);
          color = adjustSaturation(color, saturation);
          color = adjustGamma(color, gamma);
          
          gl_FragColor = vec4(color, texel.a);
        }
      `
    };
    
    const colorCorrectionPass = new ShaderPass(colorCorrectionShader);
    this.composer.addPass(colorCorrectionPass);
    this.passes.colorCorrection = colorCorrectionPass;
  }
  
  // Add chromatic aberration
  addChromaticAberrationPass() {
    const chromaticShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'offset': { value: 0.005 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          vec2 center = vec2(0.5);
          vec2 direction = normalize(uv - center);
          
          float r = texture2D(tDiffuse, uv + direction * offset).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - direction * offset).b;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `
    };
    
    const chromaticPass = new ShaderPass(chromaticShader);
    this.composer.addPass(chromaticPass);
    this.passes.chromatic = chromaticPass;
  }
  
  // Add motion blur
  addMotionBlurPass() {
    const motionBlurShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'tDepth': { value: null },
        'tPrevDepth': { value: null },
        'projectionMatrix': { value: null },
        'projectionMatrixInverse': { value: null },
        'viewMatrix': { value: null },
        'viewMatrixInverse': { value: null },
        'prevViewMatrix': { value: null },
        'prevProjectionMatrix': { value: null },
        'intensity': { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform sampler2D tPrevDepth;
        uniform mat4 projectionMatrix;
        uniform mat4 projectionMatrixInverse;
        uniform mat4 viewMatrix;
        uniform mat4 viewMatrixInverse;
        uniform mat4 prevViewMatrix;
        uniform mat4 prevProjectionMatrix;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          vec4 currentPos = vec4(vUv * 2.0 - 1.0, texture2D(tDepth, vUv).r * 2.0 - 1.0, 1.0);
          vec4 worldPos = projectionMatrixInverse * currentPos;
          worldPos /= worldPos.w;
          
          vec4 prevPos = prevProjectionMatrix * prevViewMatrix * viewMatrixInverse * worldPos;
          prevPos /= prevPos.w;
          
          vec2 velocity = (currentPos.xy - prevPos.xy) * 0.5 * intensity;
          
          vec4 color = texture2D(tDiffuse, vUv);
          color += texture2D(tDiffuse, vUv + velocity * 0.25);
          color += texture2D(tDiffuse, vUv + velocity * 0.5);
          color += texture2D(tDiffuse, vUv + velocity * 0.75);
          color *= 0.25;
          
          gl_FragColor = color;
        }
      `
    };
    
    const motionBlurPass = new ShaderPass(motionBlurShader);
    this.composer.addPass(motionBlurPass);
    this.passes.motionBlur = motionBlurPass;
  }
  
  // Add depth of field
  addDepthOfFieldPass() {
    const dofShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'tDepth': { value: null },
        'cameraNear': { value: 1 },
        'cameraFar': { value: 1000 },
        'focalDepth': { value: 20 },
        'focalLength': { value: 35 },
        'fstop': { value: 2.8 },
        'maxblur': { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float focalDepth;
        uniform float focalLength;
        uniform float fstop;
        uniform float maxblur;
        varying vec2 vUv;
        
        float readDepth(sampler2D depthSampler, vec2 coord) {
          float fragCoordZ = texture2D(depthSampler, coord).x;
          float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
          return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
        }
        
        void main() {
          float depth = readDepth(tDepth, vUv);
          float factor = abs(depth - focalDepth);
          float blur = factor * maxblur;
          
          vec4 color = vec4(0.0);
          float total = 0.0;
          
          for (float x = -4.0; x <= 4.0; x += 1.0) {
            for (float y = -4.0; y <= 4.0; y += 1.0) {
              vec2 offset = vec2(x, y) * blur * 0.001;
              color += texture2D(tDiffuse, vUv + offset);
              total += 1.0;
            }
          }
          
          gl_FragColor = color / total;
        }
      `
    };
    
    const dofPass = new ShaderPass(dofShader);
    this.composer.addPass(dofPass);
    this.passes.depthOfField = dofPass;
  }
  
  // Update post-processing effects
  update(deltaTime) {
    if (!this.enabled || !this.composer) return;
    
    // Update bloom intensity based on time
    if (this.passes.bloom) {
      const time = Date.now() * 0.001;
      this.passes.bloom.strength = 0.5 + Math.sin(time * 0.5) * 0.1;
    }
    
    // Update vignette based on player health or other factors
    if (this.passes.vignette) {
      // Example: increase vignette when player is low on health
      // this.passes.vignette.uniforms.darkness.value = 0.3 + (1.0 - health) * 0.4;
    }
  }
  
  // Render with post-processing
  render() {
    if (this.enabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // Set effect parameters
  setBloomParameters(strength, radius, threshold) {
    if (this.passes.bloom) {
      this.passes.bloom.strength = strength;
      this.passes.bloom.radius = radius;
      this.passes.bloom.threshold = threshold;
    }
  }
  
  setVignetteParameters(offset, darkness) {
    if (this.passes.vignette) {
      this.passes.vignette.uniforms.offset.value = offset;
      this.passes.vignette.uniforms.darkness.value = darkness;
    }
  }
  
  setColorCorrectionParameters(brightness, contrast, saturation, gamma) {
    if (this.passes.colorCorrection) {
      this.passes.colorCorrection.uniforms.brightness.value = brightness;
      this.passes.colorCorrection.uniforms.contrast.value = contrast;
      this.passes.colorCorrection.uniforms.saturation.value = saturation;
      this.passes.colorCorrection.uniforms.gamma.value = gamma;
    }
  }
  
  // Enable/disable effects
  setEffectEnabled(effectName, enabled) {
    if (this.passes[effectName]) {
      this.passes[effectName].enabled = enabled;
    }
  }
  
  // Enable/disable all post-processing
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  // Handle window resize
  onWindowResize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }
  
  // Dispose of resources
  dispose() {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    Object.values(this.passes).forEach(pass => {
      if (pass.dispose) {
        pass.dispose();
      }
    });
    
    this.passes = {};
  }
} 