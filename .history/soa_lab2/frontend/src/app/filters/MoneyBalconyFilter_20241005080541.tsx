import React, { useState } from 'react';

const FlatFilter: React.FC<{ onFilter: (cheapest: string, withBalcony: string) => void }> = ({ onFilter }) => {
    const [cheapest, setCheapest] = useState<boolean>(true);  // true -> cheapest, false -> most_expensive
    const [withBalcony, setWithBalcony] = useState<boolean>(true);  // true -> with-balcony, false -> without-balcony

    const handleFilterClick = () => {
        const cheapestParam = cheapest ? 'cheapest' : 'most_expensive';
        const balconyParam = withBalcony ? 'with-balcony' : 'without-balcony';
        onFilter(cheapestParam, balconyParam);
    };

    return (
        <div>
            <div>
                <label>
                    Cheapest:
                    <input
                        type="checkbox"
                        checked={cheapest}
                        onChange={() => setCheapest(!cheapest)}
                    />
                </label>
                <label>
                    With Balcony:
                    <input
                        type="checkbox"
                        checked={withBalcony}
                        onChange={() => setWithBalcony(!withBalcony)}
                    />
                </label>
            </div>
            <button onClick={handleFilterClick} class name {
                constructor(parameters) {
                    
                }
            }>Filter</button>
        </div>
    );
};

export default FlatFilter;
