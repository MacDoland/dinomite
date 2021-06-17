import directions from "../helpers/direction";
import { convertCoordinateToIndex, convertIndexToCoordinate, getNeighbours } from "../helpers/grid-helpers";
import Vector from "./vector";

class Grid {
    #grid;
    #numberOfColumns;
    #numberOfRows;
    #gridUpdateHistory;

    constructor(numberOfColumns = 0, numberOfRows = 0, data) {

        this.#numberOfColumns = numberOfColumns;
        this.#numberOfRows = numberOfRows;
        data = data || new Array(this.#numberOfColumns * this.#numberOfRows);
        this.#gridUpdateHistory = [];
        this.#grid = data;
    }

    getCenter() {
        return new Vector((this.#numberOfColumns / 2) - 1, (this.#numberOfRows / 2) - 1);
    }

    getColumnCount() {
        return this.#numberOfColumns;
    }

    getRowCount() {
        return this.#numberOfRows;
    }

    getGrid() {
        return this.#grid;
    }

    getElementAt(index) {
        return this.#grid[index];
    }

    getIndex(x, y) {
        return (y * this.#numberOfColumns) + x;
    }

    getGridCoordinates() {
        return [...this.getGrid().keys()].map((element, index) => convertIndexToCoordinate(index, this.#numberOfColumns, this.#numberOfRows));
    }

    getRandomIndex(excludedIndices = []) {
        const indices = [...this.getGrid().keys()].map((element, index) => index).filter(element => !excludedIndices.includes(element));
        const randomNumber = Math.floor(Math.random() * indices.length);
        return indices[randomNumber];
    }

    getRandomCoordinate(excludedCoordinates = []) {
        const excludedIndices = excludedCoordinates.map(coordinate => this.getIndex(coordinate.x, coordinate.y));
        const randomIndex = this.getRandomIndex(excludedIndices);
        return convertIndexToCoordinate(randomIndex, this.#numberOfColumns, this.#numberOfRows);
    }

    getNeighbours(index, depth = 1) {
        return getNeighbours(index, depth, this.#numberOfColumns, this.#numberOfRows);
    }

    fillGrid(indices, value) {
        return this.#grid.map((gridItem, index) => {
            if (indices.includes(index)) {
                gridItem = value;
            }
            return gridItem;
        });
    }

    set(index, value, includeInHistory = true) {
        if (index > 0 && index < this.#grid.length) {
            this.#grid[index] = value;

            if (includeInHistory) {
                this.#gridUpdateHistory.push({ index, value })
            }
        }
    }

    flushHistory() {
        const history = this.#gridUpdateHistory;
        this.#gridUpdateHistory = [];
        return history;
    }

    getCellCenter(cellIndex, cellSize) {
        return convertIndexToCoordinate(cellIndex, this.#numberOfColumns, this.#numberOfRows).multiplyScalar(cellSize).add(new Vector(cellSize / 2, cellSize / 2));
    }

    load(cells) {
        this.#grid = cells;
    }
}

export default Grid;