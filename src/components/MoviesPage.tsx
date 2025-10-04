import React from 'react';
import MovieGrid from './MovieGrid';
import { Movie } from '../types';

interface MoviesPageProps {
  onMovieSelect: (movie: Movie) => void;
}

export default function MoviesPage({ onMovieSelect }: MoviesPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Premium Movie
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Collection
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of movies in stunning 4K quality for your next premium watch party.
          </p>
        </div>
        
        <MovieGrid onMovieSelect={onMovieSelect} />
      </div>
    </div>
  );
}