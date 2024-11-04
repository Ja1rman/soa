import { Color } from './Color';
import { Country } from './Country';

export class Person {
  private name: string;
  private height: number;
  private eyeColor?: Color;
  private hairColor?: Color;
  private nationality: Country;

  constructor(
    name: string,
    height: number,
    nationality: Country,
    eyeColor?: Color,
    hairColor?: Color
  ) {
    if (!name || name.trim() === '') {
      throw new Error('Name cannot be null or empty');
    }
    if (height <= 0) {
      throw new Error('Height must be greater than 0');
    }
    if (!nationality) {
      throw new Error('Nationality cannot be null');
    }

    this.name = name;
    this.height = height;
    this.eyeColor = eyeColor;
    this.hairColor = hairColor;
    this.nationality = nationality;
  }
}
