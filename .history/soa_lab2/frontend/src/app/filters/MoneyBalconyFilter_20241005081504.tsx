import React, { useState } from 'react';

const MoneyBalconyFilter: React.FC<{ onFilter: (cheapest: string, withBalcony: string) => void }> = ({ onFilter }) => {
    const [cheapest, setCheapest] = useState<boolean>(true);  // true -> cheapest, false -> most_expensive
    const [withBalcony, setWithBalcony] = useState<boolean>(true);  // true -> with-balcony, false -> without-balcony

    const handleMoneyBalconyFilterClick = () => {
        const cheapestParam = cheapest ? 'cheapest' : 'most_expensive';
        const balconyParam = withBalcony ? 'with-balcony' : 'without-balcony';
        onFilter(cheapestParam, balconyParam);
    };

    return (
        <div>
      <FlatFilter onFilter={handleFilter} /> {/* Добавляем фильтр над таблицей */}
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
          {filteredFlats.length > 0
            ? filteredFlats.map((flat) => (
                <tr key={flat.id}>
                  <td>{flat.id}</td>
                  <td>{flat.name}</td>
                  <td>{flat.coordinates.x}, {flat.coordinates.y}</td>
                  <td>{flat.creationDate.toLocaleString()}</td>
                  <td>{flat.area}</td>
                  <td>{flat.numberOfRooms}</td>
                  <td>{flat.furnish || 'None'}</td>
                  <td>{flat.view || 'None'}</td>
                  <td>{flat.transport}</td>
                  <td>{flat.house ? `${flat.house.name} (${flat.house.numberOfFloors} floors, ${flat.house.numberOfLifts} lifts, ${flat.house.year} year)` : 'None'}</td>
                </tr>
              ))
            : flats.map((flat) => (
                <tr key={flat.id}>
                  <td>{flat.id}</td>
                  <td>{flat.name}</td>
                  <td>{flat.coordinates.x}, {flat.coordinates.y}</td>
                  <td>{flat.creationDate.toLocaleString()}</td>
                  <td>{flat.area}</td>
                  <td>{flat.numberOfRooms}</td>
                  <td>{flat.furnish || 'None'}</td>
                  <td>{flat.view || 'None'}</td>
                  <td>{flat.transport}</td>
                  <td>{flat.house ? `${flat.house.name} (${flat.house.numberOfFloors} floors, ${flat.house.numberOfLifts} lifts, ${flat.house.year} year)` : 'None'}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
    );
};

export default MoneyBalconyFilter;
