// processNeoData.js
export function processNeoData(apiResponse) {
  try {
    const processedData = Object.entries(apiResponse.near_earth_objects).map(
      ([date, asteroids]) => {
        const asteroidsData = asteroids.map(asteroid => {
          const closeApproach = asteroid.close_approach_data[0] || {};
          return {
            id: asteroid.id,
            name: asteroid.name,
            estimatedDiameter: asteroid.estimated_diameter?.kilometers
              ? {
                  min: asteroid.estimated_diameter.kilometers
                    .estimated_diameter_min,
                  max: asteroid.estimated_diameter.kilometers
                    .estimated_diameter_max,
                  avg:
                    (asteroid.estimated_diameter.kilometers
                      .estimated_diameter_min +
                      asteroid.estimated_diameter.kilometers
                        .estimated_diameter_max) /
                    2,
                }
              : null,
            closeApproach: closeApproach
              ? {
                  date: closeApproach.close_approach_date,
                  fullDate: closeApproach.close_approach_date_full,
                  velocity: {
                    kmPerSecond: parseFloat(
                      closeApproach.relative_velocity?.kilometers_per_second
                    ),
                    kmPerHour: parseFloat(
                      closeApproach.relative_velocity?.kilometers_per_hour
                    ),
                  },
                  missDistance: {
                    kilometers: parseFloat(
                      closeApproach.miss_distance?.kilometers
                    ),
                    lunar: parseFloat(closeApproach.miss_distance?.lunar),
                  },
                }
              : null,
            isPotentiallyHazardous: asteroid.is_potentially_hazardous_asteroid,
            isSentryObject: asteroid.is_sentry_object,
            absoluteMagnitude: asteroid.absolute_magnitude_h,
          };
        });

        return {
          date,
          totalObjects: asteroidsData.length,
          asteroids: asteroidsData,
        };
      }
    );
    return processedData; // Return the processed data for all dates
  } catch (error) {
    console.error('Error processing NEO data:', error);
    throw new Error('Failed to process NASA NEO data');
  }
}
