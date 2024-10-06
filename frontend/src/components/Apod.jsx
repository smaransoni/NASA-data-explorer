import React, { useState, useEffect } from 'react';

const Apod = () => {
  const [apodData, setApodData] = useState(null); // State to store APOD data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle error

  useEffect(() => {
    // Fetch APOD data from the backend
    const fetchApodData = async () => {
      const currentDate = new Date().toDateString();
      const cacheKey = `{NASA-API-DATA:${currentDate}}`;

      // Check if today's apod data is already cached
      if (localStorage.getItem(cacheKey)) {
        const cachedData = JSON.parse(localStorage.getItem(cacheKey));
        setApodData(cachedData); //use the cached data
        console.log('Fetched from cache');
        setLoading(false);
        return;
      }
      localStorage.clear();

      try {
        console.log('http://localhost:5000/api/apod');
        const response = await fetch('http://localhost:5000/api/apod');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        //Cache today's apod data in local storage
        localStorage.setItem(cacheKey, JSON.stringify(data));

        console.log(data);
        console.log('Fetched from api and cached');
        setApodData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApodData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {Array.isArray(apodData) ? (
        // If apodData is an array, map through it
        apodData.map(item => {
          return (
            <div key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.explanation}</p>
              <img
                src={item.url}
                alt={item.title}
                style={{ maxWidth: '100%' }}
              />
              <p>
                <strong>Date:</strong> {item.date}
              </p>
            </div>
          );
        })
      ) : (
        // If apodData is a single object, render it directly
        <div key={apodData.title}>
          <h2>{apodData.title}</h2>
          <p>{apodData.explanation}</p>
          <img
            src={apodData.url}
            alt={apodData.title}
            style={{ maxWidth: '100%' }}
          />
          <p>
            <strong>Date:</strong> {apodData.date}
          </p>
        </div>
      )}
    </>
  );
};

export default Apod;
