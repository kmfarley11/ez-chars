// const spacesToDashes = (str) => str.replaceAll(' ', '-')

/**
 * @param {string} str
 */
export const capitalizeFirstLetter = (str) => {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export const objToString = (/** @type {{ [x: string]: any; }} */ obj) => {
    const keys = Object.keys(obj);
    /**
     * @type {any[]}
     */
    const newArr = [];

    keys.forEach((key) => {
        const value = obj[key];
        if (Array.isArray(value)) {
            newArr.push(`${key}::${arrToString(value)}`);
        } else if (typeof value === 'object') {
            newArr.push(`${key}::${objToString(value)}`);
        } else {
            newArr.push(`${key}::${value}`);
        }
    });

    return arrToString(newArr, false);
};

export const arrToString = (/** @type {any[]} */ arr, encapsulate = true) => {
    /**
     * @type {string[]}
     */
    const newArr = [];
    arr.forEach((item) => {
        if (Array.isArray(item)) {
            newArr.push(arrToString(item));
        } else if (typeof item === 'object') {
            newArr.push(objToString(item));
        } else {
            newArr.push(`${item}`);
        }
    });
    const result = newArr.reduce((accumulator, currentValue) => {
        if (accumulator) {
            return `${currentValue}, ${accumulator}`;
        } else {
            return currentValue;
        }
    }, '');
    return encapsulate === true ? `[${result}]` : `${result}`;
};

export const anyToString = (/** @type {any} */ value, encapsulate = true) => {
    if (Array.isArray(value)){
        return arrToString(value, encapsulate)
    }else if (typeof value === 'object'){
        return objToString(value)
    }else{
        value}
}