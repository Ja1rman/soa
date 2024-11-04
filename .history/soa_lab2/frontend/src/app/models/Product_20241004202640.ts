import { Coordinates } from './Coordinates';
import { UnitOfMeasure } from './UnitOfMeasure';
import { Person } from './Person';

export class Product {
    private id: number;
    private name: string;
    private coordinates: Coordinates;
    private creationDate: Date;
    private price?: number;
    private manufactureCost?: number;
    private unitOfMeasure: UnitOfMeasure;
    private owner?: Person;

    constructor(
        id: number,
        name: string,
        coordinates: Coordinates,
        unitOfMeasure: UnitOfMeasure,
        creationDate: Date = new Date(),
        price?: number,
        manufactureCost?: number,
        owner?: Person
    ) {
        if (id <= 0) {
            throw new Error('ID must be greater than 0');
        }
        if (!name || name.trim() === '') {
            throw new Error('Name cannot be null or empty');
        }
        if (!coordinates) {
            throw new Error('Coordinates cannot be null');
        }
        if (!unitOfMeasure) {
            throw new Error('UnitOfMeasure cannot be null');
        }
        if (price !== undefined && price <= 0) {
            throw new Error('Price must be greater than 0 if provided');
        }

        this.id = id;
        this.name = name;
        this.coordinates = coordinates;
        this.creationDate = creationDate; // автоматически генерируется
        this.price = price;
        this.manufactureCost = manufactureCost;
        this.unitOfMeasure = unitOfMeasure;
        this.owner = owner;
    }
}
