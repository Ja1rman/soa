'use client';
import { useEffect, useState } from 'react';

import { Flat } from './models/Flat';
import { Transport } from './models/Transport';
import { Coordinates } from './models/Coordinates';
import { Furnish } from './models/Furnish';
import { View } from './models/View';
import { House } from './models/House';
import xml2js from 'xml2js';

const API_URL = 'http://89.169.129.229:8080/flat-management/flats';

const fetchFlats = async (): Promise<Flat[]> => {
  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch flats data');
  }
  const xmlText = await response.text();
  const parsedData = await xml2js.parseStringPromise(xmlText, { explicitArray: false });
  console.log(parsedData);
  return parsedData.Flats.Flat.map((flatData: Flat) => new Flat(
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

const FlatsTable: React.FC = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlats = async () => {
      try {
        const fetchedFlats = await fetchFlats();
        setFlats(fetchedFlats);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    loadFlats();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (flats.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <table border={1}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Coordinates</th>
          <th>Creation Date</th>
          <th>Area</th>
          <th>Number of Rooms</th>
          <th>Furnish</th>
          <th>View</th>
          <th>Transport</th>
          <th>House</th>
        </tr>
      </thead>
      <tbody>
        {flats.map((flat) => (
          <tr key={flat.id}>
            <td>{flat.id}</td>
            <td>{flat.name}</td>
            <td>{flat.coordinates.x}, {flat.coordinates.y}</td>
            <td>{flat.creationDate.toString}</td>
            <td>{flat.area}</td>
            <td>{flat.numberOfRooms}</td>
            <td>{flat.furnish || 'None'}</td>
            <td>{flat.view || 'None'}</td>
            <td>{flat.transport}</td>
            <td>{flat.house ? `${flat.house.name} (${flat.house.numberOfFloors} floors, ${flat.house.numberOfLifts} lifts)` : 'None'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FlatsTable;
