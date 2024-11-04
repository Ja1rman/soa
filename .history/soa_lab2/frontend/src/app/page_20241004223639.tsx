'use client';
import { useEffect, useState } from 'react';

import { Flat } from './models/Flat';
import { Transport } from './models/Transport';
import { Coordinates } from './models/Coordinates';
import { Furnish } from './models/Furnish';
import { View } from './models/View';
import { House } from './models/House';
import xml2js from 'xml2js';

const API_URL = 'https://89.169.129.229';

const fetchFlats = async (page: number): Promise<Flat[]> => {
  const response = await fetch(API_URL + `/flat-management/flats?page=${page}`, {
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingFlat, setEditingFlat] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Flat | null>(null);

  const handleEditClick = (flat: Flat) => {
    setEditingFlat(flat.id);
    setEditFormData(flat);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };
  const handleSave = async () => {
    if (editFormData) {
      try {
        const xmlData = `
          <Flat>
            <name>${editFormData.name}</name>
            <coordinates>
              <x>${editFormData.coordinates.x}</x>
              <y>${editFormData.coordinates.y}</y>
            </coordinates>
            <creationDate>${editFormData.creationDate.toISOString()}</creationDate>
            <area>${editFormData.area}</area>
            <numberOfRooms>${editFormData.numberOfRooms}</numberOfRooms>
            <furnish>${editFormData.furnish || ''}</furnish>
            <view>${editFormData.view || ''}</view>
            <transport>${editFormData.transport}</transport>
            <house>
              <name>${editFormData.house?.name || ''}</name>
              <year>${editFormData.house?.year || ''}</year>
              <numberOfFloors>${editFormData.house?.numberOfFloors}</numberOfFloors>
              <numberOfLifts>${editFormData.house?.numberOfLifts}</numberOfLifts>
            </house>
          </Flat>
        `;
  
        const response = await fetch(API_URL + `/flat-management//flats/${editFormData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/xml', 
          },
          body: xmlData,
        });
  
        if (response.ok) {
          const xmlResponse = await response.text(); // Получение текста ответа

        // Парсинг XML-ответа
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');

        // Извлечение данных из парсинга
        const updatedFlat: Flat = {
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
          setFlats((prevFlats) =>
            prevFlats.map((flat) => (flat.id === updatedFlat.id ? updatedFlat : flat))
          );
          setEditingFlat(null);
          setEditFormData(null);
        } else {
          alert('Failed to update flat.');
        }
      } catch (error) {
        console.error('Error updating flat:', error);
      }
    }
  };
  
  const handleDelete = async (flatId: number) => {
    try {
      const response = await fetch(`${API_URL}/flat-management/flats/${flatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlats(flats.filter((flat) => flat.id !== flatId));
        alert('Flat deleted successfully!');
      } else {
        alert('Failed to delete flat.');
      }
    } catch (error) {
      console.error('Error deleting flat:', error);
    }
  };

  useEffect(() => {
    const loadFlats = async () => {
      try {
        const fetchedFlats = await fetchFlats(currentPage);
        setFlats(fetchedFlats);
        setTotalPages(10);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    loadFlats();
  }, [currentPage]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (flats.length === 0) {
    return <p>Loading...</p>;
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editFormData?.name || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.name
                )}
              </td>
              <td>
                <table className="nested-table">
                  <thead>
                    <tr>
                      <th>X</th>
                      <th>Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {editingFlat === flat.id ? (
                          <input
                            type="number"
                            name="coordinates.x"
                            value={editFormData?.coordinates.x || 0}
                            onChange={handleInputChange}
                          />
                        ) : (
                          flat.coordinates.x
                        )}
                      </td>
                      <td>
                        {editingFlat === flat.id ? (
                          <input
                            type="number"
                            name="coordinates.y"
                            value={editFormData?.coordinates.y || 0}
                            onChange={handleInputChange}
                          />
                        ) : (
                          flat.coordinates.y
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td>{flat.creationDate.toLocaleString()}</td>
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="number"
                    name="area"
                    value={editFormData?.area || 0}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.area
                )}
              </td>
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="number"
                    name="numberOfRooms"
                    value={editFormData?.numberOfRooms || 0}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.numberOfRooms
                )}
              </td>
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="text"
                    name="furnish"
                    value={editFormData?.furnish || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.furnish || 'None'
                )}
              </td>
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="text"
                    name="view"
                    value={editFormData?.view || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.view || 'None'
                )}
              </td>
              <td>
                {editingFlat === flat.id ? (
                  <input
                    type="text"
                    name="transport"
                    value={editFormData?.transport || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  flat.transport
                )}
              </td>
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
                        <td>
                          {editingFlat === flat.id ? (
                            <input
                              type="text"
                              name="house.name"
                              value={editFormData?.house?.name || ''}
                              onChange={handleInputChange}
                            />
                          ) : (
                            flat.house.name || 'Unknown'
                          )}
                        </td>
                        <td>
                          {editingFlat === flat.id ? (
                            <input
                              type="number"
                              name="house.numberOfFloors"
                              value={editFormData?.house?.numberOfFloors || 0}
                              onChange={handleInputChange}
                            />
                          ) : (
                            flat.house.numberOfFloors
                          )}
                        </td>
                        <td>
                          {editingFlat === flat.id ? (
                            <input
                              type="number"
                              name="house.numberOfLifts"
                              value={editFormData?.house?.numberOfLifts || 0}
                              onChange={handleInputChange}
                            />
                          ) : (
                            flat.house.numberOfLifts
                          )}
                        </td>
                        <td>
                          {editingFlat === flat.id ? (
                            <input
                              type="number"
                              name="house.year"
                              value={editFormData?.house?.year || 0}
                              onChange={handleInputChange}
                            />
                          ) : (
                            flat.house.year || 'Unknown'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  'None'
                )}
              </td>
              <td>
                {editingFlat === flat.id ? (
                  <button onClick={handleSave}>Save</button>
                ) : (
                  <>
                    <button onClick={() => handleEditClick(flat)}>Edit</button>
                    <button onClick={() => handleDelete(flat.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>

  );
};

export default FlatsTable;
