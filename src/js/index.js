import * as fs from 'fs';
import {Canvas} from './canvas';
import {Car} from './car';
import {Game} from './game';
import {Map} from './map';
import {Line} from './geometry';

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


/* Initialize map */
let walls = [];
walls.push( new Line( 50.639, 40.541, 858.084, 39.536, '#000', 5 ) );
walls.push( new Line( 49.556, 272.46, 50.639, 40.541, '#000', 5 ) );
walls.push( new Line( 858.084, 39.536, 1129.038, 316.826, '#000', 5 ) );
walls.push( new Line( 1129.038, 316.826, 1386.987, 50.628, '#000', 5 ) );
walls.push( new Line( 1386.987, 50.628, 2054.619, 50.628, '#000', 5 ) );
walls.push( new Line( 2054.619, 50.628, 2054.619, 1559.093, '#000', 5 ) );
walls.push( new Line( 2054.619, 1559.093, 1337.132, 824.825, '#000', 5 ) );
walls.push( new Line( 1337.132, 824.825, 1337.132, 585.244, '#000', 5 ) );
walls.push( new Line( 1337.132, 585.244, 1564.734, 585.244, '#000', 5 ) );
walls.push( new Line( 1564.734, 585.244, 1564.734, 315.011, '#000', 5 ) );
walls.push( new Line( 1564.734, 315.011, 1255.681, 596.523, '#000', 5 ) );
walls.push( new Line( 1255.681, 596.523, 1252.629, 1156.191, '#000', 5 ) );
walls.push( new Line( 1252.629, 1156.191, 1595.08, 1545.781, '#000', 5 ) );
walls.push( new Line( 1595.08, 1545.781, 49.556, 1543.563, '#000', 5 ) );
walls.push( new Line( 49.556, 1543.563, 49.556, 1033.347, '#000', 5 ) );
walls.push( new Line( 49.556, 1033.347, 327.013, 1033.347, '#000', 5 ) );
walls.push( new Line( 327.013, 1033.347, 327.013, 724.999, '#000', 5 ) );
walls.push( new Line( 327.013, 724.999, 60.394, 724.999, '#000', 5 ) );
walls.push( new Line( 58.948, 726.445, 60.394, 407.779, '#000', 5 ) );
walls.push( new Line( 60.394, 407.779, 696.651, 407.779, '#000', 5 ) );
walls.push( new Line( 697.679, 407.779, 695.151, 1314.771, '#000', 5 ) );
walls.push( new Line( 696.598, 1314.771, 1034.137, 1313.846, '#000', 5 ) );
walls.push( new Line( 1034.138, 1315.292, 1021.685, 584.239, '#000', 5 ) );
walls.push( new Line( 1020.238, 581.346, 721.313, 277.041, '#000', 5 ) );
walls.push( new Line( 721.313, 277.041, 49.556, 272.46, '#000', 5 ) );
walls.push( new Line( 158.205, 150.326, 775.249, 149.606, '#000', 5 ) );
walls.push( new Line( 775.249, 149.606, 1131.185, 536.286, '#000', 5 ) );
walls.push( new Line( 1131.185, 536.286, 1426.242, 219.732, '#000', 5 ) );
walls.push( new Line( 1426.242, 219.732, 1924.796, 218.487, '#000', 5 ) );
walls.push( new Line( 1924.796, 218.487, 1924.796, 1200.946, '#000', 5 ) );
walls.push( new Line( 1924.796, 1200.946, 1501.385, 777.536, '#000', 5 ) );
walls.push( new Line( 1501.385, 777.536, 1729.709, 777.536, '#000', 5 ) );
walls.push( new Line( 1729.709, 777.536, 1728.644, 218.5, '#000', 5 ) );
walls.push( new Line( 1130.977, 537.893, 1139.654, 1178.496, '#000', 5 ) );
walls.push( new Line( 1139.654, 1181.388, 1344.517, 1419.357, '#000', 5 ) );
walls.push( new Line( 1343.071, 1420.802, 185.61, 1423.456, '#000', 5 ) );
walls.push( new Line( 185.61, 1423.456, 187.138, 1169.748, '#000', 5 ) );
walls.push( new Line( 187.138, 1169.748, 451.123, 1166.696, '#000', 5 ) );
walls.push( new Line( 451.123, 1166.696, 452.563, 606.495, '#000', 5 ) );
walls.push( new Line( 452.563, 606.495, 176.318, 599.915, '#000', 5 ) );
walls.push( new Line( 176.318, 599.915, 182.888, 506.98, '#000', 5 ) );
walls.push( new Line( 182.897, 508.565, 574.315, 505.103, '#000', 5 ) );
walls.push( new Line( 574.315, 505.103, 575.032, 1425.41, '#000', 5 ) );

let map1 = new Map(2100, 1600, walls);

/* Main program */

function main() {
    let canvas = new Canvas( 'canvas', carImages, map1 );
    let game = new Game(canvas, map1);
    game.run();
}

// document.body.onkeydown = function ( ev ) {
//     // ev.preventDefault(); // cancels default actions
//     console.log(ev.key);
//     // return false; // cancels this function as well as default actions
// }

// document.body.addEventListener( "keydown", function ( ev ) {
//     // ev.preventDefault() // cancels default actions
//     console.log(ev.key);
//     // return false; // cancels this function only
// } );

setTimeout(() => {
    main();
}, 100);
