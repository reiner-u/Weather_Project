// Maps Open-Meteo's WMO weather codes to icons from the weather-icons-master set.
// Each entry lists both a day and night filename so the night variants are
// ready to go once sunrise/sunset data is wired up on the backend.
// For now, getWeatherIcon() always resolves to the day icon.

// import.meta.glob eagerly loads every SVG in the folder as raw markup text
// (via the ?raw query) at build time, keyed by its relative path. This means
// we don't have to write a static import line for every one of the ~190 icons
// in the set -- only the ones referenced in WEATHER_CODE_ICONS below actually
// end up in the final bundle since Vite tree-shakes the rest.
const iconModules = import.meta.glob("./assets/weather_icons/*.svg", {
    eager: true,
    query: "?raw",
    import: "default",
});

const WEATHER_CODE_ICONS = {
    0: { day: "wi-day-sunny.svg", night: "wi-night-clear.svg", label: "Clear sky" },
    1: { day: "wi-day-sunny-overcast.svg", night: "wi-night-partly-cloudy.svg", label: "Mainly clear" },
    2: { day: "wi-day-cloudy.svg", night: "wi-night-alt-cloudy.svg", label: "Partly cloudy" },
    3: { day: "wi-cloudy.svg", night: "wi-cloudy.svg", label: "Overcast" },
    45: { day: "wi-day-fog.svg", night: "wi-night-fog.svg", label: "Fog" },
    48: { day: "wi-day-fog.svg", night: "wi-night-fog.svg", label: "Depositing rime fog" },
    51: { day: "wi-day-sprinkle.svg", night: "wi-night-alt-sprinkle.svg", label: "Light drizzle" },
    53: { day: "wi-day-sprinkle.svg", night: "wi-night-alt-sprinkle.svg", label: "Moderate drizzle" },
    55: { day: "wi-day-sprinkle.svg", night: "wi-night-alt-sprinkle.svg", label: "Dense drizzle" },
    56: { day: "wi-day-sleet.svg", night: "wi-night-alt-sleet.svg", label: "Light freezing drizzle" },
    57: { day: "wi-day-sleet.svg", night: "wi-night-alt-sleet.svg", label: "Dense freezing drizzle" },
    61: { day: "wi-day-rain.svg", night: "wi-night-alt-rain.svg", label: "Slight rain" },
    63: { day: "wi-day-rain.svg", night: "wi-night-alt-rain.svg", label: "Moderate rain" },
    65: { day: "wi-day-rain-wind.svg", night: "wi-night-alt-rain-wind.svg", label: "Heavy rain" },
    66: { day: "wi-day-rain-mix.svg", night: "wi-night-alt-rain-mix.svg", label: "Light freezing rain" },
    67: { day: "wi-day-rain-mix.svg", night: "wi-night-alt-rain-mix.svg", label: "Heavy freezing rain" },
    71: { day: "wi-day-snow.svg", night: "wi-night-alt-snow.svg", label: "Slight snow fall" },
    73: { day: "wi-day-snow.svg", night: "wi-night-alt-snow.svg", label: "Moderate snow fall" },
    75: { day: "wi-day-snow-wind.svg", night: "wi-night-alt-snow-wind.svg", label: "Heavy snow fall" },
    77: { day: "wi-day-snow.svg", night: "wi-night-alt-snow.svg", label: "Snow grains" },
    80: { day: "wi-day-showers.svg", night: "wi-night-alt-showers.svg", label: "Slight rain showers" },
    81: { day: "wi-day-showers.svg", night: "wi-night-alt-showers.svg", label: "Moderate rain showers" },
    82: { day: "wi-day-storm-showers.svg", night: "wi-night-alt-storm-showers.svg", label: "Violent rain showers" },
    85: { day: "wi-day-snow.svg", night: "wi-night-alt-snow.svg", label: "Slight snow showers" },
    86: { day: "wi-day-snow-wind.svg", night: "wi-night-alt-snow-wind.svg", label: "Heavy snow showers" },
    95: { day: "wi-day-thunderstorm.svg", night: "wi-night-alt-thunderstorm.svg", label: "Thunderstorm" },
    96: { day: "wi-day-thunderstorm.svg", night: "wi-night-alt-thunderstorm.svg", label: "Thunderstorm, slight hail" },
    99: { day: "wi-day-thunderstorm.svg", night: "wi-night-alt-thunderstorm.svg", label: "Thunderstorm, heavy hail" },
};

const FALLBACK_ICON = { day: "wi-na.svg", night: "wi-na.svg", label: "Unknown" };

// isDay is hardcoded true for now since the backend doesn't return sunrise/sunset
// yet. Once it does, pass the real day/night flag through here instead.
export function getWeatherIcon(code, isDay = true) {
    const entry = WEATHER_CODE_ICONS[code] ?? FALLBACK_ICON;
    const filename = isDay ? entry.day : entry.night;
    const markup = iconModules[`./assets/weather_icons/${filename}`];
    return { markup, label: entry.label };
}
