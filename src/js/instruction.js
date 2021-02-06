export class Instruction {
    constructor( instr = 0 ) {
        this.instr = instr;
    }

    static buildFromDictionary( dict ) {
        let result = 0;
        if ( dict.has( Instruction.keys['left'] ) ) {
            result |= Instruction.Left;
        }
        if ( dict.has( Instruction.keys['right'] ) ) {
            result |= Instruction.Right;
        }
        if ( dict.has( Instruction.keys['forward'] ) ) {
            result |= Instruction.Straight;
        }
        if ( dict.has( Instruction.keys['back'] ) ) {
            result |= Instruction.Back;
        }

        return result;
    }
}

Instruction.Left = 0b1;
Instruction.Right = 0b10;
Instruction.Straight = 0b100;
Instruction.Back = 0b1000;
Instruction.keys = {
    'left': 'a',
    'right': 'd',
    'forward': 'w',
    'back': 's',
}

Instruction.hasBack = function ( x ) {
    return Instruction.Back & x;
}

Instruction.hasLeft = function ( x ) {
    return Instruction.Left & x;
}

Instruction.hasRight = function ( x ) {
    return Instruction.Right & x;
}

Instruction.hasForward = function ( x ) {
    return Instruction.Straight & x;
}
