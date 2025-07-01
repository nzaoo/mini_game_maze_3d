import { describe, it, expect, beforeEach } from 'vitest';
import { MazeUtils, mazeConfig } from '../maze-data.js';

describe('Maze Game Tests', () => {
  let mockMazeMap;

  beforeEach(() => {
    // Setup mock maze for testing
    mockMazeMap = [
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
    ];
  });

  describe('MazeUtils', () => {
    describe('getMazeDimensions', () => {
      it('should return correct dimensions for valid maze', () => {
        const dimensions = MazeUtils.getMazeDimensions(mockMazeMap);
        expect(dimensions.width).toBe(30);
        expect(dimensions.height).toBe(30);
      });

      it('should return zero dimensions for empty maze', () => {
        const dimensions = MazeUtils.getMazeDimensions([]);
        expect(dimensions.width).toBe(0);
        expect(dimensions.height).toBe(0);
      });

      it('should return zero dimensions for null maze', () => {
        const dimensions = MazeUtils.getMazeDimensions(null);
        expect(dimensions.width).toBe(0);
        expect(dimensions.height).toBe(0);
      });
    });

    describe('countRewards', () => {
      it('should count rewards correctly', () => {
        const count = MazeUtils.countRewards(mockMazeMap);
        expect(count).toBe(3);
      });

      it('should return 0 for maze without rewards', () => {
        const mazeWithoutRewards = [
          '111111111111111111111111111111',
          '100000000000000000000000000001',
          '100000000000000000000000000001',
          '111111111111111111111111111111',
        ];
        const count = MazeUtils.countRewards(mazeWithoutRewards);
        expect(count).toBe(0);
      });
    });

    describe('countTraps', () => {
      it('should count traps correctly', () => {
        const count = MazeUtils.countTraps(mockMazeMap);
        expect(count).toBe(2);
      });

      it('should return 0 for maze without traps', () => {
        const mazeWithoutTraps = [
          '111111111111111111111111111111',
          '100000000000000000000000000001',
          '100000000000000000000000000001',
          '111111111111111111111111111111',
        ];
        const count = MazeUtils.countTraps(mazeWithoutTraps);
        expect(count).toBe(0);
      });
    });

    describe('validateMaze', () => {
      it('should validate correct maze structure', () => {
        const isValid = MazeUtils.validateMaze(mockMazeMap);
        expect(isValid).toBe(true);
      });

      it('should reject maze with inconsistent row lengths', () => {
        const invalidMaze = [
          '111111111111111111111111111111',
          '100000000000000000000000000001',
          '1000000000000000000000000000001', // Longer row
          '111111111111111111111111111111',
        ];
        const isValid = MazeUtils.validateMaze(invalidMaze);
        expect(isValid).toBe(false);
      });

      it('should reject empty maze', () => {
        const isValid = MazeUtils.validateMaze([]);
        expect(isValid).toBe(false);
      });

      it('should reject null maze', () => {
        const isValid = MazeUtils.validateMaze(null);
        expect(isValid).toBe(false);
      });
    });

    describe('getStartPosition', () => {
      it('should return correct start position', () => {
        const startPos = MazeUtils.getStartPosition();
        expect(startPos.x).toBe(1);
        expect(startPos.z).toBe(1);
      });
    });

    describe('getEndPosition', () => {
      it('should return correct end position', () => {
        const endPos = MazeUtils.getEndPosition(mockMazeMap);
        expect(endPos.x).toBe(28); // 30 - 2
        expect(endPos.z).toBe(28); // 30 - 2
      });

      it('should return zero position for empty maze', () => {
        const endPos = MazeUtils.getEndPosition([]);
        expect(endPos.x).toBe(0);
        expect(endPos.z).toBe(0);
      });
    });

    describe('isValidPosition', () => {
      it('should validate position within bounds and not wall', () => {
        const isValid = MazeUtils.isValidPosition(mockMazeMap, 1, 1);
        expect(isValid).toBe(true);
      });

      it('should reject wall position', () => {
        const isValid = MazeUtils.isValidPosition(mockMazeMap, 0, 0);
        expect(isValid).toBe(false);
      });

      it('should reject position out of bounds', () => {
        const isValid = MazeUtils.isValidPosition(mockMazeMap, 50, 50);
        expect(isValid).toBe(false);
      });

      it('should reject negative position', () => {
        const isValid = MazeUtils.isValidPosition(mockMazeMap, -1, -1);
        expect(isValid).toBe(false);
      });
    });

    describe('getRewardPositions', () => {
      it('should return all reward positions', () => {
        const positions = MazeUtils.getRewardPositions(mockMazeMap);
        expect(positions).toHaveLength(3);

        // Check if all positions contain 'R'
        positions.forEach(pos => {
          expect(mockMazeMap[pos.z][pos.x]).toBe('R');
        });
      });

      it('should return empty array for maze without rewards', () => {
        const mazeWithoutRewards = [
          '111111111111111111111111111111',
          '100000000000000000000000000001',
          '100000000000000000000000000001',
          '111111111111111111111111111111',
        ];
        const positions = MazeUtils.getRewardPositions(mazeWithoutRewards);
        expect(positions).toHaveLength(0);
      });
    });

    describe('getTrapPositions', () => {
      it('should return all trap positions', () => {
        const positions = MazeUtils.getTrapPositions(mockMazeMap);
        expect(positions).toHaveLength(2);

        // Check if all positions contain 'T'
        positions.forEach(pos => {
          expect(mockMazeMap[pos.z][pos.x]).toBe('T');
        });
      });

      it('should return empty array for maze without traps', () => {
        const mazeWithoutTraps = [
          '111111111111111111111111111111',
          '100000000000000000000000000001',
          '100000000000000000000000000001',
          '111111111111111111111111111111',
        ];
        const positions = MazeUtils.getTrapPositions(mazeWithoutTraps);
        expect(positions).toHaveLength(0);
      });
    });
  });

  describe('Maze Configuration', () => {
    it('should have correct tile type constants', () => {
      expect(mazeConfig.WALL).toBe('1');
      expect(mazeConfig.PATH).toBe(' ');
      expect(mazeConfig.REWARD).toBe('R');
      expect(mazeConfig.TRAP).toBe('T');
      expect(mazeConfig.START).toBe('S');
      expect(mazeConfig.END).toBe('E');
    });

    it('should have level settings for all levels', () => {
      expect(mazeConfig.levelSettings).toHaveLength(5);

      mazeConfig.levelSettings.forEach((level, _index) => {
        expect(level).toHaveProperty('timeLimit');
        expect(level).toHaveProperty('rewardValue');
        expect(level).toHaveProperty('trapDamage');
        expect(level.timeLimit).toBeGreaterThan(0);
        expect(level.rewardValue).toBeGreaterThan(0);
        expect(level.trapDamage).toBeGreaterThan(0);
      });
    });

    it('should have difficulty multipliers', () => {
      expect(mazeConfig.difficultyMultipliers).toHaveProperty('easy');
      expect(mazeConfig.difficultyMultipliers).toHaveProperty('normal');
      expect(mazeConfig.difficultyMultipliers).toHaveProperty('hard');
      expect(mazeConfig.difficultyMultipliers).toHaveProperty('expert');

      expect(mazeConfig.difficultyMultipliers.easy).toBe(1.0);
      expect(mazeConfig.difficultyMultipliers.normal).toBe(1.2);
      expect(mazeConfig.difficultyMultipliers.hard).toBe(1.5);
      expect(mazeConfig.difficultyMultipliers.expert).toBe(2.0);
    });
  });

  describe('Maze Maps', () => {
    it('should have valid maze maps', () => {
      const { mazeMaps } = require('../maze-data.js');

      expect(mazeMaps).toBeDefined();
      expect(Array.isArray(mazeMaps)).toBe(true);
      expect(mazeMaps.length).toBeGreaterThan(0);

      mazeMaps.forEach((maze, _index) => {
        expect(Array.isArray(maze)).toBe(true);
        expect(maze.length).toBeGreaterThan(0);

        // Validate maze structure
        const isValid = MazeUtils.validateMaze(maze);
        expect(isValid).toBe(true);

        // Check if maze has start and end positions
        const startPos = MazeUtils.getStartPosition();
        const endPos = MazeUtils.getEndPosition(maze);

        expect(MazeUtils.isValidPosition(maze, startPos.x, startPos.z)).toBe(
          true,
        );
        expect(MazeUtils.isValidPosition(maze, endPos.x, endPos.z)).toBe(true);
      });
    });
  });
});
