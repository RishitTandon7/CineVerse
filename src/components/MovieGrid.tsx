import React, { useState } from 'react';
import { Play, Clock, Users, Star, Filter, Grid, List, Search } from 'lucide-react';
import { movies } from '../utils/movieData';
import { Movie } from '../types';

interface MovieGridProps {
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieGrid({ onMovieSelect }: MovieGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['all', ...Array.from(new Set(movies.map(movie => movie.genre)))];
  
  const filteredMovies = movies.filter(movie => {
    const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white to-blue-50/30">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-lg text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-lg text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
                  }`}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onSelect={onMovieSelect} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMovies.map((movie) => (
            <MovieListItem key={movie.id} movie={movie} onSelect={onMovieSelect} />
          ))}
        </div>
      )}

      {filteredMovies.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No movies found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

function MovieCard({ movie, onSelect }: { movie: Movie; onSelect: (movie: Movie) => void }) {
  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => onSelect(movie)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl"
            >
              <Play className="h-8 w-8 fill-current ml-1" />
            </button>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          {movie.rating}
        </div>

        {/* Genre Badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
          {movie.genre}
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {movie.title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">{movie.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">{movie.year}</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{movie.duration}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onSelect(movie)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group-hover:scale-105"
        >
          <Users className="h-5 w-5" />
          Start Premium Watch Party
        </button>
      </div>
    </div>
  );
}

function MovieListItem({ movie, onSelect }: { movie: Movie; onSelect: (movie: Movie) => void }) {
  return (
    <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      <div className="flex gap-6">
        <div className="relative flex-shrink-0 overflow-hidden rounded-2xl">
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="w-32 h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-xl text-sm font-bold flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            {movie.rating}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {movie.title}
              </h3>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-xl text-sm font-bold">
                {movie.genre}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">{movie.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-700">{movie.year}</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{movie.duration}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onSelect(movie)}
            className="self-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-8 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Users className="h-5 w-5" />
            Start Watch Party
          </button>
        </div>
      </div>
    </div>
  );
}