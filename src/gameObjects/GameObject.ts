import * as Phaser from 'phaser';

export interface GameObjectConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    texture: string;
    frame?: string | number;
    scale?: number;
    rotation?: number;
    depth?: number;
    interactive?: boolean;
}

export interface GameObjectState {
    id: string;
    type: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    depth: number;
    customData?: any;
}

export abstract class GameObject extends Phaser.GameObjects.Sprite {
    protected id: string;
    protected elementType: string;
    protected isDragging: boolean = false;
    protected dragStartX: number = 0;
    protected dragStartY: number = 0;
    protected customData: any = {};

    constructor(config: GameObjectConfig) {
        super(config.scene, config.x, config.y, config.texture, config.frame);
        
        this.id = this.generateId();
        this.elementType = this.constructor.name;
        
        if (config.scale !== undefined) {
            this.setScale(config.scale);
        }
        
        if (config.rotation !== undefined) {
            this.setRotation(config.rotation);
        }
        
        if (config.depth !== undefined) {
            this.setDepth(config.depth);
        }
        
        if (config.interactive) {
            this.setInteractive();
            this.setupInteractivity();
        }
        
        config.scene.add.existing(this);
    }

    protected generateId(): string {
        return `${this.elementType}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    protected setupInteractivity(): void {
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
    }

    protected onPointerOver(): void {
        this.scene.game.canvas.style.cursor = 'pointer';
    }

    protected onPointerOut(): void {
        this.scene.game.canvas.style.cursor = 'default';
    }

    protected onPointerDown(): void {
        // Override in child classes
    }

    public getId(): string {
        return this.id;
    }

    public getType(): string {
        return this.elementType;
    }

    public getState(): GameObjectState {
        return {
            id: this.id,
            type: this.elementType,
            x: this.x,
            y: this.y,
            scale: this.scale,
            rotation: this.rotation,
            depth: this.depth,
            customData: this.customData
        };
    }

    public loadState(state: GameObjectState): void {
        this.x = state.x;
        this.y = state.y;
        this.setScale(state.scale);
        this.setRotation(state.rotation);
        this.setDepth(state.depth);
        if (state.customData) {
            this.customData = state.customData;
        }
    }

    public abstract canPlaceAt(x: number, y: number): boolean;
    
    public update(time: number, delta: number): void {
        // Override in child classes for custom update logic
    }
}