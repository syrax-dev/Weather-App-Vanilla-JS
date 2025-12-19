const API_KEY = "b6731de5873772c1eded405a0583456d";

// Get all DOM elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("searchBtn");
const preSearchDiv = document.getElementById("pre-search");
const cityName = document.getElementById("city-name").querySelector("h2");
const tempInfo = document.getElementById("temp-info");
const weatherCondition = document.getElementById("weather-condition");
const currentDate = document.getElementById("current-date");
const tempFeels = document.getElementById("temp-feels");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const forecastSection = document.getElementById("forecast-section");
const forecastContainer = document.getElementById("forecast-container");

// Helper function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// Helper function to format time
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get day name
function getDayName(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Fetch current weather data
async function getWeather(city) {
  try {
    searchBtn.textContent = "Loading...";
    searchBtn.disabled = true;

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );

    if (!weatherResponse.ok) {
      throw new Error("City not found");
    }

    const weatherData = await weatherResponse.json();
    console.log("Current weather:", weatherData);

    // Get coordinates for forecast
    const { lat, lon } = weatherData.coord;

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await forecastResponse.json();
    console.log("Forecast data:", forecastData);

    updateWeatherUI(weatherData);
    updateForecastUI(forecastData);

    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
    cityInput.value = "";
  } catch (error) {
    alert(
      "Unable to fetch weather data. Please check the city name and try again."
    );
    console.error("Error:", error);
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
  }
}

// Update current weather UI
function updateWeatherUI(data) {
  preSearchDiv.style.display = "none";

  cityName.textContent = data.name;
  tempInfo.textContent = `${Math.round(data.main.temp)}°C`;

  const description = data.weather[0].description;
  const capitalizedDescription = description
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  weatherCondition.textContent = capitalizedDescription;
  currentDate.textContent = formatDate(data.dt);

  tempFeels.textContent = `${Math.round(data.main.feels_like)}°C`;
  wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  sunrise.textContent = formatTime(data.sys.sunrise);
}

// Update 4-day forecast UI
function updateForecastUI(data) {
  forecastSection.classList.remove("hidden");
  forecastContainer.innerHTML = "";

  // Get one forecast per day (around noon)
  const dailyForecasts = [];
  const seenDates = new Set();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const hour = new Date(item.dt * 1000).getHours();

    if (!seenDates.has(date) && hour >= 12 && hour <= 15) {
      seenDates.add(date);
      dailyForecasts.push(item);
    }
  });

  // Take first 4 days
  dailyForecasts.slice(0, 4).forEach((forecast) => {
    const forecastCard = document.createElement("div");
    forecastCard.className =
      "bg-[#7942d6] rounded-2xl p-4 flex flex-col items-center space-y-2";

    const dayName = getDayName(forecast.dt);
    const temp = Math.round(forecast.main.temp);
    const description = forecast.weather[0].description;
    const capitalizedDesc = description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    forecastCard.innerHTML = `
            <p class="font-bold text-lg">${dayName}</p>
            <p class="text-4xl font-bold">${temp}°C</p>
            <p class="text-sm opacity-90 text-center">${capitalizedDesc}</p>
            <div class="flex justify-around w-full mt-2 pt-2 border-t border-white/20">
              <div class="text-center">
                <p class="text-xs opacity-75">Wind</p>
                <p class="text-sm font-semibold">${Math.round(
                  forecast.wind.speed * 3.6
                )} km/h</p>
              </div>
              <div class="text-center">
                <p class="text-xs opacity-75">Humidity</p>
                <p class="text-sm font-semibold">${forecast.main.humidity}%</p>
              </div>
            </div>
          `;

    forecastContainer.appendChild(forecastCard);
  });
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name");
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);
    } else {
      alert("Please enter a city name");
    }
  }
});
