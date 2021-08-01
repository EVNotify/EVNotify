<script>
import MomentJS from 'moment';
import storage from './storage.vue';

export default {
    /**
     * Formats given timestamp into human readable form ( dd.mm.yyyy hh:mm:ss)
     * @param {Number} timestamp the unix timestamp to format
     * @returns {String} the formatted timestamp string
     */
    formatDate: timestamp => {
        var date = new Date(timestamp * 1000);

        if(!(date instanceof Date) || isNaN(date)) return '?';
            var hours = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                day = date.getDate(),
                month = date.getMonth() + 1;

            seconds = ((seconds < 10)? '0' + seconds : seconds); // correct low values
            minutes = ((minutes < 10)? '0' + minutes : minutes); // correct low values
            hours = ((hours < 10)? '0' + hours : hours); // correct low values
            day = ((day < 10)? '0' + day : day); // correct low values
            month = ((month < 10)? '0' + month : month); // correct low values

            return day + '.' + month + '.' + date.getFullYear() + ' ' + hours + ':' + minutes + ':' + seconds;
    },
    /**
     * Converts the decimal time into hh:mm format (e.g.: 0.5h will be converted to 00:30h)
     * @param {Number} time the time to convert
     * @returns {String} the formatted time string
    */
    convertDecimalTime: time => {
        if (isNaN(parseInt(time))) return '00:00';

        var sign = ((time < 0) ? '-' : ''),
            min = Math.floor(Math.abs(time)),
            sec = Math.floor((Math.abs(time) * 60) % 60);
            
        return sign + (((min < 10) ? '0' : '')) + min + ':' + (((sec < 10) ? '0' : '')) + sec;
    },
    /**
     * Converts given hexadecimal signed number to decimal
     * @param {String} data the hexadecimal number as string
     * @returns {Number} the converted signed number
    */
    parseSigned: data => {
        var bits = data.length * 4;
        
        return ((parseInt(data, 16) + Math.pow(2, bits - 1)) % Math.pow(2, bits)) - Math.pow(2, bits - 1);
    },
    /**
     * Calculates chargetime left and finishtime while charging
     * @param {Number} capacity the capacity in kWh
     * @param {String} socDisplay the state of charge from display
     * @param {String} socBMS the state of charge from BMS
     * @param {String} batteryPower the charging speed
     * @param {String} typeOfTime the result timeType that gets returned
     * @returns {*} the defined and calculated timeType
     */
    chargeTime(capacity, socDisplay, socBMS, batteryPower, typeOfTime) {
        const duration = MomentJS.duration(parseFloat(this.chargeDecimalTime(capacity, socDisplay, socBMS, batteryPower))).asMilliseconds();
        const now = new Date().getTime();
        if(typeOfTime == "timeleft") {
            return MomentJS().startOf('day').add(duration, 'minutes').format('m:ss');
        } else if (typeOfTime == "finishtime") {
            return MomentJS(now).add(duration, 'hours').format('HH:mm');
        } else {
            return false;
        }
    },
    chargeDecimalTime(capacity, socDisplay, socBMS, batteryPower) {
        const soc = socDisplay || socBMS;
        const amountToCharge = capacity - parseFloat(
            capacity * ((soc === 100) ? 1 : '0.' + ((soc < 10) ? ('0' + parseInt(soc)) : parseInt(soc)))
        ).toFixed(2) || 0;
        const decimalTime = parseFloat(
            amountToCharge / (Math.abs(batteryPower))
        ).toFixed(2);
        return decimalTime;
    },
    getCarCapacity(car, capacity) {
        var capacities = {
            AMPERA_E: 60,
            BOLT_EV: 60,
            ID_3: 58,
            ID_4: 52,
            IONIQ_BEV: 28,
            IONIQ_HEV: 1.6,
            IONIQ_PHEV: 8.9,
            IONIQ_FL_EV: 38,
            IONIQ_5: 58,
            KONA_EV: 64,
            NIRO_EV: 64,
            E_SOUL: 64,
            SOUL_EV: 28,
            ZOE_Q210: 22,
            ZOE_ZE50: 52
        };

        return capacity || capacities[car] || 0;
    }
}
</script>
