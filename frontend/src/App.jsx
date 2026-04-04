import { useEffect } from "react";
import { useState } from "react";
import "./App.css";

function App() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(""); // hardcoded city for testing, setCity for future user input
    const [userInput, setUserInput] = useState("");
    const [location, setLocation] = useState(null);
    const handleCityChange = (event) => {
        setUserInput(event.target.value);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setCity(userInput) //had issues with requests overloading due to useEffect running on every keystroke, so I moved setCity here to only update city when form is submitted, which will trigger useEffect to run fetchData again with new city
        //fetchData will be called in useEffect, which will run again when city state changes
    }

    useEffect(() => {
        const handleSuccess = (position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setError(null);
            const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/coordinates?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (error) {
                setError(error.message);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        };

        const handleError = (err) => {
            setError(err.message);
            console.warn(`ERROR(${err.code}): ${err.message}`);
            setIsLoading(false);
        };

        const requestLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    handleSuccess,
                    handleError,
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            }
            else
            {
                    setError("Geolocation is not supported by your browser.");
            }
        };
        requestLocation();
    }, []); // empty dependency array means this will run once on component mount when page loads to request location

    useEffect(() =>
    {
        const fetchData = async () => {
            try {
                if (!city) return; // if city is empty, don't make the request. Prevents override of location when user's location is fetched upon page load
                const response = await fetch(`http://localhost:8000/weather?city=${city}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (error) {
                setError(error.message);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [city]); // dependency array includes city, so fetchData will run again when city changes

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <label>
                    Enter City to view weather data:
                    <input type="text" value={userInput} onChange={handleCityChange}
                    placeholder="Enter city name"/>
                </label>
                <button type="submit" disabled={isLoading}>Get Weather</button>{/*button is disabled while loading to prevent multiple requests*/}
            </form>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {data && (
                <div className="weather-container">
                    <h1 className="location-weather">{data?.city} Weather</h1>
                    {/*display weather data here, like specific items from fastAPI json object*/}
                    <p className="current-time">Current Time: {new Date((data.current.time)*1000).toLocaleString()}</p>
                    <p className="current-temperature">Current Temperature: {data.current.temperature}°C</p>
                    <p className="current-feels-like">Currently Feels Like: {data.current.apparent}°C</p>
                    <div className="hourly-table">
                        {data.hourly.map(entry => (
                            <div key={entry.date} className="hourly-entry">
                                <p className="hourly-time">Time: {new Date(entry.date).toLocaleString()}</p>
                                <p className="hourly-temperature">Temperature: {entry.temperature}°C</p>
                                <p className="hourly-feels-like">Feels Like: {entry.apparent}°C</p>
                            </div>
                        ))}
                    </div>

                    {/*for debugging. display entire json object*/}
                    {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                </div>

            )}
        </div>
    )
}
export default App;
