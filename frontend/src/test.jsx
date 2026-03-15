import React from "react";
import { useEffect } from "react";
import { useState } from "react";

function FetchData() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch("http://localhost:8000/weather?city=Toronto")
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);
    return (
        <div>
            <h1>Weather Data</h1>
            <ul>
                {data && data.map((record) => (
                    <li key={record.id}>{record.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default FetchData;