export default class DateManager {
    private static _instance: DateManager = null;
    static get instance(): DateManager {
        if (this._instance == null) {
            this._instance = new DateManager();
        }
        return this._instance;
    }
    private delta: number = 0;//与服务器的时间差

    init(severTime: number) { //初始化
        this.delta = severTime - Date.now() / 1000;
    }

    get nowTimestamp() {
        return Math.floor(Date.now() / 1000 + this.delta);
    }

    secondsToStr(scd: number) {
        let hours = Math.floor(scd / 3600);
        let hoursStr = hours > 9 ? hours : '0' + hours;

        let minutes = Math.floor(scd % 3600 / 60);
        let minutesStr = minutes > 9 ? minutes : '0' + minutes;

        let seconds = Math.floor(scd % 60);
        let secondsStr = seconds > 9 ? seconds : '0' + seconds;

        return hoursStr + ':' + minutesStr + ':' + secondsStr;
    }

    needDayTimeStr(finishTime: number) {
        let time = finishTime - this.nowTimestamp;
        let days = Math.floor(time / 86400);
        let hours = Math.floor((time / 3600) % 24);
        let minutes = Math.floor((time / 60) % 60);
        let seconds = Math.floor(time % 60);
        let hoursStr = hours < 10 ? '0' + hours : hours;
        let minutesStr = minutes < 10 ? '0' + minutes : minutes;
        let secondsStr = seconds < 10 ? '0' + seconds : seconds;
        let msg = days + 'd ' + hoursStr + "h " + minutesStr + "m " + secondsStr + "s";
        return msg;
    }

    get nowMilliscd() {
        return Date.now() + this.delta * 1000;
    }

    formatDate(timestamp) {
        var date = new Date(timestamp * 1000);
        var YY = date.getFullYear() + '-';
        var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
        var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return YY + MM + DD + " " + hh + mm + ss;
    }

    getDayIndex(timestamp) {
        var date = new Date(timestamp);
        return date.getDate();
    }
}
