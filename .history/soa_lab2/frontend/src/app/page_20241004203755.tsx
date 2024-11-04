import { useEffect, useState } from 'react';
import { Flat } from './models/Flat';
import { Transport } from './models/Transport';
import { Coordinates } from './models/Coordinates';
import { Furnish } from './models/Furnish';
import { View } from './models/View';
import { House } from './models/House';

const API_URL = 'http://89.169.129.229:8080/flat-management/flats';

const fetchFlats = async (): Promise<Flat[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch flats data');
  }
  const data = await response.json();
  return data.map((flatData: any) => new Flat(
    flatData.id,
    flatData.name,
    new Coordinates(flatData.coordinates.x, flatData.coordinates.y),
    flatData.area,
    flatData.numberOfRooms,
    flatData.transport as Transport,
    new Date(flatData.creationDate),
    flatData.furnish as Furnish,
    flatData.view as View,
    flatData.house ? new House(flatData.house.name, flatData.house.year, flatData.house.numberOfFloors, flatData.house.numberOfLifts) : undefined
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
        setError(err.message);
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
