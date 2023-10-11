


// URLs
const forecastUrlCity = 'https://api.openweathermap.org/data/2.5/forecast?q=';
const forecastUrlLatLong = 'https://api.openweathermap.org/data/2.5/forecast?';
const geoLocUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=Stockholm&limit=5&appid=';

// HTML Selectors
const weatherPlaceholder = document.querySelector('.weather');
const searchBar = document.getElementById('search-bar');

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

const fetchGeoLocation = async () => {
  try {
    const res = await fetch(`${geoLocUrl}${API_KEY}`);
    if (!res.ok) {
      throw new Error(res.error);
    }
    const json = await res.json();
    console.log(json);
    return [json[0].lat, json[0].lon, json[0].name, json[0].country];
  } catch (e) {
    console.error(e);
  }
};

const filterFutureForecast = forecastList => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const futureForecast = [];
  forecastList.forEach(forecast => {
    if (forecast.dt_txt.includes('12:00:00')) {
      const dateReadable = new Date(forecast.dt * 1000);
      futureForecast.push([days[dateReadable.getDay()], Math.round(forecast.main.temp)]);
    }
  });

  if (futureForecast.length === 5) {
    futureForecast.shift();
  }
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

const displayWeather = forecast => {
  const { name, country, sunrise, sunset } = forecast.city;
  const { temp } = forecast.list[0].main;
  const { main, description } = forecast.list[0].weather[0];

  const sunriseReadable = new Date(sunrise * 1000);
  const sunsetReadable = new Date(sunset * 1000);

  const futureForecast = filterFutureForecast(forecast.list);

  const weatherOutput = `
    <div>
      ${name}, ${country}
    </div>
    <div>
      ${Math.round(temp)}°C
    </div>
    <div>
      sunrise: ${sunriseReadable.getHours()}:${sunriseReadable.getMinutes()}
    </div>
    <div>
      sunset: ${sunsetReadable.getHours()}:${sunsetReadable.getMinutes()}
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
  const forecast = await fetchForecastCity(searchBarText);
  displayWeather(forecast);
}

