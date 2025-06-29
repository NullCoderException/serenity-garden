import * as Phaser from 'phaser';
import { RakeSystem, RakeType } from './RakeSystem';

export class GardenSandLayer {
    private scene: Phaser.Scene;
    private bounds: Phaser.Geom.Rectangle;
    private sandGraphics: Phaser.GameObjects.Graphics;
    private patternGraphics: Phaser.GameObjects.Graphics;
    private patternData!: number[][];
    private gridSize: number = 4;
    private currentRakeType: RakeType = RakeType.Simple;
    private isRakeMode: boolean = false;
    private isRaking: boolean = false;
    private lastRakePoint: { x: number; y: number } | null = null;
    private interactiveZone: Phaser.GameObjects.Zone;

    constructor(scene: Phaser.Scene, bounds: Phaser.Geom.Rectangle) {
        this.scene = scene;
        this.bounds = bounds;
        
        // Create sand base layer
        this.sandGraphics = scene.add.graphics();
        this.sandGraphics.setDepth(-5); // Below grid but above background
        
        // Create pattern layer
        this.patternGraphics = scene.add.graphics();
        this.patternGraphics.setDepth(-4); // Above sand, below grid
        
        // Create interactive zone for rake input
        this.interactiveZone = scene.add.zone(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            bounds.width,
            bounds.height
        );
        this.interactiveZone.setInteractive();
        this.interactiveZone.setDepth(-3);
        
        this.initializePatternData();
        this.drawSandBase();
        this.setupRakeListeners();
    }

    private initializePatternData(): void {
        const width = Math.floor(this.bounds.width / this.gridSize);
        const height = Math.floor(this.bounds.height / this.gridSize);
        
        this.patternData = [];
        for (let y = 0; y < height; y++) {
            this.patternData[y] = [];
            for (let x = 0; x < width; x++) {
                this.patternData[y][x] = 0;
            }
        }
    }

    private drawSandBase(): void {
        this.sandGraphics.clear();
        
        // Draw sand texture
        this.sandGraphics.fillStyle(0xF5DEB3); // Sandy beige color
        this.sandGraphics.fillRect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
        
        // Add subtle texture with dots
        this.sandGraphics.fillStyle(0xE5D3A3, 0.3);
        for (let i = 0; i < 200; i++) {
            const x = this.bounds.x + Math.random() * this.bounds.width;
            const y = this.bounds.y + Math.random() * this.bounds.height;
            this.sandGraphics.fillCircle(x, y, 1);
        }
        
        // Draw border
        this.sandGraphics.lineStyle(4, 0x8B7355);
        this.sandGraphics.strokeRect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
    }

    private setupRakeListeners(): void {
        this.interactiveZone.on('pointerdown', this.startRaking, this);
        this.interactiveZone.on('pointermove', this.continueRaking, this);
        this.interactiveZone.on('pointerup', this.stopRaking, this);
        this.interactiveZone.on('pointerout', this.stopRaking, this);
    }

    public enableRakeMode(): void {
        this.isRakeMode = true;
        // Visual feedback that rake mode is active
        this.sandGraphics.setAlpha(0.95);
    }

    public disableRakeMode(): void {
        this.isRakeMode = false;
        this.isRaking = false;
        this.lastRakePoint = null;
        this.sandGraphics.setAlpha(1);
    }

    public setRakeType(rakeType: RakeType): void {
        this.currentRakeType = rakeType;
    }

    private startRaking(pointer: Phaser.Input.Pointer): void {
        if (!this.isRakeMode) return;
        
        // Check if pointer is within bounds
        if (!this.bounds.contains(pointer.worldX, pointer.worldY)) return;
        
        this.isRaking = true;
        this.lastRakePoint = { x: pointer.worldX, y: pointer.worldY };
        this.drawRakeMark(pointer.worldX, pointer.worldY);
    }

    private continueRaking(pointer: Phaser.Input.Pointer): void {
        if (!this.isRakeMode || !this.isRaking) return;
        
        // Check if pointer is within bounds
        if (!this.bounds.contains(pointer.worldX, pointer.worldY)) {
            this.stopRaking();
            return;
        }
        
        if (this.lastRakePoint) {
            this.drawRakeLine(
                this.lastRakePoint.x,
                this.lastRakePoint.y,
                pointer.worldX,
                pointer.worldY
            );
        }
        
        this.lastRakePoint = { x: pointer.worldX, y: pointer.worldY };
    }

    private stopRaking(): void {
        this.isRaking = false;
        this.lastRakePoint = null;
    }

    private drawRakeMark(x: number, y: number): void {
        const gridX = Math.floor((x - this.bounds.x) / this.gridSize);
        const gridY = Math.floor((y - this.bounds.y) / this.gridSize);
        
        this.updatePatternData(gridX, gridY, 1);
        this.updateVisualPattern();
    }

    private drawRakeLine(x1: number, y1: number, x2: number, y2: number): void {
        const stroke = RakeSystem.createRakeStroke(x1, y1, x2, y2, this.currentRakeType);
        const affectedCells = stroke.getAffectedGridCells(
            this.gridSize,
            this.bounds.x,
            this.bounds.y
        );
        
        for (const cell of affectedCells) {
            this.updatePatternData(cell.gridX, cell.gridY, cell.intensity);
        }
        
        this.updateVisualPattern();
    }

    private updatePatternData(gridX: number, gridY: number, intensity: number): void {
        if (gridY >= 0 && gridY < this.patternData.length &&
            gridX >= 0 && gridX < this.patternData[0].length) {
            this.patternData[gridY][gridX] = Math.min(1, this.patternData[gridY][gridX] + intensity);
        }
    }

    private updateVisualPattern(): void {
        this.patternGraphics.clear();
        
        // Draw rake patterns
        this.patternGraphics.lineStyle(2, 0x8B7355, 0.7);
        
        for (let y = 0; y < this.patternData.length; y++) {
            for (let x = 0; x < this.patternData[y].length; x++) {
                if (this.patternData[y][x] > 0) {
                    const pixelX = this.bounds.x + x * this.gridSize;
                    const pixelY = this.bounds.y + y * this.gridSize;
                    
                    // Draw horizontal lines for raked areas
                    this.patternGraphics.beginPath();
                    this.patternGraphics.moveTo(pixelX, pixelY);
                    this.patternGraphics.lineTo(pixelX + this.gridSize, pixelY);
                    this.patternGraphics.strokePath();
                    
                    // Add some variation with intensity
                    if (this.patternData[y][x] > 0.5) {
                        this.patternGraphics.beginPath();
                        this.patternGraphics.moveTo(pixelX, pixelY + 2);
                        this.patternGraphics.lineTo(pixelX + this.gridSize, pixelY + 2);
                        this.patternGraphics.strokePath();
                    }
                }
            }
        }
    }

    public clearPatterns(): void {
        this.initializePatternData();
        this.patternGraphics.clear();
    }

    public smoothPatterns(): void {
        // Gradually fade patterns over time for a natural look
        for (let y = 0; y < this.patternData.length; y++) {
            for (let x = 0; x < this.patternData[y].length; x++) {
                if (this.patternData[y][x] > 0) {
                    this.patternData[y][x] = Math.max(0, this.patternData[y][x] - 0.01);
                }
            }
        }
        this.updateVisualPattern();
    }

    public destroy(): void {
        this.sandGraphics.destroy();
        this.patternGraphics.destroy();
        this.interactiveZone.destroy();
    }
}