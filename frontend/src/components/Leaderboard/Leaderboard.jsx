import React from 'react';
import './Leaderboard.css';
import murciaFlag from '../../assets/murcia_flag.jpeg';
import granadaFlag from '../../assets/granada_flag.png';

const Leaderboard = ({ rankings = [], leagueId = '' }) => {
  const defaultFlag = leagueId.includes('_gra') || leagueId.includes('veteranos_gra') ? granadaFlag : murciaFlag;
  const flagSrc = typeof defaultFlag === 'object' ? defaultFlag.src : defaultFlag;

  if (!rankings || rankings.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>Selecciona una competición para ver el Power Ranking.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">POWER RANKING</h2>
      <div className="leaderboard-header">
        <span className="header-col-rank">Ranking</span>
        <span className="header-col-team">Equipo</span>
        <span className="header-col-pts">Pts</span>
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
