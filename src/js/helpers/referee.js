import { TileState } from "../state/tile-state";
import Vector from "../structures/vector";

export const processPlayerMovement = (grid, player, offset) => {
    let newOffset = new Vector();

    if (player && offset) {
        const canMoveTopRightX = this.#canMove(offset.getXOnly(), player.getTopRight(), this.#grid);
        const canMoveBottomRightX = this.#canMove(offset.getXOnly(), player.getBottomRight(), this.#grid);
        const canMoveTopLeftX = this.#canMove(offset.getXOnly(), player.getTopLeft(), this.#grid);
        const canMoveBottomLeftX = this.#canMove(offset.getXOnly(), player.getBottomLeft(), this.#grid);

        const canMoveTopRightY = this.#canMove(offset.getYOnly(), player.getTopRight(), this.#grid);
        const canMoveBottomRightY = this.#canMove(offset.getYOnly(), player.getBottomRight(), this.#grid);
        const canMoveTopLeftY = this.#canMove(offset.getYOnly(), player.getTopLeft(), this.#grid);
        const canMoveBottomLeftY = this.#canMove(offset.getYOnly(), player.getBottomLeft(), this.#grid);

        if (canMoveTopRightX && canMoveBottomRightX && canMoveTopLeftX && canMoveBottomLeftX) {
            newOffset.add(offset.getXOnly())
        }

        if (canMoveTopRightY && canMoveBottomRightY && canMoveTopLeftY && canMoveBottomLeftY) {
            newOffset.add(offset.getXOnly())
        }
    }

    return newOffset;
}


export const canMove = (offset, position, grid) => {
    const potentialPosition = Vector.add(position, offset);
    let gridCoordinate = Vector.multiplyScalar(potentialPosition, 1 / 100).floor();
    let index = grid.getIndex(gridCoordinate.x, gridCoordinate.y);
    return index > 0 && index < grid.getGrid().length
        && (grid.getGrid()[index] === TileState.EMPTY
            || grid.getGrid()[index] === TileState.BOMB
            || grid.getGrid()[index] === TileState.RUBBLE
            || grid.getGrid()[index] === TileState.SCORCH
            || grid.getGrid()[index] === TileState.BOMB_RUBBLE_SCORCH
            || grid.getGrid()[index] === TileState.BOMB_SCORCH
            || grid.getGrid()[index] === TileState.BOMB_RUBBLE
            || grid.getGrid()[index] === TileState.RUBBLE_SCORCH
            || grid.getGrid()[index] === TileState.EXPLOSION
            || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE
            || grid.getGrid()[index] === TileState.EXPLOSION_SCORCH
            || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE_SCORCH
        );
}