function splitHexPairs(value) {
    if (typeof value !== 'string' || !value.length) return '';
    return value.match(/.{1,2}/g).join(' ');
}

function extractBlocks(raw) {
    var data = (typeof raw === 'string') ? raw.replace(/\s/g, '').toUpperCase() : '';
    var matches = [];
    var regex = /7E[A-F0-9]{3}/g;
    var match;

    while ((match = regex.exec(data)) !== null) {
        matches.push({
            header: match[0],
            index: match.index
        });
    }

    return matches.map((current, index) => {
        var end = (index + 1 < matches.length) ? matches[index + 1].index : data.length;
        var payload = data.substring(current.index + current.header.length, end);

        return {
            header: current.header,
            payload: payload,
            formatted: current.header + (payload ? ' ' + splitHexPairs(payload) : '')
        };
    });
}

function getBlockPayload(blocks, header) {
    var block = blocks.find(entry => entry.header === header);
    return block ? block.payload : '';
}

function decodeCommonHyundaiKia(command, raw) {
    var blocks = extractBlocks(raw);
    var first = getBlockPayload(blocks, '7EC21');
    var second = getBlockPayload(blocks, '7EC22');
    var third = getBlockPayload(blocks, '7EC23');
    var fourth = getBlockPayload(blocks, '7EC24');
    var fifth = getBlockPayload(blocks, '7EC25');
    var sixth = getBlockPayload(blocks, '7EC26');
    var seventh = getBlockPayload(blocks, '7EC27');

    if (command === '220105') {
        return {
            SOC_DISPLAY: fifth.substr(0, 2),
            SOH: fourth.slice(2, 6)
        };
    }

    if (command === '220101') {
        return {
            SOC_BMS: first.slice(2, 4),
            DC_BATTERY_CURRENT: second.slice(0, 4),
            DC_BATTERY_VOLTAGE: second.slice(4, 8),
            BATTERY_MAX_TEMPERATURE: second.slice(8, 10),
            BATTERY_MIN_TEMPERATURE: second.slice(10, 12),
            BATTERY_INLET_TEMPERATURE: third.slice(10, 12),
            AUX_BATTERY_VOLTAGE: fourth.slice(10, 12),
            CUMULATIVE_ENERGY_CHARGED: sixth.slice(0, 8),
            CUMULATIVE_ENERGY_DISCHARGED: sixth.slice(8, 14) + seventh.slice(0, 2),
            CHARGING: seventh.slice(10, 12),
            NORMAL_CHARGE_PORT: first.slice(12, 14) + '/' + seventh.slice(10, 12),
            RAPID_CHARGE_PORT: first.slice(12, 14) + '/' + seventh.slice(10, 12)
        };
    }

    return {};
}

export default {
    HISTORY_STORAGE_KEY: 'obd2DebugHistory',
    HISTORY_LIMIT: 20,
    GLOBAL_HISTORY_KEY: '__obdDebugHistory',
    getRelevantKeys(interpreted) {
        return Object.keys(interpreted || {}).filter(key => /^[A-Z0-9_]+$/.test(key));
    },
    getCommandLabel(component) {
        if (!component) return '';
        if (typeof component.command === 'string' && component.command.length) return component.command;
        if (typeof component.CMD === 'string' && component.CMD.length) return component.CMD;
        if (typeof component.getCurrentCommand === 'function') {
            var current = component.getCurrentCommand();

            if (typeof current === 'string') return current;
            if (current && typeof current.name === 'string') return current.name;
        }
        if (Array.isArray(component.commands) && typeof component.currentCommand === 'number') {
            var command = component.commands[component.currentCommand];

            if (typeof command === 'string') return command;
            if (command && typeof command.name === 'string') return command.name;
        }
        return '';
    },
    getHistory() {
        if (!Array.isArray(window[this.GLOBAL_HISTORY_KEY])) window[this.GLOBAL_HISTORY_KEY] = [];
        return window[this.GLOBAL_HISTORY_KEY];
    },
    appendHistory(entry) {
        var history = this.getHistory();

        history.push(entry);
        if (history.length > this.HISTORY_LIMIT) history.splice(0, history.length - this.HISTORY_LIMIT);
        return history;
    },
    clearHistory() {
        window[this.GLOBAL_HISTORY_KEY] = [];
    },
    buildFieldRawMap(car, command, raw) {
        if (['KONA_EV', 'NIRO_EV', 'E_SOUL', 'IONIQ_FL_EV'].includes(car)) {
            return decodeCommonHyundaiKia(command, raw);
        }
        return {};
    },
    buildHistoryEntry(car, command, raw, interpreted) {
        return {
            id: new Date().getTime(),
            timestamp: parseInt(new Date().getTime() / 1000),
            car: car || '',
            command: command || '',
            raw: (raw || '').replace(/\s/g, '').toUpperCase(),
            interpreted: interpreted || {}
        };
    },
    extractBlocks,
    splitHexPairs
};
