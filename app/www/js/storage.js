function setValue(key, value) {
    if(key && typeof value !== 'undefined' && typeof key === 'string')
        window.localStorage.setItem(key, ((typeof value === 'object')? JSON.stringify(value) : value));

    return value;
}

function getValue(key, defaultValue) {
    if(key && typeof key === 'string') {
        var value = window.localStorage.getItem(key);

        if(value) return ((!isNaN(parseFloat(value)) && isFinite(value))? parseFloat(value) : ((value === 'true')? true : ((value === 'false')? false : value)));
        else if (defaultValue) return defaultValue;
        return "";
    }
}

function removeValue(key) {
    if(key && typeof key === 'string') window.localStorage.removeItem(key);
    return "";
}
