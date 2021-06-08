import Bomb from "../items/bomb";
import EventDispatcher from '../helpers/event-dispatcher';

class BombShop {
    #bombs;
    #strength;
    #fuseDuration;
    #eventDispatcher;
    #events;

    constructor() {
        this.#bombs = [];
        this.#strength = 4;
        this.#fuseDuration = 3000;
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            PLANT: 'PLANT',
            EXPLODE: 'EXPLODE'
        }
    }

    getActiveBombs(){
        return this.#bombs.filter(bomb => bomb.getIsActive()).length;
    }

    plant(index) {
        const bombOnIndex = this.#bombs.filter(bomb => bomb.getIndex() === index);
        const bombCanBePlacedOnIndex = bombOnIndex.length === 0 || (bombOnIndex === 1 && !bombOnIndex[0].getIsActive());

        if (bombCanBePlacedOnIndex  && this.getActiveBombs() < 3) {
            let bomb;
            let inactiveBombs = this.#bombs.filter(bomb => bomb.getIsActive() === false);

            if (inactiveBombs.length > 0) {
                bomb = inactiveBombs[0];
                //bomb.reset();
                bomb.move(index);
                bomb.lightFuse();
            }
            else {
                bomb = new Bomb(index, this.#strength, this.#fuseDuration);
                bomb.lightFuse();
                this.#bombs.push(bomb);
            }

            bomb.clearHandlers();
            bomb.onExplode(({ index, strength }) => {
                this.#eventDispatcher.dispatch(this.#events.EXPLODE, {
                    index,
                    strength
                });
            });

            this.#eventDispatcher.dispatch(this.#events.PLANT, { index });
        }
    }

    onExplode(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPLODE, handler);
    }

    removeOnExplode(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPLODE, handler);
    }

    onPlant(handler) {
        this.#eventDispatcher.registerHandler(this.#events.PLANT, handler);
    }

    removeOnPlant(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.PLANT, handler);
    }
}

export default BombShop;