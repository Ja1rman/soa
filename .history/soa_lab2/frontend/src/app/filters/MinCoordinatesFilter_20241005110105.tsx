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