import { Coordinates } from './Coordinates';
import { Furnish } from './Furnish';
import { House } from './House';
import { Transport } from './Transport';
import { View } from './View';

export class Flat {
    public id: number;
    private name: string;
    private coordinates: Coordinates;
    private creationDate: Date;
    private area: number;
    private numberOfRooms: number;
    private furnish?: Furnish;
    private view?: View;
    private transport: Transport;
    private house?: House;

    constructor(
        id: number,
        name: string,
        coordinates: Coordinates,
        area: number,
        numberOfRooms: number,
        transport: Transport,
        creationDate: Date = new Date(),
        furnish?: Furnish,
        view?: View,
        house?: House
    ) {
        if (id === null || id <= 0) {
            throw new Error('ID must be greater than 0 and cannot be null');
        }
        if (!name || name.trim() === '') {
            throw new Error('Name cannot be null or empty');
        }
        if (!coordinates) {
            throw new Error('Coordinates cannot be null');
        }
        if (area <= 0 || area > 889) {
            throw new Error('Area must be greater than 0 and less than or equal to 889');
        }
        if (numberOfRooms <= 0 || numberOfRooms > 19) {
            throw new Error('Number of rooms must be greater than 0 and less than or equal to 19');
        }
        if (!transport) {
            throw new Error('Transport cannot be null');
        }

        this.id = id;
        this.name = name;
        this.coordinates = coordinates;
        this.creationDate = creationDate; // Генерируется автоматически
        this.area = area;
        this.numberOfRooms = numberOfRooms;
        this.furnish = furnish;
        this.view = view;
        this.transport = transport;
        this.house = house;
    }
}
