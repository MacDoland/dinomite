import SpriteSheet from "../helpers/spritesheet";
import Grid from "../structures/grid";

class CanvasRenderer {
    #canvas;
    #context;
    #cellSize;
    #borderWidth;
    #spriteSheet;

    constructor(canvas, cellSize = 50, columnCount = 11, rowCount = 11) {
        this.#borderWidth = 100;
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#cellSize = cellSize;
        this.#spriteSheet = new SpriteSheet('./images/dino.png');
        this.#loadSprites();

        this.#canvas.height = this.#cellSize * columnCount + (this.#borderWidth * 2);
        this.#canvas.width = this.#cellSize * rowCount + (this.#borderWidth * 2);
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawGrid(grid) {
        this.#context.beginPath();
        // let gridCoordinates = Grid.getGridCoordinates();

        let coordinate;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 11, 11);
            this.#context.beginPath();

            if (element === 0) {
                this.#context.fillStyle = (coordinate.y % 2) === (coordinate.x % 2) ? "#eee" : "#ced7dd";
            }
            else {
                this.#context.fillStyle = "#666";
            }
            this.#context.rect(coordinate.x * this.#cellSize + this.#borderWidth,
                coordinate.y * this.#cellSize + this.#borderWidth,
                this.#cellSize,
                this.#cellSize);
            this.#context.fill();
            this.#context.closePath();
        });

        this.#context.closePath();
    }


    drawPlayer(player) {
        this.#context.beginPath();
        // this.#context.rect(
        //     player.getPosition().x + this.#borderWidth,
        //     player.getPosition().y + this.#borderWidth,
        //     player.getWidth(),
        //     player.getHeight());
        
            const sprite = this.#spriteSheet.getSprite('dino').spriteSheet ;
            this.#context.drawImage(sprite, 0, 0, 694, 694, player.getPosition().x + this.#borderWidth - this.#cellSize, player.getPosition().y + this.#borderWidth - this.#cellSize, this.#cellSize * 2, this.#cellSize * 2);

        this.#context.fillStyle = 'red';
        this.#context.fill();
        this.#context.closePath();
    }

    takeScreenshot() {
        return this.#canvas.toDataURL('png');
    }

    #loadSprites() {
        this.#spriteSheet.addSprite('dino', 0, 0, 694, 694);
    }

}

export default CanvasRenderer;