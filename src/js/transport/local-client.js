import { defaultLevel } from "../levels/levels";

class LocalClient {
    #grid;
    #eventDispatcher;
    #events;
    #gameAuthority;
    #players;

    constructor(grid, gameConfig) {
        this.#gameAuthority = new GameAuthority(grid, gameConfig);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE'
        }

        const loop = () => {
            let message = this.#gameAuthority.getUpdate();
            this.#eventDispatcher.dispatch(GameEvents.UPDATE, message);
            setTimeout(loop, 1000 / 60);
        }

        setTimeout(loop, 1000 / 60);

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