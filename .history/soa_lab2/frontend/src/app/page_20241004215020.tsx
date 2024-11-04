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
  const [flats, setFlats] = useState(initialFlats); // Состояние для хранения данных о квартирах
  const [editingFlat, setEditingFlat] = useState(null); // Состояние для редактируемой квартиры
  const [editFormData, setEditFormData] = useState({}); // Состояние для данных редактируемой квартиры

  const handleEditClick = (flat) => {
    setEditingFlat(flat.id);
    setEditFormData(flat); // Устанавливаем данные для редактирования
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value }); // Обновляем данные в форме
  };
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

  const handleEdit = async (flatId: number) => {
    // Реализуйте логику для редактирования
    const updatedFlat = { /* соберите данные для обновления */ };

    try {
      const response = await fetch(`/api/flats/${flatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFlat),
      });

      if (response.ok) {
        // Обновите состояние или перезагрузите данные
        alert('Flat updated successfully!');
      } else {
        alert('Failed to update flat.');
      }
    } catch (error) {
      console.error('Error updating flat:', error);
    }
  };

  const handleDelete = async (flatId: number) => {
    try {
      const response = await fetch(`/api/flats/${flatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Обновите состояние или перезагрузите данные
        alert('Flat deleted successfully!');
      } else {
        alert('Failed to delete flat.');
      }
    } catch (error) {
      console.error('Error deleting flat:', error);
    }
  };

  return (
    <div>
      <style jsx>{`
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 1em;
    text-align: left;
  }
  th, td {
    padding: 12px 15px;
    border: 1px solid #dddddd;
  }
  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  .nested-table {
    width: 100%;
    border-collapse: collapse;
  }
  .nested-table th, .nested-table td {
    padding: 8px 10px;
    border: 1px solid #cccccc;
  }
  .nested-table th {
    background-color: #eaeaea;
  }
`}</style>

      <table>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flats.map((flat) => (
            <tr key={flat.id}>
              <td>{flat.id}</td>
              <td>{flat.name}</td>
              <td>
                {flat.coordinates ? (
                  <table className="nested-table">
                    <thead>
                      <tr>
                        <th>X</th>
                        <th>Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{flat.coordinates.x}</td>
                        <td>{flat.coordinates.y}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : 'Unknown'}
              </td>
              <td>{flat.creationDate.toLocaleString()}</td>
              <td>{flat.area}</td>
              <td>{flat.numberOfRooms}</td>
              <td>{flat.furnish || 'None'}</td>
              <td>{flat.view || 'None'}</td>
              <td>{flat.transport}</td>
              <td>
                {flat.house ? (
                  <table className="nested-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Number of Floors</th>
                        <th>Number of Lifts</th>
                        <th>Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{flat.house.name || 'Unknown'}</td>
                        <td>{flat.house.numberOfFloors}</td>
                        <td>{flat.house.numberOfLifts}</td>
                        <td>{flat.house.year || 'Unknown'}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : 'None'}
              </td>
              <td>
                <button onClick={() => handleEdit(flat.id)}>Edit</button>
                <button onClick={() => handleDelete(flat.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default FlatsTable;
