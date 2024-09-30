import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

createApp({
    data() {
        return {
            data: [],
            form: null,
            search: null,
            citysearchresults: [],
            selectedcountry: null,
            weather_result: null,
            location: null,
            result: false,
        }
    },
    created() {
    },
    computed() {
    },
    methods: {
        /**
         * Uses geocode's autocomplete API to autocomplete from cities around the world. Autofill does not work in firefox for some reason.
         * 
         * @param {string} input 
         */
        fetchAutocomplete(input) {
            fetch("https://api.geoapify.com/v1/geocode/autocomplete?text=" + input.value + "&type=city&format=json&apiKey=c581304a4eed4597ae80e203be1b6121")
                .then((result) => result.json())
                .then((data) => (this.search = data))
                .then(() => {
                    this.update
                });
        },
        update() {
            this.citysearchresults = []
            if (this.search != null || this.search != undefined) {
                for (let i = 0; i < this.search.results.length; i++) {
                    let result = this.search.results[i]
                    if (result.city != undefined) {
                        this.citysearchresults.push(result.formatted)
                    }
                }

            }
        },
        autoCompleteCity(input) {
            this.update()
            if (input.value != "") {
                this.fetchAutocomplete(input)
            }

        },
        /**
         * Formats a value froms degrees into a cardinal direction
         * 
         * @param {int} num 
         * @returns {string}
         */
        degToCompass(num) {
            var val = Math.floor((num / 22.5) + 0.5);
            var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
            return arr[(val % 16)];
        },
        getLocation() {
            let form = new FormData(document.getElementById("myForm"));
            let location = form.get("city");
            if (location != "") {
                fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=10&appid=" + "e8312061e7c0f05f0c0d5c86e9be0227")
                    .then((result) => result.json())
                    .then((data) => (this.location = data))
                    .then(() => this.getWeatherInfo())
            }
        },
        getWeatherInfo() {
            //Exits the function if the search input is invalid. Ideally should probably use a catch
            if(this.location[0]==undefined)
            {
                return "oh no";
            }
            this.result = true;
            let longitude = this.location[0].lon;
            let latitude = this.location[0].lat;
            fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=e8312061e7c0f05f0c0d5c86e9be0227")
                .then((result) => result.json())
                .then((data) => (this.weather_result = data))
                .then(() => {
                    this.formatData();
                })

        },
        /**
         * Formats the weather data into the preferred units
         */
        formatData() {
            this.weather_result.wind.deg = this.degToCompass(this.weather_result.wind.deg);
            this.weather_result.weather[0].description = this.weather_result.weather[0].description.charAt(0).toUpperCase() + this.weather_result.weather[0].description.slice(1);
            this.weather_result.main.temp -= 273
            this.weather_result.main.temp = this.weather_result.main.temp.toFixed(2)
            this.weather_result.main.feels_like -= 273
            this.weather_result.main.feels_like = this.weather_result.main.feels_like.toFixed(2)
            this.weather_result.wind.speed = (this.weather_result.wind.speed *= 3.6).toFixed(2)
            let sunrise = new Date((this.weather_result.sys.sunrise) * 1000)
            let sunset = new Date((this.weather_result.sys.sunset) * 1000)
            this.weather_result.sys.sunrise = sunrise.getHours() + "h" + sunrise.getMinutes()
            this.weather_result.sys.sunset = sunset.getHours() + "h" + sunset.getMinutes()
            this.weather_result.timezone = this.weather_result.timezone / 60 / 60
            this.weather_result.timezone
            if (this.weather_result.timezone > 0) {
                this.weather_result.timezone = "+" + this.weather_result.timezone
            }
        }
    },


}).mount("#app");