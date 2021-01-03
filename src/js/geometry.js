export class Point {
    constructor( x = 0, y = 0, color = '#000') {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

export class Ray {
    static getPointFromOrigin( x, y, rotation, distance ) {
        let xUnit = Math.cos( rotation );
        let yUnit = Math.sin( rotation );
        return new Point(x + xUnit * distance, y + yUnit * distance);
    }
}

export class Line {
    constructor(x1, y1, x2, y2, color='#000', width=1) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.width = width;
    }

    intersect(line2) {
        let denom = ( line2.y2 - line2.y1 ) * ( this.x2 - line2.x1 ) - ( line2.x2 - line2.x1 ) * ( this.y2 - this.y1 );
        if ( denom == 0 ) {
            return null;
        }
        let ua = ( ( line2.x2 - line2.x1 ) * ( this.y1 - line2.y1 ) - ( line2.y2 - line2.y1 ) * ( this.x1 - line2.x1 ) ) / denom;
        let ub = ( ( this.x2 - this.x1 ) * ( this.y1 - line2.y1 ) - ( this.y2 - this.y1 ) * ( this.x1 - line2.x1 ) ) / denom;
        return new Point( this.x1 + ua * ( this.x2 - this.x1 ), this.y1 + ua * ( this.y2 - this.y1 ) );
    }
}
