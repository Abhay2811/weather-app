const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");
let api;
inputField.addEventListener("keyup", e =>{
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});
locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});
function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=21826a0aee2e7d65eec75b4c48c89fb3`;
    fetchData();https
}
function onSuccess(position){
    const {latitude, longitude} = position.coords;
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=21826a0aee2e7d65eec75b4c48c89fb3`;
    fetchData();
}
function onError(error){
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}
function fetchData(){
    infoTxt.innerText = "Getting weather details";
    infoTxt.classList.add("pending");
    fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}
function weatherDetails(info){
    if(info.cod == "404"){
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        const city = info.name;
        const country = info.sys.country;
        const {description, id, icon} = info.weather[0];
        const {temp, feels_like, humidity} = info.main;
        const region = info.sys.sunrise;
        const regionn = info.sys.sunset;
        const unixTimestamp = region,
        date = new Date(unixTimestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
        sunrise = (date.toLocaleTimeString([], { hour12: true}));

        const unixTimestampp = regionn,
        datee = new Date(unixTimestampp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
        sunset = (datee.toLocaleTimeString([], { hour12: true}));
        
        const iconcode = "http://openweathermap.org/img/wn/" + icon + "@2x.png"


        if(id == 800){
            wIcon.src = iconcode;
        }else if(id >= 200 && id <= 232){
            wIcon.src = iconcode;  
        }else if(id >= 600 && id <= 622){
            wIcon.src = iconcode;
        }else if(id >= 701 && id <= 781){
            wIcon.src = iconcode;
        }else if(id >= 801 && id <= 804){
            wIcon.src = iconcode;
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = iconcode;
        }
        
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        weatherPart.querySelector(".humidityy span").innerText = `${sunrise}`;
        weatherPart.querySelector(".humidityyy span").innerText = `${sunset}`;
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");
    }
}
arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});