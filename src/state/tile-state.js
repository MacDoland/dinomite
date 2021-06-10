const TileState = {
    NULL: -1,
    EMPTY: 0,
    INDESTRUCTIBLE: 1,
    DESTRUCTABLE: 2,
    OCEAN:3,
    BOMB: 4,
    RUBBLE: 5,
    SCORCH: 6,
    BOMB_RUBBLE:7,
    BOMB_RUBBLE_SCORCH:8,
    BOMB_SCORCH:9,
    RUBBLE_SCORCH:10,
    EXPLOSION: 11,
    EXPLOSION_RUBBLE: 12,
    EXPLOSION_SCORCH: 13,
    EXPLOSION_RUBBLE_SCORCH: 14,
    EXPLOSION_OCEAN: 15
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
