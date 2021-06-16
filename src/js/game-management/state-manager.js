import { createMachine } from 'xstate';
import { TileStateStrings as Tiles } from "../state/tile-state";

const StateEvents = {
    PLANT_BOMB: 'PLANT_BOMB',
    BOMB_DETONATE: 'BOMB_DETONATE',
    EXPLOSION: 'EXPLOSION',
    EXPLOSION_END: 'EXPLOSION_END',
    DEATH: 'DEATH'
}

//Empty Tile
const emptyTileEvents = {};
emptyTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB;
emptyTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION;

//Explosion Tile
const explosionTileEvents = {};
explosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.EMPTY;
explosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE;

//Stairs
const stairTileEvents = {};
stairTileEvents[StateEvents.PLANT_BOMB] = Tiles.STAIRS_BOMB;
stairTileEvents[StateEvents.EXPLOSION] = Tiles.STAIRS_EXPLOSION;

//Stairs Bomb
const stairBombTileEvents = {};
stairBombTileEvents[StateEvents.EXPLOSION] = Tiles.STAIRS_EXPLOSION;

//Stairs Explosion
const stairExplosionTileEvents = {};
stairExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.STAIRS;
stairExplosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_STAIRS;

//Tar
const tarTileEvents = {};
tarTileEvents[StateEvents.PLANT_BOMB] = Tiles.TAR_BOMB;
tarTileEvents[StateEvents.EXPLOSION] = Tiles.TAR_EXPLOSION;

//Tar Bomb
const tarBombTileEvents = {};
tarBombTileEvents[StateEvents.EXPLOSION] = Tiles.TAR_EXPLOSION;

//Tar Explosion
const tarExplosionTileEvents = {};
tarExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.TAR;
tarExplosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_TAR;

//Ocean
const oceanTileEvents = {};

//Rubble Explosion Tile
const rubbleExplosionTileEvents = {};
rubbleExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE;
rubbleExplosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE;

//Scorch Tile
const scorchTileEvents = {};
scorchTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_SCORCH;
scorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;
scorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_SCORCH;

//Scorch Explosion Tile
const scorchExplosionTileEvents = {};
scorchExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;
scorchExplosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_SCORCH;

//Rubble Tile
const rubbleTileEvents = {};
rubbleTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_RUBBLE;
rubbleTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;
rubbleTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE;

//Rubble Scorch Tile
const rubbleScorchTileEvents = {};
rubbleScorchTileEvents[StateEvents.PLANT_BOMB] = Tiles.BOMB_RUBBLE_SCORCH;
rubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE_SCORCH;
rubbleScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;

//Rubble Scorch Explosion Tile
const rubbleScorchExplosionTileEvents = {};
rubbleScorchExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
rubbleScorchExplosionTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;

//Bomb Tile
const bombTileEvents = {};
bombTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;
bombTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;
bombTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;
bombTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_SCORCH;

//Bomb Rubble Tile
const bombRubbleTileEvents = {};
bombRubbleTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;
bombRubbleTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;
bombRubbleTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
bombRubbleTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;

//Bomb Scorch Tile
const bombScorchTileEvents = {};
bombScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.SCORCH;
bombScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_SCORCH;
bombScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;
bombScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_SCORCH;

//Bomb Rubble Scorch Tile
const bombRubbleScorchTileEvents = {};
bombRubbleScorchTileEvents[StateEvents.BOMB_DETONATE] = Tiles.RUBBLE_SCORCH;
bombRubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE_SCORCH;
bombRubbleScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
bombRubbleScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;


//Gravestone
const gravestoneTileEvents = {};
gravestoneTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION;
gravestoneTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;

const gravestoneExplosionTileEvents = {};
gravestoneExplosionTileEvents[StateEvents.EXPLOSION_END] = Tiles.SCORCH;

const gravestoneRubbleTileEvents = {};
gravestoneRubbleTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION_RUBBLE;
gravestoneRubbleTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;

const gravestoneExplosionRubbleScorchTileEvents = {};
gravestoneExplosionRubbleScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
gravestoneExplosionRubbleScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;

const gravestoneExplosionRubbleTileEvents = {};
gravestoneExplosionRubbleTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE;
gravestoneExplosionRubbleTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE;

const gravestoneScorchTileEvents = {};
gravestoneScorchTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION_SCORCH;
gravestoneScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
gravestoneScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_SCORCH;

const gravestoneRubbleScorchTileEvents = {};
gravestoneRubbleScorchTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION_RUBBLE_SCORCH;
gravestoneRubbleScorchTileEvents[StateEvents.EXPLOSION_END] = Tiles.RUBBLE_SCORCH;
gravestoneRubbleScorchTileEvents[StateEvents.DEATH] = Tiles.GRAVESTONE_RUBBLE_SCORCH;

const gravestoneStairsTileEvents = {};
gravestoneStairsTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION_STAIRS;
gravestoneStairsTileEvents[StateEvents.EXPLOSION_END] = Tiles.STAIRS;

const gravestoneTarTileEvents = {};
gravestoneTarTileEvents[StateEvents.EXPLOSION] = Tiles.GRAVESTONE_EXPLOSION_TAR;
gravestoneTarTileEvents[StateEvents.EXPLOSION_END] = Tiles.TAR;

//Destructable Tile
const destructableTileEvents = {};
destructableTileEvents[StateEvents.EXPLOSION] = Tiles.EXPLOSION_RUBBLE;

let states = {};
states[Tiles.EMPTY] = { on: emptyTileEvents };
states[Tiles.OCEAN] = { on: oceanTileEvents };
states[Tiles.STAIRS] = { on: stairTileEvents };
states[Tiles.STAIRS_BOMB] = { on: stairBombTileEvents };
states[Tiles.STAIRS_EXPLOSION] = { on: stairExplosionTileEvents };

states[Tiles.TAR] = { on: tarTileEvents };
states[Tiles.TAR_BOMB] = { on: tarBombTileEvents };
states[Tiles.TAR_EXPLOSION] = { on: tarExplosionTileEvents };

states[Tiles.GRAVESTONE] = { on: gravestoneTileEvents };
states[Tiles.GRAVESTONE_EXPLOSION] = { on: gravestoneTileEvents };
states[Tiles.GRAVESTONE_EXPLOSION_RUBBLE] = { on: gravestoneExplosionRubbleTileEvents };
states[Tiles.GRAVESTONE_EXPLOSION_RUBBLE_SCORCH] = { on: gravestoneExplosionRubbleScorchTileEvents };
states[Tiles.GRAVESTONE_RUBBLE] = { on: gravestoneRubbleTileEvents };
states[Tiles.GRAVESTONE_RUBBLE_SCORCH] = { on: gravestoneRubbleScorchTileEvents };
states[Tiles.GRAVESTONE_SCORCH] = { on: gravestoneScorchTileEvents };
states[Tiles.GRAVESTONE_STAIRS] = { on: gravestoneStairsTileEvents };
states[Tiles.GRAVESTONE_TAR] = { on: gravestoneTarTileEvents };

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