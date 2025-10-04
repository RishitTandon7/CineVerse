import { Movie } from '../types';

export const movies: Movie[] = [
  {
    id: 1,
    title: "Cosmic Journey",
    genre: "Sci-Fi",
    year: 2024,
    rating: 8.9,
    duration: "2h 34m",
    thumbnail: "https://images.pexels.com/photos/586056/pexels-photo-586056.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "An epic space adventure that takes you beyond the stars into uncharted territories of the universe.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: 2,
    title: "Ocean's Mystery",
    genre: "Adventure",
    year: 2024,
    rating: 9.1,
    duration: "1h 58m",
    thumbnail: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Deep sea exploration reveals ancient secrets hidden beneath the waves for millennia.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: 3,
    title: "Mountain Echo",
    genre: "Drama",
    year: 2023,
    rating: 8.3,
    duration: "2h 22m",
    thumbnail: "https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A gripping story of survival and courage set against the backdrop of towering peaks.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: 4,
    title: "City Lights",
    genre: "Romance",
    year: 2024,
    rating: 8.9,
    duration: "1h 45m",
    thumbnail: "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Love blooms in the urban jungle as two souls find each other in the bustling metropolis.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: 5,
    title: "Starfall",
    genre: "Fantasy",
    year: 2024,
    rating: 9.2,
    duration: "2h 41m",
    thumbnail: "https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Magic and wonder collide in a mystical realm where anything is possible.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    id: 6,
    title: "Silent Thunder",
    genre: "Thriller",
    year: 2023,
    rating: 8.5,
    duration: "1h 52m",
    thumbnail: "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Edge-of-your-seat suspense that will keep you guessing until the final frame.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  },
  {
    id: 7,
    title: "Neon Dreams",
    genre: "Cyberpunk",
    year: 2024,
    rating: 8.7,
    duration: "2h 15m",
    thumbnail: "https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A dystopian future where technology and humanity collide in spectacular fashion.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  },
  {
    id: 8,
    title: "Desert Storm",
    genre: "Action",
    year: 2023,
    rating: 8.4,
    duration: "2h 8m",
    thumbnail: "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "High-octane action in the unforgiving desert where survival is the only option.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  }
];

export const getMovieById = (id: number): Movie | undefined => {
  return movies.find(movie => movie.id === id);
};

export const getRandomMovie = (): Movie => {
  return movies[Math.floor(Math.random() * movies.length)];
};

export const getMoviesByGenre = (genre: string): Movie[] => {
  if (genre === 'all') return movies;
  return movies.filter(movie => movie.genre.toLowerCase() === genre.toLowerCase());
};