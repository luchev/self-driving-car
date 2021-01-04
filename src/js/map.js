import {Point} from './geometry';
export class Map {
    constructor( width, height, walls, startPoint, startRotation ) {
        this.width = width;
        this.height = height;
        this.walls = walls;
        this.startPoint = startPoint;
        this.startRotation = startRotation;
    }
}
