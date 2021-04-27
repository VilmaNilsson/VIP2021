import Router from '../router';

function MainView() {
  const el = document.createElement('div');

  el.innerHTML = `
    <h1>Main menu</h1>
    <button id="create">Create</button>
    <button id="join">Join</button>
  `;

  el.click('#create', () => el.navigate('/create'));
  el.click('#join', () => el.navigate('/join'));

  return el;
}

export default {
  before: (context) => {
    const uid = context.getCache('_uid');

    // Check if a username is cached, if not -> login
    if (!uid) {
      return Router.redirect('/login');
    }

    return true;
  },
  path: '/',
  view: MainView,
};
