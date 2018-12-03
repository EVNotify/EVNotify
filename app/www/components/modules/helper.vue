<script>
export default {
    /**
     * Formats given timestamp into human readable form ( dd.mm.yyyy hh:mm:ss)
     * @param {Number} timestamp the unix timestamp to format
     * @returns {String} the formatted timestamp string
     */
    formatDate: (timestamp) => {
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
    convertDecimalTime: function(time) {
        if (isNaN(parseInt(time))) return '00:00';

        var sign = ((time < 0) ? '-' : ''),
            min = Math.floor(Math.abs(time)),
            sec = Math.floor((Math.abs(time) * 60) % 60);
            
        return sign + (((min < 10) ? '0' : '')) + min + ':' + (((sec < 10) ? '0' : '')) + sec;
    }
}
</script>
