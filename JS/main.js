

const weatherApiEndpoint = "https://api.openweathermap.org/data/2.5/weather";
const oneCallApiEndpoint = "https://api.openweathermap.org/data/2.5/onecall";
const apiKey = "ab26bf8f174c0370cd63b63281374b74";
const historicalCitiesArrayKey = "historicalCities";



let inputBox = document.getElementById('input-city');
inputBox.addEventListener("keyup", e => {
    if (e.key === 13 || e.which === 13) {
        renderWeatherReportByCity(inputBox.value);
        setNewCityToLocalstorage(inputBox.value);
        renderHistoricalCities(JSON.parse(localStorage.getItem(historicalCitiesArrayKey) || '[]'));
    }
});

let searchButton = document.getElementById('search');
searchButton.addEventListener('click', () => {
    renderWeatherReportByCity(inputBox.value);
    setNewCityToLocalstorage(inputBox.value);
    renderHistoricalCities(JSON.parse(localStorage.getItem(historicalCitiesArrayKey) || '[]'));
});



function setNewCityToLocalstorage(city) {
    let store = JSON.parse(localStorage.getItem(historicalCitiesArrayKey) || '[]');
    let isCityNotExistsInStore = !store.some(elem => elem === city);
    if (city && isCityNotExistsInStore) {
        store.push(city);
    }
    localStorage.setItem(historicalCitiesArrayKey, JSON.stringify(store));
}

function renderHistoricalCities(historyCities) {
    let historyCitiesBox = document.getElementsByClassName("search-history")[0];

    historyCities.forEach(city => {
        let cityButtonClass = `city-button-${city.replace(/\s/g , "-")}`; //This code allows city with many names
        let isCityButtonNotExists = document.getElementsByClassName(cityButtonClass).length === 0;

        if (isCityButtonNotExists) {
            let cityButton = document.createElement("button");
            cityButton.setAttribute("class", cityButtonClass);
            cityButton.innerHTML = city;
            historyCitiesBox.appendChild(cityButton);

            cityButton.addEventListener('click', () => {
                renderWeatherReportByCity(cityButton.innerHTML);
            });
        }
    });
}




async function renderWeatherReportByCity(city) {
    let lon, lat;
    const url = `${weatherApiEndpoint}?q=${city}&units=metric&appid=${apiKey}`;
    let City = document.getElementById("City");
    let Today = document.getElementById("Today");
    let Icon = document.getElementById("wicon");
    let Temp = document.getElementById("Temp");
    let Wind = document.getElementById("Wind");
    let Humidity = document.getElementById("Humidity");
    let UVIndex = document.getElementById("UV-Index");



/*To get the fetch response I use the JSON, however the Json is a string and we can not use the string. 
To avoid string and get objet I need to serialized, this is why I'm using deserializedJson. 

My API give me the date in timestamp so I use a formula*1000 to get a current date
in the format dd/mm/yyyy */


    await fetch(url)
        .then(response => response.json())
        .then(deserializedJson => {
            const responseObj = deserializedJson;
            City.innerHTML = `City: ${responseObj.name}`;
            Today.innerHTML = `Today: ${new Date(responseObj.dt * 1000).toDateString()}`;
            Icon.src = `http://openweathermap.org/img/w/${responseObj.weather[0].icon}.png`;
            Temp.innerHTML = `Temp: ${responseObj.main.temp} °C`;
            Wind.innerHTML = `Wind: ${responseObj.wind.speed} MPH`;
            Humidity.innerHTML = `Humidity: ${responseObj.main.humidity} %`;
            UVIndex.innerHTML = `UVIndex: ${responseObj.main.uvi }`;

            lon = responseObj.coord.lon;
            lat = responseObj.coord.lat;
        })
        .catch(error => console.log(`Ops! Calling API for current day has this error${error}`));

    const forecastUrl = `${oneCallApiEndpoint}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastSection = document.getElementsByClassName("forecast")[0];


/* We deserializad to convert from string to object  */


    await fetch(forecastUrl)
        .then(response => response.json())
        .then(deserializedJson => {
            const forecastData = deserializedJson.daily.slice(1, 6);
            forecastData.forEach((forecastData, index) => {
                let futureDayClassname = `future-day-${index}`;
                let isFutureDaySectionExists = document.getElementsByClassName(futureDayClassname).length !== 0;
                let dateElement, iconElement, temperatureElement, windElement, humidityElement, futureDaySection;

/* Typing a city it was showing twice the futuredaysection, so this function replace the original instead to reshow it
if the function does not exist then the elements need to show up. However if the function exists does not need to show up again 
but refresh the value */
                if (!isFutureDaySectionExists) {
                    futureDaySection = document.createElement("div");
                    futureDaySection.setAttribute("class", futureDayClassname);

                    dateElement = document.createElement("span");
                    dateElement.setAttribute("class", `future-date-${index}`);
                    iconElement = document.createElement("img");
                    iconElement.setAttribute("class", `future-icon-${index}`);
                    temperatureElement = document.createElement("span");
                    temperatureElement.setAttribute("class", `future-temperature-${index}`);
                    windElement = document.createElement("span");
                    windElement.setAttribute("class", `future-wind-${index}`);
                    humidityElement = document.createElement("span");
                    humidityElement.setAttribute("class", `future-humidity-${index}`);

                    dateElement.innerHTML = new Date(forecastData.dt * 1000).toDateString();
                    iconElement.src = `http://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;
                    iconElement.alt = "Weather icon";
                    temperatureElement.innerHTML = `Temp: ${forecastData.temp.day} °C`;
                    windElement.innerHTML = `Wind: ${forecastData.wind_speed} MPH`;
                    humidityElement.innerHTML = `Humidity: ${forecastData.humidity} %`;

                    futureDaySection.appendChild(dateElement);
                    futureDaySection.appendChild(iconElement);
                    futureDaySection.appendChild(temperatureElement);
                    futureDaySection.appendChild(windElement);
                    futureDaySection.appendChild(humidityElement);

                    forecastSection.appendChild(futureDaySection);
                } else {
                    document.getElementsByClassName(`future-date-${index}`)[0].innerHTML = new Date(forecastData.dt * 1000).toDateString();
                    document.getElementsByClassName(`future-icon-${index}`)[0].src = `http://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;
                    document.getElementsByClassName(`future-icon-${index}`)[0].alt = "Weather icon";
                    document.getElementsByClassName(`future-temperature-${index}`)[0].innerHTML = `Temp: ${forecastData.temp.day} °C`;
                    document.getElementsByClassName(`future-wind-${index}`)[0].innerHTML = `Wind: ${forecastData.wind_speed} MPH`;
                    document.getElementsByClassName(`future-humidity-${index}`)[0].innerHTML = `Humidity: ${forecastData.humidity} %`;
                }

            });
        })
        .catch(error => console.log(`Ops! Calling Onecall API for forecast has this error${error}`));
};