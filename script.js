// DOM Elements
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");
const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const forecastItemsContainer = document.querySelector(
  ".forecast-items-container"
);
const locationButton = document.getElementById("locationButton");

const apiKey = "9077c9acd3a7085802cb07bdba313f45"; // OpenWeather API key
const openCageApiKey = "900096dfa42b4dd6832985bc912f2cfd"; // OpenCage API key

// Event Listener for Search
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

// Event Listener for Enter Key in Search
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

// Function to Fetch Data from API
async function getFetchData(endpoint, query) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${query}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(apiUrl);
    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Function to Fetch Current Location Data
locationButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchLocation, handleError);
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

function fetchLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const location =
        data.results[0]?.components?.city ||
        data.results[0]?.components?.town ||
        data.results[0]?.components?.village;

      if (location) {
        updateWeatherInfo(location);
      } else {
        alert("Unable to determine your location.");
      }
    })
    .catch((error) => {
      alert("An error occurred while fetching your location.");
      console.error("Error:", error);
    });
}

function handleError(error) {
  let message = "";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = "You denied the request for geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      message = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      message = "The request to get your location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      message = "An unknown error occurred.";
      break;
  }
  alert(message);
}

// Update Weather Info
async function updateWeatherInfo(city) {
  const weatherData = await getFetchData("weather", city);
  if (!weatherData || weatherData.cod !== 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = `${Math.round(temp)}°C`;
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${speed} km/h`;
  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastsInfo(city);
  showDisplaySection(weatherInfoSection);
}

// Update Forecasts Info
async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData("forecast", city);
  if (!forecastsData) return;

  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];
  forecastItemsContainer.innerHTML = "";

  forecastsData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather);
    }
  });
}

function updateForecastItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = { day: "2-digit", month: "short" };
  const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
      <img
        src="assets/weather/${getWeatherIcon(id)}"
        alt=""
        class="forecast-item-img"
      />
      <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
  `;
  forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

// Utility Functions
function getWeatherIcon(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 871) return "atmosphere.svg";
  if (id === 800) return "clear.svg";
  return "clouds.svg";
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = { weekday: "short", day: "2-digit", month: "short" };
  return currentDate.toLocaleDateString("en-GB", options);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(
    (sec) => (sec.style.display = "none")
  );
  section.style.display = "flex";
}
