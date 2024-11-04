export class House {
    public name?: string;
    public year?: number;
    public numberOfFloors: number;
    public numberOfLifts: number;

    constructor(
        numberOfFloors: number,
        numberOfLifts: number,
        name?: string,
        year?: number
    ) {
        if (year !== undefined && year <= 0) {
            throw new Error('Year must be greater than 0 if provided');
        }
        if (numberOfFloors <= 0 || numberOfFloors > 39) {
            throw new Error('Number of floors must be greater than 0 and less than or equal to 39');
        }
        if (numberOfLifts <= 0) {
            throw new Error('Number of lifts must be greater than 0');
        }

        this.name = name;
        this.year = year;
        this.numberOfFloors = numberOfFloors;
        this.numberOfLifts = numberOfLifts;
    }
}
