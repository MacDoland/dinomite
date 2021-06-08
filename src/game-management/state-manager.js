import { createMachine } from 'xstate';
import { TileStateStrings as Tiles } from "../state/tile-state";

const StateEvents = {
    PLANT_BOMB: 'PLANT_BOMB',
    BOMB_DETONATE: 'BOMB_DETONATE',
    EXPLOSION: 'EXPLOSION'
}

//Empty Tile
const emptyTileEvents = {};
emptyTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB;

//Bomb Tile
const bombTileEvents = {};
bombTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;

//Scorch Tile
const scorchTileEvents = {};
scorchTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_SCORCH;

//Rubble Tile
const rubbleTileEvents = {};
rubbleTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_RUBBLE;

//Bomb Rubble Tile
const bombRubbleTileEvents = {};
bombRubbleTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;

//Bomb Scorch Tile
const bombScorchTileEvents = {};
bombScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;

//Rubble Scorch Tile
const rubbleScorchTileEvents = {};
rubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.RUBBLE_SCORCH;

//Bomb Rubble Scorch Tile
const bombRubbleScorchTileEvents = {};
bombRubbleScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;

//Destructable Tile
const destructableTileEvents = {};
destructableTileEvents[StateEvents.EXPLOSION] = Tiles.RUBBLE;

let states = {};
states[Tiles.EMPTY] = { on: emptyTileEvents };
states[Tiles.DESTRUCTABLE] = { on: destructableTileEvents };
states[Tiles.RUBBLE] = { on: rubbleTileEvents };
states[Tiles.BOMB_RUBBLE] = { on: bombRubbleTileEvents };
states[Tiles.BOMB] = { on: bombTileEvents };
states[Tiles.SCORCH] = { on: scorchTileEvents };
states[Tiles.BOMB_RUBBLE_SCORCH] = { on: bombRubbleScorchTileEvents };
states[Tiles.BOMB_SCORCH] = { on: bombScorchTileEvents };
states[Tiles.RUBBLE_SCORCH] = { on: rubbleScorchTileEvents };

const stateMachine = createMachine({
    id: 'tiles',
    initial: Tiles.EMPTY,
    states: states
});

export default stateMachine;
export { StateEvents };