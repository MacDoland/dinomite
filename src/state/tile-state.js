const TileState = {
    EMPTY: 0,
    INDESTRUCTIBLE: 1,
    DESTRUCTABLE: 2,
    BOMB: 4,
    RUBBLE: 5,
    SCORCH: 6,
    BOMB_RUBBLE:7,
    BOMB_RUBBLE_SCORCH:8,
    BOMB_SCORCH:9,
    RUBBLE_SCORCH:10
}

Object.freeze(TileState);

const TileStateStrings = {};

Object.keys(TileState).forEach((key) => {
    TileStateStrings[key] = TileState[key].toString();
});

Object.freeze(TileStateStrings);

const indexToTileState = (index) => {
    let match = Object.keys(TileState).map(key => TileState[key]).filter(value => value === index);
    return match.length > 0 ? match[0] : -1;
}

export { TileState, TileStateStrings, indexToTileState };
