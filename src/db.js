const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const MOVIES_PATH = path.join(DATA_DIR, 'movies.db.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, '[]');
}
function read(p) { ensure(); return JSON.parse(fs.readFileSync(p, 'utf8')); }
function write(p, d) { ensure(); fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

module.exports = {
  getMovies: () => (fs.existsSync(MOVIES_PATH) ? read(MOVIES_PATH) : []),
  setMovies: (m) => write(MOVIES_PATH, m),
  getUsers: () => read(USERS_PATH),
  findUser: (username) => read(USERS_PATH).find((u) => u.Username === username) || null,
  saveUser: (user) => {
    const users = read(USERS_PATH);
    const i = users.findIndex((u) => u._id === user._id);
    if (i >= 0) users[i] = user; else users.push(user);
    write(USERS_PATH, users);
    return user;
  },
  deleteUserByUsername: (username) => {
    write(USERS_PATH, read(USERS_PATH).filter((u) => u.Username !== username));
  },
  MOVIES_PATH,
};
