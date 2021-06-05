import Vector from "./vector";

class Grid {
    #grid;
    #numberOfColumns;
    #numberOfRows;

    constructor(numberOfColumns = 0, numberOfRows = 0) {
        this.#numberOfColumns = numberOfColumns;
        this.#numberOfRows = numberOfRows;
        this.#grid = new Array(this.#numberOfColumns * this.#numberOfRows);
        this.#grid.fill(0);
        this.#grid = this.#grid
            .map((value, index) => {
                const coordinates = Grid.convertIndexToCoordinate(index, numberOfColumns, numberOfRows);
                if (coordinates.x === 0 || coordinates.y === 0 || coordinates.x === numberOfColumns -1 || coordinates.y === numberOfRows -1) {
                    return 1;
                };

                if ((coordinates.x % 2) !== 1
                    && (coordinates.y % 2) !== 1) {
                    return 1;
                };

                return 0;

            });
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

    static convertIndexToCoordinate(index, numberOfColumns, numberOfRows) {
        return new Vector(index % numberOfColumns, Math.floor(index / numberOfRows));
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

    fillGrid(indices, value) {
        return this.#grid.map((gridItem, index) => {
            if (indices.includes(index)) {
                gridItem = value;
            }
            return gridItem;
        });
    }
}

export default Grid;