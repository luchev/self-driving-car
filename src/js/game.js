import {Car} from './car';

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
            car.turn();
            car.move( progress );
        }
    }

    draw() {
        this.canvas.clear();
        this.canvas.drawTrack( 0 );
        for ( let car of this.cars ) {
            this.canvas.drawCar( car );
            console.log(car.x, car.y);
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
