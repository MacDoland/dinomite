import CanvasRenderer from './renderers/canvas-renderer';
import GameManager from './game-management/game-manager';
import AudioManager from './game-management/audio-manager';
import Vue from 'vue';
import Grid from './structures/grid';

const grid = new Grid(11, 11);
const canvas = document.getElementById('canvas');
const renderer = new CanvasRenderer(canvas, 50, grid.getColumnCount(), grid.getRowCount());
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

// var app = new Vue({
//     el: '#app',
//     data: {
//       message: 'Hello Vue!'
//     }
//   })

const updateGame = ({ grid, player }) => {
    renderer.clear();
    renderer.drawGrid(grid.getGrid())
    renderer.drawPlayer(player);
}

gameManager.onInit(updateGame);
gameManager.onUpdate(updateGame);
// gameManager.onEnd();

gameManager.init();
gameManager.start();





