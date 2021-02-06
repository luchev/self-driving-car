#!/usr/bin/env bash

NODE_ENV=development
yarn
echo Starting the server...
# mkdir -p dist && cp -r models/dqn dist/dqn
node_modules/parcel-bundler/bin/cli.js serve src/index.html -d dist --open --no-hmr --public-url / -p 3000
kill $HTTP_SERVER_PID
