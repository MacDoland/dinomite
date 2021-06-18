const Sprite = {
    OCEAN: 0,
    GRASS: 1,
    GRASS_SWAMP_NORTH: 2,
    GRASS_SWAMP_EAST: 3,
    GRASS_SWAMP_SOUTH: 4,
    GRASS_SWAMP_WEST: 5,
    GRASS_SWAMP_NORTH_EAST: 6,
    GRASS_SWAMP_NORTH_WEST: 7,
    GRASS_SWAMP_SOUTH_EAST: 8,
    GRASS_SWAMP_SOUTH_WEST: 9,
    SWAMP: 10,
    ROCK: 11,
    CLIFF_NORTH: 12,
    CLIFF_EAST: 13,
    CLIFF_SOUTH: 14,
    CLIFF_WEST: 15,
    CLIFF_NORTH_EAST: 16,
    CLIFF_NORTH_WEST: 17,
    CLIFF_SOUTH_EAST: 18,
    CLIFF_SOUTH_WEST: 19,
    FERN_BACK: 20,
    FERN_FRONT: 21,
    FERN_BACK_RUSTLE: 22,
    FERN_FRONT_RUSTLE: 23,
    BLOCK: 24,
    BLOCK_SHADOW: 25,
    RUBBLE: 26,
    SCORCH: 27,
    STAIRS: 28
}

const SpritePaths = {};
SpritePaths[Sprite.OCEAN] = ["ocean/ocean"];
SpritePaths[Sprite.GRASS] = ["tile-grass-random/grass-2_1", "tile-grass-random/grass_1_1", "tile-grass-random/grassy",]
SpritePaths[Sprite.GRASS_SWAMP_NORTH] = ["swamp-edge-down/tile-swamp-bottom-edge"];
SpritePaths[Sprite.GRASS_SWAMP_EAST] = ["swamp-edge-down/tile-swamp-bottom-edge"];
SpritePaths[Sprite.GRASS_SWAMP_SOUTH] = ["swamp-edge-up/tile-swamp-top-edge"];
SpritePaths[Sprite.GRASS_SWAMP_WEST] = ["swamp-edge-right/tile-swamp-right-edge"];
SpritePaths[Sprite.GRASS_SWAMP_NORTH_EAST] = ["swamp-edge-leftdown/tile-swamp-corner-bottom-left"];
SpritePaths[Sprite.GRASS_SWAMP_NORTH_WEST] = ["swamp-edge-rightdown/tile-swamp-corner-bottom-righrt"];
SpritePaths[Sprite.GRASS_SWAMP_SOUTH_EAST] = ["swamp-edge-leftup/tile-swamp-corner-top-left"];
SpritePaths[Sprite.GRASS_SWAMP_SOUTH_WEST] = ["swamp-edge-rightup/tile-swamp-corner-top-right"];
SpritePaths[Sprite.SWAMP] = ["swamp-middle/swamp-middle"];
SpritePaths[Sprite.ROCK] = ["destructable-rock-random/rock-1", "destructable-rock-random/rock-2",]
SpritePaths[Sprite.CLIFF_NORTH] = ["grass-edge-up-random/tile-top-edge"];
SpritePaths[Sprite.CLIFF_EAST] = ["grass-edge-right-random/tile-right-edge"];
SpritePaths[Sprite.CLIFF_SOUTH] = ["grass-edge-down-random/bottom-edge-1"];
SpritePaths[Sprite.CLIFF_WEST] = ["grass-edge-left-random/tile-left-edge"];
SpritePaths[Sprite.CLIFF_NORTH_EAST] = ["grass-edge-rightup-random/tile-corner-top-right"];
SpritePaths[Sprite.CLIFF_NORTH_WEST] = ["grass-edge-leftup-random/tile-corner-top-left"];
SpritePaths[Sprite.CLIFF_SOUTH_EAST] = ["grass-edge-rightdown-random/tile-corner-bottom-right"];
SpritePaths[Sprite.CLIFF_SOUTH_WEST] = ["grass-edge-leftdown-random/tile-corner-bottom-left"];
SpritePaths[Sprite.FERN_BACK] = ["plant-fern-large-back-rustle/fern-back00"];
SpritePaths[Sprite.FERN_FRONT] = ["plant-fern-large-front/plant-fern-front-1"];
SpritePaths[Sprite.FERN_BACK_RUSTLE] = [
    "plant-fern-large-back-rustle/fern-back00",
    "plant-fern-large-back-rustle/fern-back01",
    "plant-fern-large-back-rustle/fern-back02",
    "plant-fern-large-back-rustle/fern-back03",
    "plant-fern-large-back-rustle/fern-back04",
    "plant-fern-large-back-rustle/fern-back05",
    "plant-fern-large-back-rustle/fern-back06",
    "plant-fern-large-back-rustle/fern-back07",
    "plant-fern-large-back-rustle/fern-back08",
    "plant-fern-large-back-rustle/fern-back09"
];
SpritePaths[Sprite.FERN_FRONT_RUSTLE] = [
    "plant-fern-large-front-rustle/fern-front00",
    "plant-fern-large-front-rustle/fern-front01",
    "plant-fern-large-front-rustle/fern-front02",
    "plant-fern-large-front-rustle/fern-front03",
    "plant-fern-large-front-rustle/fern-front04",
    "plant-fern-large-front-rustle/fern-front05",
    "plant-fern-large-front-rustle/fern-front06",
    "plant-fern-large-front-rustle/fern-front07",
    "plant-fern-large-front-rustle/fern-front08",
    "plant-fern-large-front-rustle/fern-front09"
];
SpritePaths[Sprite.BLOCK] = ["indestructable-terrain/indestructible-block-1"];
SpritePaths[Sprite.BLOCK_SHADOW] = ["shadow-indestructable/shadow-indestructable"];
SpritePaths[Sprite.RUBBLE] = ["rock-rubble/rock-2"];
SpritePaths[Sprite.SCORCH] = ["scorched-terrain/scorched_terrain-1"];
SpritePaths[Sprite.STAIRS] = ["stairs-bottom/stairs-bottom"];



Object.freeze(Sprite);
Object.freeze(SpritePaths);

const SpriteStrings = {};

Object.keys(Sprite).forEach((key) => {
    SpriteStrings[key] = Sprite[key].toString();
});

Object.freeze(SpriteStrings);

const indexToSprite = (index) => {
    let match = Object.keys(Sprite).map(key => Sprite[key]).filter(value => value === index);
    return match.length > 0 ? match[0] : 0;
}

export { Sprite, SpriteStrings, SpritePaths, indexToSprite };
