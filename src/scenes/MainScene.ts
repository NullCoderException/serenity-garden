import Phaser from 'phaser';
import { ElementManager } from '../managers/ElementManager';
import { Stone, StoneType } from '../gameObjects/elements/Stone';

export default class MainScene extends Phaser.Scene {
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private cameraStartX: number = 0;
    private cameraStartY: number = 0;
    private elementManager!: ElementManager;
    private gridGraphics!: Phaser.GameObjects.Graphics;
    private showGrid: boolean = true;

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
        
        this.createGrid();
        this.createGardenBase();
        this.setupCameraControls();
        this.createUI();
        this.createDemoElements();
    }

    private createPlaceholderAssets(): void {
        this.load.on('loaderror', () => {
            this.createRectangle('stone', 50, 50, 0x808080);
            this.createRectangle('plant', 40, 60, 0x228B22);
            this.createRectangle('sand', 100, 100, 0xF5DEB3);
        });
        
        this.createRectangle('stone', 50, 50, 0x808080);
        this.createRectangle('plant', 40, 60, 0x228B22);
        this.createRectangle('sand', 100, 100, 0xF5DEB3);
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
        const gardenBounds = new Phaser.Geom.Rectangle(100, 100, 1080, 520);
        const graphics = this.add.graphics();
        
        graphics.lineStyle(4, 0x654321);
        graphics.fillStyle(0xF5DEB3, 0.3);
        graphics.fillRect(gardenBounds.x, gardenBounds.y, gardenBounds.width, gardenBounds.height);
        graphics.strokeRect(gardenBounds.x, gardenBounds.y, gardenBounds.width, gardenBounds.height);
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
            'Left Click: Select/Place elements',
            'Right Click + Drag: Pan camera',
            'Mouse Wheel: Zoom',
            'G: Toggle grid',
            'Delete: Remove selected element'
        ], {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0).setDepth(1000);
        
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
    }
    
    private createDemoElements(): void {
        const stoneTypes = [StoneType.Small, StoneType.Medium, StoneType.Large, StoneType.Flat];
        let x = 200;
        
        stoneTypes.forEach((type, index) => {
            const stone = new Stone({
                scene: this,
                x: x + (index * 100),
                y: 600,
                texture: 'stone',
                stoneType: type
            });
            
            this.elementManager.addElement(stone);
        });
        
        this.add.text(640, 550, 'Drag stones to place them in the garden', {
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