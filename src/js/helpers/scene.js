import SinglyLinkedList from "../structures/linked-list";

class Scene {
    historyStack;
    currentState;

    constructor(tiles, items, effects) {
        this.historyStack = new SinglyLinkedList();
        this.currentState = new SceneState(tiles, items, effects);
        //this.historyStack.unshift(state);
    }

    save() {
        this.historyStack.unshift(this.currentState);
        this.currentState = new SceneState(this.currentState.tiles, this.currentState.items, this.currentState.effects);
    }

    Update(type, data) {
        switch(type){
            case SceneObjectTypes.TILE:
                this.currentState.tiles[data.id] = data.value;
                break;
        }
    }
}

class SceneState {
    tiles;
    items;
    effects;

    constructor(tiles, items, effects) {
        this.tiles = tiles;
        this.items = items;
        this.effects = effects;
    }
}

const SceneObjectTypes = {
    TILE_MAP: 0,
    ITEM_MAP: 1,
    EFFECTS_MAP: 2,
    TILE: 3,
    ITEM: 4,
    EFFECT: 5
}

Object.freeze(SceneObjectTypes);

export { Scene, SceneObjectTypes };