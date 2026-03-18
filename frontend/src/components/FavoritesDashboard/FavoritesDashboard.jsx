import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { userStore } from '../../stores/authStore';
import { favoritesStore, toggleFavorite } from '../../stores/favoritesStore';
import { Star, X } from 'lucide-react';
import './FavoritesDashboard.css';

const FavoritesDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useStore(userStore);
  const favorites = useStore(favoritesStore);

  if (!user) return null;

  return (
    <div className="favorites-dashboard-container">
      <button
        className="favorites-trigger"
        onClick={() => setIsOpen(true)}
        title="Mis Favoritos"
      >
        <Star size={20} fill={favorites.length > 0 ? "#eab308" : "transparent"} stroke={favorites.length > 0 ? "#eab308" : "currentColor"} strokeWidth={2} />
        {favorites.length > 0 && <span className="favorites-badge">{favorites.length}</span>}
      </button>

      {isOpen && (
        <div className="favorites-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="favorites-modal" onClick={e => e.stopPropagation()}>
            <div className="favorites-modal-header">
              <h2>Mis Favoritos</h2>
              <button className="favorites-modal-close" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="favorites-modal-content">
              {favorites.length === 0 ? (
                <p className="favorites-empty">Aún no tienes equipos favoritos. Selecciona una liga y pulsa en la estrella de un equipo para añadirlo.</p>
              ) : (
                <ul className="favorites-list">
                  {favorites.map((fav, index) => (
                    <li key={index} className="favorite-item">
                      <div className="favorite-team-info">
                        <Star size={18} fill="#eab308" stroke="#eab308" />
                        <span className="favorite-team-name">{fav.team_name}</span>
                      </div>
                      <button
                        className="favorite-remove-btn"
                        onClick={() => toggleFavorite(fav.team_name, fav.league_id)}
                        title="Eliminar de favoritos"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesDashboard;
