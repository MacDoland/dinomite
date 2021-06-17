const ItemsState = {
    NONE: 0,
    BOMB: 0,
    GRAVE: 1,
}

Object.freeze(ItemsState);

const ItemsStateStrings = {};

Object.keys(ItemsState).forEach((key) => {
    ItemsStateStrings[key] = ItemsState[key].toString();
});

Object.freeze(ItemsStateStrings);

const indexToItemsState = (index) => {
    let match = Object.keys(ItemsState).map(key => ItemsState[key]).filter(value => value === index);
    return match.length > 0 ? match[0] : 0;
}

export { ItemsState, ItemsStateStrings, indexToItemsState };
