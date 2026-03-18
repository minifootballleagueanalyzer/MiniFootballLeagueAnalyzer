import React from 'react';
import './Leaderboard.css';
import murciaFlag from '../../assets/murcia_flag.jpeg';
import granadaFlag from '../../assets/granada_flag.png';
import { useTranslation } from '../../hooks/useTranslation';
import { useStore } from '@nanostores/react';
import { favoritesStore, toggleFavorite, isFavoritesLoading } from '../../stores/favoritesStore';
import { Star } from 'lucide-react';

const Leaderboard = ({ rankings = [], leagueId = '' }) => {
  const { t } = useTranslation();
  const favorites = useStore(favoritesStore);
  const isLoading = useStore(isFavoritesLoading);
  
  const defaultFlag = leagueId.includes('_gra') || leagueId.includes('veteranos_gra') ? granadaFlag : murciaFlag;
  const flagSrc = typeof defaultFlag === 'object' ? defaultFlag.src : defaultFlag;

  const isFav = (teamName) => favorites.some(f => f.team_name === teamName && f.league_id === leagueId);

  if (!rankings || rankings.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>{t('leaderboard.empty')}</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">{t('leaderboard.title')}</h2>
      <div className="leaderboard-header">
        <span className="header-col-rank">{t('leaderboard.col_rank')}</span>
        <span className="header-col-team">{t('leaderboard.col_team')}</span>
        <span className="header-col-pts">{t('leaderboard.col_pts')}</span>
      </div>

      <div className="leaderboard-body">
        {rankings.map((team, index) => (
          <div key={team.equipo} className="leaderboard-row">
            <div className="col-rank">
              <div className={`rank-badge ${index === 0 ? 'rank-first' : index === 1 ? 'rank-second' : index === 2 ? 'rank-third' : ''}`}>
                #{team.posicion}
              </div>
            </div>

            <div className="col-team">
              <span 
                className={`favorite-star ${isFav(team.equipo) ? 'active' : ''}`}
                onClick={() => !isLoading && toggleFavorite(team.equipo, leagueId)}
                title={isFav(team.equipo) ? "Quitar de Mis favoritos" : "Añadir a Mis favoritos"}
              >
                <Star 
                  size={18} 
                  fill={isFav(team.equipo) ? "#000" : "transparent"} 
                  stroke={isFav(team.equipo) ? "#eab308" : "#9ca3af"} 
                  strokeWidth={2}
                />
              </span>
              <img
                src={team.logo || flagSrc}
                alt={team.equipo}
                className="team-logo-image"
                onError={(e) => { e.target.src = flagSrc; }}
              />
              <span className="team-name">{team.equipo}</span>
            </div>

            <div className="col-pts">
              <span className="pts-value">{team.puntos}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
