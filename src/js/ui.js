/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as fs from 'fs';
import {Canvas} from './canvas';
import {Car} from './car';
import {Game} from './game';
import {Map} from './map';
import {Segment, Point, Square} from './geometry';

import {CartPole} from './cart_pole';
import {SaveablePolicyNetwork} from './index';
import {mean, sum} from './utils';

const appStatus = document.getElementById('app-status');
const storedModelStatusInput = document.getElementById('stored-model-status');
const hiddenLayerSizesInput = document.getElementById('hidden-layer-sizes');
const createModelButton = document.getElementById('create-model');
const deleteStoredModelButton = document.getElementById('delete-stored-model');

const numIterationsInput = document.getElementById('num-iterations');
const gamesPerIterationInput = document.getElementById('games-per-iteration');
const discountRateInput = document.getElementById('discount-rate');
const maxStepsPerGameInput = document.getElementById('max-steps-per-game');
const learningRateInput = document.getElementById('learning-rate');
const renderDuringTrainingCheckbox =
    document.getElementById('render-during-training');

const trainButton = document.getElementById('train');
const testButton = document.getElementById('test');
const iterationStatus = document.getElementById('iteration-status');
const iterationProgress = document.getElementById('iteration-progress');
const trainStatus = document.getElementById('train-status');
const trainSpeed = document.getElementById('train-speed');
const trainProgress = document.getElementById('train-progress');

const stepsContainer = document.getElementById('steps-container');


// Canvas initialization
let carImages = [];

let fileData, base64Image, image;
let extension = 'png';
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

// /* Initialize map */
let walls = [];
walls.push( new Segment( 50.639, 40.541, 858.084, 39.536, '#000', 5 ) );
walls.push( new Segment( 49.556, 272.46, 50.639, 40.541, '#000', 5 ) );
walls.push( new Segment( 858.084, 39.536, 1129.038, 316.826, '#000', 5 ) );
walls.push( new Segment( 1129.038, 316.826, 1386.987, 50.628, '#000', 5 ) );
walls.push( new Segment( 1386.987, 50.628, 2054.619, 50.628, '#000', 5 ) );
walls.push( new Segment( 2054.619, 50.628, 2054.619, 1559.093, '#000', 5 ) );
walls.push( new Segment( 2054.619, 1559.093, 1337.132, 824.825, '#000', 5 ) );
walls.push( new Segment( 1337.132, 824.825, 1337.132, 585.244, '#000', 5 ) );
walls.push( new Segment( 1337.132, 585.244, 1564.734, 585.244, '#000', 5 ) );
walls.push( new Segment( 1564.734, 585.244, 1564.734, 315.011, '#000', 5 ) );
walls.push( new Segment( 1564.734, 315.011, 1255.681, 596.523, '#000', 5 ) );
walls.push( new Segment( 1255.681, 596.523, 1252.629, 1156.191, '#000', 5 ) );
walls.push( new Segment( 1252.629, 1156.191, 1595.08, 1545.781, '#000', 5 ) );
walls.push( new Segment( 1595.08, 1545.781, 49.556, 1543.563, '#000', 5 ) );
walls.push( new Segment( 49.556, 1543.563, 49.556, 1033.347, '#000', 5 ) );
walls.push( new Segment( 49.556, 1033.347, 327.013, 1033.347, '#000', 5 ) );
walls.push( new Segment( 327.013, 1033.347, 327.013, 724.999, '#000', 5 ) );
walls.push( new Segment( 327.013, 724.999, 60.394, 724.999, '#000', 5 ) );
walls.push( new Segment( 58.948, 726.445, 60.394, 407.779, '#000', 5 ) );
walls.push( new Segment( 60.394, 407.779, 696.651, 407.779, '#000', 5 ) );
walls.push( new Segment( 697.679, 407.779, 695.151, 1314.771, '#000', 5 ) );
walls.push( new Segment( 696.598, 1314.771, 1034.137, 1313.846, '#000', 5 ) );
walls.push( new Segment( 1034.138, 1315.292, 1021.685, 584.239, '#000', 5 ) );
walls.push( new Segment( 1020.238, 581.346, 721.313, 277.041, '#000', 5 ) );
walls.push( new Segment( 721.313, 277.041, 49.556, 272.46, '#000', 5 ) );
walls.push( new Segment( 158.205, 150.326, 775.249, 149.606, '#000', 5 ) );
walls.push( new Segment( 775.249, 149.606, 1131.185, 536.286, '#000', 5 ) );
walls.push( new Segment( 1131.185, 536.286, 1426.242, 219.732, '#000', 5 ) );
walls.push( new Segment( 1426.242, 219.732, 1924.796, 218.487, '#000', 5 ) );
walls.push( new Segment( 1924.796, 218.487, 1924.796, 1200.946, '#000', 5 ) );
walls.push( new Segment( 1924.796, 1200.946, 1501.385, 777.536, '#000', 5 ) );
walls.push( new Segment( 1501.385, 777.536, 1729.709, 777.536, '#000', 5 ) );
walls.push( new Segment( 1729.709, 777.536, 1728.644, 218.5, '#000', 5 ) );
walls.push( new Segment( 1130.977, 537.893, 1139.654, 1178.496, '#000', 5 ) );
walls.push( new Segment( 1139.654, 1181.388, 1344.517, 1419.357, '#000', 5 ) );
walls.push( new Segment( 1343.071, 1420.802, 185.61, 1423.456, '#000', 5 ) );
walls.push( new Segment( 185.61, 1423.456, 187.138, 1169.748, '#000', 5 ) );
walls.push( new Segment( 187.138, 1169.748, 451.123, 1166.696, '#000', 5 ) );
walls.push( new Segment( 451.123, 1166.696, 452.563, 606.495, '#000', 5 ) );
walls.push( new Segment( 452.563, 606.495, 176.318, 599.915, '#000', 5 ) );
walls.push( new Segment( 176.318, 599.915, 182.888, 506.98, '#000', 5 ) );
walls.push( new Segment( 182.897, 508.565, 574.315, 505.103, '#000', 5 ) );
walls.push( new Segment( 574.315, 505.103, 575.032, 1425.41, '#000', 5 ) );

let rewards = [];
rewards.push( new Square( 259.485, 69.991, 50, 50 ) );
rewards.push( new Square( 524.304, 65.558, 50, 50 ) );
rewards.push( new Square( 780.466, 67.428, 50, 50 ) );
rewards.push( new Square( 982.404, 267.497, 50, 50 ) );
rewards.push( new Square( 1208.649, 293.674, 50, 50 ) );
rewards.push( new Square( 1474.161, 102.955, 50, 50 ) );
rewards.push( new Square( 1840.641, 97.345, 50, 50 ) );
rewards.push( new Square( 1964.048, 310.502, 50, 50 ) );
rewards.push( new Square( 1958.438, 544.227, 50, 50 ) );
rewards.push( new Square( 1964.048, 768.602, 50, 50 ) );
rewards.push( new Square( 1965.918, 976.15, 50, 50 ) );
rewards.push( new Square( 1797.636, 1187.437, 50, 50 ) );
rewards.push( new Square( 1591.958, 978.02, 50, 50 ) );
rewards.push( new Square( 1436.765, 817.217, 50, 50 ) );
rewards.push( new Square( 1548.953, 654.545, 50, 50 ) );
rewards.push( new Square( 1623.745, 491.872, 50, 50 ) );
rewards.push( new Square( 1618.135, 310.502, 50, 50 ) );
rewards.push( new Square( 1444.244, 256.278, 50, 50 ) );
rewards.push( new Square( 1318.968, 402.122, 50, 50 ) );
rewards.push( new Square( 1169.384, 613.409, 50, 50 ) );
rewards.push( new Square( 1167.514, 830.306, 50, 50 ) );
rewards.push( new Square( 1169.384, 1112.645, 50, 50 ) );
rewards.push( new Square( 1274.092, 1264.099, 50, 50 ) );
rewards.push( new Square( 1361.973, 1451.079, 50, 50 ) );
rewards.push( new Square( 1100.201, 1454.818, 50, 50 ) );
rewards.push( new Square( 896.393, 1456.688, 50, 50 ) );
rewards.push( new Square( 660.799, 1460.427, 50, 50 ) );
rewards.push( new Square( 445.772, 1454.818, 50, 50 ) );
rewards.push( new Square( 217.657, 1454.818, 50, 50 ) );
rewards.push( new Square( 92.381, 1292.146, 50, 50 ) );
rewards.push( new Square( 202.699, 1069.64, 50, 50 ) );
rewards.push( new Square( 363.501, 888.269, 50, 50 ) );
rewards.push( new Square( 363.501, 645.196, 50, 50 ) );
rewards.push( new Square( 103.599, 632.107, 50, 50 ) );
rewards.push( new Square( 213.917, 433.909, 50, 50 ) );
rewards.push( new Square( 599.096, 430.169, 50, 50 ) );
rewards.push( new Square( 606.575, 703.16, 50, 50 ) );
rewards.push( new Square( 604.705, 916.316, 50, 50 ) );
rewards.push( new Square( 608.445, 1146.302, 50, 50 ) );
rewards.push( new Square( 720.633, 1340.76, 50, 50 ) );
rewards.push( new Square( 963.706, 1344.5, 50, 50 ) );
rewards.push( new Square( 1057.196, 1161.26, 50, 50 ) );
rewards.push( new Square( 1051.587, 871.441, 50, 50 ) );
rewards.push( new Square( 1049.717, 609.67, 50, 50 ) );
rewards.push( new Square( 956.227, 433.909, 50, 50 ) );
rewards.push( new Square( 804.773, 267.497, 50, 50 ) );
rewards.push( new Square( 591.617, 192.705, 50, 50 ) );
rewards.push( new Square( 357.892, 188.965, 50, 50 ) );
rewards.push( new Square( 75.552, 181.486, 50, 50 ) );

const carStartPoint = new Point( 100, 100 );
const carStartingRotation = 0;
const map1 = new Map( 2100, 1600, carStartPoint, carStartingRotation, walls, rewards );

const carCanvas = new Canvas( 'car-canvas', carImages, map1 );

// Module-global instance of policy network.
let policyNet;
let stopRequested = false;

/**
 * Display a message to the info div.
 *
 * @param {string} message The message to be displayed.
 */
function logStatus(message) {
  appStatus.textContent = message;
}

// Objects and functions to support display of car status during training.
let renderDuringTraining = true;
export async function maybeRenderDuringTraining(car) {
  if (renderDuringTraining) {
    renderCar(car, carCanvas);
    await tf.nextFrame();  // Unblock UI thread.
  }
}

/**
 * A function invoked at the end of every game during training.
 *
 * @param {number} gameCount A count of how many games has completed so far in
 *   the current iteration of training.
 * @param {number} totalGames Total number of games to complete in the current
 *   iteration of training.
 */
export function onGameEnd(gameCount, totalGames) {
  iterationStatus.textContent = `Game ${gameCount} of ${totalGames}`;
  iterationProgress.value = gameCount / totalGames * 100;
  if (gameCount === totalGames) {
    iterationStatus.textContent = 'Updating weights...';
  }
}

/**
 * A function invokved at the end of a training iteration.
 *
 * @param {number} iterationCount A count of how many iterations has completed
 *   so far in the current round of training.
 * @param {*} totalIterations Total number of iterations to complete in the
 *   current round of training.
 */
function onIterationEnd(iterationCount, totalIterations) {
  trainStatus.textContent = `Iteration ${iterationCount} of ${totalIterations}`;
  trainProgress.value = iterationCount / totalIterations * 100;
}

// Objects and function to support the plotting of game steps during training.
let meanStepValues = [];
function plotSteps() {
  tfvis.render.linechart(stepsContainer, {values: meanStepValues}, {
    xLabel: 'Training Iteration',
    yLabel: 'Mean Steps Per Game',
    width: 400,
    height: 300,
  });
}

function disableModelControls() {
  trainButton.textContent = 'Stop';
  testButton.disabled = true;
  deleteStoredModelButton.disabled = true;
}

function enableModelControls() {
  trainButton.textContent = 'Train';
  testButton.disabled = false;
  deleteStoredModelButton.disabled = false;
}

/**
 * Render the current state of the system on an HTML canvas.
 *
 * @param {Car} cartPole The instance of cart-pole system to render.
 * @param {HTMLCanvasElement} canvas The instance of HTMLCanvasElement on which
 *   the rendering will happen.
 */
function renderCar( car, canvas ) {
  canvas.clear();
  canvas.drawMap();
  let sensors = car.getSensors();
  for ( let sensor of sensors ) {
    canvas.drawSegment( sensor );
  }

  canvas.drawCar( car );
  for ( let intersection of car.sensorIntersections ) {
    canvas.drawPoint( intersection );
  }
}

async function updateUIControlState() {
  const modelInfo = await SaveablePolicyNetwork.checkStoredModelStatus();
  if (modelInfo == null) {
    storedModelStatusInput.value = 'No stored model.';
    deleteStoredModelButton.disabled = true;

  } else {
    storedModelStatusInput.value = `Saved@${modelInfo.dateSaved.toISOString()}`;
    deleteStoredModelButton.disabled = false;
    createModelButton.disabled = true;
  }
  createModelButton.disabled = policyNet != null;
  hiddenLayerSizesInput.disabled = policyNet != null;
  trainButton.disabled = policyNet == null;
  testButton.disabled = policyNet == null;
  renderDuringTrainingCheckbox.checked = renderDuringTraining;
}

export async function setUpUI() {
  const cartPole = new CartPole(true);

  if (await SaveablePolicyNetwork.checkStoredModelStatus() != null) {
    policyNet = await SaveablePolicyNetwork.loadModel();
    logStatus('Loaded policy network from IndexedDB.');
    hiddenLayerSizesInput.value = policyNet.hiddenLayerSizes();
  }
  await updateUIControlState();

  renderDuringTrainingCheckbox.addEventListener('change', () => {
    renderDuringTraining = renderDuringTrainingCheckbox.checked;
  });

  createModelButton.addEventListener('click', async () => {
    try {
      const hiddenLayerSizes =
          hiddenLayerSizesInput.value.trim().split(',').map(v => {
            const num = Number.parseInt(v.trim());
            if (!(num > 0)) {
              throw new Error(
                  `Invalid hidden layer sizes string: ` +
                  `${hiddenLayerSizesInput.value}`);
            }
            return num;
          });
      policyNet = new SaveablePolicyNetwork(hiddenLayerSizes);
      console.log('DONE constructing new instance of SaveablePolicyNetwork');
      await updateUIControlState();
    } catch (err) {
      logStatus(`ERROR: ${err.message}`);
    }
  });

  deleteStoredModelButton.addEventListener('click', async () => {
    if (confirm(`Are you sure you want to delete the locally-stored model?`)) {
      await policyNet.removeModel();
      policyNet = null;
      await updateUIControlState();
    }
  });

  trainButton.addEventListener('click', async () => {
    if (trainButton.textContent === 'Stop') {
      stopRequested = true;
    } else {
      disableModelControls();

      try {
        const trainIterations = Number.parseInt(numIterationsInput.value);
        if (!(trainIterations > 0)) {
          throw new Error(`Invalid number of iterations: ${trainIterations}`);
        }
        const gamesPerIteration = Number.parseInt(gamesPerIterationInput.value);
        if (!(gamesPerIteration > 0)) {
          throw new Error(
              `Invalid # of games per iterations: ${gamesPerIteration}`);
        }
        const maxStepsPerGame = Number.parseInt(maxStepsPerGameInput.value);
        if (!(maxStepsPerGame > 1)) {
          throw new Error(`Invalid max. steps per game: ${maxStepsPerGame}`);
        }
        const discountRate = Number.parseFloat(discountRateInput.value);
        if (!(discountRate > 0 && discountRate < 1)) {
          throw new Error(`Invalid discount rate: ${discountRate}`);
        }
        const learningRate = Number.parseFloat(learningRateInput.value);

        logStatus(
            'Training policy network... Please wait. ' +
            'Network is saved to IndexedDB at the end of each iteration.');
        const optimizer = tf.train.adam(learningRate);

        meanStepValues = [];
        onIterationEnd(0, trainIterations);
        let t0 = new Date().getTime();
        stopRequested = false;
        for (let i = 0; i < trainIterations; ++i) {
          const gameSteps = await policyNet.train(
              cartPole, optimizer, discountRate, gamesPerIteration,
              maxStepsPerGame);
          const t1 = new Date().getTime();
          const stepsPerSecond = sum(gameSteps) / ((t1 - t0) / 1e3);
          t0 = t1;
          trainSpeed.textContent = `${stepsPerSecond.toFixed(1)} steps/s`
          meanStepValues.push({x: i + 1, y: mean(gameSteps)});
          console.log(`# of tensors: ${tf.memory().numTensors}`);
          plotSteps();
          onIterationEnd(i + 1, trainIterations);
          await tf.nextFrame();  // Unblock UI thread.
          await policyNet.saveModel();
          await updateUIControlState();

          if (stopRequested) {
            logStatus('Training stopped by user.');
            break;
          }
        }
        if (!stopRequested) {
          logStatus('Training completed.');
        }
      } catch (err) {
        logStatus(`ERROR: ${err.message}`);
      }
      enableModelControls();
    }
  });

  testButton.addEventListener('click', async () => {
    disableModelControls();
    let isDone = false;
    const cartPole = new CartPole(true);
    cartPole.setRandomState();
    let steps = 0;
    stopRequested = false;
    while (!isDone) {
      steps++;
      tf.tidy(() => {
        const action = policyNet.getActions(cartPole.getStateTensor())[0];
        logStatus(
            `Test in progress. ` +
            `Action: ${action === 1 ? '<--' : ' -->'} (Step ${steps})`);
        isDone = cartPole.update(action);
        renderCar(cartPole, carCanvas);
      });
      await tf.nextFrame();  // Unblock UI thread.
      if (stopRequested) {
        break;
      }
    }
    if (stopRequested) {
      logStatus(`Test stopped by user after ${steps} step(s).`);
    } else {
      logStatus(`Test finished. Survived ${steps} step(s).`);
    }
    console.log(`# of tensors: ${tf.memory().numTensors}`);
    enableModelControls();
  });
}
