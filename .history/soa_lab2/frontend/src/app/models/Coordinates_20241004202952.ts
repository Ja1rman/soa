export class Coordinates {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        if (x <= -143) {
            throw new Error('X must be greater than -143');
        }
        if (y <= -903) {
            throw new Error('Y must be greater than -903');
        }

        this.x = x;
        this.y = y;
    }
}
