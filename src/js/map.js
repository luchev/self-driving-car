export class Map {
    constructor( width, height, startPoint, startRotation, walls, rewards ) {
        this.width = width;
        this.height = height;
        this.startPoint = startPoint;
        this.startRotation = startRotation;
        this.walls = walls;
        this.rewards = rewards;
    }
}
