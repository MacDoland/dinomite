import { createMachine } from 'xstate';
import { ItemsStateStrings as Items } from '../state/item';
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
//Stairs
const stairTileEvents = {};
//Ocean
const oceanTileEvents = {};
//Slow
const slowTileEvents = {};



//Destructable Tile
const destructableTileEvents = {};
destructableTileEvents[StateEvents.EXPLOSION] = Tiles.EMPTY;

let states = {};
states[Tiles.EMPTY] = { on: emptyTileEvents };
states[Tiles.OCEAN] = { on: oceanTileEvents };
states[Tiles.STAIRS] = { on: stairTileEvents };
states[Tiles.SLOW] = { on: slowTileEvents };
states[Tiles.DESTRUCTABLE] = { on: destructableTileEvents };


const tileStateMachine = createMachine({
    id: 'tiles',
    initial: Tiles.EMPTY,
    states: states
});

const noneItemEvents = {}
noneItemEvents[StateEvents.PLANT_BOMB] = Items.BOMB;
noneItemEvents[StateEvents.DEATH] = Items.GRAVE;

const bombItemEvents = {}
bombItemEvents[StateEvents.BOMB_DETONATE] = Items.NONE;
bombItemEvents[StateEvents.EXPLOSION] = Items.NONE;

const graveItemEvents = {}
graveItemEvents[StateEvents.BOMB_DETONATE] = Items.NONE;
graveItemEvents[StateEvents.EXPLOSION] = Items.NONE;

let itemStates = {};
itemStates[Items.NONE] = { on: noneItemEvents };
itemStates[Items.BOMB] = { on: bombItemEvents };
itemStates[Items.GRAVE] = { on: graveItemEvents };

const itemStateMachine = createMachine({
    id: 'items',
    initial: Items.NONE,
    states: itemStates
});

const transitionNewState = (element, stateMap, stateMachine, stateEvent) => {
    const currentState = stateMap(element);
    return parseInt(stateMachine.transition(currentState.toString(), stateEvent).value);
};

export { StateEvents, tileStateMachine, itemStateMachine, transitionNewState };