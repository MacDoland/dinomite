import Bomb from "../items/bomb";
import EventDispatcher from '../helpers/event-dispatcher';
import Blast from "../items/blast";
import SinglyLinkedList from "../structures/linked-list";

class BombShop {
    #bombs;
    #blasts;
    #strength;
    #fuseDuration;
    #explosionDuration;
    #eventDispatcher;
    #events;

    constructor() {
        this.#bombs = [];
        this.#blasts = [];
        this.#strength = 3;
        this.#fuseDuration = 3000;
        this.#explosionDuration = 500;
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            PLANT: 'PLANT',
            EXPIRE: 'EXPIRE',
            EXPLOSION: 'EXPLOSION',
            EXPLOSION_END: 'EXPLOSION_END'
        }
    }

    getActiveBombsCount() {
        return this.getActiveBombs().length;
    }

    getActiveBombs() {
        return this.#bombs.filter(bomb => bomb.getIsActive());
    }

    getActiveBlasts() {
        return this.#blasts.filter(blast => blast.getIsActive());
    }

    getInactiveBlasts() {
        return this.#blasts.filter(blast => !blast.getIsActive()).length;
    }

    hasActiveBlastAt(index){
        return this.#blasts.filter((blast) => blast.getIndex() === index && blast.getIsActive()).length > 0;
    }

    plant(index) {
        const bombOnIndex = this.#bombs.filter(bomb => bomb.getIndex() === index);
        const bombCanBePlacedOnIndex = bombOnIndex.length === 0 || (bombOnIndex === 1 && !bombOnIndex[0].getIsActive());

        if (bombCanBePlacedOnIndex && this.getActiveBombsCount() < 4) {
            let bomb;
            let inactiveBombs = this.#bombs.filter(bomb => bomb.getIsActive() === false);

            if (inactiveBombs.length > 0) {
                bomb = inactiveBombs[0];
                bomb.reset();
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

                bomb.reset();
            });

            this.#eventDispatcher.dispatch(this.#events.PLANT, { index });
        }
    }

    detonateBombAt(index) {
        const bombOnIndex = this.#bombs.filter(bomb => bomb.getIndex() === index);

        if (bombOnIndex.length > 0 && bombOnIndex[0].getIsActive()) {
            bombOnIndex[0].detonate();
        }
    }

    createExplosion(index, rateOfFire, duration) {
        let blast = new Blast(index, rateOfFire, duration);

        blast.onEnd((index) => {
            this.#eventDispatcher.dispatch(this.#events.EXPLOSION_END, index);
        });
        
        blast.onExplode(() => {
            this.#eventDispatcher.dispatch(this.#events.EXPLOSION, index);
        });

        this.#blasts.push(blast);

        blast.detonate(index);
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

    onExplosionEnd(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPLOSION_END, handler);
    }

    removeOnExplosionEnd(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPLOSION_END, handler);
    }

    onPlant(handler) {
        this.#eventDispatcher.registerHandler(this.#events.PLANT, handler);
    }

    removeOnPlant(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.PLANT, handler);
    }
}

export default BombShop;