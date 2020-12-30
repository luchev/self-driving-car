export class Car {
    constructor( imageId = 0 ) {
        this.x = 0;
        this.y = 0;
        this.rotation = Math.PI / 2;
        this.maxSpeed = 1;
        this.imageId = imageId;
    }
}
