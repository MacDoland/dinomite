import directions from "../helpers/direction";
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
        return [...this.getGrid().keys()].map((element, index) => Grid.convertIndexToCoordinate(index, this.#numberOfColumns, this.#numberOfRows));
    }

    getRandomIndex(excludedIndices = []) {
        const indices = [...this.getGrid().keys()].map((element, index) => index).filter(element => !excludedIndices.includes(element));
        const randomNumber = Math.floor(Math.random() * indices.length);
        return indices[randomNumber];
    }

    getRandomCoordinate(excludedCoordinates = []) {
        const excludedIndices = excludedCoordinates.map(coordinate => this.getIndex(coordinate.x, coordinate.y));
        const randomIndex = this.getRandomIndex(excludedIndices);
        return Grid.convertIndexToCoordinate(randomIndex, this.#numberOfColumns, this.#numberOfRows);
    }

    getNeighbours(index, depth = 1) {
        return Grid.getNeighbours(index, depth, this.#numberOfColumns, this.#numberOfRows);
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
        return Grid.convertIndexToCoordinate(cellIndex, this.#numberOfColumns, this.#numberOfRows).multiplyScalar(cellSize).add(new Vector(cellSize / 2, cellSize / 2));
    }


    static convertIndexToCoordinate(index, numberOfColumns, numberOfRows) {
        return new Vector(index % numberOfColumns, Math.floor(index / numberOfRows));
    }

    static convertCoordinateToIndex(x, y, numberOfColumns) {
        return (y * numberOfColumns) + x;
    }

    static getNeighbours(index, depth, columnCount, rowCount) {
        let neighbours = {}, offset;
        let coordinate = Grid.convertIndexToCoordinate(index, columnCount, rowCount);

        neighbours[directions.UP] = [];
        neighbours[directions.DOWN] = [];
        neighbours[directions.LEFT] = [];
        neighbours[directions.RIGHT] = [];

        neighbours[directions.LEFTDOWN] = [];
        neighbours[directions.LEFTUP] = [];
        neighbours[directions.RIGHTDOWN] = [];
        neighbours[directions.RIGHTUP] = [];

        for (let i = 0; i < depth; i++) {
            offset = Vector.add(coordinate, new Vector(0, -(i + 1)))
            if (offset.y > 0) {
                neighbours[directions.UP].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector(0, (i + 1)))
            if (offset.y < rowCount - 1) {
                neighbours[directions.DOWN].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector(-(i + 1), 0))
            if (offset.x > 0) {
                neighbours[directions.LEFT].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector((i + 1), 0))
            if (offset.x < columnCount - 1) {
                neighbours[directions.RIGHT].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }



            offset = Vector.add(coordinate, new Vector(-(i + 1), (i + 1)))
            if (offset.y > 0) {
                neighbours[directions.LEFTDOWN].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector((i + 1), -(i + 1)))
            if (offset.y < rowCount - 1) {
                neighbours[directions.RIGHTUP].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector(-(i + 1), -(i + 1)))
            if (offset.x > 0) {
                neighbours[directions.LEFTUP].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

            offset = Vector.add(coordinate, new Vector((i + 1), (i + 1)))
            if (offset.x < columnCount - 1) {
                neighbours[directions.RIGHTDOWN].push(Grid.convertCoordinateToIndex(offset.x, offset.y, columnCount));
            }

        }

        return neighbours;
    }
}

export default Grid;