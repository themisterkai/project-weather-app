// API Key
const API_KEY = 'e4134b5157580978642e8b8494680fc8';

// URLs
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?';

// Error messages
const error404 = `Can't find what you're looking for. Try another city, <br> or add the country as well: 'Stockholm, Sweden'!`;
const errorGeoCode1 = `Permission required to proceed with  acquisition of the geolocation information. Please give permission and try again.`;
const errorGeoCodeOthers = `Acquisition of the geolocation information failed. Please try again.`;

// String constants 
const celcius = 'celcius';
const fahrenheit = 'fahrenheit';

// HTML Selectors
const mainSelector = document.getElementById("main");
const geolocationLink = document.getElementById("geolink");
const weatherPlaceholder = document.querySelector('.weather');
const errorPlaceholder = document.querySelector('.error');
const searchBar = document.getElementById('search-bar');
const forecastPlaceholder = document.querySelector('.forecast');
const descriptionPlaceholder = document.getElementById('description');
const fahrenheitController = document.getElementById('control-f');
const celciusController = document.getElementById('control-c');
const controlPlaceHolder = document.querySelector(".control");
const celciusSelector = document.querySelectorAll('.celcius');

// We set the temperature to celcius when we first load the app
let temperatureMeasurementSetting = celcius;

const fetchWeather = async ({
  city,
  lat,
  lon,
}) => {
  let url = `${weatherUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${weatherUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404){
        errorPlaceholder.innerHTML = error404;
        return;
      } else {
        throw new Error(res.error);
      }
    }
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e);
  }
 
};

const fetchForecast = async ({
  city,
  lat,
  lon,
}) => {
  let url = `${forecastUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${forecastUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404){
        errorPlaceholder.innerHTML = error404;
        return;
      } else {
        throw new Error(res);
      }
    }
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e.status);
  }
};

const getUserLocation = async () => {
   return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );
};

const getUserLatLong = async () => {
  try {
    const position = await getUserLocation();
    return position.coords;
  } catch (e) {
    if (e.code === 1) {
      errorPlaceholder.innerHTML = errorGeoCode1;
    } else {
      errorPlaceholder.innerHTML = errorGeoCodeOthers;
    }
    console.error(e);
  }
};

const celsiusToFahrenheit = celsius => {
  return celsius * 9/5 + 32;
};

const filterFutureForecast = forecastList => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const forecastCombined =  forecastList.reduce((acc, forecast) => {
    const systemDate = new Date();
    const forecastDateReadable = new Date(forecast.dt * 1000);
    const forecastDate = forecast.dt_txt.split(" ")[0];

    if (!acc.hasOwnProperty(forecastDate)) {
      acc[forecastDate] = {
        highC: Math.round(forecast.main.temp_max),
        lowC: Math.round(forecast.main.temp_min),
        highF: Math.round(celsiusToFahrenheit(forecast.main.temp_max)),
        lowF: Math.round(celsiusToFahrenheit(forecast.main.temp_min)),
        date: forecastDate,
        day: systemDate.getDay() === forecastDateReadable.getDay() ? 'Today' : days[forecastDateReadable.getDay()],
      };
    }
    if (forecast.main.temp_max > acc[forecastDate].highC) {
      acc[forecastDate].highC = Math.round(forecast.main.temp_max);
      acc[forecastDate].highF = Math.round(celsiusToFahrenheit(forecast.main.temp_max));
    }
    if (forecast.main.temp_min < acc[forecastDate].lowC) {
      acc[forecastDate].lowC = Math.round(forecast.main.temp_min);
      acc[forecastDate].lowF = Math.round(celsiusToFahrenheit(forecast.main.temp_min));
    }
    return acc;
  }, {});

  return Object.values(forecastCombined).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
};

const displayFutureForecast = forecastList => {
  let futureforecastList = '';
  forecastList.forEach(forecast => {
    futureforecastList += `
      <div>
        <p>${forecast.day}</p>
        <p class=${celcius}>${forecast.lowC} °C / ${forecast.highC} °C </p>
        <p class=${fahrenheit}>${forecast.lowF} °F / ${forecast.highF} °F </p>
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
  switch (description) {
    case 'Clear':
      descriptionPlaceholder.innerHTML = `Get your sunnies on. ${city} is looking rather great today.`;
      icon.src = "./icons/sunglasses.svg";
      mainSelector.classList.add("sunny");
      break;
    case 'Clouds':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} is looking grey today.`;
      icon.src = "./icons/clouds.svg";
      mainSelector.classList.add("grey");
      break;
    case 'Rain':
    case 'Thunderstorm':
    case 'Drizzle':
    case 'Mist':
      descriptionPlaceholder.innerHTML = `Don't forget your umbrella. It's wet in ${city} today.`;
      icon.src = "./icons/umbrella.svg"
      mainSelector.classList.add("wet");
      break;
    case 'Snow':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} looks snowy today.`;
      icon.src = "./icons/snow.svg";
      mainSelector.classList.add("snow");
      break;
    default:
      descriptionPlaceholder.innerHTML = `Be careful today in ${city}!`;
      icon.src = "./icons/unknown.svg";
      mainSelector.classList.add("default");
  };
};

const displayTemperature = () => {
  const fahrenheitSelector = document.querySelectorAll('.fahrenheit');
  const celciusSelector = document.querySelectorAll('.celcius');
  if (temperatureMeasurementSetting === celcius) {
    celciusController.innerHTML = `<b>°C</b>`;
    fahrenheitController.innerHTML = `<a href="javascript:void(0)">°F</a>`;
    fahrenheitSelector.forEach(element => {
      element.style.display = 'none';
    });
    celciusSelector.forEach(element => {
      element.style.display = 'flex';
    });
  } else {
    celciusController.innerHTML = `<a href="javascript:void(0)">°C</a>`;
    fahrenheitController.innerHTML = `<b>°F</b>`;
    celciusSelector.forEach(element => {
      element.style.display = 'none';
    });
    fahrenheitSelector.forEach(element => {
      element.style.display = 'flex';
    });
  }
};

const displayWeather = (weather, forecast) => {
  const { name, timezone } = weather;
  const { sunrise, sunset } = weather.sys;
  const { temp, feels_like: feelsLike } = weather.main;
  const { main, description } = weather.weather[0];

  const futureForecast = filterFutureForecast(forecast.list);

  const weatherOutput = `
    <p class=${celcius}>
      ${description} | ${Math.round(temp)} °C
    </p>
    <p class=${celcius}>
      feels like ${Math.round(feelsLike)} °C
    </p>
    <p class=${fahrenheit}>
      ${description} | ${Math.round(celsiusToFahrenheit(temp))} °F
    </p>
    <p class=${fahrenheit}>
      feels like ${Math.round(celsiusToFahrenheit(feelsLike))} °F
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

  errorPlaceholder.innerHTML = '';
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  searchBar.value = '';
  const weather = await fetchWeather({city: searchBarText});
  const forecast = await fetchForecast({city: searchBarText});
  displayWeather(weather, forecast);
  displayTemperature();
};

geolocationLink.onclick = async () => {
  const { latitude: lat, longitude: lon } = await getUserLatLong();
  const weather = await fetchWeather({lat, lon});
  const forecast = await fetchForecast({lat, lon});
  displayWeather(weather, forecast);
  displayTemperature();
};

fahrenheitController.onclick = () => {
  temperatureMeasurementSetting = fahrenheit;
  displayTemperature();
};

celciusController.onclick = () => {
  temperatureMeasurementSetting = celcius;
  displayTemperature();
};

(async() => {
  const initialWeather = await fetchWeather({city: 'stockholm'});
  const initialForecast = await fetchForecast({city: 'stockholm'});
  displayWeather(initialWeather, initialForecast);
  displayTemperature();
})();