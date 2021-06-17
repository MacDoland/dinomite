import { convertIndexToCoordinate, getNeighbours } from "../helpers/grid-helpers";
import { LayerState } from "../state/layers";
import Vector from "./vector";

class Grid {
    #grid;
    #numberOfColumns;
    #numberOfRows;
    #gridUpdateHistory;

    constructor(numberOfColumns = 0, numberOfRows = 0, data) {
        this.#grid = {};
        this.#numberOfColumns = numberOfColumns;
        this.#numberOfRows = numberOfRows;
        data = data || new Array(this.#numberOfColumns * this.#numberOfRows);
        this.#gridUpdateHistory = [];
        this.#grid[LayerState.TILES] = data;
        this.#grid[LayerState.ITEMS] = new Array(this.#numberOfColumns * this.#numberOfRows);
        this.#grid[LayerState.ITEMS].fill(0);
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

    get(layer = LayerState.TILES) {
        return this.#grid[layer];
    }

    getElementAt(index, layer = LayerState.TILES) {
        return this.#grid[layer][index];
    }

    getIndex(x, y) {
        return (y * this.#numberOfColumns) + x;
    }

    getGridCoordinates(layer = LayerState.TILES) {
        return [...this.get(layer).keys()].map((element, index) => convertIndexToCoordinate(index, this.#numberOfColumns, this.#numberOfRows));
    }

    getRandomIndex(excludedIndices = []) {
        const indices = [...this.get().keys()].map((element, index) => index).filter(element => !excludedIndices.includes(element));
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

    set(index, value, includeInHistory = true, layer = LayerState.TILES) {
        if (index > 0 && index < this.#grid[layer].length) {
            this.#grid[layer][index] = value;

            if (includeInHistory) {
                this.#gridUpdateHistory.push({ index, value, layer})
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

    load(cells, layer = LayerState.TILES) {
        this.#grid[layer] = cells;
    }
}

export default Grid;