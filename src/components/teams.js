import utils from '../utils';
import Rocket from './rocket';

function Teams(el, context) {
  const { game, player } = context.getState();

  if (!game) {
    return el;
  }

  // RENDER ALL TEAMS
  // ================

  const teams = game.teams.map((team, i) => {
    const div = document.createElement('div');
    div.className = `team team-${i + 1}`;

    const score = utils.pad(team.score, 3);

    div.innerHTML = `
      ${Rocket}
      <div class="score">${score}</div>
    `;

    const scoreEl = div.querySelector('.score');

    // When a player selects a station for a action
    let selectable = false;
    // Simple on-off toggle, should probably just be classes
    function setSelectable(s) {
      selectable = s;

      if (s) {
        div.classList.add('selectable');
      } else {
        div.classList.remove('selectable');
      }
    }

    div.click(() => {
      const { action } = context.getState();

      if (action && selectable) {
        setSelectable(false);
        div.send('player:action', { ...action, team: i });
      }
    });

    // When the station is selectable for actions (all station-actions)
    div.subscribe('player:action:team', () => {
      // Don't make your own team selectable
      if (player.team !== i) {
        setSelectable(true)
      }
    });

    // Otherwise remove the selection
    div.subscribe('player:action:cooldown', () => setSelectable(false));
    div.subscribe('player:action:cancel', () => setSelectable(false));
    div.subscribe('player:action:fail', () => setSelectable(false));

    el.append(div);
    return div;
  });

  // Score updates
  el.subscribe('game:score', (e) => {
    const { score } = e.detail;
    
    teams.forEach((teamEl, i) => {
      const newScore = score[i];
      const scoreEl = teamEl.querySelector('.score');
      scoreEl.textContent = utils.pad(newScore, 3);
    });
  });

  // ACTION LISTENERS
  // ================

  el.subscribe('action:teams:locked', (e) => {
    const payload = e.detail;

    // If the lock action wasn't for this station, do nothing
    if (payload.teamId !== i) {
      return;
    }

    const { start, duration } = payload;

    div.classList.add('locked');

    context.setInterval({
      start,
      duration,
      onTick: (time) => {

      },
      onEnd: () => {
        div.classList.remove('locked');
      },
    });

  });

  el.subscribe('action:teams:unlocked', (e) => {
    const payload = e.detail;

    // If the lock action wasn't for this station, do nothing
    if (payload.teamId !== i) {
      return;
    }

    div.classList.remove('locked');
  });

  el.subscribe('action:team:shake', (e) => {
    const payload = e.detail;

    const game = context.getState()
    const playerTeam = game.player.team;

    if (playerTeam !== payload.team) {
      return;
    }

    document.body.classList.add('meteor-shower');
  })

  el.subscribe('action:team:shake:fade', (e) => {
    const payload = e.detail;

    const game = context.getState()
    const playerTeam = game.player.team;

    if (playerTeam !== payload.team) {
      return;
    }

    document.body.classList.remove('meteor-shower');
  })

  return el;
}

export default Teams;
