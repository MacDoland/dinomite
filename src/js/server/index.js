const { GameEvents } = require("../events/events");
const { default: GameAuthority } = require("../game-management/game-authority");
const { default: Timer } = require("../helpers/timer");
const { defaultLevel } = require("../levels/levels");
const { default: Grid } = require("../structures/grid");

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

let timer = new Timer(true);

timer.start(tickRate);

timer.onElapsed(() => {
  const update = gameAuthority.getUpdate();
  io.emit(GameEvents.UPDATE, update);
});


io.on("connection", socket => {

  socket.emit(GameEvents.CONNECTED,  gameAuthority.getFullGameState());

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