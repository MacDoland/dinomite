import CanvasRenderer from './renderers/canvas-renderer';
import GameManager from './game-management/game-manager';
import AudioManager from './game-management/audio-manager';
import Vue from 'vue';
import Grid from './structures/grid';
import { defaultLevel } from './levels/levels';
import OptionsManager from './game-management/options-manager';
import InputManager, { InputKeys } from './game-management/input-manager';
import Logger from './helpers/logger';

let logger = new Logger();
const grid = new Grid(15, 15, defaultLevel.grid);
const canvas = document.getElementById('canvas');
const renderer = new CanvasRenderer(canvas, 100, grid.getColumnCount(), grid.getRowCount());
const gameManager = new GameManager(defaultLevel, grid, logger);
const audioManager = new AudioManager();
const optionsManager = new OptionsManager();
const inputManager = new InputManager();
let config = optionsManager.get() || {};
//audioManager.load('menu-bg', './audio/Komiku_-_12_-_Bicycle.mp3', 0.5, true);

//const ui = new UI(introScreen, gameScreen, highScoreScreen, reviewScreen);

// ui.onMainMenu(() => {
//     audioManager.play('menu-bg');
// });

// ui.onInitGame(() => {
//     audioManager.stop('menu-bg');
//     gameManager.init();
// });

// ui.onStartGame(() => {
//     gameManager.start();
// });

inputManager.onKeyUp((key) => {
    // console.log('key', key);

    if (key === InputKeys.KEY_G.toString()) {
        config = optionsManager.get() || {};
        config.showGrid = !config.showGrid;

        optionsManager.updateConfig(config);
    }
});

let position = '';
let gridPosition = '';
let direction = '';
let gridIndex = '';
let state = '';
let bombCount = '';
let logs = '';
let showDebug;

var app = new Vue({
    el: '#debug-window',
    data: {
        position,
        gridPosition,
        direction,
        gridIndex,
        state,
        bombCount,
        logs,
        showDebug
    },
    mounted() {
        gameManager.onUpdate(({ grid, player, playerState, direction, gridIndex, bombs }) => {
            let coordinate = Grid.convertIndexToCoordinate(gridIndex, 15, 15);
            this.gridPosition = `position x:${Math.floor(coordinate.x)}, y:${Math.floor(coordinate.y)}`;
            this.position = `grid position x:${Math.floor(player.getPosition().x)}, y:${Math.floor(player.getPosition().y)}`;
            this.direction = `direction: ${direction}`;
            this.gridIndex = `gridIndex: ${gridIndex}`;
            this.state = `state: ${playerState}`;
            this.bombCount = `bombCount: ${bombs.length}`;

            this.logs = logger.retrieveLogs();

            this.showDebug = config.showGrid;
        });
    }
})

const updateGame = ({ grid, player, playerState, direction, gridIndex, bombs, blasts, colliders }) => {
    inputManager.update();
    renderer.clear();
    renderer.drawGrid(grid.getGrid(), config, bombs, blasts);
    renderer.drawPlayer(player, playerState, direction, gridIndex);

    if (config.showGrid) {
        renderer.drawDebug(colliders);
    }

    // let before = performance.now();
    // let numDrawCalls =  renderer.draw();
    // let after = performance.now() - before;
    // console.log('draw calls: ', numDrawCalls, after);

    renderer.draw();

}

gameManager.onInit(updateGame);
gameManager.onUpdate(updateGame);
// gameManager.onEnd();

gameManager.init();
gameManager.start();





