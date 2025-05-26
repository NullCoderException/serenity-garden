// Garden element types
export type ElementType = 'stone' | 'plant' | 'sand' | 'water';

// Position interface
export interface Position {
    x: number;
    y: number;
}

// Garden element interface
export interface GardenElement {
    id: string;
    type: ElementType;
    position: Position;
    rotation: number;
    scale: number;
}

// Garden state for saving/loading
export interface GardenState {
    elements: GardenElement[];
    lastModified: Date;
    version: string;
}