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
    }
}
</script>
