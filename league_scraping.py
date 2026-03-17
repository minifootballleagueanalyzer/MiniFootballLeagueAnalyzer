from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
import os

# --- CONFIGURACIÓN DEL NAVEGADOR ---
opciones = Options()
opciones.add_argument('--headless')  # Ejecuta Chrome de fondo, sin abrir la ventana visual
opciones.add_argument('--no-sandbox')  # Necesario en entornos CI (GitHub Actions)
opciones.add_argument('--disable-dev-shm-usage')  # Evita crashes por memoria compartida limitada en CI
opciones.add_argument('--disable-gpu')
opciones.add_argument('--log-level=3')  # Oculta mensajes molestos de la consola

print("Iniciando el navegador fantasma...")
driver = webdriver.Chrome(options=opciones)

competiciones = [
    {"nombre": "Primera División Murcia", "id": 80, "archivo": "prim_div_mur.json", "jornadas": 18},
    {"nombre": "Segunda División A Murcia", "id": 93, "archivo": "seg_div_murA.json", "jornadas": 9},
    {"nombre": "Segunda División B Murcia", "id": 95, "archivo": "seg_div_murB.json", "jornadas": 9},
    {"nombre": "Tercera División A Murcia", "id": 94, "archivo": "ter_div_murA.json", "jornadas": 9},
    {"nombre": "Tercera División B Murcia", "id": 96, "archivo": "ter_div_murB.json", "jornadas": 9},
    {"nombre": "Cuarta División Murcia", "id": 97, "archivo": "cuar_div_mur.json", "jornadas": 9},
    {"nombre": "Primera División Granada", "id": 98, "archivo": "prim_div_gra.json", "jornadas": 9},
    {"nombre": "Segunda División Granada", "id": 99, "archivo": "seg_div_gra.json", "jornadas": 9},
    {"nombre": "Liga Veteranos (+35) Granada", "id": 87, "archivo": "veteranos_gra.json", "jornadas": 14}
]

for comp in competiciones:
    print(f"\n========================================")
    print(f"Iniciando scraping de {comp['nombre']}...")
    print(f"========================================")
    todos_los_partidos = []

    # Iteramos las jornadas según la competición
    for jornada in range(int(comp["jornadas"])):
        url = f"https://minifootballleagues.com/tournaments/{comp['id']}?tab=calendar&stage=0&journey={jornada}"
        print(f"Scrapeando Jornada {jornada + 1} de {comp['jornadas']}...")

        # Le decimos al navegador que abra la URL
        driver.get(url)

        try:
            # ESPERA INTELIGENTE: Esperamos hasta 10 segundos a que aparezca al menos un partido en pantalla
            # Buscamos que cargue la clase que contiene 'styles_containerMatch'
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'styles_containerMatch')]"))
            )
            # Le damos un segundito extra de margen para que renderice los textos internos
            time.sleep(1)

        except Exception as e:
            print(f"  Aviso: No se encontraron partidos o la jornada {jornada + 1} tardó mucho en cargar.")
            continue  # Si falla, saltamos a la siguiente jornada

        # --- EXTRACCIÓN CON BEAUTIFULSOUP ---
        # Ahora sí, extraemos el HTML final con todo el JavaScript ya ejecutado
        html_renderizado = driver.page_source
        soup = BeautifulSoup(html_renderizado, 'html.parser')

        # Buscamos las filas de los partidos (usando la misma lógica de lambda que antes)
        filas_partidos = soup.find_all('div', class_=lambda c: c and 'styles_containerMatch' in c)

        for fila in filas_partidos:
            try:
                # 1. Extraer nombre del equipo local
                elemento_local = fila.find('p', class_=lambda c: c and 'styles_teamNameLeft' in c)
                equipo_local = elemento_local.text.strip() if elemento_local else "Desconocido"
                
                # 1.1 Extraer el logo local
                container_local = fila.find('div', class_=lambda c: c and 'styles_teamContainerLeft' in c)
                img_local = container_local.find('img', class_=lambda c: c and 'styles_teamLogo' in c) if container_local else None
                escudo_local = img_local['src'] if img_local and 'src' in img_local.attrs else ""
                if escudo_local.startswith('/'):
                    escudo_local = f"https://minifootballleagues.com{escudo_local}"

                # 2. Extraer nombre del equipo visitante
                elemento_visitante = fila.find('p', class_=lambda c: c and 'styles_teamNameRight' in c)
                equipo_visitante = elemento_visitante.text.strip() if elemento_visitante else "Desconocido"

                # 2.1 Extraer el logo visitante
                container_visitante = fila.find('div', class_=lambda c: c and 'styles_teamContainerRight' in c)
                img_visitante = container_visitante.find('img', class_=lambda c: c and 'styles_teamLogo' in c) if container_visitante else None
                escudo_visitante = img_visitante['src'] if img_visitante and 'src' in img_visitante.attrs else ""
                if escudo_visitante.startswith('/'):
                    escudo_visitante = f"https://minifootballleagues.com{escudo_visitante}"

                # 3. Extraer el resultado
                elemento_resultado = fila.find('p', class_=lambda c: c and 'styles_text' in c)
                resultado_texto = elemento_resultado.text.strip() if elemento_resultado else ""

                if '-' in resultado_texto:
                    goles = resultado_texto.split('-')
                    try:
                        goles_local = int(goles[0].strip())
                        goles_visitante = int(goles[1].strip())
                    except ValueError:
                        # Si el texto entre los guiones está vacío o no es numérico (ej: " - "), 
                        # ignoramos y pasamos al siguiente partido (probablemente no se ha jugado)
                        continue

                    partido = {
                        "jornada": jornada + 1,
                        "equipo_local": equipo_local.title(),
                        "escudo_local": escudo_local,
                        "equipo_visitante": equipo_visitante.title(),
                        "escudo_visitante": escudo_visitante,
                        "goles_local": goles_local,
                        "goles_visitante": goles_visitante
                    }

                    todos_los_partidos.append(partido)

            except Exception as e:
                print(f"  Error procesando un partido: {e}")

    # --- GUARDAR LOS PARTIDOS ---
    os.makedirs('jsons', exist_ok=True)
    ruta_partidos = os.path.join('jsons', str(comp["archivo"]))
    with open(ruta_partidos, 'w', encoding='utf-8') as archivo_json:
        json.dump(todos_los_partidos, archivo_json, ensure_ascii=False, indent=4)
    print(f"¡Partidos de {comp['nombre']} completados! Guardado en '{ruta_partidos}'.")

    # --- SCRAPING DE GOLEADORES ---
    print(f"Scrapeando ránkings de goleadores para {comp['nombre']}...")
    url_stats = f"https://minifootballleagues.com/tournaments/{comp['id']}?tab=playersranking&stage=0&rankingFilter1=0&rankingFilter2=0"
    driver.get(url_stats)
    
    goleadores = []
    try:
        # Esperamos a que cargue la tabla o el card
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'Ranking_playerName') or contains(@class, 'Ranking_text')]"))
        )
        time.sleep(2)
        
        soup_stats = BeautifulSoup(driver.page_source, 'html.parser')
        
        # 1. Jugador #1 (Tarjeta especial arriba)
        top_card = soup_stats.find('div', class_=lambda c: c and 'Ranking_topRankingHeaderContainer' in c)
        if top_card:
            try:
                nombre_elem = top_card.find('p', class_=lambda c: c and 'Ranking_playerName' in c)
                goles_elem = top_card.find('p', class_=lambda c: c and 'Ranking_dorsal' in c)
                
                # Imagen
                img_elem = top_card.find('img', class_=lambda c: c and 'Avatar_img' in c)
                avatar_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                if avatar_url.startswith('/'):
                    avatar_url = f"https://minifootballleagues.com{avatar_url}"
                
                # Equipo: Buscamos un p hermano o hijo del contenedor que no sea el nombre
                # O buscamos cualquier enlace de equipo
                equipo_elem = None
                links = top_card.find_all('a', href=lambda h: h and '/teams/' in h)
                # El enlace suele ser /tournaments/X/teams/Y/players/Z, pero a veces hay un link de equipo puro
                # Si no, buscamos el texto del equipo
                equipo_nombre = "Desconocido"
                for link in links:
                    txt = link.get_text(strip=True)
                    if txt and txt != nombre_elem.get_text(strip=True):
                        equipo_nombre = txt
                        break
                
                if nombre_elem and goles_elem:
                    goleadores.append({
                        "nombre": nombre_elem.get_text(strip=True),
                        "equipo": equipo_nombre,
                        "goles": int(goles_elem.get_text(strip=True)) if goles_elem.get_text(strip=True).isdigit() else 0,
                        "avatar": avatar_url
                    })
            except Exception as e:
                print(f"  Error en Top #1: {e}")

        # 2. Jugadores #2 en adelante (Tabla)
        filas = soup_stats.find_all('tr', class_=lambda c: c and 'DataTable_dataTableRow' in c)
        for fila in filas:
            try:
                tds = fila.find_all('td')
                if len(tds) >= 5:
                    # Celda 2: Jugador (img + p)
                    nombre_elem = tds[1].find('p', class_=lambda c: c and 'Ranking_text' in c)
                    img_elem = tds[1].find('img')
                    
                    # Celda 3: Equipo
                    equipo_elem = tds[2].find('p') or tds[2]
                    
                    # Celda 5: Goles (index 4)
                    goles_val = tds[4].get_text(strip=True)
                    
                    if nombre_elem and goles_val.isdigit():
                        avatar_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                        if avatar_url.startswith('/'):
                            avatar_url = f"https://minifootballleagues.com{avatar_url}"
                            
                        goleadores.append({
                            "nombre": nombre_elem.get_text(strip=True),
                            "equipo": equipo_elem.get_text(strip=True),
                            "goles": int(goles_val),
                            "avatar": avatar_url
                        })
            except Exception as e:
                continue

    except Exception as e:
        print(f"  Aviso: No se pudieron cargar las estadísticas de goleadores: {e}")

    # Guardar estadísticas
    os.makedirs(os.path.join('jsons', 'stats'), exist_ok=True)
    nombre_stats = comp["archivo"].replace(".json", "_stats.json")
    ruta_stats = os.path.join('jsons', 'stats', nombre_stats)
    with open(ruta_stats, 'w', encoding='utf-8') as f:
        json.dump(goleadores, f, ensure_ascii=False, indent=4)
    print(f"¡Goleadores de {comp['nombre']} completados! ({len(goleadores)} encontrados)")

# Cerramos el navegador para liberar memoria
driver.quit()
print("\n¡Todo el scraping completado con éxito!")