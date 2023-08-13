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
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=21826a0aee2e7d65eec75b4c48c89fb3`;
  fetchData();
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=21826a0aee2e7d65eec75b4c48c89fb3`;
  fetchData();
}

function onError(error) {
  infoTxt.innerText = error.message;
  infoTxt.classList.add("error");
}

function fetchHourlyForecast(lat, lon) {
    const apiKey = "21826a0aee2e7d65eec75b4c48c89fb3";
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,daily&appid=${apiKey}`;
  
    return fetch(apiUrl)
      .then(response => response.json())
      .then(data => data.hourly)
      .catch(error => {
        console.log("Error fetching hourly forecast:", error);
        throw error;
      });
    
  }

  function dailyForecast(lat, lon) {
  // Replace '21826a0aee2e7d65eec75b4c48c89fb3' with your actual API key
  const apiKey = "21826a0aee2e7d65eec75b4c48c89fb3";

  // Construct the API URL using the latitude, longitude, units, and request daily forecast
  const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,hourly&appid=${apiKey}`;

  // Fetch the data from the API and parse the response as JSON
  return fetch(apiUrl)
      .then(response => response.json())
      .then(data => data.daily)
      .catch(error => {
        console.log("Error fetching hourly forecast:", error);
        throw error;
      });
}
  // console.log(dailyForecast());

function fetchData() {
  infoTxt.innerText = "Getting weather details";
  infoTxt.classList.add("pending");

  Promise.all([fetch(api)])
    .then(([weatherResponse]) => {
      return Promise.all([weatherResponse.json()]);
    })
    .then(([weatherData]) => {
        fetchHourlyForecast(weatherData.coord.lat, weatherData.coord.lon)
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
  if (weatherInfo.cod === "404") {
    infoTxt.classList.replace("pending", "error");
    infoTxt.innerText = `${inputField.value} is not a valid city name`;
  } else {
    const city = weatherInfo.name, country = weatherInfo.sys.country, 
        {description, id, icon} = weatherInfo.weather[0],
        {temp, feels_like, humidity} = weatherInfo.main,
        iconcode = "http://openweathermap.org/img/wn/" + icon + "@2x.png";      

    if (id === 800) {
      wIcon.src = iconcode;
    } else if (id >= 200 && id <= 232) {
      wIcon.src = iconcode;
    } else if (id >= 600 && id <= 622) {
      wIcon.src = iconcode;
    } else if (id >= 701 && id <= 781) {
      wIcon.src = iconcode;
    } else if (id >= 801 && id <= 804) {
      wIcon.src = iconcode;
    } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
      wIcon.src = iconcode;
    }

    weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
    weatherPart.querySelector(".weather").innerText = description;
    weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
    weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
    weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;

    infoTxt.classList.remove("pending", "error");
    infoTxt.innerText = "";
    inputField.value = "";
    wrapper.classList.add("active");


    if (hourlyWeather) {
        // Display the hourly weather forecast
        const hourlyForecastContainer = document.querySelector(".hourly-forecast");
        hourlyForecastContainer.innerHTML = ""; // Clear previous forecast
  
        hourlyWeather.forEach(hour => {
          const { temp, dt, weather } = hour;
          const description = weather[0].description;
          const time = new Date(dt * 1000).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
        //   sunrise = (date.toLocaleTimeString([], { hour12: true}));
          const icon = weather[0].icon;
          const iconCode = `http://openweathermap.org/img/wn/${icon}.png`;
  
          const forecastItem = document.createElement("div");
          forecastItem.classList.add("forecast-item");
  
          const forecastTime = document.createElement("div");
          forecastTime.classList.add("forecast-time");
          forecastTime.innerText = time;
  
          const forecastIcon = document.createElement("img");
          forecastIcon.classList.add("forecast-icon");
          forecastIcon.src = iconCode;

          const forecastDescription = document.createElement("div");
          forecastDescription.classList.add("forecast-description");
          forecastDescription.innerText = description;
  
          const forecastTemp = document.createElement("div");
          forecastTemp.classList.add("forecast-temp");
          forecastTemp.innerText = Math.round(temp) + "°C";
  
          forecastItem.appendChild(forecastTime);
          forecastItem.appendChild(forecastIcon);
          forecastItem.appendChild(forecastDescription);
          forecastItem.appendChild(forecastTemp);
  
          hourlyForecastContainer.appendChild(forecastItem);
        });


        dailyForecast(weatherInfo.coord.lat, weatherInfo.coord.lon)
      .then(dailyData => {
        // Display the 10-day weather forecast
        const dailyForecastContainer = document.querySelector(".daily-forecast");
        dailyForecastContainer.innerHTML = ""; // Clear previous forecast

        dailyData.forEach(day => {
          const { temp, weather, dt } = day;
          const description = weather[0].description;
          const date = new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const icon = weather[0].icon;
          const iconCode = `http://openweathermap.org/img/wn/${icon}.png`;

          const forecastItem = document.createElement("div");
          forecastItem.classList.add("forecast-item");

          const forecastDate = document.createElement("div");
          forecastDate.classList.add("forecast-date");
          forecastDate.innerText = date;

          const forecastIcon = document.createElement("img");
          forecastIcon.classList.add("forecast-icon");
          forecastIcon.src = iconCode;

          const forecastDescription = document.createElement("div");
          forecastDescription.classList.add("forecast-description");
          forecastDescription.innerText = description;

          const forecastTemp = document.createElement("div");
          forecastTemp.classList.add("forecast-temp");
          forecastTemp.innerText = Math.round(temp.day) + "°C";

          forecastItem.appendChild(forecastDate);
          forecastItem.appendChild(forecastIcon);
          forecastItem.appendChild(forecastDescription);
          forecastItem.appendChild(forecastTemp);

          dailyForecastContainer.appendChild(forecastItem);
        });
      })
      .catch(() => {
        console.log("Error fetching 8-day forecast:", error);
      throw error;
      });
    }
  }
}
arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});


function scrollContentLeft() {
  var div = document.getElementById("scrollableDiv");
  div.scrollBy({ left: -200, behavior: "smooth" }); // Scroll 100 pixels to the left with smooth behavior
}

function scrollRight() {
  var div = document.getElementById("scrollableDiv");
  div.scrollBy({ left: 200, behavior: "smooth" }); // Scroll 100 pixels to the right with smooth behavior
}






