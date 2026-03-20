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

@app.get("/weather") #the usual way to get weather data, through user input
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

@app.get("/coordinates") #alternative way to get weather, skipping geocoding api. Mainly for use with requesting user location which gives coordinates
async def get_weather_from_coordinates(lat: float, lon: float):
    geolocator = Nominatim(user_agent="weather_app")
    location = geolocator.reverse(f"{lat}, {lon}", zoom=12, language='en') #reverse geocode at level 12, or town/borough level and below. english to ensure address results are in english
    weather_data = weather_api(lat, lon)
    current = get_current(weather_data)
    hourly = get_hourly(weather_data)
    
    timezone = weather_data.Timezone()
    if isinstance(timezone, (bytes, bytearray)):
        timezone = timezone.decode()

    response = WeatherResponse(
        city=location.raw['address'].get('town') or location.raw['address'].get('city') or "Current Location", #try to get town or city from user location, if not then just say Current Location in the header
        latitude=lat,
        longitude=lon,
        timezone=timezone,
        current=current,
        hourly=hourly
    )
    return response 