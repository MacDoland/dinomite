export const findById = (items, id) => {
    const result = items.filter((item) => item.getId() === id);

    return result.length > 0 ? result[0] : null;
}

export const objectPropertiesAreFalse = (targetObject) => {
    let values = Object.keys(targetObject).map(key => targetObject[key]);
    let count = values.length;

    let filtered = values.filter(value => (value === false || typeof (value) === 'undefined'));

    return filtered.length === count;
}