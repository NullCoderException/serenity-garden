export enum RakeType {
    Simple = 'simple',
    Wide = 'wide',
    Curved = 'curved',
    Fine = 'fine'
}

export interface RakePattern {
    name: string;
    width: number;
    spacing: number;
    intensity: number;
    shape: 'straight' | 'curved' | 'wavy';
}

export class RakeSystem {
    private static rakePatterns: Map<RakeType, RakePattern> = new Map([
        [RakeType.Simple, {
            name: 'Simple Rake',
            width: 3,
            spacing: 4,
            intensity: 1.0,
            shape: 'straight'
        }],
        [RakeType.Wide, {
            name: 'Wide Rake',
            width: 6,
            spacing: 2,
            intensity: 0.8,
            shape: 'straight'
        }],
        [RakeType.Curved, {
            name: 'Curved Rake',
            width: 4,
            spacing: 3,
            intensity: 1.2,
            shape: 'curved'
        }],
        [RakeType.Fine, {
            name: 'Fine Rake',
            width: 1,
            spacing: 1,
            intensity: 0.6,
            shape: 'straight'
        }]
    ]);

    public static getRakePattern(type: RakeType): RakePattern {
        return this.rakePatterns.get(type) || this.rakePatterns.get(RakeType.Simple)!;
    }

    public static getAllRakeTypes(): RakeType[] {
        return Array.from(this.rakePatterns.keys());
    }

    public static createRakeStroke(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        rakeType: RakeType
    ): RakeStroke {
        const pattern = this.getRakePattern(rakeType);
        return new RakeStroke(startX, startY, endX, endY, pattern);
    }
}

export class RakeStroke {
    public points: Array<{ x: number; y: number; intensity: number }> = [];
    
    constructor(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        pattern: RakePattern
    ) {
        this.generateStrokePoints(startX, startY, endX, endY, pattern);
    }

    private generateStrokePoints(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        pattern: RakePattern
    ): void {
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const steps = Math.floor(distance / 2); // Point every 2 pixels
        
        if (steps <= 0) {
            this.points.push({ x: startX, y: startY, intensity: pattern.intensity });
            return;
        }

        const deltaX = (endX - startX) / steps;
        const deltaY = (endY - startY) / steps;
        
        // Calculate perpendicular direction for rake width
        const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const perpX = -deltaY / length;
        const perpY = deltaX / length;

        for (let i = 0; i <= steps; i++) {
            const baseX = startX + deltaX * i;
            const baseY = startY + deltaY * i;
            
            // Create multiple points across rake width
            const halfWidth = pattern.width / 2;
            for (let w = -halfWidth; w <= halfWidth; w += pattern.spacing) {
                let pointX = baseX + perpX * w;
                let pointY = baseY + perpY * w;
                
                // Apply shape modifications
                if (pattern.shape === 'curved') {
                    const curve = Math.sin((i / steps) * Math.PI) * 2;
                    pointX += perpX * curve;
                    pointY += perpY * curve;
                } else if (pattern.shape === 'wavy') {
                    const wave = Math.sin((i / steps) * Math.PI * 4) * 1;
                    pointX += perpX * wave;
                    pointY += perpY * wave;
                }
                
                // Vary intensity slightly for natural look
                const intensityVariation = 0.8 + Math.random() * 0.4;
                const intensity = pattern.intensity * intensityVariation;
                
                this.points.push({ x: pointX, y: pointY, intensity });
            }
        }
    }

    public getAffectedGridCells(gridSize: number, offsetX: number, offsetY: number): Array<{
        gridX: number;
        gridY: number;
        intensity: number;
    }> {
        const cells: Array<{ gridX: number; gridY: number; intensity: number }> = [];
        
        for (const point of this.points) {
            const gridX = Math.floor((point.x - offsetX) / gridSize);
            const gridY = Math.floor((point.y - offsetY) / gridSize);
            
            cells.push({
                gridX,
                gridY,
                intensity: point.intensity
            });
        }
        
        return cells;
    }
}