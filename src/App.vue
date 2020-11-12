<template>
  <div id="app">
    <div
      v-if="!navigatorIsOnline() || fetchNetworkError"
      style="
        position: absolute;
        width: 100%;
        height: 24px;
        color: white;
        padding-top: 5px;
        font-size: min(4vw, 20px);
        height: min(6vw, 30px);
        text-align: center;
        background-color: grey;
        opacity: 0.8;
      "
    >
      You are currently OFFLINE
    </div>
    <main>
      <div id="loaderId" v-if="showLoader" class="loader">
        <div id="loaderLottieId" class="loader-lottie">
          <lottie
            :style="'max-width:100%;height:auto;'"
            :options="defaultOptions"
            :height="lottieSize"
            :width="lottieSize"
            v-on:animCreated="handleAnimation"
          />
        </div>
      </div>
      <div
        v-show="false"
        style="
          font-size: 24px;
          color: white;
          position: absolute;
          top: 0;
          left: 0;
        "
      >
        V28
      </div>
      <div class="welcome-text">How is the weather today?</div>
      <div class="search-box">
        <div aria-label="Search Box"></div>
        <input
          id="seachBar"
          name="search bar"
          label="Search Bar"
          type="text"
          class="search-bar"
          placeholder="Search Location..."
          v-model="query"
          @keypress="seachBarKeyPress"
          @focus="searchFocus = true"
        />
        <i
          id="searchIcon"
          @click="searchFocus && fetchWeather(query)"
          class="fas fa-search-location"
          style="
            font-size: 28px;
            color: white;
            margin-left: -45px;
            z-index: 99;
            text-shadow: 3px 2px rgba(0, 0, 0, 0.5);
          "
          aria-hidden="true"
          v-bind:class="{
            transparentItem: !searchFocus,
            opacItem: searchFocus,
          }"
        ></i>
        <i
          @click="setGPSdata()"
          class="fas fa-street-view"
          style="
            font-size: 36px;
            color: white;
            margin-left: min(50px, 10%);
            text-shadow: 2px 3px rgba(0, 0, 0, 0.75);
          "
          aria-hidden="true"
        ></i>
      </div>
      <div
        class="weather-wrap"
        v-if="
          currentCityDetail !== undefined && currentCityDetail.loc !== undefined
        "
      >
        <div class="location-box">
          <div class="location">{{ currentCityDetail.loc }}</div>
          <div class="date">
            {{ dateBuilder(currentCityDetail.recordDate) }}
          </div>
        </div>

        <div class="weather-box">
          <img
            :src="getIconUrl(currentCityDetail.icon)"
            style="
              position: absolute;
              margin: -18px 0px 0px -32px;
              width: 40%;
              max-width: 100px;
              filter: drop-shadow(2px 2px 2px #222);
            "
          />
          <div class="temp">{{ Math.round(currentCityDetail.deg) }}°c</div>
          <div class="weather">{{ currentCityDetail.prep }}</div>
        </div>
        <HistoryList :historyList="reverseTempList()" :key="updateKey"
          >HistoryList Mus have been here :(</HistoryList
        >
      </div>
      <div
        v-show="false"
        id="stateDetail"
        style="color: red; position: absolute; bottom: 0px; left: 0px"
        v-html="stateDetail"
      ></div>
    </main>
    <div class="result">
      {{ currentCityDetail }}
    </div>
  </div>
</template>
<script>
// TODO : Upper part is not visible at mobile browser!!!
//import * as animationData from './assets/color-loader.json';
import HistoryList from "./components/HistoryList";
import * as animationData from "./assets/suncloud.json";
import GeneralUtils from "./utils/GeneralUtils";
import { mapGetters, mapActions } from "vuex";
import api from "./api/index";
export default {
  name: "app",
  components: {
    HistoryList,
  },
  data() {
    return {
      //api_key: process.env.VUE_APP_WEATHER_API_KEY,
      url_base: "https://api.openweathermap.org/data/2.5/",
      query: "",
      weather: {},
      gpsLat: "0",
      gpsLong: "0",
      verb: "",
      watchId: "",
      iconUrl: "#",
      stateDetail: "",
      tempList: [],
      currentCityDetail: {},
      searchFocus: false,
      defaultOptions: { animationData: animationData.default },
      showLoader: true,
      lottieSize: 600,
      fetchNetworkError: false,
      updateKey: 0,
      list: [],
    };
  },
  computed: {
    ...mapGetters({
      historyList: "getHistory",
    }),
  },
  created() {
    //console.log("created hook");
  },
  async mounted() {
    //console.log(process.env.VUE_APP_WEATHER_API_KEY)
    //console.log("mounted-tempList:",this.tempList)
    document.getElementById("app").style.backgroundImage =
      "url('img/warm-day1.jpg')";
    window.addEventListener("online", this.handleStateChange);
    window.addEventListener("offline", this.handleStateChange);
    if (
      this.historyList != null &&
      this.historyList.list !== undefined &&
      this.historyList.list.length > 0
    ) {
      this.tempList = await this.removeOldRecords(this.historyList.list);
      this.currentCityDetail = this.tempList[this.tempList.length - 1];
    }
    this.updateFormatDateToNow();
    setInterval(() => {
      //console.log("Update - timeToNow");
      this.updateFormatDateToNow();
      //console.log(this.tempList);
    }, 60 * 1000);
    setTimeout(() => {
      //this.showLoader=false;
      document.getElementById("loaderId").className = "loader-fadeOut";
      document.getElementById("loaderLottieId").className = "loader-lottie-out";
      setTimeout(() => {
        this.showLoader = false;
        document.body.style.overflow = "auto";
      }, 1000);
    }, 2000);
  },
  methods: {
    ...mapActions({
      setHistoryList: "setHistory",
    }),
    updateFormatDateToNow() {
      if (this.tempList.length > 0) {
        this.updateKey =
          this.updateKey >= Number.MAX_SAFE_INTEGER - 1
            ? 0
            : this.updateKey + 1;
        this.tempList.forEach((item) => {
          item.toNow = GeneralUtils.formattedTimeToNOW(item.recordDate);
        });
      }
    },
    reverseTempList() {
      return this.tempList.slice().reverse();
    },
    removeOldRecords(array) {
      let resultList = [];
      if (array != null && array.length === 0) return;
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      resultList = array.filter(function (record) {
        //console.log(`compare recordDate:${record.recordDate} , yesterday:${yesterday} -> result:${GeneralUtils.isOlderThan(record.recordDate,yesterday)}`)
        return !GeneralUtils.isOlderThan(record.recordDate, yesterday);
      });
      //console.log("resultList:",resultList);
      this.setHistoryList({ list: resultList });
      return Promise.resolve(resultList);
    },
    handleStateChange() {
      var timeBadge = new Date().toTimeString().split(" ")[0];
      //var newState = document.createElement('p');
      var state = navigator.onLine ? "online" : "offline";
      this.stateDetail =
        "" + timeBadge + " Connection state changed to <b>" + state + "</b>.";
      document.getElementById("app").style.opacity = navigator.onLine ? 1 : 0.5;
      //console.log("stateDetail:"+this.stateDetail);
      this.stateDetail = navigator.onLine ? "" : this.stateDetail;
      //background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
      //target.appendChild(newState);
    },
    navigatorIsOnline() {
      return navigator.onLine;
    },
    seachBarKeyPress(e) {
      if (e.key == "Enter") {
        this.fetchWeather(this.query);
      }
    },
    fetchWeather(query) {
      if (query == "") return;
      api
        .getWeatherByCityName(query)
        .then(
          (response) => {
            this.setResults(response.data);
            // console.table(list);
            console.log(response.data);
            console.log("axios-response:", response);
          },
          (error) => {
            console.log(error.message);
          }
        )
        .catch((e) => {
          console.log("fetchWeather-exception-e:", e);
        });
      /*        fetch(`${this.url_base}weather?q=${query}&units=metric&APPID=${this.api_key}`)
          .then(res => {
            return res.json();
          }).then(this.setResults);
*/
      //After Seach Stuff
      this.searchFocus = false;
      document.getElementById("seachBar").blur();
    },
    setGPSdata() {
      console.log("setGPSdata-Location");
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.gpsLat = location.coords.latitude;
          this.gpsLong = location.coords.longitude;
          this.fetchByLocation(this.gpsLat, this.gpsLong);
        });
      }
    },
    fetchByLocation(lat, lon) {
      //console.log("fetchByLocation:",`${this.url_base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${this.api_key}`);
      api
        .getWeatherByCoordinates(lat, lon)
        .then(
          (response) => {
            console.log("axios-response:", response);
            this.setResults(response.data);
          },
          (error) => {
            console.log(error.message);
          }
        )
        .catch((e) => {
          console.log("fetchWeather-exception-e:", e);
        });
      /*fetch(`${this.url_base}weather?lat=${lat}&lon=${long}&units=metric&APPID=${this.api_key}`)
        .then(res => {
          return res.json();
        }).then(this.setResults);*/
    },
    setResults(results) {
      this.weather = results;
      this.query = results.name.replace(" Province", "");
      this.setBackgrounImage(results.weather[0].main);
      let icon = results.weather[0].icon;
      this.tempList.push({
        loc: `${results.name.replace(" Province", "")}, ${results.sys.country}`,
        recordDate: new Date(),
        prep: results.weather[0].description,
        deg: Math.round(results.main.temp),
        icon: icon,
      });
      if (this.tempList.length > 5) this.tempList.shift();
      this.setHistoryList({ list: this.tempList });
      this.currentCityDetail = this.tempList[this.tempList.length - 1];
      this.searchFocus = false;
      document.getElementById("seachBar").blur();
    },
    async setBackgrounImage(val) {
      console.log("setBackgrounImage for:", val);
      var img = new Image();
      img.onload = function () {
        document.getElementById("app").style.backgroundImage = `url('${url}')`;
      };
      let url = await this.getBgImgUrl(val);
      img.src = url;
      if (img.complete) img.onload(url);
    },
    getBgImgUrl(val) {
      let url;
      if (val === "Clouds") {
        url = "../public/img/partly-cloudy.jpg";
      } else if (val === "Clear") {
        url = "../public/img/warm-day1.jpg";
      } else if (val === "Rain") {
        url = "../public/img/rainy.jpg";
      } else if (val === "Thunderstorm") {
        url = "../public/img/thunderstorm.jpg";
      } else {
        url = "../public/img/warm-day.jpg";
      }
      return Promise.resolve(url);
    },
    getIconUrl(icon) {
      //this.iconUrl = 'http://openweathermap.org/img/wn/'+icon+'@2x.png'
      return "../public/img/icon/" + icon + "@2x.png";
    },
    dateBuilder(refDate) {
      let d = new Date(refDate);
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let day = days[d.getDay()];
      let date = d.getDate();
      let month = months[d.getMonth()];
      let year = d.getFullYear();
      let timeH = d.getHours() >= 10 ? d.getHours() : "0" + d.getHours();
      let timeM = d.getMinutes() >= 10 ? d.getMinutes() : "0" + d.getMinutes();
      return `${day}, ${date} ${month} ${year} ${timeH}:${timeM}`;
    },
    handleAnimation: function (anim) {
      //console.log("handle animation");
      anim.setSpeed(1.6);
      this.anim = anim;
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: "montserrat", sans-serif;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
#app {
  background-size: cover;
  background-position: bottom;
  transition: 0.4s;
}
main {
  min-height: 100vh;
  padding: 24px 20px 15px 20px;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0.75)
  );
}
.search-box {
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
}
.search-box .search-bar {
  width: 80%;
  max-width: 450px;
  padding: 15px;
  color: white;
  font-size: min(5vw, 24px);
  font-weight: bold;
  appearance: none;
  border: none;
  outline: none;
  background: none;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0px 16px 0px 16px;
  transition: 0.4s;
}
.search-box .search-bar:focus {
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px 0px 16px 0px;
}
::placeholder {
  color: whitesmoke;
}
.location-box .location {
  color: #FFF;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}
.location-box .date {
  color: #FFF;
  font-size: 20px;
  font-weight: 300;
  font-style: italic;
  text-align: center;
}
input,
textarea,
[contenteditable] {
  color: #666;
  caret-color: black;
}
.weather-wrap {
  margin-bottom: 15px;
}
.weather-box {
  text-align: center;
}
.weather-box .temp {
  display: inline-block;
  padding: 15px 20px;
  color: #FFF;
  font-size: min(25vw, 102px);
  font-weight: 900;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  margin: 20px 0px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}
.weather-box .weather {
  color: #FFF;
  font-size: min(7.5vw, 28px);
  font-weight: 700;
  font-style: italic;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  margin-top: -55px;
}
.transparentItem {
  opacity: 0.5;
}
.opacItem {
  opacity: 1;
}
.loader {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  opacity: 1;
  background-color: white;
  z-index: 99;
  text-align: center;
  transition: 1s;
  -moz-transition: 1s;
  -webkit-transition: 1s;
}
.loader-fadeOut {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  opacity: 0;
  background-color: white;
  z-index: 99;
  text-align: center;
  transition: 0.5s;
  -moz-transition: 0.5s;
  -webkit-transition: 0.5s;
}
.loader-lottie {
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
.loader-lottie-out {
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
  width: 200%;
  transition: all 1s;
  -moz-transition: all 1s;
  -webkit-transition: all 1s;
}
.welcome-text {
  color: white;
  text-align: center;
  font-size: min(36px, 6vw);
  padding-top: min(1vw, 100px);
  padding-bottom: 15px;
  font-weight: 600;
  font-style: italic;
  text-shadow: 3px 3px rgba(0, 0, 0, 0.5);
}
</style>