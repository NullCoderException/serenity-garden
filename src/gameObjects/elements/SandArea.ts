import { DraggableGameObject } from '../DraggableGameObject';
import { GameObjectConfig } from '../GameObject';
import { RakeSystem, RakeType } from '../../systems/RakeSystem';

export enum SandAreaSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

export interface SandAreaConfig extends GameObjectConfig {
    areaSize?: SandAreaSize;
    patternTexture?: string;
}

export class SandArea extends DraggableGameObject {
    private areaSize: SandAreaSize;
    private sandPattern!: Phaser.GameObjects.Graphics;
    private patternData!: number[][];
    private gridSize: number = 4; // Resolution for pattern grid
    private isRakeMode: boolean = false;
    private currentRakeType: RakeType = RakeType.Simple;

    constructor(config: SandAreaConfig) {
        // Create base sand texture
        super({
            ...config,
            texture: config.texture || 'sand-base',
            frame: config.frame || 0
        });
        
        this.areaSize = config.areaSize || SandAreaSize.Medium;
        this.elementType = `SandArea_${this.areaSize}`;
        
        // Set scale and create pattern overlay
        this.setSizeForType();
        this.createPatternOverlay();
        this.initializePatternData();
    }

    private setSizeForType(): void {
        switch (this.areaSize) {
            case SandAreaSize.Small:
                this.setScale(0.6);
                break;
            case SandAreaSize.Medium:
                this.setScale(1.0);
                break;
            case SandAreaSize.Large:
                this.setScale(1.4);
                break;
        }
    }

    private createPatternOverlay(): void {
        this.sandPattern = this.scene.add.graphics();
        this.sandPattern.setDepth(this.depth + 1);
        
        // Position pattern overlay to match sand area
        this.sandPattern.x = this.x;
        this.sandPattern.y = this.y;
        
        // Initial smooth sand appearance
        this.drawSmoothSand();
    }

    private initializePatternData(): void {
        const width = Math.floor(this.displayWidth / this.gridSize);
        const height = Math.floor(this.displayHeight / this.gridSize);
        
        this.patternData = [];
        for (let y = 0; y < height; y++) {
            this.patternData[y] = [];
            for (let x = 0; x < width; x++) {
                this.patternData[y][x] = 0; // 0 = smooth sand, higher values = disturbed
            }
        }
    }

    private drawSmoothSand(): void {
        this.sandPattern.clear();
        // Don't draw anything initially - let the base texture show through
    }

    public enableRakeMode(): void {
        this.isRakeMode = true;
        this.setDraggable(false); // Disable dragging in rake mode
        
        // Add rake interaction listeners
        this.setInteractive();
        this.on('pointerdown', this.startRaking, this);
        this.on('pointermove', this.continueRaking, this);
        this.on('pointerup', this.stopRaking, this);
    }

    public disableRakeMode(): void {
        this.isRakeMode = false;
        this.setDraggable(true); // Re-enable dragging
        
        // Remove rake interaction listeners
        this.off('pointerdown', this.startRaking, this);
        this.off('pointermove', this.continueRaking, this);
        this.off('pointerup', this.stopRaking, this);
    }

    private isRaking: boolean = false;
    private lastRakePoint: { x: number; y: number } | null = null;

    private startRaking(pointer: Phaser.Input.Pointer): void {
        if (!this.isRakeMode) return;
        
        this.isRaking = true;
        const localPoint = this.getLocalRakePoint(pointer.worldX, pointer.worldY);
        this.lastRakePoint = localPoint;
        this.drawRakeMark(localPoint.x, localPoint.y);
    }

    private continueRaking(pointer: Phaser.Input.Pointer): void {
        if (!this.isRakeMode || !this.isRaking) return;
        
        const localPoint = this.getLocalRakePoint(pointer.worldX, pointer.worldY);
        
        if (this.lastRakePoint) {
            this.drawRakeLine(this.lastRakePoint.x, this.lastRakePoint.y, localPoint.x, localPoint.y);
        }
        
        this.lastRakePoint = localPoint;
    }

    private stopRaking(): void {
        this.isRaking = false;
        this.lastRakePoint = null;
    }

    private getLocalRakePoint(worldX: number, worldY: number): { x: number; y: number } {
        // Convert world coordinates to local sand area coordinates
        const bounds = this.getBounds();
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    private drawRakeMark(x: number, y: number): void {
        // Convert local coordinates to grid coordinates
        const gridX = Math.floor((x + this.displayWidth / 2) / this.gridSize);
        const gridY = Math.floor((y + this.displayHeight / 2) / this.gridSize);
        
        // Update pattern data
        this.updatePatternData(gridX, gridY, 1);
        
        // Redraw visual pattern
        this.updateVisualPattern();
    }

    private drawRakeLine(x1: number, y1: number, x2: number, y2: number): void {
        // Use the rake system to create sophisticated patterns
        const stroke = RakeSystem.createRakeStroke(x1, y1, x2, y2, this.currentRakeType);
        const bounds = this.getBounds();
        
        const affectedCells = stroke.getAffectedGridCells(
            this.gridSize,
            -bounds.width / 2,
            -bounds.height / 2
        );
        
        // Apply the rake stroke to pattern data
        for (const cell of affectedCells) {
            this.updatePatternData(cell.gridX, cell.gridY, cell.intensity);
        }
        
        // Update visual representation
        this.updateVisualPattern();
    }

    private updatePatternData(gridX: number, gridY: number, intensity: number): void {
        if (gridY >= 0 && gridY < this.patternData.length &&
            gridX >= 0 && gridX < this.patternData[0].length) {
            this.patternData[gridY][gridX] = Math.min(1, this.patternData[gridY][gridX] + intensity);
        }
    }

    private updateVisualPattern(): void {
        this.sandPattern.clear();
        
        const bounds = this.getBounds();
        
        // Draw rake patterns only
        this.sandPattern.lineStyle(2, 0x8B7355, 0.8); // Darker sand color for lines
        
        for (let y = 0; y < this.patternData.length; y++) {
            for (let x = 0; x < this.patternData[y].length; x++) {
                if (this.patternData[y][x] > 0) {
                    const pixelX = x * this.gridSize - bounds.width / 2;
                    const pixelY = y * this.gridSize - bounds.height / 2;
                    
                    // Draw small lines to represent disturbed sand
                    this.sandPattern.beginPath();
                    this.sandPattern.moveTo(pixelX, pixelY);
                    this.sandPattern.lineTo(pixelX + this.gridSize, pixelY);
                    this.sandPattern.strokePath();
                }
            }
        }
    }

    public clearPattern(): void {
        this.initializePatternData();
        this.drawSmoothSand();
    }

    protected handleDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        super.handleDrag(pointer, dragX, dragY);
        
        // Update pattern overlay position
        this.sandPattern.x = this.x;
        this.sandPattern.y = this.y;
    }

    public canPlaceAt(x: number, y: number): boolean {
        // First check basic bounds
        if (!super.canPlaceAt(x, y)) {
            return false;
        }
        
        // Sand areas shouldn't overlap with other elements
        const manager = this.scene.data.get('elementManager');
        if (manager) {
            const elements = manager.getAllElements();
            for (const element of elements) {
                if (element !== this) {
                    const distance = Phaser.Math.Distance.Between(x, y, element.x, element.y);
                    const minDistance = (this.displayWidth + element.displayWidth) / 2 + 20; // Extra padding
                    if (distance < minDistance) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    public getAreaSize(): SandAreaSize {
        return this.areaSize;
    }

    public setAreaSize(size: SandAreaSize): void {
        this.areaSize = size;
        this.elementType = `SandArea_${this.areaSize}`;
        this.setSizeForType();
        this.initializePatternData();
        this.drawSmoothSand();
    }

    public getCurrentRakeType(): RakeType {
        return this.currentRakeType;
    }

    public setRakeType(rakeType: RakeType): void {
        this.currentRakeType = rakeType;
    }

    public getAllRakeTypes(): RakeType[] {
        return RakeSystem.getAllRakeTypes();
    }

    public destroy(): void {
        if (this.sandPattern) {
            this.sandPattern.destroy();
        }
        super.destroy();
    }
}