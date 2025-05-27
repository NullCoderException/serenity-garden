import { DraggableGameObject } from '../DraggableGameObject';
import { GameObjectConfig } from '../GameObject';

export enum StoneType {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
    Flat = 'flat'
}

export interface StoneConfig extends GameObjectConfig {
    stoneType?: StoneType;
}

export class Stone extends DraggableGameObject {
    private stoneType: StoneType;

    constructor(config: StoneConfig) {
        super({
            ...config,
            texture: config.texture || 'stone',
            frame: config.frame || 0
        });
        
        this.stoneType = config.stoneType || StoneType.Medium;
        this.elementType = `Stone_${this.stoneType}`;
        
        // Set scale based on stone type
        this.setScaleForType();
    }

    private setScaleForType(): void {
        switch (this.stoneType) {
            case StoneType.Small:
                this.setScale(0.5);
                break;
            case StoneType.Medium:
                this.setScale(0.75);
                break;
            case StoneType.Large:
                this.setScale(1.0);
                break;
            case StoneType.Flat:
                this.setScale(0.8, 0.4);
                break;
        }
    }

    public canPlaceAt(x: number, y: number): boolean {
        // First check basic bounds
        if (!super.canPlaceAt(x, y)) {
            return false;
        }
        
        // Check for overlaps with other stones
        const manager = this.scene.data.get('elementManager');
        if (manager) {
            const elements = manager.getAllElements();
            for (const element of elements) {
                if (element !== this && element instanceof Stone) {
                    const distance = Phaser.Math.Distance.Between(x, y, element.x, element.y);
                    const minDistance = (this.displayWidth + element.displayWidth) / 2;
                    if (distance < minDistance) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    public getStoneType(): StoneType {
        return this.stoneType;
    }

    public setStoneType(type: StoneType): void {
        this.stoneType = type;
        this.elementType = `Stone_${this.stoneType}`;
        this.setScaleForType();
    }
}