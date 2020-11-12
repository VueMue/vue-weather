class GeneralUtil {
  static isOlderThan(date1, date2) {
    //console.log(`date1:${new Date(date1).getTime()}-date2:${new Date(date2).getTime()}`)
    if (new Date(date1).getTime() < new Date(date2).getTime()) return true;
    else return false;
  }
  static formattedTimeToNOW(date) {
    //console.log("formattedTimeToNOW called")
    let recordDate = new Date(date);
    let now = new Date();
    let minutesToNow = Math.round((now - recordDate) / (60 * 1000));
    //return `${recordDate.getHours()}:${recordDate.getMinutes()}`
    if (minutesToNow < 60) return `${minutesToNow} m ago`;
    if (minutesToNow >= 60) return `${Math.round(minutesToNow / 60)} h ago`;
    return "now";
  }
}

export default GeneralUtil