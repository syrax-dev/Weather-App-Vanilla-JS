const API_KEY = "b6731de5873772c1eded405a0583456d"; // OpenWeatherMap API Key

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("searchBtn");
const preSearchDiv = document.getElementById("pre-search");
const weatherInfoSection = document.getElementById("weather-info");

// Current weather display elements
const cityName = document.getElementById("city-name").querySelector("h2");
const tempInfo = document.getElementById("temp-info");
const weatherCondition = document.getElementById("weather-condition");
const currentDate = document.getElementById("current-date");

// Additional weather info elements
const tempFeels = document.getElementById("temp-feels");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");

// Forecast elements
const forecastSection = document.getElementById("forecast-section");
const forecastContainer = document.getElementById("forecast-container");

/**
 * Formats Unix timestamp to readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date (e.g., "Monday, December 20, 2025")
 */
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

/**
 * Formats Unix timestamp to readable time string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted time (e.g., "6:30 AM")
 */
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gets abbreviated day name from Unix timestamp
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Day name (e.g., "Mon", "Tue")
 */
function getDayName(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Fetches current weather and 4-day forecast for specified city
 * @param {string} city - Name of the city to get weather for
 * @async
 * @throws {Error} When API request fails or city is not found
 */
async function getWeather(city) {
  try {
    // Update button state to show loading
    searchBtn.textContent = "Loading...";
    searchBtn.disabled = true;

    // Fetch current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );

    // Handle city not found error
    if (!weatherResponse.ok) {
      throw new Error("City not found");
    }

    const weatherData = await weatherResponse.json();

    // Extract coordinates for forecast API call
    const { lat, lon } = weatherData.coord;

    // Fetch 4-day forecast data (in 3-hour intervals)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await forecastResponse.json();

    // Update UI with fetched data
    updateWeatherUI(weatherData);
    updateForecastUI(forecastData);

    // Reset button state
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
    cityInput.value = "";
  } catch (error) {
    // Show user-friendly error message
    alert(
      "Unable to fetch weather data. Please check the city name and try again."
    );
    console.error("Error:", error);

    // Reset button state
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
  }
}

/**
 * Updates the UI with current weather data
 *
 * @param {Object} data - Weather data object from API
 * @param {Object} data.main - Temperature and pressure data
 * @param {Array} data.weather - Weather conditions array
 * @param {Object} data.sys - Sunrise/sunset data
 * @param {Object} data.wind - Wind speed data
 */
function updateWeatherUI(data) {
  // Hide the pre-search placeholder
  preSearchDiv.style.display = "none";
  weatherInfoSection.classList.remove("hidden");

  // Update city name
  cityName.textContent = data.name;
  // Update temperature (rounded to nearest degree)
  tempInfo.textContent = `${Math.round(data.main.temp)}°C`;

  // Capitalize weather description
  const description = data.weather[0].description;
  const capitalizedDescription = description
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  weatherCondition.textContent = capitalizedDescription;
  // Update date
  currentDate.textContent = formatDate(data.dt);

  // Update additional weather information
  tempFeels.textContent = `${Math.round(data.main.feels_like)}°C`;
  wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  sunrise.textContent = formatTime(data.sys.sunrise);
}

/**
 * Updates the UI with 4-day forecast data
 * @param {Object} data - Forecast data object from API
 * @param {Array} data.list - Array of forecast objects (3-hour intervals)
 */
function updateForecastUI(data) {
  // Show forecast section
  forecastSection.classList.remove("hidden");

  // Clear any existing forecast cards
  forecastContainer.innerHTML = "";

  // Filter forecast data to get one entry per day (around noon)
  const dailyForecasts = [];
  const seenDates = new Set(); // O(1) lookup for date deduplication

  // Filter logic: select midday forecasts (12-3 PM) for representative daily conditions
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const hour = new Date(item.dt * 1000).getHours();

    // Get one forecast per day between 12 PM and 3 PM
    if (!seenDates.has(date) && hour >= 12 && hour <= 15) {
      seenDates.add(date);
      dailyForecasts.push(item);
    }
  });

  // Display first 4 days of forecast
  dailyForecasts.slice(0, 4).forEach((forecast) => {
    // Create forecast card element
    const forecastCard = document.createElement("div");
    forecastCard.className =
      "bg-[#7942d6] rounded-2xl p-4 flex flex-col items-center space-y-2";

    // Extract forecast data
    const dayName = getDayName(forecast.dt);
    const temp = Math.round(forecast.main.temp);
    const description = forecast.weather[0].description;

    // Capitalize description
    const capitalizedDesc = description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Build forecast card HTML
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

    // Add card to container
    forecastContainer.appendChild(forecastCard);
  });
}

/**
 * Search button click event
 * Triggers weather search when button is clicked
 */
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name");
  }
});

/**
 * Enter key press event on input field
 * Triggers weather search when Enter key is pressed
 */
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
