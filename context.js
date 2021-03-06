const utils = require('./utils');

// The global state
const STATE = { players: {}, games: {} };
// Global timers
const TIMERS = {};

// Returns the whole state (used for debugging purposes)
function getState() {
  return STATE;
}

// Clears the whole state (used for debugging purposes)
function clearState() {
  STATE.players = {};
  STATE.games = {};
  return STATE;
}

// Returns the state of a player by `id`
function getPlayerState(id) {
  if (STATE.players[id] === undefined) {
    return null;
  }

  return STATE.players[id];
}

// Returns the state of a player by equal `properties`
function getPlayerStateByProps(properties) {
  const players = Object.values(STATE.players);
  return utils.findObjectByProperties(players, properties);
}

// Updates the state of a player by `id`
function updatePlayerState(id, nextPlayerState) {
  if (STATE.players[id] === undefined) {
    return STATE.players[id];
  }

  const currentPlayerState = STATE.players[id];

  STATE.players[id] = {
    ...currentPlayerState,
    ...nextPlayerState,
  };

  return STATE.players[id];
}

// Returns the state of a game by `id`
function getGameState(id) {
  if (STATE.games[id] === undefined) {
    return null;
  }

  return STATE.games[id];
}

// Returns the state of a game by equal `properties`
function getGameStateByProps(properties) {
  const games = Object.values(STATE.games);
  return utils.findObjectByProperties(games, properties);
}

// Helper function for getting game state by player id
function getGameStateByPlayer(id) {
  if (STATE.players[id] === undefined) {
    return null;
  }

  const { gameId } = STATE.players[id];

  if (STATE.games[gameId] === undefined) {
    return null;
  }

  return STATE.games[gameId];
}

// Updates the state of a game by `id`
function updateGameState(id, nextGameState) {
  if (STATE.games[id] === undefined) {
    return null;
  }

  const currentGameState = STATE.games[id];

  STATE.games[id] = {
    ...currentGameState,
    ...nextGameState,
  };

  return STATE.games[id];
}

// Adds another player to the global state
function addPlayer(id, state = {}) {
  if (STATE.players[id] !== undefined) {
    return false;
  }

  STATE.players[id] = { id, ...state };
  return true;
}

// Removes a player from the global state
function removePlayer(id) {
  if (STATE.players[id] === undefined) {
    return false;
  }

  delete STATE.players[id];
  return true;
}

// Adds another game to the global state
function addGame(id, state = {}) {
  if (STATE.games[id] !== undefined) {
    return false;
  }

  STATE.games[id] = { id, ...state };
  return true;
}

// Removes a game from the global state
function removeGame(id) {
  if (STATE.games[id] === undefined) {
    return false;
  }

  delete STATE.games[id];
  return true;
}

// Create a `timeout` and store it by a UUID
function wrappedSetTimeout(cb, ms) {
  const id = utils.generateUUID();
  TIMERS[id] = setTimeout(cb, ms);
  return id;
}

// Clear and delete a timeout by id
function wrappedClearTimeout(id) {
  clearTimeout(TIMERS[id]);
  delete TIMERS[id];
}

// Used for debugging purposes
function getTimeouts() {
  return TIMERS;
}

// Creates a context based on the connected websocket id
function create(wss, ws) {
  return {
    // Returns the current client ID
    id: () => {
      return ws._id;
    },
    // Send a message to the connected client
    send: (event, payload = {}) => {
      utils.send(ws, { event, payload });
    },
    // Send a message to a client by `id`
    sendTo: (id, event, payload = {}) => {
      utils.sendTo(wss, id, { event, payload });
    },
    // Broadcast a message to all clients
    broadcast: (event, payload = {}, exclude = false) => {
      utils.broadcast(wss, ws, { event, payload }, exclude);
    },
    // Broadcast a message to all clients with `ids`
    broadcastTo: (ids, event, payload = {}) => {
      utils.broadcastTo(wss, ids, { event, payload });
    },
    // Broadcast a message to all players within a game
    broadcastToGame: (event, payload = {}, gameId = null) => {
      if (gameId === null) {
        const player = getPlayerState(ws._id);
        // If no game ID was given we'll extract it from the current player
        gameId = player.gameId;
      }

      const game = getGameState(gameId);

      if (game !== null) {
        // Make an array of player IDs
        const playerIds = Object.keys(game.players);
        // Then broadcast the message to all those IDs
        utils.broadcastTo(wss, playerIds, { event, payload });
      }
    },
    // Add a new player to the server state
    addPlayer: (id, state = {}) => {
      return addPlayer(id, { username: id, ...state });
    },
    // Remove a player from the server state
    removePlayer: (id) => {
      return removePlayer(id);
    },
    // Connect to an existing player in the state
    connectToPlayer: (id) => {
      const player = getPlayerState(id);

      if (!player) {
        return false;
      }

      // Remove the old player
      removePlayer(ws._id);
      // And connect this websocket to the existing player
      ws._id = id;

      return true;
    },
    // Get the state of a player by: the current connected client, a `playerId`
    // or by an object of properties
    getPlayerState: (playerId = null) => {
      if (playerId === null) {
        return getPlayerState(ws._id);
      }

      if (typeof playerId === 'object') {
        return getPlayerStateByProps(playerId);
      }

      return getPlayerState(playerId);
    },
    // Update the player state by: the current connected client or by `playerId`
    updatePlayerState: (nextPlayerState, playerId = null) => {
      if (playerId === null) {
        return updatePlayerState(ws._id, nextPlayerState);
      }

      return updatePlayerState(playerId, nextPlayerState);
    },
    // Adds a game to the server state
    addGame: (id, state = {}) => {
      return addGame(id, state);
    },
    // Remove a game from the server state
    removeGame: (id) => {
      return removeGame(id);
    },
    // Gets the state of a game by: the current connected client, a `gameId` or
    // by an object of properties
    getGameState: (gameId = null) => {
      if (gameId === null) {
        return getGameStateByPlayer(ws._id);
      }

      if (typeof gameId === 'object') {
        return getGameStateByProps(gameId);
      }

      return getGameState(gameId);
    },
    // Updates the game state by: the current connected client or by `gameId`
    updateGameState: (nextGameState, gameId = null) => {
      if (gameId === null) {
        const player = getPlayerState(ws._id);

        if (player !== null) {
          return updateGameState(player.gameId, nextGameState);
        }

        return null;
      }

      return updateGameState(gameId, nextGameState);
    },
    // Returns the whole state (used for debugging purposes)
    getState: () => {
      return getState();
    },
    // Clears the whole state (used for debugging purposes)
    clearState: () => {
      return clearState();
    },
    // Create a timeout and couple it with the current game
    setTimeout: (cb, ms, gameId = null) => {
      const game = gameId === null
        ? getGameStateByPlayer(ws._id)
        : getGameState(gameId);

      if (game === null) {
        return null;
      }

      const id = wrappedSetTimeout(cb, ms);
      game.timeouts = [...game.timeouts, id];

      updateGameState(game.id, { timeouts: game.timeouts });

      return id;
    },
    // Clear a timeout by id
    clearTimeout: (id) => {
      return wrappedClearTimeout(id);
    },
    // Clear all timeouts within a game
    clearTimeouts: (gameId = null) => {
      const game = gameId === null
        ? getGameStateByPlayer(ws._id)
        : getGameState(gameId);

      if (game === null) {
        return null;
      }

      game.timeouts.forEach((id) => wrappedClearTimeout(id));
      game.timeouts = [];

      return updateGameState(game.id, game);
    },
  };
}

module.exports = {
  getState,
  getTimeouts,
  clearState,
  addPlayer,
  removePlayer,
  addGame,
  removeGame,
  create,
};
