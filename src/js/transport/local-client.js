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
            setTimeout(loop, 1);
        }

        setTimeout(loop, 1);

        setTimeout(() => {
            let state = this.#gameAuthority.getFullGameState();
            state.playerId = "123";
            this.#eventDispatcher.dispatch(GameEvents.CONNECTED, state);
        }, 0);
    }

    send(gameEvent, data) {
        let result;
        switch (gameEvent) {
            case GameEvents.NEW_PLAYER:
                const newPlayer = this.#gameAuthority.addPlayer(data.id, data.cId);
                this.#eventDispatcher.dispatch(GameEvents.NEW_PLAYER, {
                    id: newPlayer.getId(),
                    cId: newPlayer.getCharacterIndex(),
                    p: newPlayer.getPosition().raw(),
                    d: newPlayer.getDirection(),
                    s: newPlayer.getState()
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