import "../styles/menustyle.css";
import "./documentation.css";
import AsideMenu from "../../components/asideMenu/aside";

const Documentation = () => {
  return (
    <div className="vh-100 img-fondo2 rules-page">
      <div className="row w-100 h-100 m-0">
        <div className="col-xl-2 col-md-1 col-12 px-0 d-flex">
          <aside className="menuLateral">
            <AsideMenu />
          </aside>
        </div>

        <div className="col-xl-10 col-md-11 col-12 rules-main">
          <section className="rules-content">
            <header className="rules-hero">
              <p className="rules-kicker">ChessTeacher</p>
              <h1 className="rules-title">Que incluye:</h1>
              <p className="rules-subtitle">
                ChessTeacher es una web de aprendizaje de ajedrez con el mejor motor del mundo,
                analisis de posiciones y gestion de partidas en full-stack.
              </p>

              <div className="rules-stack">
                <span>Frontend: React + Vite</span>
                <span>Backend: Node + Express</span>
                <span>Base de Datos: MongoDB</span>
                <span>Motor: Stockfish</span>
              </div>
            </header>

            <section className="rules-block">
              <h2>Sinopsis</h2>
              <p>
                La app permite jugar contra Stockfish con dificultad configurable, guardar partidas
                vinculadas al usuario, revisarlas desde historial, importarlas y exportarlas en PGN,
                y navegar a la vista de analisis con evaluacion de movimientos.
              </p>
            </section>

            <section className="rules-block">
              <h2>Puntos fuertes</h2>
              <div className="rules-strengths-grid">
                <article className="strength-card">
                  <h3>Arquitectura Full-Stack</h3>
                  <p>
                    El proyecto separa frontend y backend con responsabilidades bien definidas,
                    lo que facilita escalar sin afecte a toda la aplicacion.
                  </p>
                </article>

                <article className="strength-card">
                  <h3>Integracion Real con Stockfish</h3>
                  <p>
                    La app permite jugar contra la IA Stockfish con niveles de dificultad y calcular evaluaciones
                    de posicion para entrenar.
                  </p>
                </article>

                <article className="strength-card">
                  <h3>Ciclo Completo de Partidas</h3>
                  <p>
                    Puedes jugar, guardar, consultar historial, borrar y volver a analizar partidas
                    guardadas desde un mismo sitio.
                  </p>
                </article>

                <article className="strength-card">
                  <h3>Compatible con el formato PGN</h3>
                  <p>
                    Incluye utilidades de importacion y exportacion PGN para trabajar con estandares
                    compatibles con otras herramientas de ajedrez.
                  </p>
                </article>

                <article className="strength-card">
                  <h3>Base de Seguridad Funcional</h3>
                  <p>
                    Autenticacion con JWT, proteccion de endpoints y token persistente en cliente
                    para un flujo de usuario autenticado.
                  </p>
                </article>

                <article className="strength-card">
                  <h3>UX Enfocada en Aprendizaje</h3>
                  <p>
                    Barra de ventaja, historial de jugadas y controles de navegacion por movimientos
                    para revisar la calidad los movimientos.
                  </p>
                </article>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Documentation;