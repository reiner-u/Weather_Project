import React from "react";
import { useEffect } from "react";
import { useState } from "react";

function FetchData() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState("Manila"); // hardcoded city for testing, setCity for future user input
    const [userInput, setUserInput] = useState("");
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
    const fetchData = async () => {
        try {
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

function renderContent() {
    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }

    
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

            <h1>{city} Weather Data</h1>
            {data && (
                <div>
                    {/*display weather data here, like specific items from fastAPI json object*/}
                    <p>Current Time: {new Date((data.current.time)*1000).toLocaleString()}</p>
                    <p>Current Temperature: {data.current.temperature}°C</p>
                    <p>Currently Feels Like: {data.current.apparent}</p>
                    {/*for debugging, display entire json object*/}
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
return (
    <div>
        {renderContent()}
    </div>
)
}
export default FetchData;