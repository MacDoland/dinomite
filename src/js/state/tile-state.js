const TileState = {
    NULL: -1,
    EMPTY: 0,
    INDESTRUCTIBLE: 1,
    DESTRUCTABLE: 2,
    OCEAN: 3,
    BOMB: 4,
    RUBBLE: 5,
    SCORCH: 6,
    BOMB_RUBBLE: 7,
    BOMB_RUBBLE_SCORCH: 8,
    BOMB_SCORCH: 9,
    RUBBLE_SCORCH: 10,
    EXPLOSION: 11,
    EXPLOSION_RUBBLE: 12,
    EXPLOSION_SCORCH: 13,
    EXPLOSION_RUBBLE_SCORCH: 14,
    EXPLOSION_OCEAN: 15,
    STAIRS: 16,
    STAIRS_EXPLOSION: 18,
    STAIRS_BOMB: 19,
    CLIFF: 17,
    TAR: 20,
    TAR_BOMB: 21,
    TAR_EXPLOSION: 22,
    GRAVESTONE: 23,
    GRAVESTONE_SORCH: 24,
    GRAVESTONE_RUBBLE: 25,
    GRAVESTONE_SCORCH_RUBBLE: 26,
    GRAVESTONE_STAIRS: 27,
    GRAVESTONE_TAR: 28,
    GRAVESTONE_EXPLOSION: 29,
    GRAVESTONE_EXPLOSION_SORCH: 30,
    GRAVESTONE_EXPLOSION_RUBBLE: 31,
    GRAVESTONE_EXPLOSION_SORCH_RUBBLE: 32,
    GRAVESTONE_EXPLOSION_STAIRS: 33,
    GRAVESTONE_EXPLOSION_TAR: 34,
    CLIFF_DOWN: 35,
    CLIFF_LEFT: 36,
    CLIFF_UP: 37,
    CLIFF_RIGHT: 38,

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
