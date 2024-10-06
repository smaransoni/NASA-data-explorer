import React, { useState, useEffect } from 'react';

function NeoFeed() {
  const [neoFeedData, setNeoFeedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNeoFeed = async () => {
      try {
        const START_DATE = '';
        const END_DATE = '';

        console.log('http://localhost:5000/api/neofeed');
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/neofeed?start_date=${START_DATE}&end_date=${END_DATE}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData);
          // make the error more personal
          throw new Error(
            `Error fetching neo feed data. Error returned from the API call:${JSON.stringify(
              errorData
            )}`
          );
        }

        const data = await response.json();
        console.log(data);
        setNeoFeedData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNeoFeed();
  }, []);

  if (error) return <div>{error}</div>;
  if (loading) return <div>Loading...</div>;

  // Check if neoFeedData exists before rendering
  if (!neoFeedData) return <div>No data available</div>;

  const { element_count, near_earth_objects } = neoFeedData;

  return (
    <div>
      <h1>Near-Earth Objects Dashboard</h1>
      <h2>Total NEOs Detected: {element_count}</h2>

      {/* Error handling if no NEOs are found */}
      {element_count === 0 ? (
        <p>No near-Earth objects found for the selected dates.</p>
      ) : (
        Object.keys(near_earth_objects).map(date => (
          <div key={date}>
            <h3>Date: {date}</h3>
            <p>Total Objects on this date: {near_earth_objects[date].length}</p>

            <div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Estimated Diameter (m)</th>
                    <th>Relative Velocity (km/h)</th>
                    <th>Closest Approach (km)</th>
                    <th>Potentially Hazardous</th>
                  </tr>
                </thead>
                <tbody>
                  {near_earth_objects[date].map(neo => (
                    <tr key={neo.id}>
                      <td>{neo.name}</td>
                      <td>
                        {neo.estimated_diameter.meters.estimated_diameter_min.toFixed(
                          2
                        )}{' '}
                        -{' '}
                        {neo.estimated_diameter.meters.estimated_diameter_max.toFixed(
                          2
                        )}
                      </td>
                      <td>
                        {
                          neo.close_approach_data[0].relative_velocity
                            .kilometers_per_hour
                        }
                      </td>
                      <td>
                        {neo.close_approach_data[0].miss_distance.kilometers}
                      </td>
                      <td>
                        {neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NeoFeed;
