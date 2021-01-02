export class Car {
    constructor( imageId = 0 ) {
        this.x = 0;
        this.y = 0;
        this.rotation = Math.PI;
        this.maxSpeed = 10;
        this.maxSpeedReverse = -2;
        this.speed = 0;
        this.imageId = imageId;

        this.keys = {
            'left': 'a',
            'right': 'd',
            'forward': 'w',
            'back': 's',
        }

        this.pressedKeys = new Set();
        document.body.addEventListener( "keydown", ( e ) => {
            this.pressedKeys.add( e.key.toLowerCase() );
        } );

        document.body.addEventListener( "keyup", ( e ) => {
            this.pressedKeys.delete( e.key.toLowerCase() );
        } );
    }

    tick(progress) {
        this.turn();
        this.accelerate();
        this.move(progress);
    }

    move(progress) {
        progress /= 16;
        this.x += progress * this.speed * Math.cos(this.rotation);
        this.y += progress * this.speed * Math.sin(this.rotation);
    }

    turn() {
        if ( this.pressedKeys.has( this.keys['left'] ) ) {
            this.rotation -= 0.1;
        }
        if ( this.pressedKeys.has( this.keys['right'] ) ) {
            this.rotation += 0.1;
        }
    }

    accelerate() {
        if ( this.pressedKeys.has( this.keys['forward'] ) ) {
            this.speed = Math.min( this.speed + 0.1, this.maxSpeed );
        } else {
            this.speed = Math.max( this.speed - 0.05, 0 );
        }
        if ( this.pressedKeys.has( this.keys['back'] ) ) {
            this.speed = Math.max( this.speed - 0.1, this.maxSpeedReverse );
        }
    }
}
