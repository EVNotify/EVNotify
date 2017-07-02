function setValue(key, value) {
    if(key && value && typeof key === 'string')
        window.localStorage.setItem(key, ((typeof value === 'object')? JSON.stringify(value) : value));

    return value;
}

function getValue(key, defaultValue) {
    if(key && typeof key === 'string') {
        var value = window.localStorage.getItem(key);
        if(value) return value;
        else if (defaultValue) return defaultValue;
        else return "";
    }
}

function removeValue(key) {
    if(key && typeof key === 'string') window.localStorage.removeItem(key);
    return "";
}
