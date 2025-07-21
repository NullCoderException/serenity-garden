import Phaser from 'phaser';
import { ElementManager } from '../managers/ElementManager';
import { Stone, StoneType } from '../gameObjects/elements/Stone';
import { Plant, PlantType } from '../gameObjects/elements/Plant';
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
    private helpPanel!: Phaser.GameObjects.Container;
    private isHelpVisible: boolean = false;

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
            this.createPlantTextures();
            this.createRectangle('sand-base', 100, 100, 0xF5DEB3);
        });
        
        this.createRectangle('stone', 50, 50, 0x808080);
        this.createPlantTextures();
        this.createRectangle('sand-base', 100, 100, 0xF5DEB3);
    }

    private createPlantTextures(): void {
        // Create different colored rectangles for different plant types
        this.createRectangle('plant_small_shrub', 35, 50, 0x228B22);     // Forest green
        this.createRectangle('plant_tree', 60, 100, 0x006400);           // Dark green
        this.createRectangle('plant_flower', 25, 40, 0xFF69B4);          // Hot pink
        this.createRectangle('plant_grass', 20, 30, 0x90EE90);           // Light green
        this.createRectangle('plant_bamboo', 30, 80, 0x32CD32);          // Lime green
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
        const { width, height } = this.cameras.main;
        
        // Clean, minimal HUD - responsive positioning
        this.add.text(20, 20, 'Serenity Garden', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(1000);
        
        // Mode indicator
        this.modeText = this.add.text(20, 50, this.getModeText(), {
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 1
        }).setScrollFactor(0).setDepth(1000);
        
        // Help reminder
        this.add.text(20, 75, 'Press H for help', {
            fontSize: '14px',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 1
        }).setScrollFactor(0).setDepth(1000);
        
        this.createHelpPanel();
        this.setupKeyboardControls();
    }

    private createHelpPanel(): void {
        const { width, height } = this.cameras.main;
        
        // Help panel constants
        const HELP_PANEL_COLOR = 0x000000;
        const HELP_PANEL_OPACITY = 0.8;
        
        this.helpPanel = this.add.container(0, 0);
        this.helpPanel.setScrollFactor(0);
        this.helpPanel.setDepth(2000);
        
        // Semi-transparent background - responsive size
        const backgroundGraphics = this.add.graphics();
        backgroundGraphics.fillStyle(HELP_PANEL_COLOR, HELP_PANEL_OPACITY);
        backgroundGraphics.fillRect(0, 0, width, height);
        this.helpPanel.add(backgroundGraphics);
        
        // Help content - centered responsively
        const helpText = this.add.text(width / 2, height / 2, [
            'SERENITY GARDEN - CONTROLS',
            '',
            'PLACEMENT MODE:',
            '• Left Click: Select/Place garden elements',
            '• Drag: Move selected elements around',
            '• R: Rotate selected element (Shift+R: Counter-clockwise)',
            '• Delete: Remove selected element',
            '',
            'RAKE MODE:',
            '• Left Click + Drag: Draw patterns in sand',
            '• 1-4: Switch between rake types (Simple, Wide, Curved, Fine)',
            '',
            'CAMERA:',
            '• Right Click + Drag: Pan camera view',
            '• Mouse Wheel: Zoom in/out',
            '',
            'OTHER:',
            '• T: Toggle between Placement and Rake modes',
            '• G: Toggle grid overlay',
            '• H: Toggle this help panel',
            '',
            'Press H again to close this help'
        ], {
            fontSize: '16px',
            color: '#ffffff',
            align: 'left',
            lineSpacing: 4
        }).setOrigin(0.5);
        
        this.helpPanel.add(helpText);
        this.helpPanel.setVisible(false);
    }

    private setupKeyboardControls(): void {
        this.input.keyboard?.on('keydown-G', () => {
            this.showGrid = !this.showGrid;
            this.drawGrid();
        });
        
        this.input.keyboard?.on('keydown-H', () => {
            this.toggleHelp();
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

    private toggleHelp(): void {
        this.isHelpVisible = !this.isHelpVisible;
        this.helpPanel.setVisible(this.isHelpVisible);
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
        
        // Create plants for placement
        const plantTypes = [PlantType.SmallShrub, PlantType.Tree, PlantType.Flower, PlantType.Grass, PlantType.Bamboo];
        x = 800; // Start plants after stones
        
        plantTypes.forEach((type, index) => {
            const textureKey = `plant_${type}`;
            const plant = new Plant({
                scene: this,
                x: x + (index * 100),
                y: 700,
                texture: textureKey,
                plantType: type
            });
            
            this.elementManager.addElement(plant);
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
        
        // Place a few plants in the garden as examples
        const gardenPlant1 = new Plant({
            scene: this,
            x: 400,
            y: 350,
            texture: 'plant_tree',
            plantType: PlantType.Tree
        });
        this.elementManager.addElement(gardenPlant1);
        
        const gardenPlant2 = new Plant({
            scene: this,
            x: 800,
            y: 320,
            texture: 'plant_small_shrub',
            plantType: PlantType.SmallShrub
        });
        this.elementManager.addElement(gardenPlant2);
        
        // Simple bottom hint - responsive positioning
        const { width, height } = this.cameras.main;
        this.add.text(width / 2, height - 40, 'Drag elements from palette below • Press T to switch modes', {
            fontSize: '14px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    }
    
    public update(time: number, delta: number): void {
        this.elementManager.update(time, delta);
    }
}