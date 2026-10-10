require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { auth, signToken } = require('./auth');
const {
  getMovies, findUser, saveUser, deleteUserByUsername, getUsers,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    name: 'myFlix API',
    movies: getMovies().length,
    status: 'ok',
  });
});

app.post('/users', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body || {};
    if (!Username || !Password || !Email) {
      return res.status(400).json({ message: 'Username, Password, and Email are required' });
    }
    if (findUser(Username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const user = {
      _id: uuid().replace(/-/g, '').slice(0, 24),
      Username,
      Password: await bcrypt.hash(Password, 10),
      Email,
      Birthday: Birthday || null,
      FavouriteMovies: [],
    };
    saveUser(user);
    const { Password: _, ...safe } = user;
    return res.status(201).json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { Username, Password } = req.body || {};
    const user = findUser(Username);
    if (!user || !(await bcrypt.compare(Password || '', user.Password))) {
      return res.status(400).json({ message: 'Incorrect username or password' });
    }
    const { Password: _, ...safe } = user;
    return res.json({ user: safe, token: signToken(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/movies', auth, (_req, res) => {
  res.json(getMovies());
});

app.get('/movies/:Title', auth, (req, res) => {
  const movie = getMovies().find((m) => m.Title === req.params.Title);
  if (!movie) return res.status(404).json({ message: 'Movie not found' });
  res.json(movie);
});

app.get('/directors/:Name', auth, (req, res) => {
  const movie = getMovies().find((m) => m.Director.Name === req.params.Name);
  if (!movie) return res.status(404).json({ message: 'Director not found' });
  res.json(movie.Director);
});

app.get('/genres/:Name', auth, (req, res) => {
  const movie = getMovies().find((m) => m.Genre.Name === req.params.Name);
  if (!movie) return res.status(404).json({ message: 'Genre not found' });
  res.json(movie.Genre);
});

app.get('/users/:Username', auth, (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = findUser(req.params.Username);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { Password: _, ...safe } = user;
  res.json(safe);
});

app.put('/users/:Username', auth, async (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = findUser(req.params.Username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { Username, Password, Email, Birthday } = req.body || {};
  if (Username && Username !== user.Username) {
    if (findUser(Username)) return res.status(400).json({ message: 'Username already exists' });
    user.Username = Username;
  }
  if (Email) user.Email = Email;
  if (Birthday !== undefined) user.Birthday = Birthday;
  if (Password) user.Password = await bcrypt.hash(Password, 10);

  saveUser(user);
  const { Password: _, ...safe } = user;
  // The JWT carries the username, so a rename needs a new token.
  res.json({ ...safe, token: signToken(user) });
});

app.post('/users/:Username/movies/:MovieID', auth, (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = findUser(req.params.Username);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.FavouriteMovies.includes(req.params.MovieID)) {
    user.FavouriteMovies.push(req.params.MovieID);
    saveUser(user);
  }
  const { Password: _, ...safe } = user;
  res.json(safe);
});

app.delete('/users/:Username/movies/:MovieID', auth, (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = findUser(req.params.Username);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.FavouriteMovies = user.FavouriteMovies.filter((id) => id !== req.params.MovieID);
  saveUser(user);
  const { Password: _, ...safe } = user;
  res.json(safe);
});

app.delete('/users/:Username', auth, (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  deleteUserByUsername(req.params.Username);
  res.json({ message: 'User deleted' });
});

// Auto-seed on boot if catalog empty (useful on Render)
try {
  if (getMovies().length === 0) {
    require('./seed');
  }
} catch (e) {
  console.warn('Seed check failed', e.message);
}

app.listen(PORT, () => {
  console.log(`myFlix API on :${PORT} with ${getMovies().length} movies (${getUsers().length} users)`);
});
