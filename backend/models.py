from pydantic import BaseModel

class CurrentWeather(BaseModel):
    time : float
    temperature : float
    apparent :float
    wind_speed : float
    wind_gusts : float
    wind_direction : float
    precipitation : float
    precip_probability : int
    weather_code : int

class HourlyWeather(BaseModel):
    date : str
    temperature : float
    apparent : float
    wind_speed : float
    wind_gusts : float
    wind_direction : float
    precipitation : float
    precip_probability : int
    weather_code : int

class WeatherResponse(BaseModel):
    city : str
    latitude : float
    longitude : float
    timezone : str
    current : CurrentWeather
    hourly : list[HourlyWeather]