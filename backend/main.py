from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from geopy.geocoders import Nominatim
from weather import weather_api, get_current, get_hourly
from models import WeatherResponse, CurrentWeather, HourlyWeather


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/weather")
async def get_weather(city: str):
    geolocator = Nominatim(user_agent="weather_app")
    location = geolocator.geocode(city)
    if not location:
        raise HTTPException(status_code=404, detail="City not found")
    
    weather_data = weather_api(location.latitude, location.longitude)
    current = get_current(weather_data)
    hourly = get_hourly(weather_data)
    
    timezone = weather_data.Timezone()
    if isinstance(timezone, (bytes, bytearray)):
        timezone = timezone.decode()

    response = WeatherResponse(
        city=city,
        latitude=location.latitude,
        longitude=location.longitude,
        timezone=timezone,
        current=current,
        hourly=hourly
    )
    return response