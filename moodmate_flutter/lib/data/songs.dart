class Song {
  final String title;
  final String artist;
  final String genre;
  const Song({required this.title, required this.artist, required this.genre});
}

const Map<String, List<Song>> songsData = {
  'happy': [
    Song(title: 'Happy', artist: 'Pharrell Williams', genre: 'Pop'),
    Song(title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'Pop Rock'),
    Song(title: 'Good as Hell', artist: 'Lizzo', genre: 'Pop'),
    Song(title: 'Uptown Funk', artist: 'Bruno Mars', genre: 'Funk Pop'),
    Song(title: "Can't Stop the Feeling!", artist: 'Justin Timberlake', genre: 'Pop'),
  ],
  'relaxed': [
    Song(title: 'Weightless', artist: 'Marconi Union', genre: 'Ambient'),
    Song(title: 'Sunset Lover', artist: 'Petit Biscuit', genre: 'Chill Electronic'),
    Song(title: 'Put Your Records On', artist: 'Corinne Bailey Rae', genre: 'Soul'),
    Song(title: 'Better Together', artist: 'Jack Johnson', genre: 'Acoustic'),
    Song(title: 'Banana Pancakes', artist: 'Jack Johnson', genre: 'Acoustic'),
  ],
  'stress': [
    Song(title: 'Breathe Me', artist: 'Sia', genre: 'Indie Pop'),
    Song(title: 'Skinny Love', artist: 'Bon Iver', genre: 'Indie Folk'),
    Song(title: 'Clair de Lune', artist: 'Claude Debussy', genre: 'Classical'),
    Song(title: 'River Flows in You', artist: 'Yiruma', genre: 'Classical Piano'),
    Song(title: "Comptine d'un autre ete", artist: 'Yann Tiersen', genre: 'Classical Piano'),
  ],
  'worry': [
    Song(title: 'Three Little Birds', artist: 'Bob Marley', genre: 'Reggae'),
    Song(title: 'Here Comes the Sun', artist: 'The Beatles', genre: 'Rock'),
    Song(title: "Don't Worry Be Happy", artist: 'Bobby McFerrin', genre: 'A Cappella'),
    Song(title: 'Lean on Me', artist: 'Bill Withers', genre: 'Soul'),
    Song(title: 'What a Wonderful World', artist: 'Louis Armstrong', genre: 'Jazz'),
  ],
  'frustration': [
    Song(title: 'Lovely', artist: 'Billie Eilish', genre: 'Dark Pop'),
    Song(title: 'Someone Like You', artist: 'Adele', genre: 'Pop Ballad'),
    Song(title: 'Let It Be', artist: 'The Beatles', genre: 'Rock'),
    Song(title: 'Fix You', artist: 'Coldplay', genre: 'Alternative Rock'),
    Song(title: 'The Scientist', artist: 'Coldplay', genre: 'Alternative Rock'),
  ],
  'disappointment': [
    Song(title: 'Heal', artist: 'Tom Odell', genre: 'Indie Pop'),
    Song(title: 'Better Days', artist: 'OneRepublic', genre: 'Pop'),
    Song(title: 'Unwritten', artist: 'Natasha Bedingfield', genre: 'Pop'),
    Song(title: 'Rise Up', artist: 'Andra Day', genre: 'Soul'),
    Song(title: 'Fight Song', artist: 'Rachel Platten', genre: 'Pop'),
  ],
};
