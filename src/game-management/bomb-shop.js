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
        return this.#blasts.filter(blast => blast.getIsActive()).length;
    }

    getInactiveBlasts() {
        return this.#blasts.filter(blast => !blast.getIsActive()).length;
    }

    plant(index) {
        const bombOnIndex = this.#bombs.filter(bomb => bomb.getIndex() === index);
        const bombCanBePlacedOnIndex = bombOnIndex.length === 0 || (bombOnIndex === 1 && !bombOnIndex[0].getIsActive());

        if (bombCanBePlacedOnIndex && this.getActiveBombsCount() < 3) {
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

        if(bombOnIndex.length > 0 && bombOnIndex[0].getIsActive()){
            this.#bombs[bombOnIndex].detonate();
        }
    }

    createExplosion(index, blastTargets, rateOfFire, duration) {
        // if (this.getInactiveBlasts().length === 0) {
        let blast = new Blast(index, blastTargets, rateOfFire, duration);
        const getItemsLeftToProcess = () => { return blastTargets.map(list => list.length).reduce((a, b) => a + b) };
        let i = 0;
        blast.onExplode((targets) => {
            console.log('BIG EXPLODY');
            let itemsLeftToProcess = getItemsLeftToProcess();

            while (itemsLeftToProcess > 0) {
                console.log('itemsLeftToProcess', itemsLeftToProcess);

                blastTargets.forEach(element => {
                    let node = element.shift();
                    if (node) {
                        console.log('DESTROYING index:', node.value());
                        setTimeout(() => {
                            this.#eventDispatcher.dispatch(this.#events.EXPLOSION, node.value());
                        }, i * rateOfFire);

                        setTimeout(() => {
                            this.#eventDispatcher.dispatch(this.#events.EXPLOSION_END, node.value());
                        }, this.#strength * rateOfFire + this.#explosionDuration);
                    }
                });

                itemsLeftToProcess = getItemsLeftToProcess();

                i++;
            };
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