import openmeteo_requests
import pandas as pd
import datetime
import requests_cache
from geopy.geocoders import Nominatim
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

#Setup Nomatim
geolocator = Nominatim(user_agent = "Weather App")

#Ask from user the desired location and setup coordinates for use with open-meteo API
def user_input():
	user_location = input("What City or Address do you live in? ")
	location = geolocator.geocode(user_location)
	return location
# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
def weather_api(location):
	url = "https://api.open-meteo.com/v1/forecast"
	params = {
		"latitude": location.latitude,
		"longitude": location.longitude,
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
def output_current_temp(weather_data):
	current = weather_data.Current()
	current_temperature_2m = current.Variables(0).Value()
	
	#datetime.datetime.fromtimestamp(timestamp)
	print(f"\nCurrent time: {datetime.datetime.fromtimestamp(current.Time())}")
	print(f"Current temperature: {current_temperature_2m:.1f}°C")

# Process hourly data. The order of variables needs to be the same as requested.
def output_hourly_temp(weather_data):
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

    hourly_dataframe["temperature_2m"] = hourly_dataframe["temperature_2m"].round(1)
    hourly_dataframe["apparent_temperature"] = hourly_dataframe["apparent_temperature"].round(1)

    print("\nHourly data\n", hourly_dataframe.head(12))

def main():
	user_coordinates = user_input()
	weather_data = weather_api(user_coordinates)
	output_location_data(weather_data)
	output_current_temp(weather_data)
	output_hourly_temp(weather_data)
	
if __name__ == "__main__":
	main()