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
		"hourly": ["temperature_2m","apparent_temperature"],
		"current": ["temperature_2m", "apparent_temperature"],
		"timezone": "auto",
	}
	responses = openmeteo.weather_api(url, params=params)
	return responses[0]

# Process first location. Add a for-loop for multiple locations or weather models
def output_location_data(weather_data):
	response = weather_data
	print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
	print(f"Elevation: {response.Elevation()} m asl")
	print(f"Timezone: {response.Timezone()} {response.TimezoneAbbreviation()}")
	print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Process current data. The order of variables needs to be the same as requested.
def get_current(weather_data):
	current = weather_data.Current()
	current_temperature_2m = current.Variables(0).Value()
	current_apparent_temperature = current.Variables(1).Value()

	return {
		"time": current.Time(),
		"temperature": round(current_temperature_2m, 1),
		"apparent": round(current_apparent_temperature, 1),
	}

# Process hourly data. The order of variables needs to be the same as requested.
def get_hourly(weather_data):
    hourly = weather_data.Hourly()
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
    hourly_apparent_temperature = hourly.Variables(1).ValuesAsNumpy()

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
    dates_local = dates_utc.tz_convert(timezone) #convert UTC dates to local timezone based on user's address

    hourly_data = {"date": dates_local}
    hourly_data["temperature_2m"] = hourly_temperature_2m
    hourly_data["apparent_temperature"] = hourly_apparent_temperature

    hourly_dataframe = pd.DataFrame(data=hourly_data)

    hourly_dataframe["temperature_2m"] = hourly_dataframe["temperature_2m"].astype(float).round(1)
    hourly_dataframe["apparent_temperature"] = hourly_dataframe["apparent_temperature"].astype(float).round(1)

    hourly_dataframe = hourly_dataframe.rename(columns={
        "temperature_2m": "temperature",
        "apparent_temperature": "apparent",
    })
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