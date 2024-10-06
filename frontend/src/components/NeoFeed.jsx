import React, { useState, useEffect } from 'react';
import { processNeoData } from '../helper/processData.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function NeoFeed() {
  const [neoFeedData, setNeoFeedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRangeMode, setIsRangeMode] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 7); // Add 7 days to the current date
    return end.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
  });

  // Automatically set end date to 7 days after the start date when start date changes
  useEffect(() => {
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    setEndDate(newEndDate.toISOString().split('T')[0]);
    setSelectedDate('');
  }, [startDate]);

  // Unified function to update both startDate and endDate
  const updateDates = newStartDate => {
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newStartDate);
    newEnd.setDate(newEnd.getDate() + 7); // Add 7 days to startDate
    setStartDate(newStartDate);
    setEndDate(newEnd.toISOString().split('T')[0]);
  };

  useEffect(() => {
    const fetchNeoFeed = async () => {
      if (!startDate || !endDate) return; // Exit early if either date is not set
      try {
        const START_DATE = startDate;
        const END_DATE = isRangeMode ? endDate : startDate;

        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/neofeed?start_date=${START_DATE}&end_date=${END_DATE}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error fetching neo feed data: ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        const processedData = processNeoData(data);
        setNeoFeedData(processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNeoFeed();
  }, [startDate, endDate, isRangeMode]);

  if (error) return <div>Error occurred: {error}</div>;
  if (loading) return <div>Loading...</div>;
  if (!neoFeedData) return <div>No data available</div>;

  // Handle the start date change
  const handleStartDateChange = e => {
    const newStartDate = e.target.value;
    updateDates(newStartDate);
  };

  const handleDateSelect = date => {
    setSelectedDate(date);
  };

  // Date range validation (maximum 7 days)
  const handleEndDateChange = e => {
    const selectedEndDate = e.target.value;
    const start = new Date(startDate);
    const end = new Date(selectedEndDate);

    // If the end date is empty, do not validate or set it
    if (!selectedEndDate) {
      return;
    }
    // Check if endDate is smaller than startDate
    if (end < start) {
      alert('The end date cannot be earlier than the start date.');
    }
    // Check if the date range is greater than 7 days
    else if ((end - start) / (1000 * 60 * 60 * 24) > 7) {
      alert('The date range cannot exceed 7 days.');
    } else {
      setEndDate(selectedEndDate);
      setSelectedDate(''); // Reset selectedDate when endDate changes
    }
  };

  // Extract key statistics and notable objects
  const extractKeyStatistics = () => {
    const currentData = isRangeMode
      ? neoFeedData
      : neoFeedData.filter(data => data.date === startDate);

    if (currentData.length === 0) return null;

    let totalNEOs = 0;
    let hazardousNEOs = 0;
    let totalVelocity = 0;
    let largestObject = null;
    let fastestObject = null;
    let closestObject = null;
    let closestApproach = Number.MAX_VALUE;
    let maxDiameter = 0;
    let maxVelocity = 0;

    currentData.forEach(dayData => {
      totalNEOs += dayData.totalObjects;

      dayData.asteroids.forEach(neo => {
        const diameter = neo.estimatedDiameter?.max || 0;
        const velocity = parseFloat(neo.closeApproach?.velocity.kmPerHour) || 0;
        const missDistance = neo.closeApproach?.missDistance?.kilometers;

        // Calculate potentially hazardous asteroids
        if (neo.isPotentiallyHazardous) hazardousNEOs++;

        // Update largest object
        if (diameter > maxDiameter) {
          maxDiameter = diameter;
          largestObject = { ...neo, date: dayData.date }; // Add the date
        }

        // Update fastest object
        if (velocity > maxVelocity) {
          maxVelocity = velocity;
          fastestObject = { ...neo, date: dayData.date }; // Add the date
        }

        // Update closest object
        if (missDistance && parseFloat(missDistance) < closestApproach) {
          closestApproach = parseFloat(missDistance);
          closestObject = { ...neo, date: dayData.date }; // Add the date
        }

        totalVelocity += velocity;
      });
    });

    const averageVelocity =
      totalNEOs > 0 ? (totalVelocity / totalNEOs).toFixed(2) : 0;

    return {
      totalNEOs,
      hazardousNEOs,
      averageVelocity,
      largestObject,
      fastestObject,
      closestObject,
    };
  };

  const stats = extractKeyStatistics();
  const chartData = neoFeedData.map(data => ({
    date: data.date,
    totalObjects: data.totalObjects,
  }));

  return (
    <div>
      <h1>Near-Earth Objects Dashboard</h1>
      <h2>Total NEOs Detected Over Date(s)</h2>
      {/* Closest Approach Alert Card */}
      {stats?.closestObject && (
        <div className="alert-card">
          <h3>🚨 Closest Approach Alert!</h3>
          <p>
            The closest NEO is <strong>{stats.closestObject.name}</strong> with
            a distance of{' '}
            {stats.closestObject.closeApproach.missDistance.kilometers.toFixed(
              2
            )}{' '}
            km on {stats.closestObject.date}
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalObjects" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* Key Statistics */}
      {stats && (
        <div className="statistics-container">
          <h2>Key Statistics</h2>
          <p>Total Asteroids Detected: {stats.totalNEOs}</p>
          <p>Potentially Hazardous Asteroids: {stats.hazardousNEOs}</p>
          <p>Average Velocity: {stats.averageVelocity} km/h</p>

          {/* Notable Objects */}
          {stats.largestObject && (
            <p>
              Largest Object: <strong>{stats.largestObject.name}</strong> (
              {stats.largestObject.estimatedDiameter.max.toFixed(2)} km) on{' '}
              {stats.largestObject.date}
            </p>
          )}
          {stats.fastestObject && (
            <p>
              Fastest Object: <strong>{stats.fastestObject.name}</strong> (
              {stats.fastestObject.closeApproach.velocity.kmPerHour.toFixed(2)}{' '}
              km/h) on {stats.fastestObject.date}
            </p>
          )}
          {stats.closestObject && (
            <p>
              Closest Object: <strong>{stats.closestObject.name}</strong> (
              {stats.closestObject.closeApproach.missDistance.kilometers.toFixed(
                2
              )}{' '}
              km) on {stats.closestObject.date}
            </p>
          )}
        </div>
      )}
      <div>
        <h2>Select Date Mode:</h2>
        <button onClick={() => setIsRangeMode(!isRangeMode)}>
          {isRangeMode
            ? 'Switch to Single Date Mode'
            : 'Switch to Date Range Mode'}
        </button>

        {isRangeMode ? (
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
            <label>End Date:</label>
            <input type="date" value={endDate} onChange={handleEndDateChange} />
          </div>
        ) : (
          <div>
            <label>Select a Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
        )}
      </div>
      <div>
        <h2>Select a Date to View Asteroid list:</h2>
        <select onChange={e => handleDateSelect(e.target.value)}>
          <option value="">Select a date...</option>
          {neoFeedData.map(data => (
            <option key={data.date} value={data.date}>
              {data.date}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && (
        <div>
          <h3>{`Asteroids on ${selectedDate}`}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Estimated Diameter (km)</th>
                <th>Velocity (km/h)</th>
                <th>Closest Approach (km)</th>
                <th>Potentially Hazardous</th>
              </tr>
            </thead>
            <tbody>
              {neoFeedData
                .find(data => data.date === selectedDate)
                ?.asteroids.map(neo => (
                  <tr key={neo.id}>
                    <td>{neo.name}</td>
                    <td>
                      {neo.estimatedDiameter?.min.toFixed(2)} -{' '}
                      {neo.estimatedDiameter?.max.toFixed(2)}
                    </td>
                    <td>
                      {parseFloat(
                        neo.closeApproach?.velocity.kmPerHour
                      ).toFixed(2)}
                    </td>
                    <td>
                      {parseFloat(
                        neo.closeApproach?.missDistance.kilometers
                      ).toFixed(2)}
                    </td>
                    <td>{neo.isPotentiallyHazardous ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NeoFeed;
