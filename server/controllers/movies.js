import { Movie } from '../config/db.js';

export const getMovies = async (req, res) => {
  const { search } = req.query;

  try {
    let movies = await Movie.find({});

    if (search) {
      const searchLower = search.toLowerCase();
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchLower) ||
        movie.genre.toLowerCase().includes(searchLower)
      );
    }

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching movie details' });
  }
};
