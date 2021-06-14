import CanvasRenderer from './renderers/canvas-renderer';
import GameManager from './game-management/game-manager';
import AudioManager from './game-management/audio-manager';
import Vue from 'vue';
import Grid from './structures/grid';
import { defaultLevel } from './levels/levels';
import OptionsManager from './game-management/options-manager';
import InputManager, { InputKeys } from './game-management/input-manager';
import Logger from './helpers/logger';
import { NetworkClient } from './transport/network-client';
import { LocalClient } from './transport/local-client';
import { findById } from './helpers/helpers';

let logger = new Logger();
const grid = new Grid(15, 15, defaultLevel.grid);
const canvas = document.getElementById('canvas');
const renderer = new CanvasRenderer(canvas, 100, grid.getColumnCount(), grid.getRowCount());
const audioManager = new AudioManager();
const optionsManager = new OptionsManager();
const inputManager = new InputManager();

const client = new LocalClient(grid, defaultLevel);

const gameManager = new GameManager(client, logger);


let config = optionsManager.get() || {};

inputManager.onKeyUp((key) => {
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
        gameManager.onUpdate(({ grid, players, bombs, blasts, colliders, deltaTime, playerId }) => {
            this.logs = logger.retrieveLogs();
            this.showDebug = config.showGrid;
        });
    }
})

const updateGame = ({ grid, players, bombs, blasts, colliders, deltaTime, playerId }) => {
    inputManager.update();
    renderer.clear();


    const currentPlayer = findById(players, playerId);

    if (currentPlayer) {
        logger.log('player-position', currentPlayer.getPosition());
    }

    if (grid) {
        renderer.drawGrid(grid.getGrid(), config, bombs, blasts, currentPlayer, players);
    }

    if (players && players.length > 0) {
        renderer.drawPlayers(players);
    }

    if (grid && config.showGrid) {
        renderer.drawDebug(grid.getGrid(), 100);
    }

    renderer.draw(deltaTime * 1000);
}

gameManager.onUpdate(updateGame);

gameManager.init();
gameManager.start();





