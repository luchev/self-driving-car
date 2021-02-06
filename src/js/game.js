import {Instruction} from './instruction';

export class Game {
    constructor( canvas, map ) {
        this.lastRender = 0;
        this.canvas = canvas;
        this.map = map;
        this.cars = [];

        this.pressedKeys = new Set();
        document.body.addEventListener( "keydown", ( e ) => {
            this.pressedKeys.add( e.key.toLowerCase() );
        } );

        document.body.addEventListener( "keyup", ( e ) => {
            this.pressedKeys.delete( e.key.toLowerCase() );
        } );
    }

    run() {
        window.requestAnimationFrame( this.loop.bind( this ) );
    }

    update( progress ) {
        let instructions = Instruction.buildFromDictionary( this.pressedKeys );
        for ( let car of this.cars ) {
            car.update( instructions );
        }
    }

    reset() {
        this.canvas.clear();
        this.canvas.drawMap();
    }

    draw() {
        this.canvas.clear();
        this.canvas.drawMap();
    }

    drawCar( car, showRewardsCheckbox, showSensorsCheckbox ) {
        if ( showSensorsCheckbox ) {
            let sensors = car.getSensors();
            for ( let sensor of sensors ) {
                this.canvas.drawSegment( sensor );
            }
            for ( let intersection of car.sensorIntersections ) {
                this.canvas.drawPoint( intersection );
            }
        }
        
        this.canvas.drawCar( car, showRewardsCheckbox );
    }

    loop( timestamp ) {
        let progress = timestamp - this.lastRender;

        this.update( progress );
        this.draw();

        this.lastRender = timestamp;
        window.requestAnimationFrame( this.loop.bind( this ) );
    }
}
