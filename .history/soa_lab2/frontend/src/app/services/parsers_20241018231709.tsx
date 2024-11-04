import { Flat } from '../models/Flat';
import { Transport } from '../models/Transport';
import { Coordinates } from '../models/Coordinates';
import { Furnish } from '../models/Furnish';
import { View } from '../models/View';
import { House } from '../models/House';

import xml2js from 'xml2js';

const parseFlatsFromXml = async (xmlResponse: string): Promise<Flat[]> => {
  const parsedData = await xml2js.parseStringPromise(xmlResponse, { explicitArray: false });

  // Извлекаем данные о квартирах
  const flatsData = parsedData.Flats?.Flat || parsedData.Flat; // Проверяем наличие родительского тега

  // Если flatsData не определены, возвращаем пустой массив
  if (!flatsData) {
    return [];
  }

  // Проверяем, является ли flatsData массивом. Если нет, преобразуем в массив.
  const flatsArray = Array.isArray(flatsData) ? flatsData : [flatsData];

  return flatsArray.map((flatData: Flat) => new Flat(
    Number(flatData.id),
    flatData.name,
    new Coordinates(Number(flatData.coordinates.x), Number(flatData.coordinates.y)),
    Number(flatData.area),
    Number(flatData.numberOfRooms),
    flatData.transport as Transport,
    new Date(flatData.creationDate),
    flatData.furnish ? flatData.furnish as Furnish : undefined,
    flatData.view ? flatData.view as View : undefined,
    flatData.house ? new House(Number(flatData.house.numberOfFloors), Number(flatData.house.numberOfLifts), flatData.house.name, Number(flatData.house.year)) : undefined
  ));
};


const parseFlatFromXml = (xmlResponse: string): Flat => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');

  const flat: Flat = {
    id: parseInt(xmlDoc.getElementsByTagName('id')[0].textContent || '0'),
    name: xmlDoc.getElementsByTagName('name')[0].textContent || '',
    coordinates: {
      x: parseFloat(xmlDoc.getElementsByTagName('x')[0].textContent || '0'),
      y: parseFloat(xmlDoc.getElementsByTagName('y')[0].textContent || '0'),
    },
    creationDate: new Date(xmlDoc.getElementsByTagName('creationDate')[0].textContent || ''),
    area: parseFloat(xmlDoc.getElementsByTagName('area')[0].textContent || '0'),
    numberOfRooms: parseInt(xmlDoc.getElementsByTagName('numberOfRooms')[0].textContent || '0'),
    furnish: xmlDoc.getElementsByTagName('furnish')[0].textContent as Furnish,
    view: xmlDoc.getElementsByTagName('view')[0].textContent as View,
    transport: xmlDoc.getElementsByTagName('transport')[0].textContent as Transport,
    house: {
      name: xmlDoc.getElementsByTagName('house')[0].getElementsByTagName('name')[0].textContent || '',
      year: parseInt(xmlDoc.getElementsByTagName('house')[0].getElementsByTagName('year')[0].textContent || '0'),
      numberOfFloors: parseInt(xmlDoc.getElementsByTagName('house')[0].getElementsByTagName('numberOfFloors')[0].textContent || '0'),
      numberOfLifts: parseInt(xmlDoc.getElementsByTagName('house')[0].getElementsByTagName('numberOfLifts')[0].textContent || '0'),
    },
  };

  return flat;
};
export default parseFlatFromXml, parseFlatsFromXml;
