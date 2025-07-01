// =============== AUDIO MANAGER UTILITY ===============
// Advanced audio management system for game sounds

export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.sounds = new Map();
    this.music = null;
    this.currentMusic = null;
    this.volume = {
      master: 0.5,
      music: 0.3,
      sfx: 0.7
    };
    this.spatialAudio = true;
    this.listener = null;
    
    this.init();
  }
  
  // Initialize audio context
  async init() {
    try {
      // Create audio context
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      
      // Connect gain nodes
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
      
      // Set initial volumes
      this.setMasterVolume(this.volume.master);
      this.setMusicVolume(this.volume.music);
      this.setSFXVolume(this.volume.sfx);
      
      // Create listener for spatial audio
      if (this.spatialAudio) {
        this.listener = this.context.listener;
      }
      
      console.log('Audio Manager initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Audio Manager:', error);
    }
  }
  
  // Load audio file
  async loadSound(id, url, options = {}) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.sounds.set(id, {
        buffer: audioBuffer,
        options: {
          loop: false,
          volume: 1.0,
          spatial: false,
          maxDistance: 50,
          rolloffFactor: 1,
          ...options
        }
      });
      
      return true;
    } catch (error) {
      console.warn(`Failed to load sound ${id}:`, error);
      return false;
    }
  }
  
  // Load multiple sounds
  async loadSounds(soundList) {
    const promises = soundList.map(sound => 
      this.loadSound(sound.id, sound.url, sound.options)
    );
    
    return Promise.all(promises);
  }
  
  // Play sound
  playSound(id, options = {}) {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound ${id} not found`);
      return null;
    }
    
    try {
      // Create source
      const source = this.context.createBufferSource();
      source.buffer = sound.buffer;
      
      // Create gain node
      const gainNode = this.context.createGain();
      gainNode.gain.value = sound.options.volume * this.volume.sfx;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.sfxGain);
      
      // Set options
      source.loop = options.loop || sound.options.loop;
      
      // Spatial audio
      if (sound.options.spatial && this.spatialAudio && options.position) {
        const panner = this.context.createPanner();
        panner.setPosition(options.position.x, options.position.y, options.position.z);
        panner.maxDistance = sound.options.maxDistance;
        panner.rolloffFactor = sound.options.rolloffFactor;
        
        source.connect(panner);
        panner.connect(gainNode);
      }
      
      // Play sound
      source.start(0);
      
      return {
        source,
        gain: gainNode,
        stop: () => {
          try {
            source.stop();
          } catch (error) {
            // Sound already stopped
          }
        },
        setVolume: (volume) => {
          gainNode.gain.value = volume * this.volume.sfx;
        }
      };
    } catch (error) {
      console.warn(`Failed to play sound ${id}:`, error);
      return null;
    }
  }
  
  // Play music
  async playMusic(id, fadeIn = true) {
    // Stop current music
    if (this.currentMusic) {
      this.stopMusic(fadeIn);
    }
    
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Music ${id} not found`);
      return null;
    }
    
    try {
      // Create source
      const source = this.context.createBufferSource();
      source.buffer = sound.buffer;
      source.loop = true;
      
      // Create gain node
      const gainNode = this.context.createGain();
      gainNode.gain.value = fadeIn ? 0 : sound.options.volume * this.volume.music;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.musicGain);
      
      // Play music
      source.start(0);
      
      this.currentMusic = {
        source,
        gain: gainNode,
        id,
        fadeIn: () => {
          gainNode.gain.setValueAtTime(0, this.context.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            sound.options.volume * this.volume.music,
            this.context.currentTime + 2
          );
        },
        fadeOut: () => {
          gainNode.gain.setValueAtTime(sound.options.volume * this.volume.music, this.context.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 2);
        },
        stop: () => {
          try {
            source.stop();
          } catch (error) {
            // Music already stopped
          }
        }
      };
      
      // Fade in if requested
      if (fadeIn) {
        this.currentMusic.fadeIn();
      }
      
      return this.currentMusic;
    } catch (error) {
      console.warn(`Failed to play music ${id}:`, error);
      return null;
    }
  }
  
  // Stop music
  stopMusic(fadeOut = true) {
    if (this.currentMusic) {
      if (fadeOut) {
        this.currentMusic.fadeOut();
        setTimeout(() => {
          this.currentMusic.stop();
          this.currentMusic = null;
        }, 2000);
      } else {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
    }
  }
  
  // Set master volume
  setMasterVolume(volume) {
    this.volume.master = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = this.volume.master;
  }
  
  // Set music volume
  setMusicVolume(volume) {
    this.volume.music = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.gain.gain.value = this.volume.music;
    }
  }
  
  // Set SFX volume
  setSFXVolume(volume) {
    this.volume.sfx = Math.max(0, Math.min(1, volume));
  }
  
  // Get volume levels
  getVolume() {
    return { ...this.volume };
  }
  
  // Update listener position for spatial audio
  updateListenerPosition(position, orientation) {
    if (this.listener && this.spatialAudio) {
      this.listener.setPosition(position.x, position.y, position.z);
      if (orientation) {
        this.listener.setOrientation(
          orientation.forward.x, orientation.forward.y, orientation.forward.z,
          orientation.up.x, orientation.up.y, orientation.up.z
        );
      }
    }
  }
  
  // Create spatial sound
  createSpatialSound(id, position, options = {}) {
    return this.playSound(id, {
      ...options,
      position,
      spatial: true
    });
  }
  
  // Create ambient sound
  createAmbientSound(id, options = {}) {
    return this.playSound(id, {
      ...options,
      spatial: false
    });
  }
  
  // Create looping sound
  createLoopingSound(id, options = {}) {
    return this.playSound(id, {
      ...options,
      loop: true
    });
  }
  
  // Stop all sounds
  stopAllSounds() {
    // Stop current music
    this.stopMusic(false);
    
    // Note: Individual sound sources need to be tracked to stop them
    // This is a simplified implementation
  }
  
  // Pause audio context
  pause() {
    if (this.context && this.context.state === 'running') {
      this.context.suspend();
    }
  }
  
  // Resume audio context
  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }
  
  // Check if audio is supported
  isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
  
  // Get audio context state
  getState() {
    return this.context ? this.context.state : 'unsupported';
  }
  
  // Create audio visualization
  createVisualizer(canvas) {
    if (!this.context) return null;
    
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Connect master gain to analyser
    this.masterGain.disconnect();
    this.masterGain.connect(analyser);
    analyser.connect(this.context.destination);
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
    
    return {
      analyser,
      stop: () => {
        // Reconnect master gain directly to destination
        this.masterGain.disconnect();
        this.masterGain.connect(this.context.destination);
      }
    };
  }
  
  // Create audio effects
  createEffects() {
    const effects = {};
    
    // Reverb effect
    effects.reverb = this.context.createConvolver();
    
    // Delay effect
    effects.delay = this.context.createDelay(5.0);
    effects.delay.delayTime.value = 0.3;
    
    // Filter effect
    effects.filter = this.context.createBiquadFilter();
    effects.filter.type = 'lowpass';
    effects.filter.frequency.value = 1000;
    
    return effects;
  }
  
  // Apply effect to sound
  applyEffect(sound, effect) {
    if (sound && effect) {
      // Disconnect from current output
      sound.disconnect();
      
      // Connect through effect
      sound.connect(effect);
      effect.connect(this.sfxGain);
    }
  }
  
  // Remove effect from sound
  removeEffect(sound) {
    if (sound) {
      // Disconnect from effect
      sound.disconnect();
      
      // Reconnect directly
      sound.connect(this.sfxGain);
    }
  }
  
  // Save audio settings
  saveSettings() {
    const settings = {
      volume: this.volume,
      spatialAudio: this.spatialAudio
    };
    
    try {
      localStorage.setItem('maze_game_audio_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
      return false;
    }
  }
  
  // Load audio settings
  loadSettings() {
    try {
      const data = localStorage.getItem('maze_game_audio_settings');
      if (data) {
        const settings = JSON.parse(data);
        
        this.volume = settings.volume || this.volume;
        this.spatialAudio = settings.spatialAudio !== undefined ? settings.spatialAudio : this.spatialAudio;
        
        // Apply settings
        this.setMasterVolume(this.volume.master);
        this.setMusicVolume(this.volume.music);
        this.setSFXVolume(this.volume.sfx);
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    
    return false;
  }
  
  // Dispose of audio resources
  dispose() {
    if (this.currentMusic) {
      this.stopMusic(false);
    }
    
    this.sounds.clear();
    
    if (this.context) {
      this.context.close();
    }
  }
} 