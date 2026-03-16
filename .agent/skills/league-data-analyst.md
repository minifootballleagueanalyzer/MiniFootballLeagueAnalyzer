---
name: league-data-analyst
description: Analiza estadísticas de la MiniFootballLeague, rankings ELO y datos de equipos desde archivos JSON locales.
---

# Analista de MiniFootballLeague

Utiliza esta habilidad cuando el usuario haga preguntas sobre el estado de forma de los equipos, subidas de ELO, estadísticas defensivas o comparativas de Fair Play.

## Ubicación de los datos
- **ELO Rankings**: `frontend/public/elo_rankings.json`
- **Datos por competición**: Carpeta `jsons/*.json` (ej: `jsons/prim_div_mur.json`)

## Instrucciones para el Agente
1. **Lectura de archivos**: Usa tu herramienta de lectura de archivos para acceder a los JSONs mencionados.
2. **Interpretación de ELO**: 
   - Un valor de ELO más alto indica un mejor estado de forma actual.
   - Compara los valores de ELO entre jornadas para detectar la "mayor subida del mes".
3. **Métricas de Rendimiento**:
   - **Poder Ofensivo**: Capacidad de anotación.
   - **Solidez Defensiva**: Capacidad para evitar goles (valores bajos de goles encajados).
   - **Fair Play**: Nivel de disciplina. Si un equipo tiene muchas tarjetas, su Fair Play es bajo.
4. **Análisis Complejo**: Cuando se te pregunte por equipos "mal posicionados por Fair Play", busca equipos con buen ELO o Solidez Defensiva pero con puntuaciones bajas en la métrica de disciplina.

## Ejemplos de uso
- "Dime qué equipo de Tercera A ha subido más su ELO recientemente."
- "Busca equipos con gran defensa pero muchas tarjetas acumuladas."