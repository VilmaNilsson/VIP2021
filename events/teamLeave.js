function teamLeave(context) {
  // Init variables
  const playerId = context.id();
  const gameState = context.getGameState();
  const player = gameState.players[playerId];
  const { team } = gameState.players[playerId];

  // Update player, -1 for no team
  player.team = -1;

  // Update game state
  gameState.players[playerId] = player;
  context.updateGameState(gameState);

  // Broadcast event
  context.broadcastToGame('team:left', { playerId, team });
  context.send('team:yours', { team: -1 });
}

module.exports = {
  'team:leave': teamLeave,
};
