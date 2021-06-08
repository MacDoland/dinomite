import Bomb from "../items/bomb";
import EventDispatcher from '../helpers/event-dispatcher';
import Blast from "../items/blast";

class BombShop {
    #bombs;
    #blasts;
    #strength;
    #fuseDuration;
    #eventDispatcher;
    #events;

    constructor() {
        this.#bombs = [];
        this.#blasts = [];
        this.#strength = 4;
        this.#fuseDuration = 3000;
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            PLANT: 'PLANT',
            EXPIRE: 'EXPIRE',
            EXPLOSION: 'EXPLOSION'
        }
    }

    getActiveBombs() {
        return this.#bombs.filter(bomb => bomb.getIsActive()).length;
    }

    getActiveBlasts() {
        return this.#blasts.filter(blast => blast.getIsActive()).length;
    }

    getInactiveBlasts() {
        return this.#blasts.filter(blast => !blast.getIsActive()).length;
    }

    plant(index) {
        const bombOnIndex = this.#bombs.filter(bomb => bomb.getIndex() === index);
        const bombCanBePlacedOnIndex = bombOnIndex.length === 0 || (bombOnIndex === 1 && !bombOnIndex[0].getIsActive());

        if (bombCanBePlacedOnIndex && this.getActiveBombs() < 3) {
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
                this.#eventDispatcher.dispatch(this.#events.EXPIRE, {
                    index,
                    strength
                });
            });

            this.#eventDispatcher.dispatch(this.#events.PLANT, { index });
        }
    }

    createExplosion(index, blastTargets, rateOfFire, duration) {
        // if (this.getInactiveBlasts().length === 0) {
            let blast = new Blast(index, blastTargets, rateOfFire, duration);

            blast.onExplode((targets) => {
                this.#eventDispatcher.dispatch(this.#events.EXPLOSION, blastTargets);
            });

            this.#blasts.push(blast);

            blast.detonate(index);
        // }
    }

    onBombExpired(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPIRE, handler);
    }

    removeOnBombExpired(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPIRE, handler);
    }

    onExplosion(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPLOSION, handler);
    }

    removeOnExplosion(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPLOSION, handler);
    }

    onPlant(handler) {
        this.#eventDispatcher.registerHandler(this.#events.PLANT, handler);
    }

    removeOnPlant(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.PLANT, handler);
    }
}

export default BombShop;