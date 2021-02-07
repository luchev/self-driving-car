import * as fs from 'fs';

import * as argparse from 'argparse';
import {mkdir} from 'shelljs';

// The value of tf (TensorFlow.js-Node module) will be set dynamically
// depending on the value of the --gpu flag below.
let tf;

import {Car} from './car';
import {copyWeights} from './dqn';

class MovingAverager {
    constructor( bufferLength ) {
        this.buffer = [];
        for ( let i = 0; i < bufferLength; ++i ) {
            this.buffer.push( null );
        }
    }

    append( x ) {
        this.buffer.shift();
        this.buffer.push( x );
    }

    average() {
        return this.buffer.reduce( ( x, prev ) => x + prev ) / this.buffer.length;
    }
}

export async function train(
    agent, batchSize, gamma, learningRate, cumulativeRewardThreshold,
    maxNumFrames, syncEveryFrames, savePath, logDir ) {
    let summaryWriter;
    if ( logDir != null ) {
        summaryWriter = tf.node.summaryFileWriter( logDir );
    }

    for ( let i = 0; i < agent.replayBufferSize; ++i ) {
        agent.playStep();
    }

    const rewardAverager100 = new MovingAverager( 100 );
    const gatesAverager100 = new MovingAverager( 100 );

    const optimizer = tf.train.adam( learningRate );
    let tPrev = new Date().getTime();
    let frameCountPrev = agent.frameCount;
    let averageReward100Best = -Infinity;
    let averageGates100Best = -Infinity;
    while ( true ) {
        agent.trainOnReplayBatch( batchSize, gamma, optimizer );
        const {cumulativeReward, done, gatesReached} = agent.playStep();
        if ( done ) {
            const t = new Date().getTime();
            const framesPerSecond =
                ( agent.frameCount - frameCountPrev ) / ( t - tPrev ) * 1e3;
            tPrev = t;
            frameCountPrev = agent.frameCount;

            rewardAverager100.append( cumulativeReward );
            gatesAverager100.append( gatesReached );
            const averageReward100 = rewardAverager100.average();
            const averageGates100 = gatesAverager100.average();

            console.log(
                `Frame #${agent.frameCount}: ` +
                `cumulativeReward100=${averageReward100.toFixed( 1 )}; ` +
                `gates100=${averageGates100.toFixed( 2 )} ` +
                `(epsilon=${agent.epsilon.toFixed( 3 )}) ` +
                `(${framesPerSecond.toFixed( 1 )} frames/s)` );
            if ( summaryWriter != null ) {
                summaryWriter.scalar(
                    'cumulativeReward100', averageReward100, agent.frameCount );
                summaryWriter.scalar( 'gates100', averageGates100, agent.frameCount );
                summaryWriter.scalar( 'epsilon', agent.epsilon, agent.frameCount );
                summaryWriter.scalar(
                    'framesPerSecond', framesPerSecond, agent.frameCount );
            }
            if ( averageReward100 > averageReward100Best ) {
                averageReward100Best = averageReward100;
                let date = new Date(Date.now()).toLocaleTimeString('it-IT');
                if ( savePath != null ) {
                    await agent.onlineNetwork.save( `file://${savePath}-` + date );
                    console.log( `Saved DQN to ${savePath}-` + date );
                }
            }
            if ( averageGates100 > averageGates100Best ) {
                averageGates100Best = averageGates100;
                let date = new Date(Date.now()).toLocaleTimeString('it-IT');
                if ( savePath != null ) {
                    await agent.onlineNetwork.save( `file://${savePath}-gates-` + date );
                    console.log( `Saved DQN to ${savePath}-gates-` + date );
                }
            }
        }
        if ( agent.frameCount % syncEveryFrames === 0 ) {
            copyWeights( agent.targetNetwork, agent.onlineNetwork );
            console.log( 'Sync\'ed weights from online network to target network' );
        }
    }
}

export function parseArguments() {
    const parser = new argparse.ArgumentParser( {
        description: 'Training script for a DQN that plays the snake game'
    } );
    parser.addArgument( '--gpu', {
        action: 'storeTrue',
        help: 'Whether to use tfjs-node-gpu for training ' +
            '(requires CUDA GPU, drivers, and libraries).'
    } );
    parser.addArgument( '--maxNumFrames', {
        type: 'float',
        defaultValue: 1e9,
        help: 'Maximum number of frames to run durnig the training. ' +
            'Training ends immediately when this frame count is reached.'
    } );
    parser.addArgument( '--replayBufferSize', {
        type: 'int',
        defaultValue: 1e4,
        help: 'Length of the replay memory buffer.'
    } );
    parser.addArgument( '--epsilonInit', {
        type: 'float',
        defaultValue: 0.5,
        help: 'Initial value of epsilon, used for the epsilon-greedy algorithm.'
    } );
    parser.addArgument( '--epsilonFinal', {
        type: 'float',
        defaultValue: 0.01,
        help: 'Final value of epsilon, used for the epsilon-greedy algorithm.'
    } );
    parser.addArgument( '--epsilonDecayFrames', {
        type: 'int',
        defaultValue: 1e5,
        help: 'Number of frames of game over which the value of epsilon ' +
            'decays from epsilonInit to epsilonFinal'
    } );
    parser.addArgument( '--batchSize', {
        type: 'int',
        defaultValue: 64,
        help: 'Batch size for DQN training.'
    } );
    parser.addArgument( '--gamma', {
        type: 'float',
        defaultValue: 0.99,
        help: 'Reward discount rate.'
    } );
    parser.addArgument( '--learningRate', {
        type: 'float',
        defaultValue: 1e-3,
        help: 'Learning rate for DQN training.'
    } );
    parser.addArgument( '--syncEveryFrames', {
        type: 'int',
        defaultValue: 1e3,
        help: 'Frequency at which weights are sync\'ed from the online network ' +
            'to the target network.'
    } );
    parser.addArgument( '--savePath', {
        type: 'string',
        defaultValue: './models/dqn',
        help: 'File path to which the online DQN will be saved after training.'
    } );
    parser.addArgument( '--logDir', {
        type: 'string',
        defaultValue: null,
        help: 'Path to the directory for writing TensorBoard logs in.'
    } );
    return parser.parseArgs();
}

async function main() {
    const args = parseArguments();
    if ( args.gpu ) {
        tf = require( '@tensorflow/tfjs-node-gpu' );
    } else {
        tf = require( '@tensorflow/tfjs-node' );
    }
    console.log( `args: ${JSON.stringify( args, null, 2 )}` );

    const agent = Car.withConfig( {
        replayBufferSize: args.replayBufferSize,
        epsilonInit: args.epsilonInit,
        epsilonFinal: args.epsilonFinal,
        epsilonDecayFrames: args.epsilonDecayFrames,
        learningRate: args.learningRate
    } );

    await train(
        agent, args.batchSize, args.gamma, args.learningRate,
        args.cumulativeRewardThreshold, args.maxNumFrames,
        args.syncEveryFrames, args.savePath, args.logDir );
}

if ( require.main === module ) {
    main();
}
