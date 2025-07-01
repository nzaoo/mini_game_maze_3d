// =============== ACHIEVEMENT SYSTEM COMPONENT ===============
// Advanced achievement system for player progression

export class AchievementSystem {
  constructor() {
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
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
      speedRuns: 0
    };
    
    this.init();
  }
  
  // Initialize achievement system
  init() {
    this.createAchievements();
    this.loadProgress();
  }
  
  // Create all achievements
  createAchievements() {
    // Speed achievements
    this.addAchievement({
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a level in under 30 seconds',
      icon: '⚡',
      requirements: { speedRun: 30 }
    });
    
    this.addAchievement({
      id: 'lightning_fast',
      name: 'Lightning Fast',
      description: 'Complete a level in under 20 seconds',
      icon: '⚡⚡',
      requirements: { speedRun: 20 }
    });
    
    this.addAchievement({
      id: 'time_master',
      name: 'Time Master',
      description: 'Complete a level in under 15 seconds',
      icon: '⚡⚡⚡',
      requirements: { speedRun: 15 }
    });
    
    // Score achievements
    this.addAchievement({
      id: 'score_collector',
      name: 'Score Collector',
      description: 'Collect 100 total rewards',
      icon: '🏆',
      requirements: { rewardsCollected: 100 }
    });
    
    this.addAchievement({
      id: 'score_master',
      name: 'Score Master',
      description: 'Collect 500 total rewards',
      icon: '🏆🏆',
      requirements: { rewardsCollected: 500 }
    });
    
    this.addAchievement({
      id: 'score_legend',
      name: 'Score Legend',
      description: 'Collect 1000 total rewards',
      icon: '🏆🏆🏆',
      requirements: { rewardsCollected: 1000 }
    });
    
    // Level completion achievements
    this.addAchievement({
      id: 'level_explorer',
      name: 'Level Explorer',
      description: 'Complete 5 levels',
      icon: '🗺️',
      requirements: { levelsCompleted: 5 }
    });
    
    this.addAchievement({
      id: 'level_master',
      name: 'Level Master',
      description: 'Complete 10 levels',
      icon: '🗺️🗺️',
      requirements: { levelsCompleted: 10 }
    });
    
    this.addAchievement({
      id: 'level_legend',
      name: 'Level Legend',
      description: 'Complete 25 levels',
      icon: '🗺️🗺️🗺️',
      requirements: { levelsCompleted: 25 }
    });
    
    // Perfect run achievements
    this.addAchievement({
      id: 'perfect_run',
      name: 'Perfect Run',
      description: 'Complete a level without hitting any traps',
      icon: '✨',
      requirements: { perfectLevel: true }
    });
    
    this.addAchievement({
      id: 'perfect_master',
      name: 'Perfect Master',
      description: 'Complete 5 levels perfectly',
      icon: '✨✨',
      requirements: { perfectLevels: 5 }
    });
    
    this.addAchievement({
      id: 'perfect_legend',
      name: 'Perfect Legend',
      description: 'Complete 10 levels perfectly',
      icon: '✨✨✨',
      requirements: { perfectLevels: 10 }
    });
    
    // Distance achievements
    this.addAchievement({
      id: 'distance_walker',
      name: 'Distance Walker',
      description: 'Travel 1000 units total',
      icon: '🚶',
      requirements: { distanceTraveled: 1000 }
    });
    
    this.addAchievement({
      id: 'distance_runner',
      name: 'Distance Runner',
      description: 'Travel 5000 units total',
      icon: '🏃',
      requirements: { distanceTraveled: 5000 }
    });
    
    this.addAchievement({
      id: 'distance_marathon',
      name: 'Distance Marathon',
      description: 'Travel 10000 units total',
      icon: '🏃‍♂️',
      requirements: { distanceTraveled: 10000 }
    });
    
    // Jump achievements
    this.addAchievement({
      id: 'jump_beginner',
      name: 'Jump Beginner',
      description: 'Jump 50 times total',
      icon: '🦘',
      requirements: { jumps: 50 }
    });
    
    this.addAchievement({
      id: 'jump_expert',
      name: 'Jump Expert',
      description: 'Jump 200 times total',
      icon: '🦘🦘',
      requirements: { jumps: 200 }
    });
    
    this.addAchievement({
      id: 'jump_master',
      name: 'Jump Master',
      description: 'Jump 500 times total',
      icon: '🦘🦘🦘',
      requirements: { jumps: 500 }
    });
    
    // Survival achievements
    this.addAchievement({
      id: 'survivor',
      name: 'Survivor',
      description: 'Complete 3 levels without dying',
      icon: '🛡️',
      requirements: { noDeaths: 3 }
    });
    
    this.addAchievement({
      id: 'immortal',
      name: 'Immortal',
      description: 'Complete 10 levels without dying',
      icon: '🛡️🛡️',
      requirements: { noDeaths: 10 }
    });
    
    // Special achievements
    this.addAchievement({
      id: 'first_blood',
      name: 'First Blood',
      description: 'Hit your first trap',
      icon: '💀',
      requirements: { firstTrap: true }
    });
    
    this.addAchievement({
      id: 'persistent',
      name: 'Persistent',
      description: 'Die 10 times and keep playing',
      icon: '💪',
      requirements: { deaths: 10 }
    });
    
    this.addAchievement({
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Play for 1 hour total',
      icon: '⏰',
      requirements: { totalPlayTime: 3600000 }
    });
    
    this.addAchievement({
      id: 'addicted',
      name: 'Addicted',
      description: 'Play for 5 hours total',
      icon: '⏰⏰',
      requirements: { totalPlayTime: 18000000 }
    });
  }
  
  // Add achievement
  addAchievement(achievement) {
    this.achievements.set(achievement.id, {
      ...achievement,
      unlocked: false,
      unlockDate: null,
      progress: 0
    });
  }
  
  // Update statistics
  updateStatistics(stats) {
    Object.assign(this.statistics, stats);
    this.checkAchievements();
  }
  
  // Check for unlocked achievements
  checkAchievements() {
    this.achievements.forEach((achievement, id) => {
      if (!achievement.unlocked && this.checkRequirements(achievement.requirements)) {
        this.unlockAchievement(id);
      }
    });
  }
  
  // Check if requirements are met
  checkRequirements(requirements) {
    for (const [key, value] of Object.entries(requirements)) {
      switch (key) {
        case 'speedRun':
          if (this.statistics.speedRuns < value) return false;
          break;
        case 'rewardsCollected':
          if (this.statistics.rewardsCollected < value) return false;
          break;
        case 'levelsCompleted':
          if (this.statistics.levelsCompleted < value) return false;
          break;
        case 'perfectLevel':
          if (!this.statistics.perfectLevels) return false;
          break;
        case 'perfectLevels':
          if (this.statistics.perfectLevels < value) return false;
          break;
        case 'distanceTraveled':
          if (this.statistics.distanceTraveled < value) return false;
          break;
        case 'jumps':
          if (this.statistics.jumps < value) return false;
          break;
        case 'noDeaths':
          if (this.statistics.deaths > 0) return false;
          break;
        case 'deaths':
          if (this.statistics.deaths < value) return false;
          break;
        case 'totalPlayTime':
          if (this.statistics.totalPlayTime < value) return false;
          break;
        case 'firstTrap':
          if (this.statistics.trapsHit === 0) return false;
          break;
      }
    }
    return true;
  }
  
  // Unlock achievement
  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockDate = Date.now();
      this.unlockedAchievements.add(achievementId);
      
      // Show achievement notification
      this.showAchievementNotification(achievement);
      
      // Save progress
      this.saveProgress();
      
      return true;
    }
    return false;
  }
  
  // Show achievement notification
  showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 1000;
      transform: translateX(400px);
      transition: transform 0.5s ease;
      max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  // Get achievement by ID
  getAchievement(achievementId) {
    return this.achievements.get(achievementId);
  }
  
  // Get all achievements
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }
  
  // Get unlocked achievements
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.unlocked);
  }
  
  // Get locked achievements
  getLockedAchievements() {
    return this.getAllAchievements().filter(a => !a.unlocked);
  }
  
  // Get achievements by category
  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }
  
  // Get achievement progress
  getAchievementProgress(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return 0;
    
    const requirements = achievement.requirements;
    let progress = 0;
    let total = 0;
    
    for (const [key, value] of Object.entries(requirements)) {
      const current = this.statistics[key] || 0;
      const required = value;
      
      if (typeof required === 'number') {
        progress += Math.min(current, required);
        total += required;
      } else if (typeof required === 'boolean') {
        progress += current ? 1 : 0;
        total += 1;
      }
    }
    
    return total > 0 ? (progress / total) * 100 : 0;
  }
  
  // Get statistics
  getStatistics() {
    return { ...this.statistics };
  }
  
  // Get achievement count
  getAchievementCount() {
    return {
      total: this.achievements.size,
      unlocked: this.unlockedAchievements.size,
      locked: this.achievements.size - this.unlockedAchievements.size
    };
  }
  
  // Get completion percentage
  getCompletionPercentage() {
    return (this.unlockedAchievements.size / this.achievements.size) * 100;
  }
  
  // Reset all achievements
  reset() {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockDate = null;
      achievement.progress = 0;
    });
    this.unlockedAchievements.clear();
    this.saveProgress();
  }
  
  // Save progress to localStorage
  saveProgress() {
    const data = {
      achievements: Array.from(this.achievements.entries()),
      statistics: this.statistics,
      unlockedAchievements: Array.from(this.unlockedAchievements)
    };
    
    try {
      localStorage.setItem('maze_game_achievements', JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Failed to save achievements:', error);
      return false;
    }
  }
  
  // Load progress from localStorage
  loadProgress() {
    try {
      const data = localStorage.getItem('maze_game_achievements');
      if (data) {
        const parsed = JSON.parse(data);
        
        this.achievements = new Map(parsed.achievements);
        this.statistics = parsed.statistics || this.statistics;
        this.unlockedAchievements = new Set(parsed.unlockedAchievements);
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to load achievements:', error);
    }
    
    return false;
  }
  
  // Export achievement data
  export() {
    return {
      achievements: this.getAllAchievements(),
      statistics: this.statistics,
      count: this.getAchievementCount(),
      completion: this.getCompletionPercentage()
    };
  }
} 