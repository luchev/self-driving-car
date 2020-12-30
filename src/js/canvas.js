export class Canvas {
    constructor( canvasId, carImages, trackImages ) {
        this.id = canvasId;
        this.canvas = document.getElementById( canvasId );
        this.ctx = this.canvas.getContext( '2d' );
        this.carImages = carImages;
        this.trackImages = trackImages;
        carImages[0].width /= 4;
        carImages[0].height /= 4;
    }

    drawCar( car ) {
        this.ctx.save();
        let width = this.carImages[car.imageId].width;
        let height = this.carImages[car.imageId].height;
        // this.ctx.translate( car.x + width / 2, car.y + height / 2);
        this.ctx.rotate( car.rotation );
        // this.ctx.translate( - width / 2, - height / 2);
        this.ctx.drawImage( this.carImages[car.imageId], -width / 2, -height / 2, width, height);
        this.ctx.restore();
    }

    drawTrack(trackIndex) {
        this.ctx.save();
        this.canvas.width = this.trackImages[trackIndex].width;
        this.canvas.height = this.trackImages[trackIndex].height;
        this.ctx.drawImage( this.trackImages[trackIndex], 0, 0 );
        this.ctx.restore();
    }
}
