class NumberUtil {
    static getHumanReadable(num) {
        let days, hours, minutes, seconds = num;

        if(seconds <= 60) return { time: seconds, units: 'seconds' };

        minutes = (seconds / 60);

        if(minutes <= 60) return { time: minutes, units: 'minutes' };

        hours   = (minutes / 60);

        if(hours <= 60) return { time: hours, units: 'hours' };

        return { time: hours / 24, units: 'days' };
    }
}

module.exports = NumberUtil;