import React, { useState, useEffect } from 'react';

const Apod = () => {
  const [apodData, setApodData] = useState(null); // State to store APOD data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle error

  useEffect(() => {
    // Fetch APOD data from your backend (update with your actual backend URL)
    const fetchApodData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/apod');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log(data);
        setApodData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApodData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
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
  );
};

export default Apod;
