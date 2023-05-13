const TIME_IDENTIFIERS = {
    SECOND: 'second',
    MINUTE: 'minute',
    HOUR: 'hour',
    DAY: 'day',
    MONTH: 'month',
    YEAR: 'year'
};

class TimeUtil {
    static toHours(count, identifier) {
        switch (identifier) {
            case TIME_IDENTIFIERS.SECOND:
                return parseInt((count / (60*60)).toFixed(2));
            case TIME_IDENTIFIERS.MINUTE:
                return parseInt((count / 60).toFixed(2));
            case TIME_IDENTIFIERS.HOUR:
                return count;
            case TIME_IDENTIFIERS.DAY:
                return count * 24;
            case TIME_IDENTIFIERS.MONTH:
                return TimeUtil.toHours(30, TIME_IDENTIFIERS.DAY);
        }
    }
}

TimeUtil.TIME = TIME_IDENTIFIERS;

module.exports = TimeUtil;