const TileState = {
    ANY: -1,
    RESTRICTED: 0,
    EMPTY: 1,
    INDESTRUCTIBLE: 2,
    DESTRUCTABLE: 3,
    CLIFF: 4,
    STAIRS: 5,
    SLOW: 6,
}

Object.freeze(TileState);

const TileStateStrings = {};

Object.keys(TileState).forEach((key) => {
    TileStateStrings[key] = TileState[key].toString();
});

Object.freeze(TileStateStrings);

const indexToTileState = (index) => {
    let match = Object.keys(TileState).map(key => TileState[key]).filter(value => value === index);
    return match.length > 0 ? match[0] : 0;
}

export { TileState, TileStateStrings, indexToTileState };
