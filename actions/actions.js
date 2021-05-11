const actions = [
  {
    event: 'action:station:lock',
    name: 'Lock Station',
    desc: 'Lock a station for 30 seconds',
    target: 'stations',
    cooldown: 60,
  },
  {
    event: 'action:station:unlock',
    name: 'Unlock Station',
    desc: 'Unlocks a locked station.',
    target: 'stations',
    cooldown: 60,
  },
  {
    event: 'action:player:secret-cargo',
    name: 'Secret Cargo',
    desc: 'Unocks the secret cargo for 2 minutes',
    target: 'player',
    cooldown: 4 * 60,
  },
  {
    event: 'action:teams:slowed',
    name: 'Increase login time - Team',
    desc: 'Increase the login time for an entire team for 1 minute',
    target: 'teams',
    cooldown: 3 * 60,
  },
  {
    event: 'action:station:slowed',
    name: 'Increase login time - Station',
    desc: 'Increase the login time on a station for all teams for 1 minute',
    target: 'stations',
    cooldown: 2 * 60,
  },
  {
    event: 'action:teams:swap-rack',
    name: 'Swap Racks',
    desc: `Swap your team's rack of bins with team's rack.`,
    target: 'teams',
    cooldown: 3 * 60,
  },
  {
    event: 'action:station:double-points',
    name: 'Double Points Station',
    desc: 'Doubles the amount of points handed out by a given Station. It only works for the next points.',
    target: 'stations',
    cooldown: 2 * 60,
  },
  {
    event: 'action:station:half-points',
    name: 'Half Points Station',
    desc: 'Halves the amount of points handed out by a given Station. It only works for the next points.',
    target: 'stations',
    cooldown: 2 * 60,
  },
  {
    event: 'action:stations:double-points',
    name: 'Double All Points',
    desc: 'Doubles the amount of points handed out by all Stations. It only works for the next points.',
    target: 'stations',
    cooldown: 2 * 60,
  },
  {
    event: 'action:stations:half-points',
    name: 'Half All Points',
    desc: 'Halves the amount of points handed out by all Stations. It only works for the next points.',
    target: 'stations',
    cooldown: 2 * 60,
  },
];

module.exports = actions;
