import * as Phaser from 'phaser';
import { GameObject, GameObjectState } from '../gameObjects/GameObject';
import { DraggableGameObject } from '../gameObjects/DraggableGameObject';

export interface ElementManagerConfig {
    scene: Phaser.Scene;
    gridSize?: number;
    snapToGrid?: boolean;
}

export class ElementManager {
    private scene: Phaser.Scene;
    private elements: Map<string, GameObject>;
    private selectedElement: GameObject | null = null;
    private gridSize: number;
    private snapToGrid: boolean;
    private elementGroup: Phaser.GameObjects.Group;

    constructor(config: ElementManagerConfig) {
        this.scene = config.scene;
        this.elements = new Map();
        this.gridSize = config.gridSize || 32;
        this.snapToGrid = config.snapToGrid || false;
        
        this.elementGroup = this.scene.add.group({
            runChildUpdate: true
        });
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Listen for element selection
        this.scene.input.on('gameobjectdown', this.handleElementClick, this);
        
        // Listen for background click to deselect
        this.scene.input.on('pointerdown', this.handleBackgroundClick, this);
    }

    private handleElementClick(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject instanceof GameObject) {
            this.selectElement(gameObject);
        }
    }

    private handleBackgroundClick(pointer: Phaser.Input.Pointer): void {
        // If clicking on empty space, deselect
        const hitObjects = this.scene.input.hitTestPointer(pointer);
        if (hitObjects.length === 0) {
            this.deselectElement();
        }
    }

    public addElement(element: GameObject): void {
        const id = element.getId();
        this.elements.set(id, element);
        this.elementGroup.add(element);
        
        // Apply snap to grid if enabled
        if (this.snapToGrid && element instanceof DraggableGameObject) {
            element.snapToGrid(this.gridSize);
        }
        
        // Set up drag events for DraggableGameObjects
        if (element instanceof DraggableGameObject) {
            const originalDragEnd = element['dragEvents'].onDragEnd;
            element['dragEvents'].onDragEnd = (gameObject, pointer) => {
                if (originalDragEnd) {
                    originalDragEnd(gameObject, pointer);
                }
                if (this.snapToGrid) {
                    gameObject.snapToGrid(this.gridSize);
                }
            };
        }
    }

    public removeElement(elementId: string): boolean {
        const element = this.elements.get(elementId);
        if (element) {
            if (this.selectedElement === element) {
                this.deselectElement();
            }
            this.elements.delete(elementId);
            this.elementGroup.remove(element);
            element.destroy();
            return true;
        }
        return false;
    }

    public selectElement(element: GameObject): void {
        if (this.selectedElement) {
            this.deselectElement();
        }
        
        this.selectedElement = element;
        
        // Visual feedback for selection
        element.setTint(0x88ff88);
        
        // Emit selection event
        this.scene.events.emit('elementSelected', element);
    }

    public deselectElement(): void {
        if (this.selectedElement) {
            this.selectedElement.clearTint();
            const previousSelection = this.selectedElement;
            this.selectedElement = null;
            
            // Emit deselection event
            this.scene.events.emit('elementDeselected', previousSelection);
        }
    }

    public getSelectedElement(): GameObject | null {
        return this.selectedElement;
    }

    public getElementById(id: string): GameObject | undefined {
        return this.elements.get(id);
    }

    public getAllElements(): GameObject[] {
        return Array.from(this.elements.values());
    }

    public setSnapToGrid(enabled: boolean): void {
        this.snapToGrid = enabled;
        
        // Apply to all existing draggable elements if enabling
        if (enabled) {
            this.elements.forEach(element => {
                if (element instanceof DraggableGameObject) {
                    element.snapToGrid(this.gridSize);
                }
            });
        }
    }

    public setGridSize(size: number): void {
        this.gridSize = size;
        
        // Re-snap all elements if snap to grid is enabled
        if (this.snapToGrid) {
            this.elements.forEach(element => {
                if (element instanceof DraggableGameObject) {
                    element.snapToGrid(this.gridSize);
                }
            });
        }
    }

    public getState(): GameObjectState[] {
        return this.getAllElements().map(element => element.getState());
    }

    public loadState(states: GameObjectState[]): void {
        // Clear existing elements
        this.clear();
        
        // Load elements from states
        // Note: This requires a factory to recreate elements from states
        // Will be implemented when we have concrete element types
    }

    public clear(): void {
        this.elements.forEach(element => {
            element.destroy();
        });
        this.elements.clear();
        this.selectedElement = null;
    }

    public update(time: number, delta: number): void {
        // Update is handled by the group's runChildUpdate
    }

    public destroy(): void {
        this.clear();
        this.elementGroup.destroy();
        this.scene.input.off('gameobjectdown', this.handleElementClick, this);
        this.scene.input.off('pointerdown', this.handleBackgroundClick, this);
    }
}