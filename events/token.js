// Gets the relevant player object key based on the payload
function getPlayerPocketKey(from, to) {
  if (typeof from === 'string') {
    return from === 'pocket' ? 'pocket' : 'temporaryPocket';
  }
  return to === 'pocket' ? 'pocket' : 'temporaryPocket';
}

function tokenSwap(context, payload) {
  const game = context.getGameState();

  // Not within a game
  if (game === null) {
    context.send('token:swap:fail', { errorCode: 0 });
    return;
  }

  // Game is not active
  if (game.properties.phase.type !== 2) {
    context.send('token:swap:fail', { errorCode: 1 });
    return;
  }

  const playerId = context.id();
  const player = game.players[playerId];

  // Not within a team
  if (player.team === -1) {
    context.send('token:swap:fail', { errorCode: 2 });
    return;
  }

  // from:  {String|Number} 'pocket|temporary-pocket' or 0 (slot index)
  // to:    {String|Number} 'pocket|temporary-pocket' or 0 (slot index)
  //
  // If the destination (pocket to slot) has a token, we'll replace them
  const { to, from } = payload;

  // Not enough payload
  if (to === undefined || from === undefined) {
    context.send('token:swap:fail', { errorCode: 3 });
    return;
  }

  // Invalid payload
  if (typeof to !== 'number' && typeof to !== 'string'
    && typeof from !== 'number' && typeof from !== 'string') {
    context.send('token:swap:fail', { errorCode: 3.1 });
    return;
  }

  // The swap has to be from two separate places
  if (to === from) {
    context.send('token:swap:fail', { errorCode: 4 });
    return;
  }

  // Not within a station
  if ((typeof to === 'number' || typeof from === 'number')
    && player.properties.inStation === null) {
    context.send('token:swap:fail', { errorCode: 5 });
    return;
  }

  // Check if they're using the temporary pocket, if its locked it will fail
  if ((from === 'temporary-pocket' || to === 'temporary-pocket')
    && player.properties.temporaryPocketLocked === true) {
    context.send('token:swap:fail', { errorCode: 6 });
    return;
  }

  // Between pockets
  // ===============
  if (typeof from === 'string' && typeof to === 'string') {
    // Swap the two
    const prevPocket = player.properties.pocket;
    const prevTemporaryPocket = player.properties.temporaryPocket;
    player.properties.pocket = prevTemporaryPocket;
    player.properties.temporaryPocket = prevPocket;

    // Update the game (ie. the player)
    game.players[playerId] = player;
    context.updateGameState(game);

    const { pocket, temporaryPocket } = player.properties;
    context.send('player:pockets', { pocket, temporaryPocket });
    return;
  }

  // Between slots
  // =================
  if (typeof from === 'number' && typeof to === 'number') {
    const teamIndex = player.team;
    const stationIndex = player.properties.inStation.station;
    const fromSlotIndex = from;
    const toSlotIndex = to;
    const station = game.stations[stationIndex];

    // Store the current slot values
    const prevFromSlot = station.racks[teamIndex].slots[fromSlotIndex];
    const prevToSlot = station.racks[teamIndex].slots[toSlotIndex];

    station.racks[teamIndex].slots[fromSlotIndex] = prevToSlot;
    station.racks[teamIndex].slots[toSlotIndex] = prevFromSlot;
    // Update the game state
    game.stations[stationIndex] = station;
    context.updateGameState(game);

    // Broadcast the updated rack
    // TODO: only broadcast to the people within a station?
    context.broadcastToGame('station:rack', {
      station: stationIndex,
      team: teamIndex,
      rack: station.racks[teamIndex],
    });
    // TODO: update salary count
    return;
  }

  // From pockets to slot (or vice versa)
  // ====================================
  const teamIndex = player.team;
  const stationIndex = player.properties.inStation.station;
  const slotIndex = typeof from === 'number' ? from : to;
  const station = game.stations[stationIndex];

  const playerPocket = getPlayerPocketKey(from, to);

  // Store the current pocket/slot values
  const prevSlot = station.racks[teamIndex].slots[slotIndex];
  const prevPocket = player.properties[playerPocket];

  // Move the new token to the slot
  const nextSlot = { token: prevPocket };
  station.racks[teamIndex].slots[slotIndex] = nextSlot;

  // Update the player pocket or temporary pocket
  player.properties[playerPocket] = prevSlot.token;

  // Update the game state
  game.stations[stationIndex] = station;
  game.players[playerId] = player;
  context.updateGameState(game);

  // Broadcast the updated rack
  // TODO: only broadcast to the people within a station?
  context.broadcastToGame('station:rack', {
    station: stationIndex,
    team: teamIndex,
    rack: station.racks[teamIndex],
  });

  // Send the players updated pocket
  const { pocket, temporaryPocket } = player.properties;
  context.send('player:pockets', { pocket, temporaryPocket });
  // TODO: update salary count
}

module.exports = {
  'token:swap': tokenSwap,
};