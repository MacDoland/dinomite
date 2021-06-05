import EventDispatcher from '../helpers/event-dispatcher';
import InputManager from '../game-management/input-manager';
import HighScoreManager from '../game-management/highscore-manager';


class UI {
    #inputManager;
    #highScoreManager;
    #eventDispatcher;
    #events;
    #startScreen;
    #gameScreen;
    #highScoreScreen;
    #reviewScreen;
    #promptElement;
    #promptElementText;
    #scoreElement

    constructor(startScreen, gameScreen, highScoreScreen, reviewScreen) {
        this.#inputManager = new InputManager();
        this.#eventDispatcher = new EventDispatcher();
        this.#highScoreManager = new HighScoreManager('highscores');

        this.#events = {
            INIT: "INIT",
            MAINMENU: "MAINMENU",
            STARTGAME: "STARTGAME",
            SUBMITSCORE: "SUBMITSCORE",
            SHOWHIGHSCORES: "SHOWHIGHSCORES"
        };
        Object.freeze(this.#events);

        this.#startScreen = startScreen;
        this.#gameScreen = gameScreen;
        this.#highScoreScreen = highScoreScreen;
        this.#reviewScreen = reviewScreen;

        this.#scoreElement = document.body.querySelectorAll('.score')
        this.#promptElement = document.getElementById('prompt');
        this.#promptElementText = document.getElementById('prompt-text');
        this.#clearPrompt();
        this.#showStartScreen();
    }

    /* Public Methods */
    updateScore(score) {
        for (var i = 0; i < this.#scoreElement.length; i++) {
            this.#scoreElement[i].innerHTML = score;
        }
    }

    goToReview(image, score) {
        this.#showReviewScreen(score);
        this.#reviewScreen.querySelector('img').src = image;
        this.updateScore(score);
    }

    renderHighScores(highScores) {
        const highscoresElement = this.#highScoreScreen.querySelector('#high-scores');
        const highscoresMessage = this.#highScoreScreen.querySelector('#high-scores-message')

        this.#show(highscoresElement);
        this.#hide(highscoresMessage);

        if (highScores.length === 0) {
            this.#show(highscoresMessage);
        }

        let highScoresHtml = [`<li><h3>name</h3><h3>#<span class="apple-icon"></span></h3></li>`];
        for (let i = 0; i < 10; i++) {
            if (i < highScores.length) {
                highScoresHtml.push(`<li><div>${highScores[i].name}</div><div>${highScores[i].value}</div></li>`)
            }
            else {
                highScoresHtml.push(`<li><div></div><div></div></li>`)
            }
        }

        highscoresElement.innerHTML = highScoresHtml.join("");

    }

    /* Events */
    onInitGame(handler) {
        this.#eventDispatcher.registerHandler(this.#events.INIT, handler);
    }

    removeonInitGame(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.INIT, handler);
    }

    onStartGame(handler) {
        this.#eventDispatcher.registerHandler(this.#events.STARTGAME, handler);
    }

    removeOnStartGame(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.STARTGAME, handler);
    }

    onSubmitHighScores(handler) {
        this.#eventDispatcher.registerHandler(this.#events.SUBMITSCORE, handler);
    }

    removeOnSubmitHighScores(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.SUBMITSCORE, handler);
    }

    onShowHighScores(handler) {
        this.#eventDispatcher.registerHandler(this.#events.SHOWHIGHSCORES, handler);
    }

    removeOnShowHighScores(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.SHOWHIGHSCORES, handler);
    }

    onMainMenu(handler) {
        this.#eventDispatcher.registerHandler(this.#events.MAINMENU, handler);
    }

    removeOnMainMenu(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.MAINMENU, handler);
    }


    /* Private Methods */
    #showStartScreen() {
        this.#show(this.#startScreen);
        this.#hide(this.#gameScreen);
        this.#hide(this.#highScoreScreen);
        this.#hide(this.#reviewScreen);

        const highScoresButton = this.#startScreen.querySelector('#high-scores-button');
        const startButton = this.#startScreen.querySelector('#start-button');

        const onStartGameAction = () => {
            startButton.removeEventListener('click', onStartGameAction);
            this.#startGame();
        }

        const onHighScoresAction = () => {
            highScoresButton.removeEventListener('click', onHighScoresAction);
            this.#showHighScoreScreen();
            this.#eventDispatcher.dispatch(this.#events.SHOWHIGHSCORES);
        }

        startButton.addEventListener('click', onStartGameAction);
        highScoresButton.addEventListener('click', onHighScoresAction);
        this.#eventDispatcher.dispatch(this.#events.MAINMENU);
    }

    #startGame() {
        this.#showGameScreen();
        this.#eventDispatcher.dispatch(this.#events.INIT);
        this.#prompt('Press any key to begin');

        const onBeingGameAction = () => {
            this.#inputManager.removeOnAnyKey(onBeingGameAction);
            this.#clearPrompt();
            this.#eventDispatcher.dispatch(this.#events.STARTGAME);
        }

        this.#inputManager.onAnyKey(onBeingGameAction);
    }

    #showGameScreen() {
        this.#hide(this.#startScreen);
        this.#show(this.#gameScreen);
        this.#hide(this.#highScoreScreen);
        this.#hide(this.#reviewScreen);
    }

    #showHighScoreScreen() {
        this.#hide(this.#startScreen);
        this.#hide(this.#gameScreen);
        this.#show(this.#highScoreScreen);
        this.#hide(this.#reviewScreen);

        this.#highScoreManager.getTopTen().then((highscores) => {
            this.renderHighScores(highscores);
        });

        const backToMenuButton = this.#highScoreScreen.querySelector('#back-button');
        const backToMenuAction = () => {
            backToMenuButton.removeEventListener('click', backToMenuAction);
            this.#showStartScreen();
        }
        backToMenuButton.addEventListener('click', backToMenuAction);
    }

    #showReviewScreen(score) {
        this.#hide(this.#startScreen);
        this.#hide(this.#gameScreen);
        this.#hide(this.#highScoreScreen);
        this.#show(this.#reviewScreen);

        const playAgainButton = this.#reviewScreen.querySelector('#play-again-button');
        const backToMenuButton = this.#reviewScreen.querySelector('#menu-button');
        const scoreButton = this.#reviewScreen.querySelector('#submit-button');
        const nameInput = this.#reviewScreen.querySelector('#name');

        const submitScoreAction = (e) => {
            e.preventDefault();

            if (typeof (nameInput.value) === 'string' && nameInput.value.length > 0) {
                scoreButton.removeEventListener('click', submitScoreAction);
                this.#highScoreManager.addHighScore(nameInput.value.replace(/[^0-9a-z ]/gi, ''), score).then(() => {
                    this.#showHighScoreScreen();
                    this.#eventDispatcher.dispatch(this.#events.SHOWHIGHSCORES);
                });
            }
            else {
                alert('Please enter a name');
            }
        }

        const playAgainAction = () => {
            playAgainButton.removeEventListener('click', playAgainAction);
            this.#startGame();
        }

        const backToMenuAction = () => {
            backToMenuButton.removeEventListener('click', backToMenuAction);
            this.#showStartScreen();
        }

        playAgainButton.addEventListener('click', playAgainAction);
        backToMenuButton.addEventListener('click', backToMenuAction);
        scoreButton.addEventListener('click', submitScoreAction);
    }

    #show(element) {
        element.classList.remove('hidden');
    }

    #hide(element) {
        element.classList.add('hidden');
    }

    #prompt(text) {
        this.#show(this.#promptElement);
        this.#promptElementText.innerHTML = text;
    }

    #clearPrompt() {
        this.#promptElementText.innerHTML = '';
        this.#hide(this.#promptElement);
    }
}

export default UI;