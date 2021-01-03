import {Car} from './car';
import {Line, Point} from './geometry';

export class Game {
    constructor( canvas ) {
        this.lastRender = 0;
        this.cars = [new Car()];
        this.canvas = canvas;
    }

    run() {
        window.requestAnimationFrame( this.loop.bind( this ) );
    }

    update( progress ) {
        for ( let car of this.cars ) {
            car.tick( progress );
        }
    }

    draw() {
        this.canvas.clear();
        this.canvas.drawTrack( 0 );
        for ( let car of this.cars ) {
            let sensors = car.getSensors();
            for (let sensor of sensors) {
                this.canvas.drawLine(sensor);
            }
            this.canvas.drawCar( car );
        }
    }

    loop( timestamp ) {
        let progress = timestamp - this.lastRender;

        this.update( progress );
        this.draw();

        this.lastRender = timestamp;
        window.requestAnimationFrame( this.loop.bind( this ) );
    }
}
