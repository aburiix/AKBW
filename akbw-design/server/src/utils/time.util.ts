function toUZTString(date: Date): string {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    // UZT = UTC+5
    const uzt = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${days[date.getDay()]} ${months[uzt.getMonth()]} ` +
           `${pad(uzt.getDate())} ${pad(uzt.getHours())}:` +
           `${pad(uzt.getMinutes())}:${pad(uzt.getSeconds())} UZT ` +
           `${uzt.getFullYear()}`;
}

/** Paynet UWS format: YYYY-MM-dd HH:mm:ss (GMT+5) */
function toPaynetTimestamp(date: Date = new Date()): string {
    const uzt = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${uzt.getUTCFullYear()}-${pad(uzt.getUTCMonth() + 1)}-${pad(uzt.getUTCDate())} ` +
        `${pad(uzt.getUTCHours())}:${pad(uzt.getUTCMinutes())}:${pad(uzt.getUTCSeconds())}`;
}

export {
    toUZTString,
    toPaynetTimestamp
}