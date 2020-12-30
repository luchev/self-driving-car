import * as fs from 'fs';
import {Canvas} from './canvas';
import {Car} from './car';

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


/* Main program */

function main() {
    let canvas = new Canvas( 'canvas', carImages, trackImages );
    let car = new Car( 0 );
    canvas.drawTrack( 0 );
    canvas.drawCar( car );

    
}

document.body.onkeydown = function ( ev ) {
    // ev.preventDefault(); // cancels default actions
    console.log(ev.key);
    // return false; // cancels this function as well as default actions
}

document.body.addEventListener( "keydown", function ( ev ) {
    // ev.preventDefault() // cancels default actions
    console.log(ev.key);
    // return false; // cancels this function only
} );

setTimeout(() => {
    main();
}, 100);
