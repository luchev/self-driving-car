import {Line, Ray} from './geometry';

export class Car {
    constructor( imageId = 0 ) {
        this.x = 0;
        this.y = 0;
        this.rotation = Math.PI;
        this.maxSpeed = 10;
        this.maxSpeedReverse = -4;
        this.speed = 0;
        this.imageId = imageId;
        this.sensorAngles = this.init_sensors( 8 );
        this.sensorDrawLength = 150;
        this.drawSensors = true;
        this.color = '#ff0000'

        this.keys = {
            'left': 'a',
            'right': 'd',
            'forward': 'w',
            'back': 's',
        }

        this.pressedKeys = new Set();
        document.body.addEventListener( "keydown", ( e ) => {
            this.pressedKeys.add( e.key.toLowerCase() );
        } );

        document.body.addEventListener( "keyup", ( e ) => {
            this.pressedKeys.delete( e.key.toLowerCase() );
        } );
    }

    getSensors() {
        let sensors = [];
        for ( let angle of this.sensorAngles ) {
            let endPoint = Ray.getPointFromOrigin( this.x, this.y, this.rotation + angle, this.sensorDrawLength );
            sensors.push( new Line( this.x, this.y, endPoint.x, endPoint.y, this.color ) );
        }
        return sensors;
    }

    tick( progress ) {
        this.turn();
        this.accelerate();
        this.move( progress );
    }

    init_sensors( num_sensors ) {
        let sensors = [];
        let dAngle = Math.PI * 2 / num_sensors;
        let sensor = 0;
        for ( let i = 0; i < num_sensors; i++ ) {
            sensors.push( sensor );
            sensor += dAngle;
        }

        return sensors;
    }

    move( progress ) {
        progress /= 16;
        this.x += progress * this.speed * Math.cos( this.rotation );
        this.y += progress * this.speed * Math.sin( this.rotation );
    }

    turn() {
        if ( this.pressedKeys.has( this.keys['left'] ) ) {
            this.rotation -= 0.1;
        }
        if ( this.pressedKeys.has( this.keys['right'] ) ) {
            this.rotation += 0.1;
        }
    }

    accelerate() {
        if ( this.pressedKeys.has( this.keys['forward'] ) ) {
            this.speed = Math.min( this.speed + 0.1, this.maxSpeed );
        } else if ( this.pressedKeys.has( this.keys['back'] ) ) {
            this.speed = Math.max( this.speed -0.1, this.maxSpeedReverse );
        } else if (this.speed > 0) {
            this.speed = Math.max( this.speed -0.05, 0 );
        } else if (this.speed < 0) {
            this.speed = Math.min( this.speed + 0.05, 0 );
        }
        console.log(this.speed);
    }
}
