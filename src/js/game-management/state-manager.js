import { createMachine } from 'xstate';
import { TileStateStrings as Tiles } from "../state/tile-state";

const StateEvents = {
    PLANT_BOMB: 'PLANT_BOMB',
    BOMB_DETONATE: 'BOMB_DETONATE',
    EXPLOSION: 'EXPLOSION',
    EXPLOSION_END: 'EXPLOSION_END'
}

//Empty Tile
const emptyTileEvents = {};
emptyTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB;
emptyTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION;

//Explosion Tile
const explosionTileEvents = {};
explosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.EMPTY;


//Ocean
const oceanTileEvents = {};

//Rubble Explosion Tile
const rubbleExplosionTileEvents = {};
rubbleExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE;

//Scorch Tile
const scorchTileEvents = {};
scorchTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_SCORCH;
scorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;

//Scorch Explosion Tile
const scorchExplosionTileEvents = {};
scorchExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;

//Rubble Tile
const rubbleTileEvents = {};
rubbleTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_RUBBLE;
rubbleTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;

//Rubble Scorch Tile
const rubbleScorchTileEvents = {};
rubbleScorchTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_RUBBLE_SCORCH;
rubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE_SCORCH;

//Rubble Scorch Explosion Tile
const rubbleScorchExplosionTileEvents = {};
rubbleScorchExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;

//Bomb Tile
const bombTileEvents = {};
bombTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;
bombTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;
bombTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;

//Bomb Rubble Tile
const bombRubbleTileEvents = {};
bombRubbleTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;
bombRubbleTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;
bombRubbleTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;

//Bomb Scorch Tile
const bombScorchTileEvents = {};
bombScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;
bombScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;
bombScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;

//Bomb Rubble Scorch Tile
const bombRubbleScorchTileEvents = {};
bombRubbleScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;
bombRubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE_SCORCH;
bombRubbleScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;


//Destructable Tile
const destructableTileEvents = {};
destructableTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;

let states = {};
states[Tiles.EMPTY] = { on: emptyTileEvents };
states[Tiles.OCEAN] = { on: oceanTileEvents };

states[Tiles.DESTRUCTABLE] = { on: destructableTileEvents };
states[Tiles.RUBBLE] = { on: rubbleTileEvents };
states[Tiles.BOMB_RUBBLE] = { on: bombRubbleTileEvents };
states[Tiles.BOMB] = { on: bombTileEvents };
states[Tiles.SCORCH] = { on: scorchTileEvents };
states[Tiles.BOMB_RUBBLE_SCORCH] = { on: bombRubbleScorchTileEvents };
states[Tiles.BOMB_SCORCH] = { on: bombScorchTileEvents };
states[Tiles.RUBBLE_SCORCH] = { on: rubbleScorchTileEvents };

states[Tiles.EXPLOSION] = { on: explosionTileEvents };
states[Tiles.EXPLOSION_RUBBLE] = { on: rubbleExplosionTileEvents };
states[Tiles.EXPLOSION_SCORCH] = { on: scorchExplosionTileEvents };
states[Tiles.EXPLOSION_RUBBLE_SCORCH] = { on: rubbleScorchExplosionTileEvents };

const stateMachine = createMachine({
    id: 'tiles',
    initial: Tiles.EMPTY,
    states: states
});

export default stateMachine;
export { StateEvents };