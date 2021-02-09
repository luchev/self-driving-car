import * as tf from '@tensorflow/tfjs';

export function createDeepQNetwork( numInputs, numActions ) {
  if ( !( Number.isInteger( numActions ) && numActions > 1 ) ) {
    throw new Error(
      `Expected numActions to be a integer greater than 1, ` +
      `but got ${numActions}` );
  }
  if ( !( Number.isInteger( numInputs ) && numInputs > 1 ) ) {
    throw new Error(
      `Expected numInputs to be a integer greater than 1, ` +
      `but got ${numInputs}` );
  }

  const model = tf.sequential();
  model.add( tf.layers.conv1d( {
    filters: 128,
    kernelSize: 3,
    strides: 1,
    activation: 'relu',
    inputShape: [numInputs, 1]
  } ) );
  model.add( tf.layers.batchNormalization() );
  model.add( tf.layers.conv1d( {
    filters: 256,
    kernelSize: 3,
    strides: 1,
    activation: 'relu'
  } ) );
  model.add( tf.layers.batchNormalization() );
  model.add( tf.layers.conv1d( {
    filters: 256,
    kernelSize: 3,
    strides: 1,
    activation: 'relu'
  } ) );
  model.add( tf.layers.flatten() );
  model.add( tf.layers.dense( {units: 100, activation: 'relu'} ) );
  model.add( tf.layers.dropout( {rate: 0.25} ) );
  model.add( tf.layers.dense( {units: numActions} ) );

  return model;
}

/**
 * Copy the weights from a source deep-Q network to another.
 *
 * @param {tf.LayersModel} destNetwork The destination network of weight
 *   copying.
 * @param {tf.LayersModel} srcNetwork The source network for weight copying.
 */
export function copyWeights( destNetwork, srcNetwork ) {
  let originalDestNetworkTrainable;
  if ( destNetwork.trainable !== srcNetwork.trainable ) {
    originalDestNetworkTrainable = destNetwork.trainable;
    destNetwork.trainable = srcNetwork.trainable;
  }

  destNetwork.setWeights( srcNetwork.getWeights() );

  if ( originalDestNetworkTrainable != null ) {
    destNetwork.trainable = originalDestNetworkTrainable;
  }
}
