const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");

let api;

inputField.addEventListener("keyup", e => {
  if (e.key === "Enter" && inputField.value !== "") {
    requestApi(inputField.value);
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Your browser does not support geolocation API.");
  }
});

function requestApi(city) {
  const apiKey = '080279ddec284d8684a54329232804';
  api = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
  fetchData();
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  const apiKey = '080279ddec284d8684a54329232804'; 
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`; 
  api = apiUrl;
  fetchData();
}

function onError(error) {
  infoTxt.innerText = error.message;
  infoTxt.classList.add("error");
}

function fetchHourlyForecast(lat, lon) {
  const apiKey = "080279ddec284d8684a54329232804"; 
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&hours=24`;
  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => data.forecast.forecastday[0].hour)
    .catch(error => {
      // console.log("Error fetching hourly forecast:", error);
      throw error;
    });
}

function dailyForecast(lat, lon) {
  const apiKey = "080279ddec284d8684a54329232804"; 
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`;
  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => data.forecast.forecastday)
    .catch(error => {
      // console.log("Error fetching daily forecast:", error);
      throw error;
    });
}

function fetchData() {
  infoTxt.innerText = "Getting weather details";
  infoTxt.classList.add("pending");

  Promise.all([fetch(api)])
    .then(([weatherResponse]) => {
      return Promise.all([weatherResponse.json()]);
    })
    .then(([weatherData]) => {
      fetchHourlyForecast(weatherData.location.lat, weatherData.location.lon)
        .then(hourlyData => {
          weatherDetails(weatherData, hourlyData);
        })
        .catch(() => {
          weatherDetails(weatherData, null);
        });
    })
    .catch(() => {
      infoTxt.innerText = "Something went wrong";
      infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(weatherInfo, hourlyWeather) {
  if (!weatherInfo) {
    infoTxt.classList.replace("pending", "error");
    infoTxt.innerText = "City not found";
    return;
  }

  const { name: city, region, country } = weatherInfo.location;
  const  { condition, icon } = weatherInfo.current,
    { temp_c, feelslike_c, humidity } = weatherInfo.current;
    const iconUrl = "https:" + condition.icon;

  // Set weather icon based on condition
  wIcon.src = iconUrl;

  weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp_c);
  weatherPart.querySelector(".weather").innerText = condition.text;
  weatherPart.querySelector(".location .state").innerText = `${city}, ${region}`;
  weatherPart.querySelector(".country").innerText = `${country}`;

  weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feelslike_c);
  weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;

  infoTxt.classList.remove("pending", "error");
  infoTxt.innerText = "";
  inputField.value = "";
  wrapper.classList.add("active");

  if (hourlyWeather) {
    // hourly weather forecast
    const hourlyForecastContainer = document.querySelector(".hourly-forecast");
    hourlyForecastContainer.innerHTML = "";

    hourlyWeather.forEach(hour => {
      const { temp_c, time, condition } = hour;
      // const description = condition.text;
      const iconCode = "https:" + condition.icon;

      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");

      const forecastTime = document.createElement("div");
      forecastTime.classList.add("forecast-time");
      forecastTime.innerText = time.substring(11);

      const forecastIcon = document.createElement("img");
      forecastIcon.classList.add("forecast-icon");
      forecastIcon.src = iconCode;

      // const forecastDescription = document.createElement("div");
      // forecastDescription.classList.add("forecast-description");
      // forecastDescription.innerText = description;

      const forecastTemp = document.createElement("div");
      forecastTemp.classList.add("forecast-temp");
      forecastTemp.innerText = Math.round(temp_c) + "°C";

      forecastItem.appendChild(forecastTime);
      forecastItem.appendChild(forecastIcon);
      // forecastItem.appendChild(forecastDescription);
      forecastItem.appendChild(forecastTemp);

      hourlyForecastContainer.appendChild(forecastItem);
    });

    //daily forecast
    dailyForecast(weatherInfo.location.lat, weatherInfo.location.lon)
      .then(dailyData => {
        // Display daily forecast
        const dailyForecastContainer = document.querySelector(".daily-forecast");
        dailyForecastContainer.innerHTML = "";

        dailyData.slice(1).forEach(day => {
          const { day: { avgtemp_c }, date, day: { condition: { text }, icon } } = day;
          const iconCode = "https:" + condition.icon;

          const forecastItem = document.createElement("div");
          forecastItem.classList.add("forecast-item");

          const forecastDate = document.createElement("div");
          forecastDate.classList.add("forecast-date");
          forecastDate.innerText = new Date(date).toLocaleDateString();

          const forecastIcon = document.createElement("img");
          forecastIcon.classList.add("forecast-icon");
          forecastIcon.src = iconCode;

          // const forecastDescription = document.createElement("div");
          // forecastDescription.classList.add("forecast-description");
          // forecastDescription.innerText = text;

          const forecastTemp = document.createElement("div");
          forecastTemp.classList.add("forecast-temp");
          forecastTemp.innerText = Math.round(avgtemp_c) + "°C";

          forecastItem.appendChild(forecastDate);
          forecastItem.appendChild(forecastIcon);
          // forecastItem.appendChild(forecastDescription);
          forecastItem.appendChild(forecastTemp);

          dailyForecastContainer.appendChild(forecastItem);
        });
      })
      .catch(() => {
        console.log("Error fetching daily forecast");
      });
  }
}

arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");
});

function scrollContentLeft() {
  let div = document.getElementById("scrollableDiv");
  div.scrollBy({ left: -200, behavior: "smooth" }); 
}

function scrollRight() {
  let div = document.getElementById("scrollableDiv");
  div.scrollBy({ left: 200, behavior: "smooth" }); 
}
