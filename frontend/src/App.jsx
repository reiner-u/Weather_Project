import { useEffect } from "react";
import { useState } from "react";
import "./App.css";
import { getWeatherIcon } from "./weatherIcons";
import PrecipitationChart from "./PrecipitationChart";

function WeatherIcon({ code, className }) {
    const { markup, label } = getWeatherIcon(code);
    return (
        <span
            className={className}
            role="img"
            aria-label={label}
            dangerouslySetInnerHTML={{ __html: markup }}
        />
    );
}

function WindIndicator({ speed, gusts, direction }) {
    // Open-Meteo's wind_direction is the compass bearing the wind is blowing
    // FROM. Adding 180 flips a north-pointing arrow so it visually points
    // toward where the wind is actually heading, which reads more naturally.
    const rotation = direction + 180;
    return (
        <span
            className="wind-indicator"
            role="img"
            aria-label={`Wind ${speed} km/h, gusts up to ${gusts} km/h`}
            title={`Gusts up to ${gusts} km/h`}
        >
            <span className="wind-arrow" style={{ transform: `rotate(${rotation}deg)` }}>
                <svg viewBox="0 0 24 24">
                    <path d="M12 2 L18 20 L12 16 L6 20 Z" />
                </svg>
            </span>
            {speed} km/h
        </span>
    );
}

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
                const response = await fetch(`https://weather-project-ct3v.onrender.com/coordinates?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
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
                const response = await fetch(`https://weather-project-ct3v.onrender.com/weather?city=${city}`);
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
        <div className="app-shell">
            <form className="search-form" onSubmit={handleFormSubmit}>
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
                    <div className="current-hero">
                        <WeatherIcon code={data.current.weather_code} className="current-icon" />
                        <div className="current-details">
                            <p className="current-time">Current Time: {new Date((data.current.time)*1000).toLocaleString()}</p>
                            <p className="current-temperature">Current Temperature: {data.current.temperature}°C</p>
                            <p className="current-feels-like">Currently Feels Like: {data.current.apparent}°C</p>
                        </div>
                    </div>

                    <h2 className="section-title">Precipitation</h2>
                    <PrecipitationChart hourly={data.hourly} />

                    <h2 className="section-title">Hourly Forecast</h2>
                    <div className="hourly-table">
                        {data.hourly.map(entry => (
                            <div key={entry.date} className="hourly-entry">
                                <WeatherIcon code={entry.weather_code} className="hourly-icon" />
                                <p className="hourly-time">Time: {new Date(entry.date).toLocaleString()}</p>
                                <p className="hourly-temperature">Temperature: {entry.temperature}°C</p>
                                <p className="hourly-feels-like">Feels Like: {entry.apparent}°C</p>
                                <WindIndicator
                                    speed={entry.wind_speed}
                                    gusts={entry.wind_gusts}
                                    direction={entry.wind_direction}
                                />
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
