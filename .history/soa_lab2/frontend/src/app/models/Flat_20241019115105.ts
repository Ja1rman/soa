import { Coordinates } from './Coordinates';
import { Furnish } from './Furnish';
import { House } from './House';
import { Transport } from './Transport';
import { View } from './View';

export class Flat {
    public id: number;
    public name: string;
    public coordinates: Coordinates;
    public creationDate: Date;
    public area: number;
    public numberOfRooms: number;
    public furnish?: Furnish;
    public view?: View;
    public transport: Transport;
    public house?: House;

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
