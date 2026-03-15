import React from "react";
import { useEffect } from "react";
import { useState } from "react";

function FetchData() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState("Toronto"); // hardcoded city for testing, setCity for future user input

    
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
}, []);

function renderContent() {
    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }
    return (
        <div>
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