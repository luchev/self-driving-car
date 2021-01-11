import {Line, Segment, Ray, Point} from './geometry';
import {Instruction} from './instruction';

export class Car {
    constructor( imageId = 0, x, y, rotation, rewards ) {
        this.originalX = x;
        this.originalY = y;
        this.originalRotation = rotation;

        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.speed = 0;
        
        this.points = 0;
        this.alive = true;
        this.rewards = rewards;
        this.pursuingReward = 0;
        this.distanceToNextReward = this.calculateDistanceToNextReward();
        
        this.maxSpeed = 10;
        this.maxSpeedReverse = -4;
        
        this.imageId = imageId;
        
        this.sensorAngles = this.initSensorAngles( 8 );
        this.sensorIntersectionLength = 3000;
        this.sensorIntersections = [];
        
        this.sensorDrawLength = 300;
        this.drawSensors = true;
        this.color = '#ff0000';
    }

    update( instructions, progress, walls ) {
        if (!this.alive) {
            return;
        }
        this.turn(instructions);
        this.accelerate(instructions);
        this.move( progress / 16 );
        this.updateSensors( walls );
        this.checkReward();
        this.checkAlive();
    }

    reset() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.rotation = this.originalRotation;
        this.speed = 0;
        
        this.alive = true;
        this.points = 0;
        
        this.pursuingReward = 0;
        this.distanceToNextReward = this.calculateDistanceToNextReward();
    }

    checkAlive() {
        for (let point of this.sensorIntersections) {
            if (point.distanceTo(this.x, this.y) < 25) {
                this.alive = false;
                this.speed = 0;
                break;
            }
        }
    }

    resetRewards() {
        this.pursuingReward = 0;
    }

    calculateDistanceToNextReward() {
        return Point.distanceBetween( this.x, this.y, this.rewards[this.pursuingReward].center.x, this.rewards[this.pursuingReward].center.y);
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
        sensors.push( -Math.PI );
        return sensors;
    }

    move( progress = 1 ) {
        this.x += progress * this.speed * Math.cos( this.rotation );
        this.y += progress * this.speed * Math.sin( this.rotation );
    }

    turn(instructions) {
        if ( Instruction.hasLeft(instructions) ) {
            this.rotation -= 0.05;
        }
        if ( Instruction.hasRight( instructions ) ) {
            this.rotation += 0.05;
        }
    }

    accelerate( instructions) {
        if ( Instruction.hasForward( instructions ) ) {
            this.speed = Math.min( this.speed + 0.1, this.maxSpeed );
        } else if ( Instruction.hasBack( instructions ) ) {
            this.speed = Math.max( this.speed - 0.2, this.maxSpeedReverse );
        } else if ( this.speed > 0 ) {
            this.speed = Math.max( this.speed - 0.05, 0 );
        } else if ( this.speed < 0 ) {
            this.speed = Math.min( this.speed + 0.05, 0 );
        }
    }
}
