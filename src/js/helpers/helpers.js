export const findById = (items, id) => {
    const result = items.filter((item) => item.getId() === id);

    return result.length > 0 ? result[0] : null;
}

