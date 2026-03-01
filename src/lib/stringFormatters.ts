// const spacesToDashes = (str) => str.replaceAll(' ', '-')

export const capitalizeFirstLetter = (str: string) => {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
};

export const objToString = (obj: Record<string, any>) => {
	const keys = Object.keys(obj);
	const newArr: string[] = [];

	keys.forEach((key: string) => {
		const value: any = obj[key];
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

export const arrToString = (arr: any[], encapsulate = true) => {
	const newArr: any[] = [];
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

export const anyToString = (value: any, encapsulate = true) => {
	if (Array.isArray(value)) {
		return arrToString(value, encapsulate);
	} else if (typeof value === 'object') {
		return objToString(value);
	} else {
		value;
	}
};
