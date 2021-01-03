import {Line, Ray} from './geometry';

export class Canvas {
    constructor( canvasId, carImages, map ) {
        this.id = canvasId;
        this.canvas = document.getElementById( canvasId );
        this.ctx = this.canvas.getContext( '2d' );
        this.carImages = carImages;
        for ( let car of this.carImages ) {
            car.width /= 2;
            car.height /= 2;
        }
        
        this.map = map;
        this.canvas.width = this.map.width;
        this.canvas.height = this.map.height;
    }

    clear() {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
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

    drawMap() {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
        for (let wall of this.map.walls) {
            this.drawLine(wall);
        }
    }

    drawLine( line ) {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
        this.ctx.beginPath();
        this.ctx.moveTo( line.x1, line.y1 );
        this.ctx.lineTo( line.x2, line.y2 );
        this.ctx.strokeStyle = line.color;
        this.ctx.stroke();
    }

    drawPoint( point ) {
        this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
        this.ctx.fillStyle = point.color;
        this.ctx.fillRect( point.x - 3, point.y - 3, 6, 6 );
    }

    drawRay( x, y, rotation, maxLength=300, color='#000000' ) {
        let endPoint = Ray.getPointFromOrigin(x, y, rotation, maxLength);
        this.drawLine(new Line(x, y, endPoint.x, endPoint.y, color));
    }
}
