import {utools_db_store} from "./base";

const GLOBAL_STATISTICS = 'statistics'
export const CountType= {
    VISITED: "visited",
    COPYED: "copyed",
    VIM: "vim"
}
export const statisticsManager = {
    isInited: false,
    data:{},

    init() {
        if(this.isInited) {
            return
        }
        this.data = utools.db.get(GLOBAL_STATISTICS)?.data ?? {
            visited:{
                total: 0,
                week:{}
            },
            copyed:{
                total: 0,
                week:{}
            },
            vim:{
                total: 0,
                week: {}
            }
        }
        this.clearPreviousWeek();
        this.countUsed();
        this.isInited = true
    },
    _now(){
        const date = new Date();
        return new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    },
    writeToDB(){
        utools_db_store(GLOBAL_STATISTICS,this.data)
    },
    count(type){
        this.data[type].total++;
        const now = this._now();
        if(now in this.data[type].week){
            this.data[type].week[now]++;
        }else{
            this.data[type].week[now] = 1
        }
        this.writeToDB();
    },
    countUsed(){
        const now = this._now();
        let change = false;
        if(!this.data.used){
            this.data.used = {
                total: 1,
                start: now,
                today: now
            }
            change = true;
        }
        if(this.data.used.today !== now){
            this.data.used.total ++;
            this.data.used.today = now;
            change = true;
        }
        if(change){
            this.writeToDB();
        }
    },

    clearPreviousWeek(){
        const now = this._now();
        const timestampOfSevenDay = 7 * 24 * 60 * 60 * 1000;
        for (let weekKey in this.data.visited.week) {
            if(now - weekKey > timestampOfSevenDay){
                delete this.data.visited.week[weekKey]
            }
        }
        for (let weekKey in this.data.copyed.week) {
            if(now - weekKey > timestampOfSevenDay){
                delete this.data.copyed.week[weekKey]
            }
        }
        for (let weekKey in this.data.vim.week) {
            if(now - weekKey > timestampOfSevenDay){
                delete this.data.vim.week[weekKey]
            }
        }
    },
    _calcLastWeekCount(week){
        let i = 0;
        for (let weekKey in week) {
            i+= week[weekKey];
        }
        return i
    },
    _getStatistics(type,now){
        return[
            this.data[type].week[now]??0,
            this._calcLastWeekCount(this.data[type].week),
            this.data[type].total,
        ]
    },
    _getUsedStatistics(now){
        return [
            this.data.used.total,
            'N/A',
            Math.floor((now - this.data.used.start) / (24 * 60 * 60 * 1000))
        ]
    },
    getStatistics(){
        const now = this._now();
        return [
            {
                label: "复制粘贴",
                value: this._getStatistics(CountType.COPYED,now),
            },
            {
                label: "访问插件",
                value: this._getStatistics(CountType.VISITED,now)
            },
            {
                label: "按键",
                value: this._getStatistics(CountType.VIM,now)
            },
            {
                label: "使用天数",
                value: this._getUsedStatistics(now)
            }
        ]
    }
}