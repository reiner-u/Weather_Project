import openmeteo_requests
import pandas as pd
import requests_cache
from geopy.geocoders import Nominatim
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

#Setup Nomatim
#geolocator = Nominatim(user_agent = "Weather App")

def weather_api(lat, lon):
	url = "https://api.open-meteo.com/v1/forecast"
	params = {
		"latitude": lat,
		"longitude": lon,
		"hourly": ["temperature_2m","apparent_temperature", "wind_speed_10m", "wind_gusts_10m", "wind_direction_10m", "precipitation", "precipitation_probability", "weather_code"],
		"current": ["temperature_2m","apparent_temperature", "wind_speed_10m", "wind_gusts_10m", "wind_direction_10m", "precipitation", "precipitation_probability", "weather_code"],
		"timezone": "auto",
	}
	responses = openmeteo.weather_api(url, params=params)
	return responses[0]

# Legacy code, back when this was a single file command line weather app.
def output_location_data(weather_data):
	response = weather_data
	print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
	print(f"Elevation: {response.Elevation()} m asl")
	print(f"Timezone: {response.Timezone()} {response.TimezoneAbbreviation()}")
	print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Process current data. The order of variables needs to be the same as requested.
def get_current(weather_data):
	current = weather_data.Current()
	# Index order matches params["current"] list
	current_temperature_2m = current.Variables(0).Value()
	current_apparent_temperature = current.Variables(1).Value()
	current_wind_speed = current.Variables(2).Value()
	current_wind_gusts = current.Variables(3).Value()
	current_wind_direction = current.Variables(4).Value()
	current_precipitation = current.Variables(5).Value()
	current_precip_probability = current.Variables(6).Value()
	current_weather_code = current.Variables(7).Value()

	return {
		"time": current.Time(),
		"temperature": round(current_temperature_2m, 1),
		"apparent": round(current_apparent_temperature, 1),
		"wind_speed": round(current_wind_speed, 1),
		"wind_gusts": round(current_wind_gusts, 1),
		"wind_direction": round(current_wind_direction, 1),
		"precipitation": round(current_precipitation, 1),
		"precip_probability": round(current_precip_probability, 1),
		"weather_code": int(current_weather_code),
	}

# Process hourly data. The order of variables needs to be the same as requested.
def get_hourly(weather_data):
    hourly = weather_data.Hourly()
    # Index order matches params["hourly"] list
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
    hourly_apparent_temperature = hourly.Variables(1).ValuesAsNumpy()
    hourly_wind_speed = hourly.Variables(2).ValuesAsNumpy()
    hourly_wind_gusts = hourly.Variables(3).ValuesAsNumpy()
    hourly_wind_direction = hourly.Variables(4).ValuesAsNumpy()
    hourly_precipitation = hourly.Variables(5).ValuesAsNumpy()
    hourly_precip_probability = hourly.Variables(6).ValuesAsNumpy()
    hourly_weather_code = hourly.Variables(7).ValuesAsNumpy()

    # Get timezone
    timezone = weather_data.Timezone()
    if isinstance(timezone, (bytes, bytearray)):
        timezone = timezone.decode()

    # Build hourly timestamps in UTC
    dates_utc = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )
    dates_local = dates_utc.tz_convert(timezone)

    hourly_data = {
        "date": dates_local,
        "temperature": hourly_temperature_2m,
        "apparent": hourly_apparent_temperature,
        "wind_speed": hourly_wind_speed,
        "wind_gusts": hourly_wind_gusts,
        "wind_direction": hourly_wind_direction,
        "precipitation": hourly_precipitation,
        "precip_probability": hourly_precip_probability,
        "weather_code": hourly_weather_code,
    }

    hourly_dataframe = pd.DataFrame(data=hourly_data)

    for col in ["temperature", "apparent", "wind_speed", "wind_gusts", "wind_direction", "precipitation"]:
        hourly_dataframe[col] = hourly_dataframe[col].astype(float).round(1)
    hourly_dataframe["precip_probability"] = hourly_dataframe["precip_probability"].astype(float).round(0).astype(int)
    hourly_dataframe["weather_code"] = hourly_dataframe["weather_code"].astype(int)
    hourly_dataframe["date"] = hourly_dataframe["date"].astype(str)

    return hourly_dataframe.to_dict(orient="records")

def main():
	user_coordinates = user_input()
	weather_data = weather_api(user_coordinates)
	output_location_data(weather_data)
	get_current(weather_data)
	get_hourly(weather_data)
	
if __name__ == "__main__":
	main()