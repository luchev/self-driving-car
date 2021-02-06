import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import {Canvas} from './canvas';
import {Car} from './car';
import {Game} from './game';
import {Map} from './map';

window.global = window;
window.Buffer = window.Buffer || require( 'buffer' ).Buffer;

let fileData, base64Image, image;
let extension = 'png';

/* Load cars */
let carImages = [];
fileData = fs.readFileSync( 'src/img/car-0.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
carImages.push( image );

fileData = fs.readFileSync( 'src/img/car-1.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
carImages.push( image );

fileData = fs.readFileSync( 'src/img/car-2.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
carImages.push( image );

fileData = fs.readFileSync( 'src/img/car-3.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
carImages.push( image );

fileData = fs.readFileSync( 'src/img/car-4.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
carImages.push( image );

/* Load tracks */
let trackImages = [];

fileData = fs.readFileSync( 'src/img/track-0.png' );
base64Image = new Buffer.from( fileData, 'binary' ).toString( 'base64' );
image = new Image();
image.src = `data:image/${extension.split( '.' ).pop()};base64,${base64Image}`;
trackImages.push( image );

const canvas = new Canvas( 'car-canvas', carImages, Map.default() );
let car = Car.default();

const gameCanvas = document.getElementById( 'game-canvas' );

const loadHostedModelButton = document.getElementById( 'load-hosted-model' );

const stepButton = document.getElementById( 'step' );
const resetButton = document.getElementById( 'reset' );
const autoPlayStopButton = document.getElementById( 'auto-play-stop' );
const gameStatusSpan = document.getElementById( 'game-status' );
const showSensorsCheckbox = document.getElementById( 'show-sensors' );
const showRewardsCheckbox = document.getElementById( 'show-rewards' );

let game;
let qNet;

let cumulativeReward = 0;
let cumulativeGates = 0;
let autoPlaying = false;
let autoPlayIntervalJob;

/** Reset the game state. */
async function reset() {
    if ( game == null || car == null ) {
        return;
    }
    game.reset();
    car.reset();
    await calcQValuesAndBestAction();
    game.draw();
    game.drawCar( car, showRewardsCheckbox.checked, showSensorsCheckbox.checked );
    gameStatusSpan.textContent = 'Game started.';
    stepButton.disabled = false;
    autoPlayStopButton.disabled = false;
}

/**
 * Play a game for one step.
 *
 * - Use the current best action to forward one step in the game.
 * - Accumulate to the cumulative reward.
 * - Determine if the game is over and update the UI accordingly.
 * - If the game has not ended, calculate the current Q-values and best action.
 * - Render the game in the canvas.
 */
async function step() {
    const [alive, reward, gateHit] = car.update( bestAction );
    const done = !alive;
    invalidateQValuesAndBestAction();
    cumulativeReward += reward;
    if ( gateHit ) {
        cumulativeGates++;
    }
    gameStatusSpan.textContent =
        `Reward=${cumulativeReward.toFixed( 1 )}; Gates=${cumulativeGates}`;
    if ( done ) {
        gameStatusSpan.textContent += '. Game Over!';
        cumulativeReward = 0;
        cumulativeGates = 0;
        if ( autoPlayIntervalJob ) {
            clearInterval( autoPlayIntervalJob );
            autoPlayStopButton.click();
        }
        autoPlayStopButton.disabled = true;
        stepButton.disabled = true;
    }
    await calcQValuesAndBestAction();
    game.draw();
    game.drawCar( car, showRewardsCheckbox.checked, showSensorsCheckbox.checked );
}

let currentQValues;
let bestAction;

import {ALL_ACTIONS} from './car';

/** Calculate the current Q-values and the best action. */
async function calcQValuesAndBestAction() {
    if ( currentQValues != null ) {
        return;
    }
    tf.tidy( () => {
        const stateTensor = Car.getStatesTensors( [car.getState()] );
        const predictOut = qNet.predict( stateTensor );
        currentQValues = predictOut.dataSync();
        bestAction = ALL_ACTIONS[predictOut.argMax( -1 ).dataSync()[0]];
    } );
}

function invalidateQValuesAndBestAction() {
    currentQValues = null;
    bestAction = null;
}

const LOCAL_MODEL_URL = 'dqn/model.json';

function enableGameButtons() {
    autoPlayStopButton.disabled = false;
    stepButton.disabled = false;
    resetButton.disabled = false;
}

async function initGame() {
    game = new Game( canvas, Map.default() );
    car = Car.default();

    const stateTensor = Car.getStatesTensors( [car.getState()] );

    for ( let i = 0; i < 3; ++i ) {
        qNet.predict( stateTensor );
    }

    await reset();

    stepButton.addEventListener( 'click', step );

    autoPlayStopButton.addEventListener( 'click', () => {
        if ( autoPlaying ) {
            autoPlayStopButton.textContent = 'Auto Play';
            if ( autoPlayIntervalJob ) {
                clearInterval( autoPlayIntervalJob );
            }
        } else {
            autoPlayIntervalJob = setInterval( () => {
                step( game, qNet );
            }, 100 );
            autoPlayStopButton.textContent = 'Stop';
        }
        autoPlaying = !autoPlaying;
        stepButton.disabled = autoPlaying;
    } );

    resetButton.addEventListener( 'click', () => reset( game ) );
}

( async function () {
    try {
        qNet = await tf.loadLayersModel( LOCAL_MODEL_URL );
        loadHostedModelButton.textContent = `Loaded model from ${LOCAL_MODEL_URL}`;
        initGame();
        enableGameButtons();
    } catch ( err ) {
        console.log( 'Loading local model failed.' );
        loadHostedModelButton.disabled = false;
    }
} )();
