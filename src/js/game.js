import {Car} from './car';
import {Line, Point} from './geometry';
import {Map} from './map';

export class Game {
    constructor( canvas, map ) {
        this.lastRender = 0;
        this.canvas = canvas;
        this.map = map;
        this.cars = [new Car()];
        for ( let car of this.cars ) {
            car.x = this.map.startPoint.x;
            car.y = this.map.startPoint.y;
            car.rotation = this.map.startRotation;
        }
    }

    run() {
        window.requestAnimationFrame( this.loop.bind( this ) );
    }

    update( progress ) {
        for ( let car of this.cars ) {
            car.tick( progress );
            car.updateSensors(this.map.walls);
        }
    }

    draw() {
        this.canvas.clear();
        this.canvas.drawMap();
        for ( let car of this.cars ) {
            let sensors = car.getSensors();
            for (let sensor of sensors) {
                this.canvas.drawSegment(sensor);
            }

            this.canvas.drawCar( car );

            for ( let intersection of car.sensorIntersections) {
                this.canvas.drawPoint(intersection);
            }
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
