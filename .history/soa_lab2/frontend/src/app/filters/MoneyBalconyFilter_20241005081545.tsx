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
        <div>
          <p>Price:</p>
          <label>
            <input
              type="radio"
              value="cheapest"
              checked={cheapest === 'cheapest'}
              onChange={() => setCheapest('cheapest')}
            />
            Cheapest
          </label>
          <label>
            <input
              type="radio"
              value="most_expensive"
              checked={cheapest === 'most_expensive'}
              onChange={() => setCheapest('most_expensive')}
            />
            Most Expensive
          </label>
        </div>
  
        <div>
          <p>Balcony:</p>
          <label>
            <input
              type="radio"
              value="with-balcony"
              checked={withBalcony === 'with-balcony'}
              onChange={() => setWithBalcony('with-balcony')}
            />
            With Balcony
          </label>
          <label>
            <input
              type="radio"
              value="without-balcony"
              checked={withBalcony === 'without-balcony'}
              onChange={() => setWithBalcony('without-balcony')}
            />
            Without Balcony
          </label>
        </div>
  
        <button onClick={handleFilterClick}>Filter</button>
      </div>
    );
};

export default MoneyBalconyFilter;
