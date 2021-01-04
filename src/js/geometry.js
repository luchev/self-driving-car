export class Point {
    constructor( x = 0, y = 0, color = '#000', width = 1 ) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = width;
    }

    squaredDistanceTo( point ) {
        return Math.pow( this.x - point.x, 2 ) + Math.pow( this.y - point.y, 2 );
    }

    squaredDistanceTo( x, y ) {
        return Math.pow( this.x - x, 2 ) + Math.pow( this.y - y, 2 );
    }

    static distanceSquaredBetween( x1, y1, x2, y2 ) {
        return Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 );
    }
}

export class Ray {
    static getPointFromOrigin( x, y, rotation, distance ) {
        let xUnit = Math.cos( rotation );
        let yUnit = Math.sin( rotation );
        return new Point( x + xUnit * distance, y + yUnit * distance );
    }
}

export class Line {
    constructor( x1, y1, x2, y2, color = '#000', width = 1 ) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.width = width;
    }

    intersect( line2 ) {
        let denom = ( line2.y2 - line2.y1 ) * ( this.x2 - line2.x1 ) - ( line2.x2 - line2.x1 ) * ( this.y2 - this.y1 );
        if ( denom == 0 ) {
            return null;
        }
        let ua = ( ( line2.x2 - line2.x1 ) * ( this.y1 - line2.y1 ) - ( line2.y2 - line2.y1 ) * ( this.x1 - line2.x1 ) ) / denom;
        return new Point( this.x1 + ua * ( this.x2 - this.x1 ), this.y1 + ua * ( this.y2 - this.y1 ) );
    }
}

export class Segment extends Line {
    constructor( x1, y1, x2, y2, color = '#000', width = 1 ) {
        super( x1, y1, x2, y2, color, width );
        if ( this.x1 < this.x2 ) {
            [this.x1, this.x2] = [this.x2, this.x1];
            [this.y1, this.y2] = [this.y2, this.y1];
        }
    }

    intersectSegment( segment ) {
        // http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
        let denominator = ( ( segment.y2 - segment.y1 ) * ( this.x2 - this.x1 ) ) - ( ( segment.x2 - segment.x1 ) * ( this.y2 - this.y1 ) );
        if ( denominator == 0 ) {
            return null;
        }

        let a = this.y1 - segment.y1;
        let b = this.x1 - segment.x1;
        let numerator1 = ( ( segment.x2 - segment.x1 ) * a ) - ( ( segment.y2 - segment.y1 ) * b );
        let numerator2 = ( ( this.x2 - this.x1 ) * a ) - ( ( this.y2 - this.y1 ) * b );
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        if ( a > 0 && a < 1 && b > 0 && b < 1 ) {
            let x = this.x1 + ( a * ( this.x2 - this.x1 ) );
            let y = this.y1 + ( a * ( this.y2 - this.y1 ) );
            return new Point( x, y );
        }

        return null;
    };
}

export class Square {
    constructor( x, y, width, height, color = '#ffd700' ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.center = new Point( this.x + this.width / 2, this.y + this.height / 2 );
        this.color = color;
    }
}
