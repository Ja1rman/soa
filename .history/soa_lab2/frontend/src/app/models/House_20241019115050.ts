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
       

        this.name = name;
        this.year = year;
        this.numberOfFloors = numberOfFloors;
        this.numberOfLifts = numberOfLifts;
    }
}
