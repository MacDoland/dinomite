const { GameEvents } = require("../events/events");
const { default: GameAuthority } = require("../game-management/game-authority");
const { default: Timer } = require("../helpers/timer");
const { defaultLevel } = require("../levels/levels");
const { default: Grid } = require("../structures/grid");
const isEqual = require('fast-deep-equal');
const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const grid = new Grid(15, 15, defaultLevel.grid);
const gameAuthority = new GameAuthority(grid, defaultLevel);
const tickRate = 1000 / 60;
let previousUpdate = null;


/*
   players: Object.keys(this.players).filter(key => this.players[key]).map((key) => {
                const player = this.players[key];
                return {
                    id: player.getId(),
                    position: player.getPosition().raw(),
                    state: player.getState(),
                    direction: player.getDirection(),
                }
            }),
            tiles: this.#grid.flushHistory(),
            bombs: this.#bombShop.getActiveBombs().map(bomb => {
                return {
                    id: bomb.getIndex(),
                    progress: bomb.getProgress(),
                    state: bomb.getState()
                };
            }),
            blasts: this.#bombShop.getActiveBlasts().map(blast => {
                return {
                    id: blast.getIndex(),
                    progress: blast.getProgress()
                };
            })
*/

let timer = new Timer(true);

timer.start(tickRate);

timer.onElapsed(() => {
  const update = gameAuthority.getUpdate();

  if (!isEqual(update, previousUpdate)) {
    io.emit(GameEvents.UPDATE, update);
  }

  previousUpdate = update;
});


io.on("connection", socket => {

  socket.emit(GameEvents.CONNECTED, gameAuthority.getFullGameState());

  socket.on(GameEvents.NEW_PLAYER, (data) => {
    console.log('recieved new player request');
    const player = gameAuthority.addPlayer(socket.id);

    const message = {
      id: player.getId(),
      position: player.getPosition().raw(),
      direction: player.getDirection(),
      state: player.getState()
    }

    io.emit(GameEvents.NEW_PLAYER, message);
  });

  socket.on("disconnect", (reason) => {
    gameAuthority.removePlayer(socket.id);
    io.emit(GameEvents.PLAYER_LEFT, {
      id: socket.id
    });
  });

  socket.on(GameEvents.PLAYER_INPUT, ({ id, input }) => {

    gameAuthority.addPlayerInputUpdate(socket.id, input);
  });
});

httpServer.listen(3000, '', () => {
  console.log('listening on port 3000');
});