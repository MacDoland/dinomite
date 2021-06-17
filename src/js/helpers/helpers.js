import Grid from "../structures/grid";
import Vector from "../structures/vector";
import { convertCoordinateToIndex } from "./grid-helpers";

export const findById = (items, id) => {
    const result = items.filter((item) => item.getId() === id);

    return result.length > 0 ? result[0] : null;
}

export const objectPropertiesAreFalse = (targetObject) => {
    let values = Object.keys(targetObject).map(key => targetObject[key]);
    let count = values.length;

    let filtered = values.filter(value => (value === false || typeof (value) === 'undefined'));

    return filtered.length === count;
}

export const killPlayersOnTile = (tileId, players, grid) => {
    players.forEach(player => {
        let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
        let playerIndex = convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, grid.getColumnCount(), grid.getRowCount());
        if (tileId === playerIndex) {
            player.die();

            setTimeout(() => {
                player.respawn();
            }, 3000);
        }
    });
}

