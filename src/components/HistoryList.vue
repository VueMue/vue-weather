<template>
  <div>
    <div class="weather-history-container" v-if="historyList">
      <div v-for="(item, index) in historyList" :key="index">
        <div
          class="weather-history"
          v-if="item != null"
          :class="index === 0 && 'active'"
        >
          <span class="location">{{ item.loc }}</span>
          <span class="temp">{{ item.deg }}&deg;</span>
          <span class="item">{{ item.prep }}</span>
          <span class="time-diff">{{ item.toNow }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HistoryList",
  props: {
    historyList: {
      loc: "",
      deg: "",
      prep: "",
      recordDate: "",
    },
  },
  computed: {},
  methods: {
    diffFromNow(date) {
      let recordDate = new Date(date);
      //return `${recordDate.getHours()}:${recordDate.getMinutes()}`
      return `${recordDate - new Date()}`;
    },
  },
  mounted() {
    //console.log("HistoryListMounted:",this.historyList);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.weather-history-container {
  margin-top: min(7%, 80px);
}
.weather-history {
  display: grid;
  grid-template-columns: 40% 10% 30% 20%;
  padding: 10px;
  font-weight: bold;
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  margin: min(20px, 2vw) auto;
  padding: 10px 0px 10px 15px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  max-width: 450px;
}
.weather-history .location {
  font-size: min(4.25vw, 20px);
  text-align: left;
  font-weight: bold;
  margin: auto 0px;
}
.weather-history .item {
  font-size: min(3vw, 16px);
  text-align: left;
  font-weight: bold;
  margin: auto 0px;
}
.weather-history .time-diff {
  font-size: min(2.7vw, 14px);
  text-align: left;
  font-weight: bold;
  opacity: 0.8;
  margin: auto 10px;
}
.weather-history .temp {
  font-size: min(4.5vw, 20px);
  text-align: left;
  font-weight: bold;
  margin: auto 0px;
}
.active {
  background-color: rgba(255, 255, 255, 0.45);
}
</style>