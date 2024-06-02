import {utools_db_store} from "./base";
import { debounce as _debounce } from 'lodash-es'
import dayjs from "dayjs";

const GLOBAL_STATISTICS = 'statistics/'+ utools.getNativeId();
const OLD_STATISTICS = 'statistics';
export const CountType= {
    VISITED: "visited",
    COPYED: "copyed",
    VIM: "vim"
}
const writeToDB = _debounce(()=>{
    utools_db_store(GLOBAL_STATISTICS,statisticsManager.data)
},150)
export const statisticsManager = {
    isInited: false,
    data:{},

    init() {
        if(this.isInited) {
            return
        }
        const data = utools.db.get(OLD_STATISTICS)?.data
        if(data) {
            this.data = data
            utools.db.remove(OLD_STATISTICS);
        }else{
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
        }
        this.clearPreviousWeek();
        this.countUsed();
        this.isInited = true
    },
    _now(){
        const date = new Date();
        return new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    },
    _curMonday(nowDate){
        let date;
        if(nowDate.getDay() === 0){
            date = dayjs().subtract(1,'day').day(1).toDate();
        }else{
            date = dayjs().day(1).toDate();
        }
        return new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    },
    count(type){
        this.data[type].total++;
        const now = this._now();
        if(now in this.data[type].week){
            this.data[type].week[now]++;
        }else{
            this.data[type].week[now] = 1
        }
        writeToDB();
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
            writeToDB();
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
    _calcLastWeekCount(week,currentWeekOne){
        let total = 0;
        for (let weekKey in week) {
            if(weekKey >= currentWeekOne){
                total += week[weekKey];
            }
        }
        return total;
    },
    _getStatistics(type,now,curMonday){
        return[
            this.data[type].week[now]??0,
            this._calcLastWeekCount(this.data[type].week,curMonday),
            this.data[type].total,
        ]
    },
    _getUsedStatistics(now){
        return [
            this.data.used.total,
            Math.floor((now - this.data.used.start) / (24 * 60 * 60 * 1000)) + 1
        ]
    },

    getStatistics(){
        const date = new Date();
        const now = new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
        const curMonday = this._curMonday(date);

        return [
            {
                label: "有效使用天数",
                value: this._getUsedStatistics(now)
            },
            {
                label: "复制粘贴",
                value: this._getStatistics(CountType.COPYED,now,curMonday),
            },
            {
                label: "访问插件",
                value: this._getStatistics(CountType.VISITED,now,curMonday)
            },
            // {
            //     label: "Vim键入",
            //     value: this._getStatistics(CountType.VIM,now,curMonday)
            // },
        ]
    }
}