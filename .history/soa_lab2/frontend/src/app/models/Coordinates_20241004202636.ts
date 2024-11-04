export class Coordinates {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        if (x === null || x === undefined) {
            throw new Error('X cannot be null');
        }

        this.x = x;
        this.y = y;
    }
}
