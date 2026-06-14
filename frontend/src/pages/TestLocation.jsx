import { useState } from "react";
import { searchLocations } from "../services/location";

function TestLocation() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const handleSearch = async (value) => {
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    try {
      const data = await searchLocations(value);

      setResults(data.features || []);
    } catch (error) {
      console.error(error);
    }
  };

  const selectLocation = (location) => {
    setSelectedLocation(location);

    setQuery(
      location.properties.formatted
    );

    setResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          Location Search Test
        </h1>

        <input
          type="text"
          value={query}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          placeholder="Search business location..."
          className="w-full border p-3 rounded-lg"
        />

        {results.length > 0 && (
          <div className="mt-2 border rounded-lg overflow-hidden">

            {results.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  selectLocation(item)
                }
                className="p-3 border-b cursor-pointer hover:bg-slate-100"
              >
                <p className="font-medium">
                  {item.properties.formatted}
                </p>
              </div>
            ))}

          </div>
        )}

        {selectedLocation && (
          <div className="mt-8 bg-slate-50 p-5 rounded-xl">

            <h2 className="text-xl font-bold mb-4">
              Selected Location
            </h2>

            <p>
              <strong>Address:</strong>{" "}
              {selectedLocation.properties.formatted}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {selectedLocation.properties.city}
            </p>

            <p>
              <strong>State:</strong>{" "}
              {selectedLocation.properties.state}
            </p>

            <p>
              <strong>Pincode:</strong>{" "}
              {selectedLocation.properties.postcode}
            </p>

            <p>
              <strong>Latitude:</strong>{" "}
              {
                selectedLocation.properties.lat
              }
            </p>

            <p>
              <strong>Longitude:</strong>{" "}
              {
                selectedLocation.properties.lon
              }
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default TestLocation;