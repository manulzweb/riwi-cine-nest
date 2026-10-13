// src/pages/BillboardPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Filter,
  Info,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { BillboardItem, Movie } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotification } from '../context/NotificationContext.tsx';

interface BillboardPageProps {
  selectedCityId: number | null;
  onSelectShowtime: (showtimeId: number) => void;
}

export const BillboardPage: React.FC<BillboardPageProps> = ({
  selectedCityId,
  onSelectShowtime,
}) => {
  const [billboard, setBillboard] = useState<BillboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedMovieDetail, setSelectedMovieDetail] = useState<Movie | null>(null);
  const { notify } = useNotification();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getBillboard({ cityId: selectedCityId || undefined })
      .then((data) => {
        if (isMounted) {
          setBillboard(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          notify(err.message || 'Error al cargar la cartelera', 'error');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCityId, notify]);

  // Extract all formats and genres from movies
  const { allFormats, allGenres } = React.useMemo(() => {
    const formatsSet = new Set<string>();
    const genresSet = new Set<string>();

    for (const item of billboard) {
      item.movie.formats?.forEach((f) => formatsSet.add(f));
      item.movie.genres?.forEach((g) => genresSet.add(g));
    }

    return {
      allFormats: Array.from(formatsSet),
      allGenres: Array.from(genresSet),
    };
  }, [billboard]);

  // Filtered billboard
  const filteredBillboard = React.useMemo(() => {
    return billboard.filter(({ movie, showtimes }) => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.synopsis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFormat =
        selectedFormat === 'all' ||
        movie.formats?.includes(selectedFormat) ||
        showtimes.some((s) => s.format === selectedFormat);

      const matchesGenre =
        selectedGenre === 'all' || movie.genres?.includes(selectedGenre);

      return matchesSearch && matchesFormat && matchesGenre;
    });
  }, [billboard, searchTerm, selectedFormat, selectedGenre]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cinema-card via-slate-900 to-cinema-card border border-cinema-border p-6 sm:p-12 mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-accent/20 border border-cinema-accent/30 text-cinema-accent text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Cartelera Oficial
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Vive el cine con la mejor calidad y asientos reservados.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Selecciona tu película favorita, consulta los horarios en tu ciudad y asegura tus butacas en tiempo real sin filas.
          </p>
        </div>

        {/* Decorative Neon Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-cinema-card border border-cinema-border mb-10">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar película por título, género o sinopsis..."
            className="w-full pl-11 pr-4 py-3 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-400 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Format selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Formato:
            </span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="py-2.5 px-3 bg-cinema-dark border border-cinema-border rounded-xl text-xs font-semibold text-slate-200 focus:border-cinema-accent"
            >
              <option value="all">Todos los formatos</option>
              {allFormats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Genre selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Género:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="py-2.5 px-3 bg-cinema-dark border border-cinema-border rounded-xl text-xs font-semibold text-slate-200 focus:border-cinema-accent"
            >
              <option value="all">Todos los géneros</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid / Showtimes */}
      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando cartelera de cine en tiempo real...</span>
        </div>
      ) : filteredBillboard.length === 0 ? (
        <div className="w-full py-16 text-center bg-cinema-card rounded-2xl border border-cinema-border p-8">
          <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">No se encontraron películas</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Intenta cambiar los filtros de búsqueda o seleccionar otra ciudad en el menú superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillboard.map(({ movie, showtimes }) => (
            <article
              key={movie.id}
              className="group bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:border-slate-600 transition-all flex flex-col shadow-lg hover:shadow-glow"
            >
              {/* Poster and Badges */}
              <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-slate-900">
                <img
                  src={movie.bannerUrl || movie.posterUrl}
                  alt={`Póster de la película ${movie.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/20 to-transparent" />

                {/* Classification and duration tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20">
                    {movie.classification || 'TP'}
                  </span>
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-semibold text-slate-200 border border-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {movie.duration} min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMovieDetail(movie)}
                  className="absolute bottom-3 right-3 p-2 bg-black/70 backdrop-blur-md hover:bg-cinema-accent rounded-xl text-white border border-white/20 transition focus-visible:ring-2 focus-visible:ring-white"
                  title="Ver sinopsis y tráiler"
                  aria-label={`Ver sinopsis de ${movie.title}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Movie info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-red-400 transition">
                    {movie.title}
                  </h2>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {movie.genres?.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px] font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Showtimes Pill List */}
                <div className="pt-4 border-t border-cinema-border/70">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cinema-accent" />
                    Funciones Disponibles:
                  </span>

                  {showtimes.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No hay funciones próximas</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {showtimes.map((st) => {
                        const timeStr = st.startTime
                          ? new Date(st.startTime).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Pronto';

                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => onSelectShowtime(st.id)}
                            className="px-3 py-1.5 bg-cinema-dark hover:bg-cinema-accent text-slate-200 hover:text-white rounded-xl border border-cinema-border hover:border-red-500 text-xs font-bold transition flex items-center gap-1.5 shadow-sm group/btn focus-visible:ring-2 focus-visible:ring-cinema-accent"
                            title={`${st.cinema?.name || 'Cine'} - ${st.room?.name || 'Sala'} (${st.format || '2D'})`}
                          >
                            <span>{timeStr}</span>
                            {st.format && (
                              <span className="text-[10px] text-cyan-400 group-hover/btn:text-white uppercase font-extrabold">
                                {st.format}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Movie Detail Modal */}
      {selectedMovieDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-detail-title"
        >
          <div
            className="relative w-full max-w-2xl bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="movie-detail-title" className="text-2xl font-black text-white">
                {selectedMovieDetail.title}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedMovieDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Cerrar modal de detalles"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <img
                src={selectedMovieDetail.posterUrl}
                alt={selectedMovieDetail.title}
                className="w-32 h-48 object-cover rounded-xl border border-cinema-border shrink-0 mx-auto sm:mx-0"
              />
              <div className="flex-1 space-y-3 text-sm">
                <p className="text-slate-300 leading-relaxed">{selectedMovieDetail.synopsis}</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    <strong className="text-white">Director:</strong> {selectedMovieDetail.director}
                  </p>
                  <p>
                    <strong className="text-white">Duración:</strong> {selectedMovieDetail.duration} minutos
                  </p>
                  <p>
                    <strong className="text-white">Clasificación:</strong> {selectedMovieDetail.classification}
                  </p>
                  <p>
                    <strong className="text-white">Formatos:</strong> {selectedMovieDetail.formats?.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {selectedMovieDetail.trailerUrl && (
              <a
                href={selectedMovieDetail.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 transition"
              >
                <Play className="w-4 h-4 text-cinema-accent" />
                Ver Tráiler Oficial en YouTube
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
