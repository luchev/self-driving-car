import * as tf from '@tensorflow/tfjs';

import {Segment, Ray, Point} from './geometry';
import {Instruction} from './instruction';
import {Map} from './map';
import {ReplayMemory} from './replay_memory';
import {createDeepQNetwork} from './dqn';
import {getRandomInteger} from './utils';

const ACTION_STRAIGHT = Instruction.Straight;
const ACTION_STRAIGHT_LEFT = Instruction.Straight | Instruction.Left;
const ACTION_STRAIGHT_RIGHT = Instruction.Straight | Instruction.Right;
const ACTION_BACK = Instruction.Back;
const ACTION_BACK_LEFT = Instruction.Back | Instruction.Left;
const ACTION_BACK_RIGHT = Instruction.Back | Instruction.Right;
// export const ALL_ACTIONS = [ACTION_BACK, ACTION_STRAIGHT, ACTION_STRAIGHT_LEFT, ACTION_STRAIGHT_RIGHT];
export const ALL_ACTIONS = [ACTION_STRAIGHT, ACTION_STRAIGHT_LEFT, ACTION_STRAIGHT_RIGHT, ACTION_BACK, ACTION_BACK_LEFT, ACTION_BACK_RIGHT];
export const NUM_ACTIONS = ALL_ACTIONS.length;

const NUM_SENSORS = 8;
const NUM_INPUTS = 5 + NUM_SENSORS;

const NO_GATE_REWARD = -0.1;
const GATE_REWARD = 100;
const DEATH_REWARD = -100;

var car = null;

export class Car {
    constructor( imageId = 0, x, y, rotation, rewards, walls ) {
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
        this.walls = walls;
        this.pursuingReward = 0;
        this.distanceToNextReward = this.calculateDistanceToNextReward();

        this.maxSpeed = 10;
        this.maxSpeedReverse = -4;

        this.imageId = imageId;

        this.sensorAngles = this.initSensorAngles( NUM_SENSORS );
        this.sensorIntersectionLength = 3000;
        this.sensorIntersections = [];
        this.updateSensors();

        this.sensorDrawLength = 300;
        this.drawSensors = true;
        this.color = '#ff0000';

        this.onlineNetwork = createDeepQNetwork( NUM_INPUTS, NUM_ACTIONS );
        this.targetNetwork = createDeepQNetwork( NUM_INPUTS, NUM_ACTIONS );
        this.targetNetwork.trainable = false;
        this.frameCount = 0;

        this.gateReached = 0;

        this.cumulativeReward_ = 0;
        this.gatesReached_ = 0;
    }

    static default() {
        const map1 = Map.default();
        return new Car( 0, map1.startPoint.x, map1.startPoint.y, map1.startRotation, map1.rewards, map1.walls );
    }

    static withConfig( config ) {
        const map1 = Map.default();
        let car = new Car( 0, map1.startPoint.x, map1.startPoint.y, map1.startRotation, map1.rewards, map1.walls );
        car.epsilonInit = config.epsilonInit;
        car.epsilonFinal = config.epsilonFinal;
        car.epsilonDecayFrames = config.epsilonDecayFrames;
        car.epsilonIncrement_ = ( car.epsilonFinal - car.epsilonInit ) / car.epsilonDecayFrames;
        car.replayMemory = new ReplayMemory( config.replayBufferSize );
        car.replayBufferSize = config.replayBufferSize;
        car.optimizer = tf.train.adam( config.learningRate );

        return car;
    }

    getRandomAction() {
        return getRandomInteger( 0, NUM_ACTIONS );
    }

    update( instructions ) {
        if ( !this.alive ) {
            return;
        }
        this.turn( instructions );
        this.accelerate( instructions );
        this.move();
        this.updateSensors();
        let reward = this.checkReward();
        let alive = this.checkAlive();

        if (!alive) {
            return [this.alive, DEATH_REWARD, false]
        }

        if ( reward > 0 ) {
            return [this.alive, reward, true];
        } else {
            return [this.alive, reward, false];
        }
    }

    playStep() {
        this.epsilon = this.frameCount >= this.epsilonDecayFrames ?
            this.epsilonFinal :
            this.epsilonInit + this.epsilonIncrement_ * this.frameCount;
        this.frameCount++;

        let action;
        if ( Math.random() < this.epsilon ) {
            action = this.getRandomAction();
        } else {
            tf.tidy( () => {
                const stateTensor = this.getStateTensor();
                action = ALL_ACTIONS[this.onlineNetwork.predict( stateTensor ).argMax( -1 ).dataSync()[0]];
            } );
        }

        let state = this.getState();
        let [alive, reward, gateReached] = this.update( action );
        let done = !alive;
        let nextState = this.getState();

        this.replayMemory.append( [state, action, reward, done, nextState] );

        this.cumulativeReward_ += reward;
        if ( gateReached ) {
            this.gatesReached_++;
        }
        const output = {
            action,
            cumulativeReward: this.cumulativeReward_,
            done,
            gatesReached: this.gatesReached_
        };
        if ( done ) {
            this.reset();
        }
        return output;
    }

    static getStatesTensors( states ) {
        if ( !Array.isArray( states ) ) {
            states = [states];
        }
        const numExamples = states.length;

        if (car == null) {
            car = Car.default();
        }
        const buffer = tf.buffer( [numExamples, NUM_INPUTS, 1] );

        for ( let n = 0; n < numExamples; ++n ) {
            if ( states[n] == null ) {
                continue;
            }

            car.setState( states[n] );

            let values = [
                car.x,
                car.y,
                car.rotation,
                car.speed,
                car.distanceToNextReward,
                ...car.getSensorIntersectionDistances()
            ];
            for ( let i = 0; i < values.length; i++ ) {
                buffer.set( values[i], n, 0, i );
            }

        }
        return buffer.toTensor();
    }

    trainOnReplayBatch( batchSize, gamma, optimizer ) {
        const batch = this.replayMemory.sample( batchSize );
        const lossFunction = () => tf.tidy( () => {
            const stateTensor = Car.getStatesTensors( batch.map( example => example[0] ) );

            const actionTensor = tf.tensor1d( batch.map( example => example[1] ), 'int32' );
            const qs = this.onlineNetwork.apply( stateTensor, {training: true} ).mul( tf.oneHot( actionTensor, NUM_ACTIONS ) ).sum( -1 );

            const rewardTensor = tf.tensor1d( batch.map( example => example[2] ) );
            const nextStateTensor = Car.getStatesTensors( batch.map( example => example[4] ) );
            const nextMaxQTensor = this.targetNetwork.predict( nextStateTensor ).max( -1 );
            const doneMask = tf.scalar( 1 ).sub( tf.tensor1d( batch.map( example => example[3] ) ).asType( 'float32' ) );
            const targetQs = rewardTensor.add( nextMaxQTensor.mul( doneMask ).mul( gamma ) );
            return tf.losses.meanSquaredError( targetQs, qs );
        } );

        // Calculate the gradients of the loss function with repsect to the weights
        // of the online DQN.
        const grads = tf.variableGrads( lossFunction );
        // Use the gradients to update the online DQN's weights.
        optimizer.applyGradients( grads.grads );
        tf.dispose( grads );
    }

    getState() {
        return [
            this.x,
            this.y,
            this.rotation,
            this.speed,
            this.points,
            this.pursuingReward
        ];
    }

    setState( state ) {
        this.x = state[0];
        this.y = state[1];
        this.rotation = state[2];
        this.speed = state[3];
        this.points = state[4];
        this.pursuingReward = state[5];
        this.updateSensors();
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

        this.cumulativeReward_ = 0;
        this.gatesReached_ = 0;
    }

    getStateTensor() {
        const buffer = tf.buffer( [1, NUM_INPUTS, 1] );
        let values = [
            this.x,
            this.y,
            this.rotation,
            this.speed,
            this.distanceToNextReward,
            ...this.getSensorIntersectionDistances()
        ];
        for ( let i = 0; i < values.length; i++ ) {
            buffer.set( values[i], 0, 0, i );
        }
        return buffer.toTensor();
    }

    getSensorIntersectionDistances() {
        let distances = [];
        for ( let point of this.sensorIntersections ) {
            distances.push( point.distanceTo( this.x, this.y ) );
        }
        return distances;
    }

    checkAlive() {
        for ( let point of this.sensorIntersections ) {
            if ( point.distanceTo( this.x, this.y ) < 25 ) {
                this.alive = false;
                this.speed = 0;
                this.points = DEATH_REWARD;
                break;
            }
        }
        return this.alive;
    }

    resetRewards() {
        this.pursuingReward = 0;
    }

    calculateDistanceToNextReward() {
        return Point.distanceBetween( this.x, this.y, this.rewards[this.pursuingReward].center.x, this.rewards[this.pursuingReward].center.y );
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
            this.pursuingReward++;
            if ( this.pursuingReward == this.rewards.length ) {
                this.pursuingReward = 0;
            }
            return GATE_REWARD;
        }
        return NO_GATE_REWARD;
    }

    updateSensors() {
        let sensorLines = this.getSensors( this.sensorIntersectionLength );
        this.sensorIntersections = [];
        for ( let sensor of sensorLines ) {
            let closestIntersection = new Point( Infinity, Infinity );
            let closestDistance = Infinity;
            for ( let wall of this.walls ) {
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
        let sensor = 0;
        for ( let i = 0; i < num_sensors; i++ ) {
            sensors.push( sensor );
            sensor += dAngle;
        }
        return sensors;
    }

    move( progress = 1 ) {
        this.x += progress * this.speed * Math.cos( this.rotation );
        this.y += progress * this.speed * Math.sin( this.rotation );
    }

    turn( instructions ) {
        if ( Instruction.hasLeft( instructions ) ) {
            this.rotation -= 0.05;
        }
        if ( Instruction.hasRight( instructions ) ) {
            this.rotation += 0.05;
        }
    }

    accelerate( instructions ) {
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
