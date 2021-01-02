export class Canvas {
    constructor( canvasId, carImages, trackImages ) {
        this.id = canvasId;
        this.canvas = document.getElementById( canvasId );
        this.ctx = this.canvas.getContext( '2d' );
        this.carImages = carImages;
        for ( let car of this.carImages ) {
            car.width /= 4;
            car.height /= 4;
        }
        this.trackImages = trackImages;
    }

    clear() {
        this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    }

    drawCar( car ) {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
        let width = this.carImages[car.imageId].width;
        let height = this.carImages[car.imageId].height;
        this.ctx.translate( car.x, car.y );
        this.ctx.rotate( car.rotation + Math.PI / 2 );
        this.ctx.drawImage( this.carImages[car.imageId], - width / 2, - height / 2, width, height );
    }

    drawTrack( trackIndex ) {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
        this.canvas.width = this.trackImages[trackIndex].width;
        this.canvas.height = this.trackImages[trackIndex].height;
        this.ctx.drawImage( this.trackImages[trackIndex], 0, 0 );
    }
}
