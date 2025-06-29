import { DraggableGameObject } from '../DraggableGameObject';
import { GameObjectConfig } from '../GameObject';

export enum PlantType {
    SmallShrub = 'small_shrub',
    Tree = 'tree',
    Flower = 'flower',
    Grass = 'grass',
    Bamboo = 'bamboo'
}

export interface PlantConfig extends GameObjectConfig {
    plantType?: PlantType;
}

export class Plant extends DraggableGameObject {
    private plantType: PlantType;
    private baseScale: number;
    private windPhase: number;
    private growthPhase: number;
    private windIntensity: number;
    private baseRotation: number = 0;

    constructor(config: PlantConfig) {
        super({
            ...config,
            texture: config.texture || 'plant',
            frame: config.frame || 0
        });
        
        this.plantType = config.plantType || PlantType.SmallShrub;
        this.elementType = `Plant_${this.plantType}`;
        
        // Initialize animation properties
        this.windPhase = Math.random() * Math.PI * 2; // Random starting phase
        this.growthPhase = 0;
        this.windIntensity = this.getWindIntensityForType();
        
        // Set scale and properties based on plant type
        this.setPropertiesForType();
        this.baseScale = this.scaleX;
    }

    private setPropertiesForType(): void {
        switch (this.plantType) {
            case PlantType.SmallShrub:
                this.setScale(0.6);
                this.setOrigin(0.5, 0.85); // Base at bottom
                break;
            case PlantType.Tree:
                this.setScale(1.2);
                this.setOrigin(0.5, 0.9); // Base at bottom
                break;
            case PlantType.Flower:
                this.setScale(0.4);
                this.setOrigin(0.5, 0.8); // Stem base
                break;
            case PlantType.Grass:
                this.setScale(0.3);
                this.setOrigin(0.5, 0.95); // Ground level
                break;
            case PlantType.Bamboo:
                this.setScale(0.8);
                this.setOrigin(0.5, 0.9); // Base at bottom
                break;
        }
    }

    private getWindIntensityForType(): number {
        switch (this.plantType) {
            case PlantType.SmallShrub:
                return 0.8;
            case PlantType.Tree:
                return 0.3; // Trees sway less
            case PlantType.Flower:
                return 1.2; // Flowers are more delicate
            case PlantType.Grass:
                return 1.5; // Grass moves most
            case PlantType.Bamboo:
                return 0.6;
            default:
                return 1.0;
        }
    }

    public update(time: number, delta: number): void {
        super.update(time, delta);
        
        // Subtle wind animation
        this.windPhase += delta * 0.001; // Slow movement
        const windOffset = Math.sin(this.windPhase) * 0.02 * this.windIntensity;
        
        // Apply wind rotation on top of base rotation (very subtle)
        this.rotation = this.baseRotation + windOffset;
        
        // Subtle growth/breathing effect
        this.growthPhase += delta * 0.0008;
        const growthScale = 1 + Math.sin(this.growthPhase) * 0.01;
        this.setScale(this.baseScale * growthScale);
    }

    public canPlaceAt(x: number, y: number): boolean {
        // First check basic bounds
        if (!super.canPlaceAt(x, y)) {
            return false;
        }
        
        // Check for overlaps with other plants and stones
        const manager = this.scene.data.get('elementManager');
        if (manager) {
            const elements = manager.getAllElements();
            for (const element of elements) {
                if (element !== this) {
                    const distance = Phaser.Math.Distance.Between(x, y, element.x, element.y);
                    let minDistance: number;
                    
                    // Different spacing rules based on plant type
                    if (this.plantType === PlantType.Tree) {
                        minDistance = Math.max(this.displayWidth, element.displayWidth) * 0.8;
                    } else if (this.plantType === PlantType.Grass) {
                        minDistance = Math.max(this.displayWidth, element.displayWidth) * 0.3;
                    } else {
                        minDistance = (this.displayWidth + element.displayWidth) / 2.5;
                    }
                    
                    if (distance < minDistance) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    public getPlantType(): PlantType {
        return this.plantType;
    }

    public setPlantType(type: PlantType): void {
        this.plantType = type;
        this.elementType = `Plant_${this.plantType}`;
        this.windIntensity = this.getWindIntensityForType();
        this.setPropertiesForType();
        this.baseScale = this.scaleX;
    }

    public setWindIntensity(intensity: number): void {
        this.windIntensity = intensity;
    }

    // Override rotation methods to work with base rotation
    public rotate(degrees: number): void {
        this.baseRotation = degrees;
    }

    public rotateStep(clockwise: boolean = true): void {
        const step = this.rotationStep || (Math.PI / 8); // 22.5 degrees default
        this.baseRotation += clockwise ? step : -step;
    }

    // Override to include plant-specific state
    public getState(): any {
        const baseState = super.getState();
        return {
            ...baseState,
            plantType: this.plantType,
            windPhase: this.windPhase,
            growthPhase: this.growthPhase,
            baseRotation: this.baseRotation
        };
    }

    public loadState(state: any): void {
        super.loadState(state);
        if (state.plantType) {
            this.setPlantType(state.plantType);
        }
        if (state.windPhase !== undefined) {
            this.windPhase = state.windPhase;
        }
        if (state.growthPhase !== undefined) {
            this.growthPhase = state.growthPhase;
        }
        if (state.baseRotation !== undefined) {
            this.baseRotation = state.baseRotation;
        }
    }
}