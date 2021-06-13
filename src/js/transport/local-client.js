import { GameEvents } from "../events/events";
import GameAuthority from "../game-management/game-authority";
import EventDispatcher from "../helpers/event-dispatcher";
import { defaultLevel } from "../levels/levels";

class LocalClient {
    #eventDispatcher;
    #gameAuthority;

    constructor(grid, gameConfig) {
        this.#gameAuthority = new GameAuthority(grid, gameConfig);
        this.#eventDispatcher = new EventDispatcher();

        const loop = () => {
            let message = this.#gameAuthority.getUpdate();
            this.#eventDispatcher.dispatch(GameEvents.UPDATE, message);
            setTimeout(loop, 1000 / 60);
        }

        setTimeout(loop, 1000 / 60);

        setTimeout(() => {
            this.#eventDispatcher.dispatch(GameEvents.CONNECTED, this.#gameAuthority.getFullGameState());
        }, 10);
    }

    send(gameEvent, data) {
        let result;
        switch (gameEvent) {
            case GameEvents.CONNECTED:
                this.#eventDispatcher.dispatch(GameEvents.CONNECTED, defaultLevel.grid);
                break;
            case GameEvents.NEW_PLAYER:
                let response = this.#gameAuthority.addPlayer(data.id);
                this.#eventDispatcher.dispatch(GameEvents.NEW_PLAYER, {
                    id: response.getId(),
                    state: response.getState(),
                    position: response.getPosition(),
                    direction: response.getDirection()
                });
                break;
            case GameEvents.PLAYER_INPUT:
                result = this.#gameAuthority.addPlayerInputUpdate(data.id, data.input);
                break;
        }
    }

    on(event, handler) {
        this.#eventDispatcher.registerHandler(event, handler);
    }
}



export { LocalClient };