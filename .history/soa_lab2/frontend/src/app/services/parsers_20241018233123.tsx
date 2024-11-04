import { Flat } from '../models/Flat';
import { Transport } from '../models/Transport';
import { Coordinates } from '../models/Coordinates';
import { Furnish } from '../models/Furnish';
import { View } from '../models/View';
import { House } from '../models/House';

import xml2js from 'xml2js';

export async function parseFlatsFromXml(xmlResponse: string): Promise<Flat[]> {
  const parsedData = await xml2js.parseStringPromise(xmlResponse, { explicitArray: false });

  // Извлекаем данные о квартирах
  const flatsData = parsedData.Flats?.Flat || parsedData.Flat; // Проверяем наличие родительского тега

  // Если flatsData не определены, возвращаем пустой массив
  if (!flatsData) {
    return [];
  }

  // Проверяем, является ли flatsData массивом. Если нет, преобразуем в массив.
  const flatsArray = Array.isArray(flatsData) ? flatsData : [flatsData];

  return flatsArray.map(flatData => parseFlatData(flatData));
}

export function parseFlatFromXml(xmlResponse: string): Flat {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
  const flatData = xmlDoc.getElementsByTagName('Flat')[0];

  return parseFlatData(flatData);
}

// Общая функция для парсинга данных квартиры
function parseFlatData(flatData: any): Flat {
  const houseData = flatData.getElementsByTagName('house')[0];

  return new Flat(
    Number(flatData.getElementsByTagName('id')[0]?.textContent || '0'),
    flatData.getElementsByTagName('name')[0]?.textContent || '',
    new Coordinates(
      Number(flatData.getElementsByTagName('x')[0]?.textContent || '0'),
      Number(flatData.getElementsByTagName('y')[0]?.textContent || '0')
    ),
    Number(flatData.getElementsByTagName('area')[0]?.textContent || '0'),
    Number(flatData.getElementsByTagName('numberOfRooms')[0]?.textContent || '0'),
    flatData.getElementsByTagName('transport')[0]?.textContent as Transport,
    new Date(flatData.getElementsByTagName('creationDate')[0]?.textContent || ''),
    flatData.getElementsByTagName('furnish')[0]?.textContent as Furnish || undefined,
    flatData.getElementsByTagName('view')[0]?.textContent as View || undefined,
    houseData ? new House(
      Number(houseData.getElementsByTagName('numberOfFloors')[0]?.textContent || '0'),
      Number(houseData.getElementsByTagName('numberOfLifts')[0]?.textContent || '0'),
      houseData.getElementsByTagName('name')[0]?.textContent || '',
      Number(houseData.getElementsByTagName('year')[0]?.textContent || '0')
    ) : undefined
  );
}
