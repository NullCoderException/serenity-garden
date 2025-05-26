import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private cameraStartX: number = 0;
    private cameraStartY: number = 0;

    constructor() {
        super({ key: 'MainScene' });
    }

    public preload(): void {
        this.createPlaceholderAssets();
    }

    public create(): void {
        this.cameras.main.setBounds(-1000, -1000, 3280, 2720);
        this.cameras.main.setZoom(1);
        
        this.createGardenBase();
        this.setupCameraControls();
        
        this.add.text(640, 50, 'Serenity Garden', {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
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

    private createGardenBase(): void {
        const gardenBounds = new Phaser.Geom.Rectangle(100, 100, 1080, 520);
        const graphics = this.add.graphics();
        
        graphics.lineStyle(4, 0x654321);
        graphics.fillStyle(0xF5DEB3, 0.3);
        graphics.fillRect(gardenBounds.x, gardenBounds.y, gardenBounds.width, gardenBounds.height);
        graphics.strokeRect(gardenBounds.x, gardenBounds.y, gardenBounds.width, gardenBounds.height);
        
        this.add.image(300, 300, 'stone').setInteractive();
        this.add.image(500, 400, 'plant').setInteractive();
        this.add.image(700, 350, 'stone').setInteractive();
        this.add.image(900, 450, 'plant').setInteractive();
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

    public update(): void {
        // Game loop logic will go here
    }
}