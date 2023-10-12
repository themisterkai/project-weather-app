


// URLs
const weatherUrlCity = 'https://api.openweathermap.org/data/2.5/weather?q=';
const forecastUrlCity = 'https://api.openweathermap.org/data/2.5/forecast?q=';
// const forecastUrlLatLong = 'https://api.openweathermap.org/data/2.5/forecast?';
// const geoLocUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=Stockholm&limit=5&appid=';

// HTML Selectors
const weatherPlaceholder = document.querySelector('.weather');
const searchBar = document.getElementById('search-bar');

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

// TODO: Advanced Stretch goal for geolocation
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
        ${forecast[0]} ${forecast[1]}°C
      </div>
    `
  });
  return futureforecastList;
}

const displayWeather = (weather, forecast) => {
  const { name, timezone } = weather;
  const { country, sunrise, sunset } = weather.sys;
  const { temp } = weather.main;
  const { main, description } = weather.weather[0];
  
  const sunriseReadable = new Date((sunrise + timezone) * 1000);
  const sunsetReadable = new Date((sunset+ timezone) * 1000);

  // we need to get the timezone offset so we can show it in the local time
  // instead of GMT
  const sunriseOffset = sunriseReadable.getTimezoneOffset() / 60;
  const sunsetOffset = sunsetReadable.getTimezoneOffset() / 60;

  const futureForecast = filterFutureForecast(forecast.list);

  const weatherOutput = `
    <div>
      ${name}, ${country}
    </div>
    <div>
      ${Math.round(temp)}°C
    </div>
    <div>
      sunrise: ${sunriseReadable.getHours() + sunriseOffset}:${sunriseReadable.getMinutes().toString().padStart(2, "0")}
    </div>
    <div>
      sunset: ${sunsetReadable.getHours() + sunsetOffset}:${sunsetReadable.getMinutes().toString().padStart(2, "0")}
    </div>
    <div>
      ${main}, ${description}
    </div>
    ${displayFutureForecast(futureForecast)}
    `;
  weatherPlaceholder.innerHTML = weatherOutput;
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  console.log(searchBarText)
  const weather = await fetchWeatherCity(searchBarText);
  const forecast = await fetchForecastCity(searchBarText);
  displayWeather(weather, forecast);
}

(async() => {
  const initialWeather = await fetchWeatherCity('stockholm');
  const initialForecast = await fetchForecastCity('stockholm');
  displayWeather(initialWeather, initialForecast);



})();