'use client';
import { useEffect, useState } from 'react';

import { Flat } from './models/Flat';
import { Transport } from './models/Transport';
import { Furnish } from './models/Furnish';
import { View } from './models/View';
import MoneyBalconyFilter from './filters/MoneyBalconyFilter';
import './Flat.css';

import { parseFlatsFromXml, parseFlatFromXml } from './services/parsers';

const API_URL = 'https://89.169.129.229';
const API_URL2 = 'https://89.169.129.229:444';


const fetchFlats = async (page: number, sortFields: string, filterFields: string): Promise<Flat[]> => {
  let filter = '';
  if (filterFields !== 'none') {
    filter = `&filter=${filterFields}`;
  }
  const response = await fetch(API_URL + `/flat-management/flats?page=${page}&sort=${sortFields}` + filter, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch flats data');
  }
  const xmlResponse = await response.text();
  return parseFlatsFromXml(xmlResponse);
};

const FlatsTable: React.FC = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingFlat, setEditingFlat] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Flat | null>(null);
  const [maxFurnish, setMaxFurnish] = useState<Furnish | ''>('');
  const [showMinCoordinates, setShowMinCoordinates] = useState(false);
  const [addFurnish, setAddFurnish] = useState<Furnish | undefined>(undefined);
  const [addView, setAddView] = useState<View | undefined>(undefined);
  const [addTransport, setAddTransport] = useState<Transport | Transport.NONE>(Transport.NONE);
  const [name, setName] = useState('');
  const [x, setX] = useState<number>();
  const [y, setY] = useState<number>();
  const [area, setArea] = useState<number>();
  const [numberOfRooms, setNumberOfRooms] = useState<number>();
  const [houseName, setHouseName] = useState('');
  const [houseYear, setHouseYear] = useState<number>();
  const [numberOfFloors, setNumberOfFloors] = useState<number>();
  const [numberOfLifts, setNumberOfLifts] = useState<number>();
  const [minRooms, setMinRooms] = useState<number>(); // начальное значение для minRooms
  const [roomCount, setRoomCount] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [sortFieldsField, setSortFieldsField] = useState('')
  const [sortFields, setSortFields] = useState('id');
  const [filterFieldsField, setFilterFieldsField] = useState('')
  const [filterFields, setFilterFields] = useState('none');

  const handleFilterFields = async () => {
    setFilterFields(filterFieldsField);
  }

  const handleSortFields = async () => {
    setSortFields(sortFieldsField);
  }
  const handleFetchTotalCost = async () => {
    try {
      const response = await fetch(API_URL2 + `/agency/get-total-cost`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const xmlText = await response.text();

      // Парсинг XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const totalCostElement = xmlDoc.getElementsByTagName('number')[0];

      if (totalCostElement && totalCostElement.textContent) {
        setTotalCost(parseFloat(totalCostElement.textContent));
      } else {
        throw new Error('Невозможно извлечь данные из XML');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchRoomCount = async () => {
    try {
      const response = await fetch(API_URL + `/flat-management/flats/number-of-rooms?minRooms=${minRooms}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const xmlText = await response.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const numberElement = xmlDoc.getElementsByTagName('number')[0];

      if (numberElement && numberElement.textContent) {
        setRoomCount(parseInt(numberElement.textContent, 10));
      } else {
        throw new Error('Невозможно извлечь данные из XML');
      }
    } catch (err) {
      alert(err);
    }
  };
  const handleMoneyBalconyFilter = async (cheapest: string, withBalcony: string) => {
    try {
      const response = await fetch(API_URL2 + `/agency/find-with-balcony/${cheapest}/${withBalcony}`);
      const xmlResponse = await response.text();

      const parsedFlats: Flat[] = [await parseFlatFromXml(xmlResponse)];
      setFlats(parsedFlats);
    } catch (err) {
      alert(`Error fetching filtered flats: ${err}`);
    }
  };

  const fetchFlatsWithFurnishLessThan = async () => {
    try {
      const response = await fetch(API_URL + `/flat-management/flats/furnish-less-than?maxFurnish=${maxFurnish}`);
      const xmlResponse = await response.text();
      const parsedFlats: Flat[] = await parseFlatsFromXml(xmlResponse);

      setFlats(parsedFlats);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleFilterClick = () => {
    if (maxFurnish) {
      fetchFlatsWithFurnishLessThan();
    }
  };

  const handleEditClick = (flat: Flat) => {
    setEditingFlat(flat.id);
    setEditFormData(flat);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (editFormData) {
      const fieldPath = name.split('.'); // Разделяем имя на части, например, 'coordinates.x'
      if (fieldPath.length === 2) {
        const [parentField, childField] = fieldPath;
        setEditFormData({
          ...editFormData,
          [parentField]: {
            ...(editFormData as any)[parentField], // Сохраняем остальные поля объекта
            [childField]: isNaN(+value) ? value : +value, // Обновляем конкретное вложенное поле
          },
        });
      } else {
        setEditFormData({
          ...editFormData,
          [name]: isNaN(+value) ? value : +value, // Простое поле
        });
      }

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
        console.log(xmlData);
        const response = await fetch(API_URL + `/flat-management/flats/${editFormData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/xml',
          },
          body: xmlData,
        });

        if (response.ok) {
          const xmlResponse = await response.text(); // Получение текста ответа

          const updatedFlat = parseFlatFromXml(xmlResponse);
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
        const fetchedFlats = await fetchFlats(currentPage, sortFields, filterFields);
        setFlats(fetchedFlats);
        setTotalPages(10);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    loadFlats();
  }, [currentPage, sortFields, filterFields]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (flats.length === 0) {
    return <p>Элементов нет, но вы держитесь</p>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFlat: Flat = {
      id: 0, // ID will be assigned on the server
      name,
      coordinates: {
        x: Number(x),
        y: Number(y),
      },
      creationDate: new Date(), // Or use a different logic for date
      area: Number(area),
      numberOfRooms: Number(numberOfRooms),
      furnish: addFurnish,
      view: addView,
      transport: addTransport,
      house: {
        name: houseName,
        year: Number(houseYear),
        numberOfFloors: Number(numberOfFloors),
        numberOfLifts: Number(numberOfLifts),
      },
    };

    // Call the onAdd function to add the new Flat
    await onAdd(newFlat);

    // Reset form fields
    setName('');
    setX(undefined);
    setY(undefined);
    setArea(undefined);
    setNumberOfRooms(undefined);
    setAddFurnish(undefined);
    setAddView(undefined);
    setAddTransport(Transport.NONE);
    setHouseName('');
    setHouseYear(undefined);
    setNumberOfFloors(undefined);
    setNumberOfLifts(undefined);
  };


  const onAdd = async (newFlat: Flat) => {

    try {
      const body = `<Flat>
                  <name>${newFlat.name}</name>
                  <coordinates>
                      <x>${newFlat.coordinates.x}</x>
                      <y>${newFlat.coordinates.y}</y>
                  </coordinates>
                  <area>${newFlat.area}</area>
                  <numberOfRooms>${newFlat.numberOfRooms}</numberOfRooms>
                  <furnish>${newFlat.furnish || ''}</furnish>
                  <view>${newFlat.view || ''}</view>
                  <transport>${newFlat.transport}</transport>
                  <house>
                      <name>${newFlat.house?.name || ''}</name>
                      <year>${newFlat.house?.year || ''}</year>
                      <numberOfFloors>${newFlat.house?.numberOfFloors || ''}</numberOfFloors>
                      <numberOfLifts>${newFlat.house?.numberOfLifts || ''}</numberOfLifts>
                  </house>
              </Flat>`
      console.log(body);
      const response = await fetch(API_URL + '/flat-management/flats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: body,
      });

      if (response.ok) {
        const xmlResponse = await response.text();
        const addedFlat = parseFlatFromXml(xmlResponse);
        setFlats((prev) => [...prev, addedFlat]);
      } else {
        alert('Failed to add flat');
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const fetchMinCoordinates = async () => {
    try {
      const response = await fetch(API_URL + '/flat-management/flats/min-coordinates');
      const xmlResponse = await response.text();
      const parsedFlats: Flat[] = [await parseFlatFromXml(xmlResponse)];

      setFlats(parsedFlats); // Обновите состояние таблицы новыми данными
      setShowMinCoordinates(true); // Установите флаг для отображения минимальных координат
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const resetToDefaultTable = async () => {
    try {
      setCurrentPage(1);
      setSortFields('id');
      setFilterFields('none');
      const fetchedFlats = await fetchFlats(currentPage, sortFields, filterFields);
      setFlats(fetchedFlats);
      setShowMinCoordinates(false); // Сбросить флаг
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Add New Flat</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Flat Name"
          required
        />
        <input
          type="number"
          step="0.01"
          value={x !== undefined? x : ""}
          onChange={(e) => setX(Number(e.target.value))}
          placeholder="Coordinate X"
          required
        />
        <input
          type="number"
          value={y !== undefined? y : ""}
          onChange={(e) => setY(Number(e.target.value))}
          placeholder="Coordinate Y"
          required
        />
        <input
          type="number"
          step="0.01"
          value={area !== undefined? area : ""}
          onChange={(e) => setArea(Number(e.target.value))}
          placeholder="Area"
          required
        />
        <input
          type="number"
          value={numberOfRooms !== undefined? numberOfRooms : ""}
          onChange={(e) => setNumberOfRooms(Number(e.target.value))}
          placeholder="Number of Rooms"
        />

        <select
          id="furnish"
          value={addFurnish}
          onChange={(e) => setAddFurnish(e.target.value as Furnish)}
        >
          <option value="">Select Furnish</option>
          <option value="DESIGNER">DESIGNER</option>
          <option value="NONE">NONE</option>
          <option value="FINE">FINE</option>
          <option value="BAD">BAD</option>
          <option value="LITTLE">LITTLE</option>
        </select>

        <select
          id="view"
          value={addView}
          onChange={(e) => setAddView(e.target.value as View)}
        >
          <option value="">Select View</option>
          <option value="YARD">YARD</option>
          <option value="PARK">PARK</option>
          <option value="NORMAL">NORMAL</option>
          <option value="GOOD">GOOD</option>
        </select>

        <select
          id="transport"
          value={addTransport}
          onChange={(e) => setAddTransport(e.target.value as Transport)}
        >
          <option value="NONE">Select Transport</option>
          <option value="FEW">FEW</option>
          <option value="NONE">NONE</option>
          <option value="NORMAL">NORMAL</option>
        </select>

        <input
          type="text"
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="House Name"
        />
        <input
          type="number"
          value={houseYear !== undefined? houseYear : ""}
          onChange={(e) => setHouseYear(Number(e.target.value))}
          placeholder="House Year"
        />
        <input
          type="number"
          value={numberOfFloors !== undefined? numberOfFloors : ""}
          onChange={(e) => setNumberOfFloors(Number(e.target.value))}
          placeholder="Number of Floors"
        />
        <input
          type="number"
          value={numberOfLifts !== undefined? numberOfLifts : ""}
          onChange={(e) => setNumberOfLifts(Number(e.target.value))}
          placeholder="Number of Lifts"
        />
        <button type="submit" className="pagination-button">Add Flat</button>
      </form>
      <div className="base-element">
        <input
          type="text"
          onChange={(e) => setFilterFieldsField(e.target.value)}
          placeholder="Поля для фильтрации"
        />
        <button onClick={handleFilterFields} className="pagination-button">
          Filter
        </button>
      </div>
      <div className="base-element">
        <input
          type="text"
          onChange={(e) => setSortFieldsField(e.target.value)}
          placeholder="Поля для сортировки"
        />
        <button onClick={handleSortFields} className="pagination-button">
          Filter
        </button>
      </div>
      <div className="base-element">
        <button className="pagination-button" onClick={handleFetchTotalCost}>
          Get Total Cost of All Flats
        </button>
        {totalCost !== null && (
          <div>
            <strong>Total Cost:</strong> {totalCost}
          </div>
        )}
      </div>
      <div className="base-element">
        <input
          type="number"
          min="1"
          value={minRooms}
          onChange={(e) => setMinRooms(Number(e.target.value))}
          placeholder="Мин число комнат"
        />
        <button onClick={handleFetchRoomCount} className="pagination-button">
          Получить количество квартир
        </button>
        {roomCount !== null && (
          <p>Количество квартир с более чем {minRooms} комнатами: {roomCount}</p>
        )}
      </div>
      <MoneyBalconyFilter onFilter={handleMoneyBalconyFilter} />
      <div className='base-element'>
        <label htmlFor="furnish">Max Furnish:</label>
        <select
          id="furnish"
          value={maxFurnish}
          onChange={(e) => setMaxFurnish(e.target.value as Furnish)}
        >
          <option value="">Select Furnish</option>
          <option value="DESIGNER">DESIGNER</option>
          <option value="NONE">NONE</option>
          <option value="FINE">FINE</option>
          <option value="BAD">BAD</option>
          <option value="LITTLE">LITTLE</option>
        </select>
        <button onClick={handleFilterClick} className="pagination-button">Filter</button>
      </div>
      <div className='base-element'>
        <button onClick={fetchMinCoordinates} className="pagination-button">Get Flat with Min Coordinates</button><br></br>
      </div>
      <div className='base-element'>
        <button onClick={resetToDefaultTable} className="pagination-button">Reset to Default Table</button>
      </div>
      {error && <p>Error: {error}</p>}
      <h2>Flats Table</h2>
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
                  <button onClick={handleSave} className="button">
                    Save
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleEditClick(flat)} className="button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(flat.id)} className="button button-delete">
                      Delete
                    </button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-container">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>

  );
};

export default FlatsTable;
