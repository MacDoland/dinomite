const LayerState = {
    TILES: 0, 
    ITEMS: 1
}

Object.freeze(LayerState);

const LayerStateStrings = {};

Object.keys(LayerState).forEach((key) => {
    LayerStateStrings[key] = LayerState[key].toString();
});

Object.freeze(LayerStateStrings);

const indexToLayerState = (index) => {
    let match = Object.keys(LayerState).map(key => LayerState[key]).filter(value => value === index);
    return match.length > 0 ? match[0] : 0;
}

export { LayerState, LayerStateStrings, indexToLayerState };
