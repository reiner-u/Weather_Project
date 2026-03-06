from pydantic import BaseModel

class CurrentWeather(BaseModel):
    time : float
    temperature : float
    apparent :float

class HourlyWeather(BaseModel):
    date : str
    temperature : float
    apparent : float

class WeatherResponse(BaseModel):
    city : str
    latitude : float
    longitude : float
    timezone : str
    current : CurrentWeather
    hourly : list[HourlyWeather]