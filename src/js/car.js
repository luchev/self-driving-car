import {Line, Segment, Ray, Point} from './geometry';

export class Car {
    constructor( imageId = 0, x, y, rotation, rewards ) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.points = 0;
        this.maxSpeed = 10;
        this.maxSpeedReverse = -4;
        this.speed = 0;
        this.imageId = imageId;
        this.sensorAngles = this.initSensorAngles( 8 );
        this.sensorDrawLength = 300;
        this.sensorIntersectionLength = 3000;
        this.drawSensors = true;
        this.sensorIntersections = [];
        this.color = '#ff0000';
        this.rewards = rewards;
        this.pursuingReward = 0;
        this.distanceToNextReward = this.calculateDistanceToNextReward();

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

    resetRewards() {
        this.pursuingReward = 0;
    }

    calculateDistanceToNextReward() {
        return Math.sqrt( Math.pow( this.x - this.rewards[this.pursuingReward].center.x, 2 ) + Math.pow( this.y - this.rewards[this.pursuingReward].center.y, 2 ) );
    }

    getSensors( length = -1 ) {
        if ( length === -1 ) {
            length = this.sensorDrawLength;
        }
        let sensors = [];
        for ( let angle of this.sensorAngles ) {
            let endPoint = Ray.getPointFromOrigin( this.x, this.y, this.rotation + angle, length );
            sensors.push( new Segment( this.x, this.y, endPoint.x, endPoint.y, this.color ) );
        }
        return sensors;
    }

    tick( progress, walls ) {
        this.turn();
        this.accelerate();
        this.move( progress );
        this.updateSensors( walls );
        this.checkReward();
    }

    checkReward() {
        this.distanceToNextReward = this.calculateDistanceToNextReward();
        if ( this.distanceToNextReward < 50 ) {
            this.points += 1;
            this.pursuingReward++;
            if ( this.pursuingReward == this.rewards.length ) {
                this.pursuingReward = 0;
            }
        }
    }

    updateSensors( walls ) {
        let sensorLines = this.getSensors( this.sensorIntersectionLength );
        this.sensorIntersections = [];
        for ( let sensor of sensorLines ) {
            let closestIntersection = new Point( Infinity, Infinity );
            let closestDistance = Infinity;
            for ( let wall of walls ) {
                let intersection = sensor.intersectSegment( wall );
                if ( intersection == null ) {
                    continue;
                }

                let distance = intersection.squaredDistanceTo( this.x, this.y );
                if ( distance < closestDistance ) {
                    closestIntersection = intersection;
                    closestDistance = distance;
                }
            }
            closestIntersection.color = '#ff00ff';
            closestIntersection.width = 6;
            this.sensorIntersections.push( closestIntersection );
        }
    }

    initSensorAngles( num_sensors ) {
        let sensors = [];
        let dAngle = Math.PI * 2 / num_sensors;
        sensors.push( 0 );
        sensors.push( dAngle );
        sensors.push( -dAngle );
        sensors.push( 2 * dAngle );
        sensors.push( -2 * dAngle );
        return sensors;
    }

    move( progress ) {
        progress /= 16;
        this.x += progress * this.speed * Math.cos( this.rotation );
        this.y += progress * this.speed * Math.sin( this.rotation );
    }

    turn() {
        if ( this.pressedKeys.has( this.keys['left'] ) ) {
            this.rotation -= 0.05;
        }
        if ( this.pressedKeys.has( this.keys['right'] ) ) {
            this.rotation += 0.05;
        }
    }

    accelerate() {
        if ( this.pressedKeys.has( this.keys['forward'] ) ) {
            this.speed = Math.min( this.speed + 0.1, this.maxSpeed );
        } else if ( this.pressedKeys.has( this.keys['back'] ) ) {
            this.speed = Math.max( this.speed - 0.2, this.maxSpeedReverse );
        } else if ( this.speed > 0 ) {
            this.speed = Math.max( this.speed - 0.05, 0 );
        } else if ( this.speed < 0 ) {
            this.speed = Math.min( this.speed + 0.05, 0 );
        }
    }
}
