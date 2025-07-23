// Show today's date
var monthName = [ "January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December" ];
var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var today = new Date();

// Display the formatted date in the UI
document.getElementsByClassName('date')[0].innerHTML = 
    `${dayNames[today.getDay()]}, ${today.getDate()} ${monthName[today.getMonth()]} ${today.getFullYear()}`;

// Trigger weather check when user presses Enter
document.getElementById('city').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        check(); // Call weather check function
    }
});

// Fetch current and forecast weather data
async function check() {
    const cityname = document.getElementById('city').value;
    const temperature = document.getElementById('temperature');
    const cond = document.getElementById('cond');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const location = document.getElementById('location');
    const apikey = '8041c8cb8d527b58717a7d216e502ade';

    // API URLs for current weather and 5-day forecast
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apikey}&units=metric`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${apikey}&units=metric`;

    try {
        // Fetch both APIs in parallel for efficiency
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentWeatherURL),
            fetch(forecastURL)
        ]);

        // Check if either response is invalid
        if (!currentRes.ok || !forecastRes.ok) throw new Error("City not found");

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        // Update current weather UI
        temperature.innerHTML = `${currentData.main.temp} <sup>°C </sup>`;
        cond.innerHTML = `${currentData.weather[0].description}`;
        humidity.innerHTML = ` Humidity ${currentData.main.humidity}%`;
        wind.innerHTML = `Wind ${currentData.wind.speed} m/s`;
        location.innerHTML = `${currentData.name}, ${currentData.sys.country}`;

        // Update hourly forecast (next 5 entries ≈ 15 hours)
        updateHourlyForecast(forecastData.list.slice(0, 5));
        
    } catch (error) {
        document.getElementById('result').innerHTML = `${error.message}`;
    }
}

// Update hourly forecast section with weather data
function updateHourlyForecast(hourlyData) {
    const hourBlocks = document.querySelectorAll(".hour-block");

    hourlyData.forEach((data, index) => {
        if (index < hourBlocks.length) {
            const time = new Date(data.dt * 1000); // Convert UNIX timestamp
            const hours = time.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHour = `${hours % 12 || 12} ${ampm}`;

            const temperature = Math.round(data.main.temp);
            const weatherMain = data.weather[0].main;
            const emoji = getEmojiForWeather(weatherMain); // Get matching emoji

            // Update each block with time, emoji and temperature
            hourBlocks[index].querySelector(".hour-time").textContent = formattedHour;
            hourBlocks[index].querySelector(".hour-emoji").textContent = emoji;
            hourBlocks[index].querySelector(".hour-temp").textContent = `${temperature}°C`;
        }
    });
}

// Return appropriate emoji for given weather condition
function getEmojiForWeather(condition) {
    const emojis = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Thunderstorm: "⛈️",
        Snow: "❄️",
        Mist: "🌫️",
        Smoke: "💨",
        Haze: "🌫️",
        Dust: "🌪️",
        Fog: "🌫️",
        Sand: "🌪️",
        Ash: "🌋",
        Squall: "🌬️",
        Tornado: "🌪️"
    };
    return emojis[condition] || "❔"; // fallback emoji if not matched
}
