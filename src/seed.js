const { v4: uuid } = require('uuid');
const { setMovies, getMovies } = require('./db');

const poster = (id) => `https://image.tmdb.org/t/p/w500/${id}.jpg`;

const raw = [
  ['The Shawshank Redemption','Two imprisoned men bond over years, finding solace and eventual redemption.','Drama','Character-driven emotional stories.','Frank Darabont','American filmmaker known for King adaptations.','9cqNxx0GxF0bflZmeSMuL5tnGzr',true],
  ['The Godfather','An aging crime patriarch transfers control to his reluctant son.','Crime','Stories of crime and moral ambiguity.','Francis Ford Coppola','Director of The Godfather trilogy.','3bhkrj58Vtu7enBRAdXyHl8yU9L',true],
  ['The Dark Knight','Batman faces the Joker as Gotham descends into chaos.','Action','High-energy conflict and spectacle.','Christopher Nolan','Director of cerebral blockbusters.','qJ2tW6WMUDux911r6m7haRef0WH',true],
  ['Pulp Fiction','Interwoven tales of hitmen, a boxer, and redemption.','Crime','Stories of crime and moral ambiguity.','Quentin Tarantino','Known for sharp dialogue and nonlinear crime.','d5iIlFn5s0ImszYzBPb8JPIfbXD',true],
  ['Inception','A thief enters dreams to plant an idea and earn redemption.','Sci-Fi','Speculative tech and imagined futures.','Christopher Nolan','Director of cerebral blockbusters.','oYuLEt3zVCKq57qu2F8dT7NIa6f',true],
  ['Fight Club','An office worker and a soap maker form an underground fight club.','Drama','Character-driven emotional stories.','David Fincher','Director of dark precise thrillers.','pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK',false],
  ['Forrest Gump','American history through the eyes of a kind Alabama man.','Drama','Character-driven emotional stories.','Robert Zemeckis','Inventive mainstream storytelling.','arw2vcBveWOVZr6pxUjFDxWTczM',false],
  ['The Matrix','A hacker learns reality is a simulation and joins the fight.','Sci-Fi','Speculative tech and imagined futures.','Lana Wachowski','Co-creator of The Matrix.','f89U3ADr1oiB1s9GkdPOEpXUk5H',true],
  ['Goodfellas','Henry Hill rises and falls inside the mob.','Crime','Stories of crime and moral ambiguity.','Martin Scorsese','Central figure in modern crime cinema.','aKuFiU82s5ISJpGZp7YkIr3kCUd',false],
  ['Interstellar','Explorers travel through a wormhole to save humanity.','Sci-Fi','Speculative tech and imagined futures.','Christopher Nolan','Director of cerebral blockbusters.','gEU2QniE6E77NI6lCU6M61Bee8m',true],
  ['Parasite','Class conflict threatens a poor family and a rich one.','Thriller','Suspense-driven uneasy stories.','Bong Joon-ho','Socially sharp genre hybrids.','7IiTTgloJzvGI1TAYymCQgbf5Sp',true],
  ['Spirited Away','A girl enters a spirit world where humans become beasts.','Animation','Drawn and animated storytelling.','Hayao Miyazaki','Studio Ghibli co-founder.','39wmItIWsg5sZNgLbmqW9A4gqo9',true],
  ['The Fellowship of the Ring','A hobbit sets out to destroy a powerful ring.','Fantasy','Imagined worlds and epic stakes.','Peter Jackson','Brought Middle-earth to screen.','6oom5QYQ2yQTMJIbnvbkBL9cCir',true],
  ['Gladiator','A general seeks vengeance against a corrupt emperor.','Action','High-energy conflict and spectacle.','Ridley Scott','Epic historical and sci-fi films.','ty8TGRuvJLPUmAR1H1nRIsgwvim',false],
  ['Whiplash','A young drummer faces a ruthless instructor.','Drama','Character-driven emotional stories.','Damien Chazelle','Music-centered precise dramas.','7fn624j6ojULgqFZ0X0bW9gdcjC',false],
  ['The Prestige','Rival magicians escalate into obsession.','Thriller','Suspense-driven uneasy stories.','Christopher Nolan','Director of cerebral blockbusters.','bdN3gXuIZYaJP7ftWW7UNsAvoxy',false],
  ['Alien','A crew meets a deadly lifeform in deep space.','Horror','Fear dread and the uncanny.','Ridley Scott','Epic historical and sci-fi films.','vfrQk5IPloGg1v9Rzbh2Eg3VGyM',false],
  ['Blade Runner 2049','A blade runner uncovers a society-shaking secret.','Sci-Fi','Speculative tech and imagined futures.','Denis Villeneuve','Atmospheric large-scale sci-fi.','gajva2M0wxOZBbHygj0hF2W8oXq',true],
  ['Mad Max: Fury Road','Max and Furiosa flee a tyrant across the wasteland.','Action','High-energy conflict and spectacle.','George Miller','Creator of Mad Max.','8tZYtuWezp8JbcsvHYO0O46tFbo',true],
  ['Get Out','A weekend visit becomes a racial nightmare.','Horror','Fear dread and the uncanny.','Jordan Peele','Socially sharp horror.','tFXcEccSQMf3lfhfXKSU9iRBpa3',false],
  ['La La Land','A pianist and actress chase love and careers in LA.','Romance','Relationships and emotional connection.','Damien Chazelle','Music-centered precise dramas.','uDO8zWDhfWwoFdKS4fzkUJt0Rf0',false],
  ['The Grand Budapest Hotel','A lobby boy and concierge in a comic adventure.','Comedy','Humor wit and comic situations.','Wes Anderson','Stylized meticulous comedies.','eWdyYQreja6JGCzqHWXpWHDrrPo',false],
  ['Joker','A troubled comedian spirals into villainy.','Drama','Character-driven emotional stories.','Todd Phillips','Comedy and Joker origin.','udDclJoHjfjb8Ekgsd4FDteOkCU',false],
  ['Arrival','A linguist tries to communicate with alien visitors.','Sci-Fi','Speculative tech and imagined futures.','Denis Villeneuve','Atmospheric large-scale sci-fi.','x2FJsf1ElAgr53U6fKpF6jG8jK0',false],
  ['The Social Network','The founding of Facebook and its fallout.','Drama','Character-driven emotional stories.','David Fincher','Director of dark precise thrillers.','n0ybibhJtQ5icDqTp8eRytcIHJx',false],
  ['No Country for Old Men','A hunter finds drug money and a relentless killer.','Thriller','Suspense-driven uneasy stories.','Joel Coen','Dark crime with Ethan Coen.','bj1vXWpJbX6H5YSvWe0XbgeOzHK',false],
  ['Moonlight','A young man comes of age and grapples with identity.','Drama','Character-driven emotional stories.','Barry Jenkins','Intimate lyrical dramas.','4911T5FbJ9eD2Fce7PGuZEpofhU',false],
  ['Everything Everywhere All at Once','A woman must save the multiverse.','Comedy','Humor wit and comic situations.','Daniel Kwan','Co-director of EEAAO.','w3LxiVYdWWRvEVdn5RYq6jIqkb1',true],
  ['Dune','Paul Atreides arrives on the desert planet Arrakis.','Sci-Fi','Speculative tech and imagined futures.','Denis Villeneuve','Atmospheric large-scale sci-fi.','d5NXSklXo0qyIYkgV94SAgM4NwV',true],
  ['The Silence of the Lambs','An FBI trainee consults Hannibal Lecter.','Thriller','Suspense-driven uneasy stories.','Jonathan Demme','Landmark thriller director.','uS9m8OBk1A8eM9I042wpxtsLbXd',false],
  ['Se7en','Detectives hunt a killer using the seven deadly sins.','Thriller','Suspense-driven uneasy stories.','David Fincher','Director of dark precise thrillers.','6yoghtyTpznpBik8EngEmJskVUO',false],
  ['Amélie','A Parisian woman secretly improves lives around her.','Romance','Relationships and emotional connection.','Jean-Pierre Jeunet','Whimsical visual storytelling.','nSxUYgTDw9QmgwWcTXHvQJc0Y7P',false],
  ['Princess Mononoke','A prince is caught between forest gods and humans.','Animation','Drawn and animated storytelling.','Hayao Miyazaki','Studio Ghibli co-founder.','cMYCDADoLKLbB9qLspkHYICPUBK',false],
  ['The Departed','A cop and a mole hunt each other in Boston.','Crime','Stories of crime and moral ambiguity.','Martin Scorsese','Central figure in modern crime cinema.','nT97ifVT2J1yDiwRD1c6Q8n6R8k',false],
  ['Heat','Cops and professional thieves collide in LA.','Crime','Stories of crime and moral ambiguity.','Michael Mann','Stylish meticulous crime films.','umSVjVdbVwtx5pkEvj9FNlv7LAu',false],
  ['There Will Be Blood','An oil prospector descends into obsession.','Drama','Character-driven emotional stories.','Paul Thomas Anderson','Ambitious character dramas.','fa0RDkAlCec0STeMNAhPaF89q6U',false],
  ['Portrait of a Lady on Fire','A painter and her subject fall in love.','Romance','Relationships and emotional connection.','Céline Sciamma','Intimate visually exact dramas.','2LqugXFso6bWiUeCpDnw1bVNXNX',false],
  ['Pan\'s Labyrinth','A girl escapes fascist Spain into a fairy-tale underworld.','Fantasy','Imagined worlds and epic stakes.','Guillermo del Toro','Fairy tale horror allegory.','yjFJ8EWb0Fb5xwqXF5XN6Cqktyw',false],
  ['Django Unchained','A freed slave teams with a bounty hunter.','Western','Frontier conflict and myth.','Quentin Tarantino','Sharp dialogue and genre remixes.','7oWY8VDWW7thTzWh3nqL6Ni701W',true],
  ['The Wolf of Wall Street','A stockbroker rises and crashes on excess.','Drama','Character-driven emotional stories.','Martin Scorsese','Central figure in modern crime cinema.','pWHf4khOloNVfMxQi55OPL3nW1W',false]
];

const movies = raw.map(([Title, Description, gName, gDesc, dName, dBio, img, Featured]) => ({
  _id: uuid().replace(/-/g, '').slice(0, 24),
  Title,
  Description,
  Genre: { Name: gName, Description: gDesc },
  Director: { Name: dName, Bio: dBio, Birth: '1950-01-01' },
  ImagePath: poster(img),
  Featured: !!Featured,
}));

setMovies(movies);
console.log(`Seeded ${getMovies().length} movies`);
