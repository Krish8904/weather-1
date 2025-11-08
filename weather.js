const API_KEY = "d7ea5627511449b7fbd75182c8c23733";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const messageEl = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");
const locationName = document.getElementById("locationName");
const timeLocal = document.getElementById("timeLocal");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("weatherIcon");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#ffd7d7" : "#bfe9ff";
}

function clearMessage() {
  messageEl.textContent = "";
}

function showCard() {
  weatherCard.classList.remove("hidden");
}

function hideCard() {
  weatherCard.classList.add("hidden");
}

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) throw new Error("City not found.");
    if (res.status === 401) throw new Error("Invalid API key.");
    throw new Error("Error: " + res.statusText);
  }

  return await res.json();
}

function localTime(offset) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offset * 1000);
  return local.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderWeather(data) {
  locationName.textContent = `${data.name}${
    data.sys && data.sys.country ? ", " + data.sys.country : ""
  }`;

  timeLocal.textContent = localTime(data.timezone || 0);
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  descEl.textContent =
    data.weather && data.weather[0] ? data.weather[0].description : "";
  feelsEl.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

  if (data.weather && data.weather[0] && data.weather[0].icon) {
    const icon = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    iconEl.alt = data.weather[0].description || "";
    iconEl.classList.remove("hidden");
  } else {
    iconEl.classList.add("hidden");
  }

  showCard();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    showMessage("Please enter a city.", true);
    hideCard();
    return;
  }

  if (!API_KEY || API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
    showMessage("Set your API key in script.js", true);
    return;
  }

  showMessage("Loading...");
  hideCard();

  try {
    const data = await fetchWeather(city);
    clearMessage();
    renderWeather(data);
  } catch (err) {
    showMessage(err.message || "Error fetching weather.", true);
    hideCard();
  }
});
