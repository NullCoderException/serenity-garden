import Phaser from 'phaser';
import { ElementManager } from '../managers/ElementManager';
import { Stone, StoneType } from '../gameObjects/elements/Stone';
import { DraggableGameObject } from '../gameObjects/DraggableGameObject';
import { RakeType } from '../systems/RakeSystem';
import { GardenSandLayer } from '../systems/GardenSandLayer';

export enum InteractionMode {
    Placement = 'placement',
    Rake = 'rake'
}

export default class MainScene extends Phaser.Scene {
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private cameraStartX: number = 0;
    private cameraStartY: number = 0;
    private elementManager!: ElementManager;
    private gridGraphics!: Phaser.GameObjects.Graphics;
    private showGrid: boolean = true;
    private currentMode: InteractionMode = InteractionMode.Placement;
    private currentRakeType: RakeType = RakeType.Simple;
    private modeText!: Phaser.GameObjects.Text;
    private gardenSandLayer!: GardenSandLayer;
    private gardenBounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(100, 100, 1080, 520);

    constructor() {
        super({ key: 'MainScene' });
    }

    public preload(): void {
        this.createPlaceholderAssets();
    }

    public create(): void {
        this.cameras.main.setBounds(-1000, -1000, 3280, 2720);
        this.cameras.main.setZoom(1);
        
        this.elementManager = new ElementManager({
            scene: this,
            gridSize: 32,
            snapToGrid: true
        });
        
        this.data.set('elementManager', this.elementManager);
        
        this.createGardenBase();
        this.createGrid();
        this.setupCameraControls();
        this.createUI();
        this.createDemoElements();
    }

    private createPlaceholderAssets(): void {
        this.load.on('loaderror', () => {
            this.createRectangle('stone', 50, 50, 0x808080);
            this.createRectangle('plant', 40, 60, 0x228B22);
            this.createRectangle('sand-base', 100, 100, 0xF5DEB3);
        });
        
        this.createRectangle('stone', 50, 50, 0x808080);
        this.createRectangle('plant', 40, 60, 0x228B22);
        this.createRectangle('sand-base', 100, 100, 0xF5DEB3);
    }

    private createRectangle(key: string, width: number, height: number, color: number): void {
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    private createGrid(): void {
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.setDepth(-10);
        this.drawGrid();
    }
    
    private drawGrid(): void {
        if (!this.showGrid) {
            this.gridGraphics.clear();
            return;
        }
        
        const gridSize = 32;
        const bounds = this.cameras.main.getBounds();
        
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x888888, 0.3);
        
        for (let x = bounds.x; x < bounds.x + bounds.width; x += gridSize) {
            this.gridGraphics.moveTo(x, bounds.y);
            this.gridGraphics.lineTo(x, bounds.y + bounds.height);
        }
        
        for (let y = bounds.y; y < bounds.y + bounds.height; y += gridSize) {
            this.gridGraphics.moveTo(bounds.x, y);
            this.gridGraphics.lineTo(bounds.x + bounds.width, y);
        }
        
        this.gridGraphics.strokePath();
    }
    
    private createGardenBase(): void {
        // Create the garden sand layer as the base
        this.gardenSandLayer = new GardenSandLayer(this, this.gardenBounds);
    }

    private setupCameraControls(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown() || pointer.middleButtonDown()) {
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
                this.cameraStartX = this.cameras.main.scrollX;
                this.cameraStartY = this.cameras.main.scrollY;
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const dragX = this.dragStartX - pointer.x;
                const dragY = this.dragStartY - pointer.y;
                
                this.cameras.main.setScroll(
                    this.cameraStartX + dragX,
                    this.cameraStartY + dragY
                );
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
            const zoom = this.cameras.main.zoom;
            const newZoom = Phaser.Math.Clamp(zoom - (deltaY * 0.001), 0.5, 2);
            this.cameras.main.setZoom(newZoom);
        });
    }

    private createUI(): void {
        this.add.text(640, 50, 'Serenity Garden', {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        this.add.text(10, 10, [
            'Controls:',
            'Left Click: Select/Place stones (Placement mode) or Draw in sand (Rake mode)',
            'Right Click + Drag: Pan camera',
            'Mouse Wheel: Zoom',
            'G: Toggle grid',
            'R: Rotate selected element (Shift+R: Counter-clockwise)',
            'Delete: Remove selected element',
            'T: Toggle tool mode (Placement/Rake)',
            '1-4: Switch rake types (in Rake mode)'
        ], {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0).setDepth(1000);
        
        // Mode indicator
        this.modeText = this.add.text(640, 100, this.getModeText(), {
            fontSize: '18px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        this.setupKeyboardControls();
    }

    private setupKeyboardControls(): void {
        this.input.keyboard?.on('keydown-G', () => {
            this.showGrid = !this.showGrid;
            this.drawGrid();
        });
        
        this.input.keyboard?.on('keydown-DELETE', () => {
            const selected = this.elementManager.getSelectedElement();
            if (selected) {
                this.elementManager.removeElement(selected.getId());
            }
        });
        
        this.input.keyboard?.on('keydown-R', (event: KeyboardEvent) => {
            const selected = this.elementManager.getSelectedElement();
            if (selected && selected instanceof DraggableGameObject) {
                const clockwise = !event.shiftKey;
                selected.rotateStep(clockwise);
                this.elementManager.updateSelectedElementIndicator();
            }
        });
        
        // Tool mode switching
        this.input.keyboard?.on('keydown-T', () => {
            this.toggleMode();
        });
        
        // Rake type switching (only in rake mode)
        this.input.keyboard?.on('keydown-ONE', () => {
            if (this.currentMode === InteractionMode.Rake) {
                this.setRakeType(RakeType.Simple);
            }
        });
        
        this.input.keyboard?.on('keydown-TWO', () => {
            if (this.currentMode === InteractionMode.Rake) {
                this.setRakeType(RakeType.Wide);
            }
        });
        
        this.input.keyboard?.on('keydown-THREE', () => {
            if (this.currentMode === InteractionMode.Rake) {
                this.setRakeType(RakeType.Curved);
            }
        });
        
        this.input.keyboard?.on('keydown-FOUR', () => {
            if (this.currentMode === InteractionMode.Rake) {
                this.setRakeType(RakeType.Fine);
            }
        });
    }

    private toggleMode(): void {
        this.currentMode = this.currentMode === InteractionMode.Placement 
            ? InteractionMode.Rake 
            : InteractionMode.Placement;
        
        this.updateModeUI();
        this.updateSandAreasMode();
    }

    private setRakeType(rakeType: RakeType): void {
        this.currentRakeType = rakeType;
        this.updateModeUI();
        this.updateSandAreasRakeType();
    }

    private updateModeUI(): void {
        this.modeText.setText(this.getModeText());
    }

    private getModeText(): string {
        if (this.currentMode === InteractionMode.Placement) {
            return 'Mode: PLACEMENT - Click to place/select stones';
        } else {
            const rakeNames = {
                [RakeType.Simple]: 'Simple',
                [RakeType.Wide]: 'Wide',
                [RakeType.Curved]: 'Curved',
                [RakeType.Fine]: 'Fine'
            };
            return `Mode: RAKE (${rakeNames[this.currentRakeType]}) - Draw patterns in the sand garden`;
        }
    }

    private updateSandAreasMode(): void {
        if (this.currentMode === InteractionMode.Rake) {
            this.gardenSandLayer.enableRakeMode();
        } else {
            this.gardenSandLayer.disableRakeMode();
        }
    }

    private updateSandAreasRakeType(): void {
        this.gardenSandLayer.setRakeType(this.currentRakeType);
    }
    
    private createDemoElements(): void {
        // Create stones for placement
        const stoneTypes = [StoneType.Small, StoneType.Medium, StoneType.Large, StoneType.Flat];
        let x = 200;
        
        stoneTypes.forEach((type, index) => {
            const stone = new Stone({
                scene: this,
                x: x + (index * 120),
                y: 700,
                texture: 'stone',
                stoneType: type
            });
            
            this.elementManager.addElement(stone);
        });
        
        // Place a few stones in the garden as examples
        const gardenStone1 = new Stone({
            scene: this,
            x: 300,
            y: 200,
            texture: 'stone',
            stoneType: StoneType.Large
        });
        this.elementManager.addElement(gardenStone1);
        
        const gardenStone2 = new Stone({
            scene: this,
            x: 600,
            y: 300,
            texture: 'stone',
            stoneType: StoneType.Medium
        });
        this.elementManager.addElement(gardenStone2);
        
        const gardenStone3 = new Stone({
            scene: this,
            x: 900,
            y: 250,
            texture: 'stone',
            stoneType: StoneType.Small
        });
        this.elementManager.addElement(gardenStone3);
        
        this.add.text(640, 650, 'Zen Garden - Drag stones from below into the sand garden. Press T to switch to Rake mode!', {
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }
    
    public update(time: number, delta: number): void {
        this.elementManager.update(time, delta);
    }
}