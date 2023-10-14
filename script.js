


// URLs
const weatherUrlCity = 'https://api.openweathermap.org/data/2.5/weather?q=';
const forecastUrlCity = 'https://api.openweathermap.org/data/2.5/forecast?q=';
const forecastUrlLatLong = 'https://api.openweathermap.org/data/2.5/forecast?';
// const geoLocUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=Stockholm&limit=5&appid=';

// HTML Selectors
const mainSelector = document.getElementById("main");
const weatherPlaceholder = document.querySelector('.weather');
const searchBar = document.getElementById('search-bar');
const forecastPlaceholder = document.querySelector('.forecast');
const descriptionPlaceholder = document.getElementById('description');

const fetchWeatherCity = async (city) => {
  try {
    const res = await fetch(`${weatherUrlCity}${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);

    return json;
  } catch (e) {
    console.error(e);
  }
 
};

const fetchForecastCity = async (city) => {
  try {
    const res = await fetch(`${forecastUrlCity}${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);

    return json;
  } catch (e) {
    console.error(e);
  }
 
};

// TODO: Advanced Stretch goal for geolocation
const fetchForecastLatLong = async (lat, lon) => {
  try {
    const res = await fetch(`${forecastUrlLatLong}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);
    
    return json;
  } catch (e) {
    
  }
};

// function getLocation() {
  //     if (navigator.geolocation) {
  //         navigator.geolocation.getCurrentPosition(showPosition);
  //     } else {
  //         console.log("Geolocation is not supported by this browser.");
  //     }
  //   }
  //   function showPosition(position) {
  //     console.log(position.coords.latitude);
  //     console.log(position.coords.longitude); 
  //   }
  //   getLocation()

// const fetchGeoLocation = async () => {
//   try {
//     const res = await fetch(`${geoLocUrl}${API_KEY}`);
//     if (!res.ok) {
//       throw new Error(res.error);
//     }
//     const json = await res.json();
//     console.log(json);
//     return [json[0].lat, json[0].lon, json[0].name, json[0].country];
//   } catch (e) {
//     console.error(e);
//   }
// };

const filterFutureForecast = forecastList => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const futureForecast = [];
  const currentDate = new Date(forecastList[0].dt * 1000)
  forecastList.forEach(forecast => {
    const dateReadable = new Date(forecast.dt * 1000);
    if (forecast.dt_txt.includes('09:00:00') && currentDate.getDay() !== dateReadable.getDay()) {
      futureForecast.push([days[dateReadable.getDay()], Math.round(forecast.main.temp)]);
    }
  });
  return futureForecast;
};

const displayFutureForecast = forecastList => {
  let futureforecastList = '';
  forecastList.forEach(forecast => {
    futureforecastList += `
      <div>
        <p>${forecast[0]}</p>
        <p>${forecast[1]}°C</p>
      </div>
    `
  });
  return futureforecastList;
};

const getTime = (time, timezone) => {
  const timeReadable = new Date((time + timezone) * 1000);

   // we need to get the timezone offset so we can show it in the local time
  // instead of GMT
  const timezoneOffset = timeReadable.getTimezoneOffset() / 60;

  return `${timeReadable.getHours() + timezoneOffset}.${timeReadable.getMinutes().toString().padStart(2, "0")}`
};

const showDescription = (city, description) => {
  mainSelector.classList.remove(...mainSelector.classList);
  // description = 'Sno';
  switch (description) {
    case 'Clear':
      descriptionPlaceholder.innerHTML = `Get your sunnies on. ${city} is looking rather great today.`;
      icon.src = "./icons/sunglasses.svg";
      mainSelector.classList.add("sunny");
      break;
    case 'Clouds':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} is looking grey today.`;
      icon.src = "./icons/clouds.svg";
      mainSelector.classList.add("cloudy");
      break;
    case 'Rain':
    case 'Thunderstorm':
    case 'Drizzle':
      descriptionPlaceholder.innerHTML = `Don't forget your umbrella. It's wet in ${city} today.`;
      icon.src = "./icons/umbrella.svg"
      mainSelector.classList.add("rainy");
      break;
    case 'Snow':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} looks snowy today.`;
      icon.src = "./icons/snow.svg";
      mainSelector.classList.add("snow");
      break;
    default:
      descriptionPlaceholder.innerHTML = `Be careful today in ${city}!`;
      icon.src = "./icons/unknown.svg";
      mainSelector.classList.add("unknown");
  };
};

const displayWeather = (weather, forecast) => {
  const { name, timezone } = weather;
  const { sunrise, sunset } = weather.sys;
  const { temp, feels_like: feelsLike } = weather.main;
  const { main, description } = weather.weather[0];

  const futureForecast = filterFutureForecast(forecast.list);

  const weatherOutput = `
    <p>
      ${description} | ${Math.round(temp)} °C
    </p>
    <p>
      feels like ${Math.round(feelsLike)} °C
    </p>
    <p>
      sunrise ${getTime(sunrise, timezone)}
    </p>
    <p>
      sunset ${getTime(sunset, timezone)}
    </p>
  `;
  weatherPlaceholder.innerHTML = weatherOutput;

  forecastPlaceholder.innerHTML = `${displayFutureForecast(futureForecast)}`;
  showDescription(name, main);
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  searchBar.value = '';
  const weather = await fetchWeatherCity(searchBarText);
  const forecast = await fetchForecastCity(searchBarText);
  displayWeather(weather, forecast);
}

(async() => {
  const initialWeather = await fetchWeatherCity('stockholm');
  const initialForecast = await fetchForecastCity('stockholm');
  displayWeather(initialWeather, initialForecast);
})();