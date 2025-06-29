import { GameObject, GameObjectConfig } from './GameObject';
import * as Phaser from 'phaser';

export interface DragEvents {
    onDragStart?: (gameObject: DraggableGameObject, pointer: Phaser.Input.Pointer) => void;
    onDrag?: (gameObject: DraggableGameObject, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => void;
    onDragEnd?: (gameObject: DraggableGameObject, pointer: Phaser.Input.Pointer) => void;
}

export class DraggableGameObject extends GameObject {
    protected originalX: number = 0;
    protected originalY: number = 0;
    protected originalDepth: number = 0;
    protected dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    protected isValidPlacement: boolean = true;
    protected dragEvents: DragEvents = {};
    protected rotationStep: number = 15; // degrees per rotation step

    constructor(config: GameObjectConfig & { dragEvents?: DragEvents }) {
        super({ ...config, interactive: true });
        
        if (config.dragEvents) {
            this.dragEvents = config.dragEvents;
        }
        
        this.setupDragging();
    }

    protected setupDragging(): void {
        this.scene.input.setDraggable(this);
        
        this.on('dragstart', this.handleDragStart, this);
        this.on('drag', this.handleDrag, this);
        this.on('dragend', this.handleDragEnd, this);
    }

    protected handleDragStart(pointer: Phaser.Input.Pointer): void {
        this.isDragging = true;
        this.originalX = this.x;
        this.originalY = this.y;
        this.originalDepth = this.depth;
        
        // Calculate offset between pointer and object center
        this.dragOffset.x = this.x - pointer.worldX;
        this.dragOffset.y = this.y - pointer.worldY;
        
        // Bring to front while dragging
        this.setDepth(1000);
        
        // Visual feedback
        this.setAlpha(0.8);
        this.setTint(0xffffff);
        
        if (this.dragEvents.onDragStart) {
            this.dragEvents.onDragStart(this, pointer);
        }
    }

    protected handleDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        // Update position with offset
        const newX = pointer.worldX + this.dragOffset.x;
        const newY = pointer.worldY + this.dragOffset.y;
        
        this.x = newX;
        this.y = newY;
        
        // Check if placement is valid
        this.isValidPlacement = this.canPlaceAt(newX, newY);
        
        // Visual feedback for valid/invalid placement
        if (this.isValidPlacement) {
            this.setTint(0x00ff00);
        } else {
            this.setTint(0xff0000);
        }
        
        if (this.dragEvents.onDrag) {
            this.dragEvents.onDrag(this, pointer, dragX, dragY);
        }
    }

    protected handleDragEnd(pointer: Phaser.Input.Pointer): void {
        this.isDragging = false;
        
        // Reset visual properties
        this.setAlpha(1);
        this.clearTint();
        
        if (!this.isValidPlacement) {
            // Return to original position if placement is invalid
            this.x = this.originalX;
            this.y = this.originalY;
        }
        
        // Restore original depth
        this.setDepth(this.originalDepth);
        
        if (this.dragEvents.onDragEnd) {
            this.dragEvents.onDragEnd(this, pointer);
        }
    }

    public snapToGrid(gridSize: number): void {
        if (!this.isDragging) {
            this.x = Math.round(this.x / gridSize) * gridSize;
            this.y = Math.round(this.y / gridSize) * gridSize;
        }
    }

    public setDraggable(draggable: boolean): void {
        if (draggable) {
            this.scene.input.setDraggable(this);
        } else {
            this.scene.input.setDraggable(this, false);
        }
    }

    public canPlaceAt(x: number, y: number): boolean {
        // Override this method in child classes to implement placement rules
        // For now, just check if within scene bounds
        const bounds = this.scene.cameras.main.getBounds();
        const halfWidth = this.displayWidth / 2;
        const halfHeight = this.displayHeight / 2;
        
        return x - halfWidth >= bounds.x &&
               x + halfWidth <= bounds.x + bounds.width &&
               y - halfHeight >= bounds.y &&
               y + halfHeight <= bounds.y + bounds.height;
    }

    public rotate(degrees: number): void {
        this.rotation += Phaser.Math.DegToRad(degrees);
    }

    public rotateStep(clockwise: boolean = true): void {
        const step = clockwise ? this.rotationStep : -this.rotationStep;
        this.rotate(step);
    }

    public setRotationStep(degrees: number): void {
        // Clamp to minimum of 1 degree to prevent micro-rotations that could cause performance issues
        // or unintended behavior with very small rotation values
        this.rotationStep = Math.max(1, Math.abs(degrees));
    }

    public getRotationDegrees(): number {
        return Phaser.Math.RadToDeg(this.rotation);
    }

    public setRotationDegrees(degrees: number): void {
        this.rotation = Phaser.Math.DegToRad(degrees);
    }
}