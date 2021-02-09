# Autonomous Car using Tensorflow JS Reinforcement Learning

![](https://i.imgur.com/OfOOGx9.png)

Autonomous car in the browser, built with JS and Tensorflow. The preview uses an HTML Canvas.

A Reinforcement learning algorithm is used to train a model, which can drive a car around a given track.

The specific algorithm used is a Deep Q-Network from Tensorflow, together with an Epsilon greedy algorithm.

## Training the Deep Q-Network in Node.js
To train the DQN, use command:

```sh
yarn
yarn train
```

If you have a CUDA-enabled GPU installed on your system, along with all the required drivers and libraries, append the --gpu flag to the command above to let use the GPU for training, which will lead to a significant increase in the training speed:

```sh
yarn train --gpu
```

To monitor the training progress using TensorBoard, use the --logDir flag and point it to a log directory, e.g.,

```sh
yarn train --logDir /tmp/logs
```

During the training, you can use TensorBoard to visualize the curves of

- Cumulative reward values from the games
- Training speed (game frames per second)
- Value of the epsilon from the epsilon-greedy algorithm and so forth.

Specifically, open a separate terminal. In the terminal, install tensorboard and launch the backend server of tensorboard:

```sh
pip install tensorboard
tensorboard --logdir /tmp/logs
```

Once started, the tensorboard backend process will print an http:// URL to the console. Open your browser and navigate to the URL to see the logged curves.

## Running the demo in the browser
After the DQN training completes, you can use the following command to launch a demo that shows how the network plays the game in the browser:

```sh
yarn && yarn watch
```

## Credits

The frontend page is based on [tfjs examples](https://github.com/tensorflow/tfjs-examples)

The car images are from [opengameart](https://opengameart.org/content/cars-2d-top-down)

An [article](https://towardsdatascience.com/deep-q-learning-tutorial-mindqn-2a4c855abffc) explaining the usage of DQN + Epsilon greedy by Mike Wang.

The game architecture is based on this [article](https://www.sitepoint.com/quick-tip-game-loop-in-javascript/) by Mike Brown.
