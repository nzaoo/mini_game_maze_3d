# 🏃‍♂️ Maze Game 3D

A modern, immersive 3D maze game built with Three.js featuring dynamic lighting, particle effects, and multiple challenging levels.

![Maze Game 3D](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🎮 Features

- **Immersive 3D Graphics**: Built with Three.js for stunning visual effects
- **Multiple Levels**: 5 progressively challenging maze levels
- **Dynamic Lighting**: Realistic flashlight and ambient lighting
- **Particle Effects**: Beautiful visual feedback for rewards and interactions
- **Minimap Navigation**: Real-time position tracking and maze overview
- **Audio System**: Immersive sound effects and background music
- **Responsive Design**: Optimized for desktop and mobile devices
- **Performance Optimized**: Smooth 60fps gameplay with efficient rendering
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/maze-game-3d.git
   cd maze-game-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

### Controls
- **W/A/S/D**: Move around the maze
- **Mouse**: Look around and navigate
- **Hold Left Mouse**: Run faster
- **Space**: Jump
- **ESC**: Pause/Resume game

### Objectives
- 🟡 **Collect golden spheres** to earn points
- 🔴 **Avoid red traps** that can end your game
- 🟢 **Reach the green exit** to complete the level
- ⏰ **Beat the timer** before time runs out
- 🗺️ **Use the minimap** to navigate efficiently

### Scoring System
- **Golden Sphere**: +10 points (Level 1) to +30 points (Level 5)
- **Time Bonus**: Remaining time converted to points
- **Level Completion**: Bonus points for finishing quickly

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run preview      # Preview production build

# Building
npm run build        # Build for production
npm run analyze      # Analyze bundle size

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI

# Deployment
npm run deploy       # Deploy to GitHub Pages
npm run clean        # Clean build artifacts
```

### Project Structure

```
maze-game-3d/
├── src/
│   ├── main.js          # Main game logic
│   ├── maze-data.js     # Maze level definitions
│   └── style.css        # Game styles
├── public/
│   └── audio/           # Audio assets
├── dist/                # Production build
├── index.html           # Entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

### Key Components

- **GameState**: Central state management
- **AudioManager**: Sound effects and music handling
- **UIManager**: User interface and HUD management
- **PhysicsManager**: Movement and collision detection
- **CollisionManager**: Game object interactions
- **PerformanceMonitor**: FPS tracking and optimization

## 🎨 Customization

### Adding New Levels

1. Edit `src/maze-data.js`
2. Add new maze layout to `mazeMaps` array
3. Configure level settings in `levelSettings`

```javascript
// Example maze layout
[
  "111111111111111111111111111111",
  "100000000000000000000000000001",
  "101110111011101110111011101101",
  "100R00100010001000100010001001",
  // ... more rows
  "111111111111111111111111111111"
]
```

### Customizing Graphics

- Modify materials in `buildMaze()` method
- Adjust lighting in `createScene()` method
- Update particle effects in `createParticleEffect()` method

### Audio Customization

- Add audio files to `public/audio/` directory
- Update `AudioManager` class to include new sounds
- Configure volume and playback settings

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Performance Optimizations

- **Instanced Rendering**: Efficient wall rendering
- **Frustum Culling**: Only render visible objects
- **Level of Detail**: Dynamic quality adjustment
- **Memory Management**: Proper disposal of Three.js objects
- **Code Splitting**: Optimized bundle sizes

## 🐛 Troubleshooting

### Common Issues

1. **Game not loading**
   - Check browser console for errors
   - Ensure all dependencies are installed
   - Verify WebGL support

2. **Performance issues**
   - Lower graphics settings
   - Close other browser tabs
   - Update graphics drivers

3. **Audio not working**
   - Check browser audio permissions
   - Ensure audio files are in correct location
   - Try refreshing the page

### Debug Mode

Enable debug mode by adding `?debug=true` to the URL:

```
http://localhost:3000?debug=true
```

This will show:
- FPS counter
- Performance metrics
- Debug information
- Console logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Test on multiple browsers
- Optimize for performance
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Team**: For the amazing 3D graphics library
- **Vite Team**: For the fast build tool
- **Open Source Community**: For inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/maze-game-3d/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nzaoo)
- **Email**: nzao1327@gmail.com

---

<div align="center">
  <p>Made with ❤️ by Maze Game Developer</p>
  <p>
    <a href="https://github.com/yourusername/maze-game-3d/stargazers">
      <img src="https://img.shields.io/github/stars/yourusername/maze-game-3d" alt="Stars">
    </a>
    <a href="https://github.com/yourusername/maze-game-3d/network">
      <img src="https://img.shields.io/github/forks/yourusername/maze-game-3d" alt="Forks">
    </a>
    <a href="https://github.com/yourusername/maze-game-3d/issues">
      <img src="https://img.shields.io/github/issues/yourusername/maze-game-3d" alt="Issues">
    </a>
  </p>
</div>
