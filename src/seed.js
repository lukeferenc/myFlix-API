const crypto = require('crypto');
const { setMovies, getMovies } = require('./db');

// Stable ids so a reseed doesn't orphan users' saved favourites.
const idFor = (title) => crypto.createHash('md5').update(title).digest('hex').slice(0, 24);

const poster = (idOrUrl) =>
  idOrUrl.startsWith('http') ? idOrUrl : `https://image.tmdb.org/t/p/w500/${idOrUrl}.jpg`;

const raw = [
  ["The Shawshank Redemption", "Two imprisoned men bond over years, finding solace and eventual redemption.", "Drama", "Character-driven emotional stories.", "Frank Darabont", "American filmmaker known for King adaptations.", "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", true],
  ["The Godfather", "An aging crime patriarch transfers control to his reluctant son.", "Crime", "Stories of crime and moral ambiguity.", "Francis Ford Coppola", "Director of The Godfather trilogy.", "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg", true],
  ["The Dark Knight", "Batman faces the Joker as Gotham descends into chaos.", "Action", "High-energy conflict and spectacle.", "Christopher Nolan", "Director of cerebral blockbusters.", "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", true],
  ["Pulp Fiction", "Interwoven tales of hitmen, a boxer, and redemption.", "Crime", "Stories of crime and moral ambiguity.", "Quentin Tarantino", "Known for sharp dialogue and nonlinear crime.", "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", true],
  ["Inception", "A thief enters dreams to plant an idea and earn redemption.", "Sci-Fi", "Speculative tech and imagined futures.", "Christopher Nolan", "Director of cerebral blockbusters.", "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", true],
  ["Fight Club", "An office worker and a soap maker form an underground fight club.", "Drama", "Character-driven emotional stories.", "David Fincher", "Director of dark precise thrillers.", "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", false],
  ["Forrest Gump", "American history through the eyes of a kind Alabama man.", "Drama", "Character-driven emotional stories.", "Robert Zemeckis", "Inventive mainstream storytelling.", "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg", false],
  ["The Matrix", "A hacker learns reality is a simulation and joins the fight.", "Sci-Fi", "Speculative tech and imagined futures.", "Lana Wachowski", "Co-creator of The Matrix.", "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", true],
  ["Goodfellas", "Henry Hill rises and falls inside the mob.", "Crime", "Stories of crime and moral ambiguity.", "Martin Scorsese", "Central figure in modern crime cinema.", "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", false],
  ["Interstellar", "Explorers travel through a wormhole to save humanity.", "Sci-Fi", "Speculative tech and imagined futures.", "Christopher Nolan", "Director of cerebral blockbusters.", "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX500.jpg", true],
  ["Parasite", "Class conflict threatens a poor family and a rich one.", "Thriller", "Suspense-driven uneasy stories.", "Bong Joon-ho", "Socially sharp genre hybrids.", "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png", true],
  ["Spirited Away", "A girl enters a spirit world where humans become beasts.", "Animation", "Drawn and animated storytelling.", "Hayao Miyazaki", "Studio Ghibli co-founder.", "https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg", true],
  ["The Fellowship of the Ring", "A hobbit sets out to destroy a powerful ring.", "Fantasy", "Imagined worlds and epic stakes.", "Peter Jackson", "Brought Middle-earth to screen.", "https://m.media-amazon.com/images/M/MV5BNmYyNGE1MTctMWIzNy00MTVjLWI2ODAtNGZhOGI3ZDQzZTE1XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg", true],
  ["Gladiator", "A general seeks vengeance against a corrupt emperor.", "Action", "High-energy conflict and spectacle.", "Ridley Scott", "Epic historical and sci-fi films.", "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg", false],
  ["Whiplash", "A young drummer faces a ruthless instructor.", "Drama", "Character-driven emotional stories.", "Damien Chazelle", "Music-centered precise dramas.", "https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX500.jpg", false],
  ["The Prestige", "Rival magicians escalate into obsession.", "Thriller", "Suspense-driven uneasy stories.", "Christopher Nolan", "Director of cerebral blockbusters.", "https://m.media-amazon.com/images/M/MV5BM2Y0YmM5MWYtZTYzNi00ZjU5LTlmOGYtZDQ4ODQyMjAzNjQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg", false],
  ["Alien", "A crew meets a deadly lifeform in deep space.", "Horror", "Fear dread and the uncanny.", "Ridley Scott", "Epic historical and sci-fi films.", "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", false],
  ["Blade Runner 2049", "A blade runner uncovers a society-shaking secret.", "Sci-Fi", "Speculative tech and imagined futures.", "Denis Villeneuve", "Atmospheric large-scale sci-fi.", "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_QL75_UX380_CR0,0,380,562_.jpg", true],
  ["Mad Max: Fury Road", "Max and Furiosa flee a tyrant across the wasteland.", "Action", "High-energy conflict and spectacle.", "George Miller", "Creator of Mad Max.", "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", true],
  ["Get Out", "A weekend visit becomes a racial nightmare.", "Horror", "Fear dread and the uncanny.", "Jordan Peele", "Socially sharp horror.", "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg", false],
  ["La La Land", "A pianist and actress chase love and careers in LA.", "Romance", "Relationships and emotional connection.", "Damien Chazelle", "Music-centered precise dramas.", "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", false],
  ["The Grand Budapest Hotel", "A lobby boy and concierge in a comic adventure.", "Comedy", "Humor wit and comic situations.", "Wes Anderson", "Stylized meticulous comedies.", "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", false],
  ["Joker", "A troubled comedian spirals into villainy.", "Drama", "Character-driven emotional stories.", "Todd Phillips", "Comedy and Joker origin.", "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", false],
  ["Arrival", "A linguist tries to communicate with alien visitors.", "Sci-Fi", "Speculative tech and imagined futures.", "Denis Villeneuve", "Atmospheric large-scale sci-fi.", "https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX500.jpg", false],
  ["The Social Network", "The founding of Facebook and its fallout.", "Drama", "Character-driven emotional stories.", "David Fincher", "Director of dark precise thrillers.", "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg", false],
  ["No Country for Old Men", "A hunter finds drug money and a relentless killer.", "Thriller", "Suspense-driven uneasy stories.", "Joel Coen", "Dark crime with Ethan Coen.", "https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_QL75_UY562_CR1,0,380,562_.jpg", false],
  ["Moonlight", "A young man comes of age and grapples with identity.", "Drama", "Character-driven emotional stories.", "Barry Jenkins", "Intimate lyrical dramas.", "https://m.media-amazon.com/images/M/MV5BNzQxNTIyODAxMV5BMl5BanBnXkFtZTgwNzQyMDA3OTE@._V1_QL75_UX380_CR0,0,380,562_.jpg", false],
  ["Everything Everywhere All at Once", "A woman must save the multiverse.", "Comedy", "Humor wit and comic situations.", "Daniel Kwan", "Co-director of EEAAO.", "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", true],
  ["Dune", "Paul Atreides arrives on the desert planet Arrakis.", "Sci-Fi", "Speculative tech and imagined futures.", "Denis Villeneuve", "Atmospheric large-scale sci-fi.", "https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX500.jpg", true],
  ["The Silence of the Lambs", "An FBI trainee consults Hannibal Lecter.", "Thriller", "Suspense-driven uneasy stories.", "Jonathan Demme", "Landmark thriller director.", "https://m.media-amazon.com/images/M/MV5BNDdhOGJhYzctYzYwZC00YmI2LWI0MjctYjg4ODdlMDExYjBlXkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg", false],
  ["Se7en", "Detectives hunt a killer using the seven deadly sins.", "Thriller", "Suspense-driven uneasy stories.", "David Fincher", "Director of dark precise thrillers.", "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", false],
  ["Am\u00e9lie", "A Parisian woman secretly improves lives around her.", "Romance", "Relationships and emotional connection.", "Jean-Pierre Jeunet", "Whimsical visual storytelling.", "https://m.media-amazon.com/images/M/MV5BOTNmYzY0MWQtZGZmNy00Y2Y4LWFmMDQtMTZjYTdiYzEwZGQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg", false],
  ["Princess Mononoke", "A prince is caught between forest gods and humans.", "Animation", "Drawn and animated storytelling.", "Hayao Miyazaki", "Studio Ghibli co-founder.", "https://upload.wikimedia.org/wikipedia/en/8/8c/Princess_Mononoke_Japanese_poster.png", false],
  ["The Departed", "A cop and a mole hunt each other in Boston.", "Crime", "Stories of crime and moral ambiguity.", "Martin Scorsese", "Central figure in modern crime cinema.", "https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_QL75_UY562_CR0,0,380,562_.jpg", false],
  ["Heat", "Cops and professional thieves collide in LA.", "Crime", "Stories of crime and moral ambiguity.", "Michael Mann", "Stylish meticulous crime films.", "https://m.media-amazon.com/images/M/MV5BMTkxYjU1OTMtYWViZC00ZjAzLWI3MDktZGQ2N2VmMjVjNDRlXkEyXkFqcGc@._V1_QL75_UY562_CR6,0,380,562_.jpg", false],
  ["There Will Be Blood", "An oil prospector descends into obsession.", "Drama", "Character-driven emotional stories.", "Paul Thomas Anderson", "Ambitious character dramas.", "https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg", false],
  ["Portrait of a Lady on Fire", "A painter and her subject fall in love.", "Romance", "Relationships and emotional connection.", "C\u00e9line Sciamma", "Intimate visually exact dramas.", "https://upload.wikimedia.org/wikipedia/en/c/cb/Portrait_of_a_Lady_on_Fire.jpg", false],
  ["Pan's Labyrinth", "A girl escapes fascist Spain into a fairy-tale underworld.", "Fantasy", "Imagined worlds and epic stakes.", "Guillermo del Toro", "Fairy tale horror allegory.", "https://m.media-amazon.com/images/M/MV5BOTc1NTAxMWItMWFlNy00MmU2LTkwMTMtNzMwOTg5OTQ5YTFiXkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg", false],
  ["Django Unchained", "A freed slave teams with a bounty hunter.", "Western", "Frontier conflict and myth.", "Quentin Tarantino", "Sharp dialogue and genre remixes.", "https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_QL75_UX380_CR0,0,380,562_.jpg", true],
  ["The Wolf of Wall Street", "A stockbroker rises and crashes on excess.", "Drama", "Character-driven emotional stories.", "Martin Scorsese", "Central figure in modern crime cinema.", "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_SX500.jpg", false],
];

const movies = raw.map(([Title, Description, gName, gDesc, dName, dBio, img, Featured]) => ({
  _id: idFor(Title),
  Title,
  Description,
  Genre: { Name: gName, Description: gDesc },
  Director: { Name: dName, Bio: dBio, Birth: '1950-01-01' },
  ImagePath: poster(img),
  Featured: !!Featured,
}));

setMovies(movies);
console.log(`Seeded ${getMovies().length} movies`);
