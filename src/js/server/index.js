const { GameEvents } = require("../events/events");
const { default: GameAuthority } = require("../game-management/game-authority");
const { default: Timer } = require("../helpers/timer");
const { defaultLevel } = require("../levels/levels");
const { default: Grid } = require("../structures/grid");

const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const grid = new Grid(15, 15, defaultLevel.grid);
const gameAuthority = new GameAuthority(grid, defaultLevel);
const tickRate = 1000 / 60;

let timer = new Timer(true);

timer.start(tickRate);

const loop = () => {
  setTimeout(loop, 0);
}

timer.onElapsed(() => {
  io.emit(GameEvents.UPDATE, gameAuthority.getUpdate());
});

setTimeout(loop, 0);

io.on("connection", socket => {
  socket.on(GameEvents.NEW_PLAYER, (data) => {
    console.log('recieved new player request');
    const player = gameAuthority.addPlayer(data.id);

    const message = {
      id: player.getId(),
      position: player.getPosition().raw(),
      direction: player.getDirection(),
      state: player.getState()
    }

    socket.emit(GameEvents.NEW_PLAYER, message);
  });

  socket.on(GameEvents.PLAYER_INPUT, ({ id, input }) => {
    const result = gameAuthority.processPlayerInput(id, input);
    // if (result && result.position.magnitude() > 0) {

    //   const message = {
    //     id: result.id,
    //     position: result.position,
    //     state: result.state,
    //     direction: result.direction
    //   };

    //  // socket.emit(GameEvents.PLAYER_SET_POSITION, message);
    // }
  });
});

httpServer.listen(3000, '', () => {
  console.log('listening on port 3000');
});