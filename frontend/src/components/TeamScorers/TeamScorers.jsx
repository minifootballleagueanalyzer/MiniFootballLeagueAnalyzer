import React from 'react';
import './TeamScorers.css';
import { motion } from 'framer-motion';

const TeamScorers = ({ teamName, scorersData = [] }) => {
  // Filter scorers for this team and take top 5
  const topScorers = scorersData
    .filter(player => player.equipo === teamName)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 5);

  return (
    <div className="team-scorers-container">
      <h3 className="team-scorers-title">Top 5 Goleadores: {teamName}</h3>
      
      <div className="scorers-list">
        {topScorers.length > 0 ? (
          topScorers.map((player, index) => (
            <motion.div 
              key={`${player.nombre}-${index}`}
              className="scorer-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="scorer-info">
                <img 
                  src={player.avatar || 'https://minifootballleagues.com/static/team/default1.png'} 
                  alt={player.nombre} 
                  className="scorer-avatar"
                  onError={(e) => { e.target.src = 'https://minifootballleagues.com/static/team/default1.png'; }}
                />
                <span className="scorer-name" title={player.nombre}>{player.nombre}</span>
              </div>
              
              <div className="scorer-goals-badge">
                <span className="goals-count">{player.goles}</span>
                <span className="goals-label">Goles</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="empty-scorers">
            No hay datos de goleadores disponibles para este equipo.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamScorers;
