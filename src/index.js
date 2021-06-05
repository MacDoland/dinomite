import CanvasRenderer from './renderers/canvas-renderer';
import GameManager from './game-management/game-manager';
import AudioManager from './game-management/audio-manager';
import Vue from 'vue';
import Grid from './structures/grid';

const grid = new Grid(11, 11);
const canvas = document.getElementById('canvas');
const renderer = new CanvasRenderer(canvas, 100, grid.getColumnCount(), grid.getRowCount());
const gameManager = new GameManager(grid);
const audioManager = new AudioManager();
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
let position = '';
let direction = '';
let gridIndex = '';
let state = '';

var app = new Vue({
    el: '#debug-window',
    data: {
        position,
        direction,
        gridIndex,
        state
    },
    mounted() {
        gameManager.onUpdate(({ grid, player, playerState, direction,  gridIndex }) => {
            this.position = `position x:${Math.floor(player.getPosition().x)}, y:${Math.floor(player.getPosition().y)}`;
            this.direction = `direction: ${direction}`;
            this.gridIndex = `gridIndex: ${gridIndex}`;
            this.state = `state: ${playerState}`;
        });
    }
  })

const updateGame = ({ grid, player, playerState, direction  }) => {
    renderer.clear();
    renderer.drawGrid(grid.getGrid())
    renderer.drawPlayer(player, playerState, direction);
}

gameManager.onInit(updateGame);
gameManager.onUpdate(updateGame);
// gameManager.onEnd();

gameManager.init();
gameManager.start();





