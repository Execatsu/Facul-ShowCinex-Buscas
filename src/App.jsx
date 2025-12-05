import React, { useState, useEffect } from "react";
import {
    Search,
    Hash,
    List,
    Film,
    Clock,
    Zap,
    BarChart3,
    ChevronRight,
    X,
    Menu,
} from "lucide-react";

const ShowCinexApp = () => {
    // ========== ESTADOS PRINCIPAIS ==========
    const [movies, setMovies] = useState([]);
    const [indexedMovies, setIndexedMovies] = useState({});
    const [hashTable, setHashTable] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState("menu"); // menu, sequential, indexed, hash, allMovies

    // ========== ESTADOS BUSCA SEQUENCIAL ==========
    const [seqQuery, setSeqQuery] = useState("");
    const [seqResult, setSeqResult] = useState(null);
    const [seqStats, setSeqStats] = useState(null);
    const [seqAnimating, setSeqAnimating] = useState(false);
    const [seqCurrentIndex, setSeqCurrentIndex] = useState(-1);

    // ========== ESTADOS BUSCA INDEXADA ==========
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedMovie, setSelectedMovie] = useState(null);

    // ========== ESTADOS BUSCA HASH ==========
    const [hashQuery, setHashQuery] = useState("");
    const [hashResult, setHashResult] = useState(null);
    const [hashStats, setHashStats] = useState(null);

    // ========== CARREGAR DADOS DA API ==========
    useEffect(() => {
        loadMoviesData();
    }, []);

    async function loadAllMovies() {
        const arquivos = Array.from({ length: 10 }, (_, i) => `dados${i + 1}.json`);

        const promises = arquivos.map(async (nome) => {
            const resp = await fetch(`/${nome}`);
            const data = await resp.json();
            return data;
        });

        // aguarda todas as leituras
        const resultados = await Promise.all(promises);

        // junta tudo em 1 único array
        const detailedMovies = resultados.flat();

        return detailedMovies;
    }


    const loadMoviesData = async () => {
        try {
            setLoading(true);

            // Buscar detalhes de cada filme (incluindo gêneros)
            const detailedMovies = await loadAllMovies();

            setMovies(detailedMovies);

            // ========== CRIAR ESTRUTURA INDEXADA POR GÊNERO ==========
            const indexed = {};
            detailedMovies.forEach((movie) => {
                movie.genres.forEach((genre) => {
                    if (!indexed[genre]) {
                        indexed[genre] = [];
                    }
                    indexed[genre].push(movie);
                });
            });

            // Ordenar alfabeticamente dentro de cada gênero
            Object.keys(indexed).forEach((genre) => {
                indexed[genre].sort((a, b) => a.title.localeCompare(b.title));
            });

            setIndexedMovies(indexed);

            // ========== CRIAR TABELA HASH usando ID como chave ==========
            const hash = {};
            detailedMovies.forEach((movie) => {
                hash[movie.id] = movie;
            });

            setHashTable(hash);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar filmes:", error);
            setLoading(false);
        }
    };

    // ========== BUSCA SEQUENCIAL ==========
    const performSequentialSearch = () => {
        if (!seqQuery.trim()) return;

        setSeqAnimating(true);
        setSeqResult(null);
        setSeqStats(null);
        setSeqCurrentIndex(-1);

        const startTime = performance.now();
        let iterations = 0;
        let found = null;

        // Animação da busca
        const searchQuery = seqQuery.toLowerCase().trim();

        const animate = (index) => {
            if (index >= movies.length) {
                // Não encontrou
                const endTime = performance.now();
                setSeqStats({
                    time: (endTime - startTime).toFixed(2),
                    iterations: iterations,
                    found: false,
                });
                setSeqAnimating(false);
                setSeqCurrentIndex(-1);
                return;
            }

            setSeqCurrentIndex(index);
            iterations++;

            // Verificar se o título contém a query
            if (movies[index].title.toLowerCase().includes(searchQuery)) {
                found = movies[index];
                const endTime = performance.now();

                setTimeout(() => {
                    setSeqResult(found);
                    setSeqStats({
                        time: (endTime - startTime).toFixed(2),
                        iterations: iterations,
                        found: true,
                    });
                    setSeqAnimating(false);
                    setSeqCurrentIndex(-1);
                }, 100);
                return;
            }

            // Continuar busca com delay para animação
            setTimeout(() => animate(index + 1), 30);
        };

        animate(0);
    };

    // ========== BUSCA HASH ==========
    const performHashSearch = () => {
        if (!hashQuery.trim()) return;

        const startTime = performance.now();
        const movieId = parseInt(hashQuery);

        // Busca O(1) na tabela hash
        const found = hashTable[movieId];
        const endTime = performance.now();

        setHashResult(found || null);
        setHashStats({
            time: (endTime - startTime).toFixed(4),
            found: !!found,
        });
    };

    // ========== COMPONENTE: TELA DE CARREGAMENTO ==========
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Film className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Carregando Filmes...
                    </h2>
                    <p className="text-gray-400">Buscando dados da API</p>
                </div>
            </div>
        );
    }

    // ========== COMPONENTE: CARD DE FILME ==========
    const MovieCard = ({ movie, isAnimating = false, compact = false }) => (
        <div
            className={`bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                isAnimating
                    ? "border-yellow-400 scale-105 shadow-lg shadow-yellow-400/50"
                    : "border-slate-700 hover:border-purple-500"
            } ${compact ? "flex gap-3 p-3" : "p-4"}`}
        >
            {movie.poster && (
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className={
                        compact
                            ? "w-16 h-24 object-cover rounded"
                            : "w-full h-48 object-cover rounded-lg mb-3"
                    }
                />
            )}
            <div className="flex-1">
                <h3
                    className={`font-bold text-white mb-1 ${
                        compact ? "text-sm" : "text-lg"
                    }`}
                >
                    {movie.title}
                </h3>
                {!compact && movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {movie.genres.map((genre, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-400">
                        ★ {movie.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">ID: {movie.id}</span>
                </div>
                {!compact && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {movie.overview}
                    </p>
                )}
            </div>
        </div>
    );

    // ========== COMPONENTE: DETALHES DO FILME ==========
    const MovieDetails = ({ movie, onClose }) => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {movie.backdrop && (
                    <div className="relative h-64">
                        <img
                            src={movie.backdrop}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                )}

                <div className="p-6">
                    <div className="flex gap-6">
                        {movie.poster && (
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-48 h-72 object-cover rounded-lg shadow-xl"
                            />
                        )}

                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {movie.title}
                            </h2>
                            {movie.originalTitle !== movie.title && (
                                <p className="text-gray-400 mb-4">
                                    {movie.originalTitle}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                                {movie.genres.map((genre, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-gray-400 text-sm">
                                        Avaliação
                                    </p>
                                    <p className="text-yellow-400 text-xl font-bold">
                                        ★ {movie.rating.toFixed(1)}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {movie.votes.toLocaleString()} votos
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-gray-400 text-sm">
                                        ID do Filme
                                    </p>
                                    <p className="text-white text-xl font-bold">
                                        {movie.id}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-gray-400 text-sm">
                                        Lançamento
                                    </p>
                                    <p className="text-white font-bold">
                                        {new Date(
                                            movie.releaseDate
                                        ).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-gray-400 text-sm">
                                        Duração
                                    </p>
                                    <p className="text-white font-bold">
                                        {movie.runtime} min
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-700/30 p-4 rounded-lg">
                                <h3 className="text-white font-bold mb-2">
                                    Sinopse
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ========== TELA: MENU PRINCIPAL ==========
    if (currentView === "menu") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="mx-auto px-4 py-12">
                    <div className="text-center mb-12">
                        <Film className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-pulse" />
                        <h1 className="text-5xl font-bold text-white mb-2">
                            ShowCinex
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Plataforma Inteligente de Busca de Filmes
                        </p>
                        <p className="text-purple-300 mt-2">
                            {movies.length} filmes carregados da API
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* Busca Sequencial */}
                        <div
                            onClick={() => setCurrentView("sequential")}
                            className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
                        >
                            <Search className="w-12 h-12 text-blue-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                Busca Sequencial
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Percorre a lista item por item até encontrar o
                                filme. Ideal para buscar por nome ou parte do
                                título.
                            </p>
                            <div className="flex items-center text-blue-400 font-semibold">
                                Iniciar{" "}
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </div>
                        </div>

                        {/* Busca Indexada */}
                        <div
                            onClick={() => setCurrentView("indexed")}
                            className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-green-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20"
                        >
                            <List className="w-12 h-12 text-green-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                Busca Indexada
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Filmes organizados por gênero em ordem
                                alfabética. Navegação estruturada e eficiente.
                            </p>
                            <div className="flex items-center text-green-400 font-semibold">
                                Iniciar{" "}
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </div>
                        </div>

                        {/* Busca Hash */}
                        <div
                            onClick={() => setCurrentView("hash")}
                            className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-purple-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                        >
                            <Hash className="w-12 h-12 text-purple-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                Busca Hash
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Busca instantânea O(1) usando o ID do filme.
                                Acesso direto e ultra-rápido.
                            </p>
                            <div className="flex items-center text-purple-400 font-semibold">
                                Iniciar{" "}
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </div>
                        </div>

                        {/* Todos os Filmes */}
                        <div
                            onClick={() => setCurrentView("allMovies")}
                            className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-yellow-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
                        >
                            <Film className="w-12 h-12 text-yellow-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                Todos os Filmes
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Visualize toda a biblioteca de filmes
                                disponíveis na plataforma.
                            </p>
                            <div className="flex items-center text-yellow-400 font-semibold">
                                Ver Todos{" "}
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                            <h3 className="text-white font-bold mb-3">
                                📊 Dados da API - TMDB
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                                <div>
                                    <p className="text-gray-400 text-sm">
                                        Total de Filmes
                                    </p>
                                    <p className="text-white font-bold">
                                        {movies.length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">
                                        Gêneros Únicos
                                    </p>
                                    <p className="text-white font-bold">
                                        {Object.keys(indexedMovies).length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">
                                        Campos por Filme
                                    </p>
                                    <p className="text-white font-bold">12</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">
                                        Fonte
                                    </p>
                                    <p className="text-white font-bold">
                                        TMDB API
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 text-center">
                        <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                            <h3 className="text-white font-bold mb-3">
                                👨‍💻 Desenvolvido Por
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Cássius Fernando
                            </p>
                        </div>
                    </div>  
                </div>
            </div>
        );
    }

    // ========== TELA: BUSCA SEQUENCIAL ==========
    if (currentView === "sequential") {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="w-full px-4 py-8">
                    <button
                        onClick={() => {
                            setCurrentView("menu");
                            setSeqQuery("");
                            setSeqResult(null);
                            setSeqStats(null);
                        }}
                        className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Voltar ao Menu
                    </button>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <Search className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold text-white mb-2">
                                Busca Sequencial
                            </h2>
                            <p className="text-gray-300">
                                Digite o nome ou parte do título do filme
                            </p>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-6 mb-6">
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    value={seqQuery}
                                    onChange={(e) =>
                                        setSeqQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        !seqAnimating &&
                                        performSequentialSearch()
                                    }
                                    placeholder="Ex: Matrix, Vingadores, etc..."
                                    disabled={seqAnimating}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                                <button
                                    onClick={performSequentialSearch}
                                    disabled={seqAnimating || !seqQuery.trim()}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                                >
                                    {seqAnimating ? "Buscando..." : "Buscar"}
                                </button>
                            </div>

                            {seqStats && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <span className="text-gray-400">
                                                Tempo de busca
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {seqStats.time} ms
                                        </p>
                                    </div>
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 className="w-5 h-5 text-blue-400" />
                                            <span className="text-gray-400">
                                                Iterações
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {seqStats.iterations}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Animação da lista sendo percorrida */}
                        {seqAnimating && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-6 mb-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                                    Percorrendo lista...
                                </h3>
                                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                    {movies
                                        .slice(
                                            Math.max(0, seqCurrentIndex - 2),
                                            seqCurrentIndex + 3
                                        )
                                        .map((movie, idx) => {
                                            const actualIndex =
                                                Math.max(
                                                    0,
                                                    seqCurrentIndex - 2
                                                ) + idx;
                                            return (
                                                <MovieCard
                                                    key={movie.id}
                                                    movie={movie}
                                                    isAnimating={
                                                        actualIndex ===
                                                        seqCurrentIndex
                                                    }
                                                    compact={true}
                                                />
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Resultado */}
                        {seqResult && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-green-500 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4 text-xl">
                                    ✅ Filme Encontrado!
                                </h3>
                                <MovieCard movie={seqResult} />
                                <button
                                    onClick={() => setSelectedMovie(seqResult)}
                                    className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    Ver Detalhes Completos
                                </button>
                            </div>
                        )}

                        {seqStats && !seqStats.found && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 rounded-xl p-6 text-center">
                                <p className="text-red-400 text-lg font-semibold">
                                    ❌ Nenhum filme encontrado com "{seqQuery}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {selectedMovie && (
                    <MovieDetails
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </div>
        );
    }

    // ========== TELA: BUSCA INDEXADA ==========
    if (currentView === "indexed") {
        const genres = Object.keys(indexedMovies).sort();
        const moviesInGenre = selectedGenre ? indexedMovies[selectedGenre] : [];

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
                <div className="container mx-auto px-4 py-8">
                    <button
                        onClick={() => {
                            setCurrentView("menu");
                            setSelectedGenre("");
                            setSelectedMovie(null);
                        }}
                        className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Voltar ao Menu
                    </button>

                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8">
                            <List className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold text-white mb-2">
                                Busca Indexada
                            </h2>
                            <p className="text-gray-300">
                                Navegue por gênero e encontre filmes organizados
                                alfabeticamente
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Coluna 1: Seleção de Gênero */}
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                                    <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                        1
                                    </span>
                                    Escolha o Gênero
                                </h3>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {genres.map((genre) => (
                                        <button
                                            key={genre}
                                            onClick={() => {
                                                setSelectedGenre(genre);
                                                setSelectedMovie(null);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                                selectedGenre === genre
                                                    ? "bg-green-500 text-white font-semibold"
                                                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                            }`}
                                        >
                                            {genre}
                                            <span className="float-right text-sm opacity-70">
                                                ({indexedMovies[genre].length})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna 2: Lista de Filmes do Gênero */}
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                                    <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                        2
                                    </span>
                                    Selecione o Filme
                                </h3>
                                {!selectedGenre ? (
                                    <p className="text-gray-400 text-center py-8">
                                        Selecione um gênero primeiro
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        <p className="text-green-400 text-sm mb-3">
                                            {moviesInGenre.length} filmes em
                                            ordem alfabética
                                        </p>
                                        {moviesInGenre.map((movie) => (
                                            <button
                                                key={movie.id}
                                                onClick={() =>
                                                    setSelectedMovie(movie)
                                                }
                                                className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all text-gray-300 hover:text-white"
                                            >
                                                <div className="font-semibold">
                                                    {movie.title}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span>
                                                        ★{" "}
                                                        {movie.rating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(
                                                            movie.releaseDate
                                                        ).getFullYear()}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Coluna 3: Detalhes do Filme */}
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                                    <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                        3
                                    </span>
                                    Informações
                                </h3>
                                {!selectedMovie ? (
                                    <p className="text-gray-400 text-center py-8">
                                        Selecione um filme para ver os detalhes
                                    </p>
                                ) : (
                                    <div className="max-h-[500px] overflow-y-auto">
                                        <MovieCard movie={selectedMovie} />
                                        <button
                                            onClick={() => {
                                                // selectedMovie já está setado, então vamos criar um estado temporário
                                                const temp = selectedMovie;
                                                setSelectedMovie(null);
                                                setTimeout(
                                                    () =>
                                                        setSelectedMovie(temp),
                                                    10
                                                );
                                            }}
                                            className="w-full mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
                                        >
                                            Ver Detalhes Completos
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedMovie && (
                    <MovieDetails
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </div>
        );
    }

    // ========== TELA: BUSCA HASH ==========
    if (currentView === "hash") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-8">
                    <button
                        onClick={() => {
                            setCurrentView("menu");
                            setHashQuery("");
                            setHashResult(null);
                            setHashStats(null);
                        }}
                        className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Voltar ao Menu
                    </button>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <Hash className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold text-white mb-2">
                                Busca Hash
                            </h2>
                            <p className="text-gray-300">
                                Busca instantânea O(1) usando o ID do filme
                            </p>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-6 mb-6">
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="number"
                                    value={hashQuery}
                                    onChange={(e) =>
                                        setHashQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && performHashSearch()
                                    }
                                    placeholder="Digite o ID do filme (ex: 550, 238, 424)"
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={performHashSearch}
                                    disabled={!hashQuery.trim()}
                                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                                >
                                    Buscar
                                </button>
                            </div>

                            {hashStats && (
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <span className="text-gray-400">
                                            Tempo de busca (O(1))
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">
                                        {hashStats.time} ms
                                    </p>
                                    <p className="text-purple-400 text-sm mt-2">
                                        ⚡ Acesso direto à tabela hash
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                                <h4 className="text-purple-300 font-semibold mb-2">
                                    💡 Dica: IDs disponíveis
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">
                                    Experimente alguns destes IDs:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {movies.slice(0, 10).map((movie) => (
                                        <button
                                            key={movie.id}
                                            onClick={() => {
                                                setHashQuery(
                                                    movie.id.toString()
                                                );
                                                performHashSearch();
                                            }}
                                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded text-sm transition-colors"
                                        >
                                            {movie.id}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Resultado */}
                        {hashResult && hashStats?.found && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-green-500 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4 text-xl flex items-center gap-2">
                                    ✅ Filme Encontrado Instantaneamente!
                                </h3>
                                <MovieCard movie={hashResult} />
                                <button
                                    onClick={() => setSelectedMovie(hashResult)}
                                    className="w-full mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
                                >
                                    Ver Detalhes Completos
                                </button>
                            </div>
                        )}

                        {hashStats && !hashStats.found && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-red-500 rounded-xl p-6 text-center">
                                <p className="text-red-400 text-lg font-semibold">
                                    ❌ Nenhum filme encontrado com ID{" "}
                                    {hashQuery}
                                </p>
                                <p className="text-gray-400 mt-2">
                                    Verifique se o ID está correto
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {selectedMovie && (
                    <MovieDetails
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </div>
        );
    }

    // ========== TELA: TODOS OS FILMES ==========
    if (currentView === "allMovies") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900">
                <div className="container mx-auto px-4 py-8">
                    <button
                        onClick={() => {
                            setCurrentView("menu");
                            setSelectedMovie(null);
                        }}
                        className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Voltar ao Menu
                    </button>

                    <div className="text-center mb-8">
                        <Film className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-white mb-2">
                            Biblioteca Completa
                        </h2>
                        <p className="text-gray-300">
                            Navegue por todos os {movies.length} filmes
                            disponíveis
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => setSelectedMovie(movie)}
                                className="cursor-pointer"
                            >
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </div>

                {selectedMovie && (
                    <MovieDetails
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </div>
        );
    }

    return null;
};

export default ShowCinexApp;
