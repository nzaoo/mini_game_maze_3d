// =============== INVENTORY SYSTEM COMPONENT ===============
// Advanced inventory system for items and power-ups

export class InventorySystem {
  constructor() {
    this.items = new Map();
    this.maxSlots = 10;
    this.selectedSlot = 0;
    this.powerUps = new Map();
    this.coins = 0;
    this.keys = 0;
    this.gems = 0;
    
    this.init();
  }
  
  // Initialize inventory
  init() {
    // Initialize empty slots
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
    
    // Initialize power-ups
    this.powerUps.set('speedBoost', { active: false, duration: 0, maxDuration: 10000 });
    this.powerUps.set('jumpBoost', { active: false, duration: 0, maxDuration: 8000 });
    this.powerUps.set('invincibility', { active: false, duration: 0, maxDuration: 5000 });
    this.powerUps.set('magnet', { active: false, duration: 0, maxDuration: 12000 });
    this.powerUps.set('doublePoints', { active: false, duration: 0, maxDuration: 15000 });
  }
  
  // Add item to inventory
  addItem(item) {
    const emptySlot = this.findEmptySlot();
    if (emptySlot !== -1) {
      this.items.set(emptySlot, {
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        icon: item.icon,
        quantity: item.quantity || 1,
        maxQuantity: item.maxQuantity || 1,
        effect: item.effect,
        rarity: item.rarity || 'common'
      });
      return true;
    }
    return false; // Inventory full
  }
  
  // Remove item from inventory
  removeItem(slotIndex) {
    if (this.items.has(slotIndex) && this.items.get(slotIndex)) {
      this.items.set(slotIndex, null);
      return true;
    }
    return false;
  }
  
  // Use item from inventory
  useItem(slotIndex) {
    const item = this.items.get(slotIndex);
    if (!item) return false;
    
    switch (item.type) {
      case 'consumable':
        return this.useConsumable(item, slotIndex);
      case 'powerUp':
        return this.activatePowerUp(item);
      case 'key':
        return this.useKey(item, slotIndex);
      case 'gem':
        return this.useGem(item, slotIndex);
      default:
        return false;
    }
  }
  
  // Use consumable item
  useConsumable(item, slotIndex) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(slotIndex);
    }
    
    // Apply effect
    if (item.effect) {
      this.applyEffect(item.effect);
    }
    
    return true;
  }
  
  // Activate power-up
  activatePowerUp(item) {
    const powerUp = this.powerUps.get(item.id);
    if (powerUp) {
      powerUp.active = true;
      powerUp.duration = powerUp.maxDuration;
      return true;
    }
    return false;
  }
  
  // Use key
  useKey(item, slotIndex) {
    if (this.keys > 0) {
      this.keys--;
      this.removeItem(slotIndex);
      return true;
    }
    return false;
  }
  
  // Use gem
  useGem(item, slotIndex) {
    this.gems += item.quantity;
    this.removeItem(slotIndex);
    return true;
  }
  
  // Apply item effect
  applyEffect(effect) {
    switch (effect.type) {
      case 'heal':
        // Heal player
        break;
      case 'speed':
        this.activatePowerUp({ id: 'speedBoost' });
        break;
      case 'jump':
        this.activatePowerUp({ id: 'jumpBoost' });
        break;
      case 'invincibility':
        this.activatePowerUp({ id: 'invincibility' });
        break;
      case 'magnet':
        this.activatePowerUp({ id: 'magnet' });
        break;
      case 'doublePoints':
        this.activatePowerUp({ id: 'doublePoints' });
        break;
    }
  }
  
  // Update power-ups
  update(deltaTime) {
    this.powerUps.forEach((powerUp, key) => {
      if (powerUp.active) {
        powerUp.duration -= deltaTime * 1000;
        if (powerUp.duration <= 0) {
          powerUp.active = false;
          powerUp.duration = 0;
        }
      }
    });
  }
  
  // Check if power-up is active
  isPowerUpActive(powerUpId) {
    const powerUp = this.powerUps.get(powerUpId);
    return powerUp ? powerUp.active : false;
  }
  
  // Get power-up remaining time
  getPowerUpTime(powerUpId) {
    const powerUp = this.powerUps.get(powerUpId);
    return powerUp ? powerUp.duration : 0;
  }
  
  // Find empty slot
  findEmptySlot() {
    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.items.get(i)) {
        return i;
      }
    }
    return -1;
  }
  
  // Get item at slot
  getItem(slotIndex) {
    return this.items.get(slotIndex);
  }
  
  // Get all items
  getAllItems() {
    const items = [];
    for (let i = 0; i < this.maxSlots; i++) {
      const item = this.items.get(i);
      if (item) {
        items.push({ ...item, slot: i });
      }
    }
    return items;
  }
  
  // Get items by type
  getItemsByType(type) {
    return this.getAllItems().filter(item => item.type === type);
  }
  
  // Get items by rarity
  getItemsByRarity(rarity) {
    return this.getAllItems().filter(item => item.rarity === rarity);
  }
  
  // Check if inventory is full
  isFull() {
    return this.findEmptySlot() === -1;
  }
  
  // Get inventory space used
  getUsedSlots() {
    let count = 0;
    for (let i = 0; i < this.maxSlots; i++) {
      if (this.items.get(i)) {
        count++;
      }
    }
    return count;
  }
  
  // Get inventory space available
  getAvailableSlots() {
    return this.maxSlots - this.getUsedSlots();
  }
  
  // Add coins
  addCoins(amount) {
    this.coins += amount;
  }
  
  // Remove coins
  removeCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }
  
  // Get coins
  getCoins() {
    return this.coins;
  }
  
  // Add keys
  addKeys(amount) {
    this.keys += amount;
  }
  
  // Remove keys
  removeKeys(amount) {
    if (this.keys >= amount) {
      this.keys -= amount;
      return true;
    }
    return false;
  }
  
  // Get keys
  getKeys() {
    return this.keys;
  }
  
  // Add gems
  addGems(amount) {
    this.gems += amount;
  }
  
  // Remove gems
  removeGems(amount) {
    if (this.gems >= amount) {
      this.gems -= amount;
      return true;
    }
    return false;
  }
  
  // Get gems
  getGems() {
    return this.gems;
  }
  
  // Select slot
  selectSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.maxSlots) {
      this.selectedSlot = slotIndex;
      return true;
    }
    return false;
  }
  
  // Get selected slot
  getSelectedSlot() {
    return this.selectedSlot;
  }
  
  // Get selected item
  getSelectedItem() {
    return this.getItem(this.selectedSlot);
  }
  
  // Move item between slots
  moveItem(fromSlot, toSlot) {
    if (fromSlot === toSlot) return false;
    
    const fromItem = this.items.get(fromSlot);
    const toItem = this.items.get(toSlot);
    
    if (!fromItem) return false;
    
    // If destination is empty, just move
    if (!toItem) {
      this.items.set(toSlot, fromItem);
      this.items.set(fromSlot, null);
      return true;
    }
    
    // If items are the same type and stackable, combine them
    if (fromItem.id === toItem.id && fromItem.maxQuantity > 1) {
      const totalQuantity = fromItem.quantity + toItem.quantity;
      if (totalQuantity <= fromItem.maxQuantity) {
        toItem.quantity = totalQuantity;
        this.items.set(fromSlot, null);
        return true;
      } else {
        // Split the stack
        const spaceInDest = fromItem.maxQuantity - toItem.quantity;
        toItem.quantity = fromItem.maxQuantity;
        fromItem.quantity -= spaceInDest;
        return true;
      }
    }
    
    // Swap items
    this.items.set(fromSlot, toItem);
    this.items.set(toSlot, fromItem);
    return true;
  }
  
  // Sort inventory
  sortInventory() {
    const items = this.getAllItems();
    
    // Sort by type, then by rarity, then by name
    items.sort((a, b) => {
      const typeOrder = { 'key': 0, 'gem': 1, 'powerUp': 2, 'consumable': 3 };
      const rarityOrder = { 'legendary': 0, 'epic': 1, 'rare': 2, 'common': 3 };
      
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      
      if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      }
      
      return a.name.localeCompare(b.name);
    });
    
    // Clear inventory and re-add sorted items
    this.items.clear();
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
    
    items.forEach((item, index) => {
      if (index < this.maxSlots) {
        this.items.set(index, item);
      }
    });
  }
  
  // Clear inventory
  clear() {
    this.items.clear();
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
    this.coins = 0;
    this.keys = 0;
    this.gems = 0;
  }
  
  // Save inventory to localStorage
  save() {
    const data = {
      items: Array.from(this.items.entries()),
      coins: this.coins,
      keys: this.keys,
      gems: this.gems,
      selectedSlot: this.selectedSlot,
      powerUps: Array.from(this.powerUps.entries())
    };
    
    try {
      localStorage.setItem('maze_game_inventory', JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Failed to save inventory:', error);
      return false;
    }
  }
  
  // Load inventory from localStorage
  load() {
    try {
      const data = localStorage.getItem('maze_game_inventory');
      if (data) {
        const parsed = JSON.parse(data);
        
        this.items = new Map(parsed.items);
        this.coins = parsed.coins || 0;
        this.keys = parsed.keys || 0;
        this.gems = parsed.gems || 0;
        this.selectedSlot = parsed.selectedSlot || 0;
        this.powerUps = new Map(parsed.powerUps);
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to load inventory:', error);
    }
    
    return false;
  }
  
  // Export inventory data
  export() {
    return {
      items: this.getAllItems(),
      coins: this.coins,
      keys: this.keys,
      gems: this.gems,
      powerUps: Array.from(this.powerUps.entries()),
      usedSlots: this.getUsedSlots(),
      availableSlots: this.getAvailableSlots()
    };
  }
} 