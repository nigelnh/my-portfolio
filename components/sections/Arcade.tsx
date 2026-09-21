"use client";

import { useCallback, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { armAudio } from "@/lib/sfx";
import { BLOB_ANIM, BlobSprite } from "../blob/sprites";
import { FaintBlob, FOODS, FoodSprite, type FoodType } from "../game/sprites";
import { BLOB, useFeedGame, WIN_SCORE } from "../game/useFeedGame";
import { Panel } from "../Panel";

const LEGEND: FoodType[] = ["boba", "donut", "coffee"];

const pad = (n: number) => (n >= 0 && n < 10 ? `0${n}` : `${n}`);
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/**
 * "Feed The Blob" — the kit's arcade cabinet, rebuilt as a section.
 *
 * Nothing moves until the visitor presses START, so the page stays still for
 * anyone who scrolls past.
 */
export function Arcade() {
  const { t } = useLang();
  const g = t.game;
  const arenaRef = useRef<HTMLDivElement>(null);
  const game = useFeedGame(arenaRef);

  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string, ms: number) => {
    setFlash(text);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), ms);
  }, []);

  const playing = game.phase === "playing";

  const begin = () => {
    armAudio();
    game.start();
    say(g.greeting, 2800);
  };

  const onArenaDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playing) return;
    if (game.drop(e.clientX, e.clientY) === "too-low") say(g.tooLow, 1600);
  };

  return (
    <section id="arcade" className="section">
      <Panel title={g.label}>
        <div className="arcade">
          <div className="arcade__head">
            <div className="arcade__intro">
              <span className="arcade__kicker">{g.kicker}</span>
              <h3 className="h3">{g.title}</h3>
              <p className="muted">{g.rules}</p>
              <p className="arcade__warn">{g.warn}</p>
            </div>
            <button
              type="button"
              className="arcade__start"
              data-stop={playing}
              onClick={playing ? game.quit : begin}
            >
              {playing ? g.stop : g.start}
            </button>
          </div>

          <ul className="arcade__legend">
            {LEGEND.map((type) => (
              <li key={type} className="arcade__legend-item" data-kind={type}>
                <FoodSprite type={type} scale={0.7} />
                <span className="arcade__legend-name">{g.food[type]}</span>
                <span className="arcade__legend-pts">
                  {signed(FOODS[type].points)} {g.pts}
                </span>
              </li>
            ))}
          </ul>

          <div className="arcade__cabinet">
            <div className="arcade__hud">
              <span className="arcade__stat">
                {g.score}
                <b className="arcade__score">{pad(game.score)}</b>
              </span>
              <span className="arcade__target">
                {g.goal} ≥ {WIN_SCORE}
              </span>
              <span className="arcade__stat">
                {g.time}
                <b className="arcade__clock" data-low={game.timeLeft <= 5}>
                  {game.timeLeft}s
                </b>
              </span>
            </div>

            <div
              ref={arenaRef}
              className="arcade__arena"
              data-playing={playing}
              onPointerDown={onArenaDown}
            >
              <div className="arcade__zone" aria-hidden="true">
                {playing ? <span className="arcade__zone-hint">{g.dropHint}</span> : null}
              </div>

              {game.items.map((item) => (
                <div key={item.id} ref={game.bindItem(item.id)} className="arcade__food">
                  <FoodSprite type={item.type} />
                </div>
              ))}

              {game.floats.map((f) => (
                <span
                  key={f.id}
                  className="arcade__float"
                  style={{ left: `${f.x}px`, top: `${f.y}px`, color: f.tint }}
                >
                  {f.text}
                </span>
              ))}

              {/* Hidden between rounds: the overlays carry their own blob. */}
              <div
                className="fg-blob arcade__blob"
                hidden={!playing}
                style={{
                  left: `${Math.round(game.blob.x)}px`,
                  bottom: `${BLOB.floor}px`,
                  transition: `left ${game.hopDuration}ms cubic-bezier(0.28, 0.84, 0.42, 1)`,
                }}
              >
                {flash && playing ? <p className="arcade__bubble">{flash}</p> : null}
                <span
                  className={`blob-flip${game.blob.facingLeft ? " blob-flip--left" : ""}`}
                >
                  <BlobSprite
                    key={game.blob.hopping ? `hop-${game.blob.hopId}` : `rest-${game.mood}`}
                    state={game.mood}
                    size={BLOB.w}
                    className={`pixel-blob ${
                      game.blob.hopping ? "anim-single-hop" : BLOB_ANIM[game.mood]
                    }`}
                    style={
                      game.blob.hopping
                        ? { animationDuration: `${game.hopDuration}ms` }
                        : undefined
                    }
                  />
                </span>
              </div>

              {game.phase === "intro" ? (
                <div className="arcade__overlay">
                  <BlobSprite state="idle" size={64} className="pixel-blob anim-idle" />
                  <h4 className="arcade__overlay-title">{g.introTitle}</h4>
                  <p className="arcade__overlay-text">{g.introText}</p>
                  <button type="button" className="arcade__start" onClick={begin}>
                    {g.start}
                  </button>
                </div>
              ) : null}

              {game.phase === "won" ? (
                <div className="arcade__overlay" data-tone="win">
                  <BlobSprite state="boba" size={80} className="pixel-blob anim-boba" />
                  <p className="arcade__overlay-quote">{g.wonLine}</p>
                  <h4 className="arcade__overlay-title" data-tone="win">
                    {g.wonTitle}
                  </h4>
                  <p className="arcade__overlay-text">
                    {g.finalScore}: {game.score} {g.pts}
                  </p>
                  <button type="button" className="arcade__start" onClick={begin}>
                    {g.again}
                  </button>
                </div>
              ) : null}

              {game.phase === "lost" ? (
                <div className="arcade__overlay" data-tone="lose">
                  <FaintBlob size={84} />
                  <p className="arcade__overlay-quote">{g.lostLine}</p>
                  <h4 className="arcade__overlay-title" data-tone="lose">
                    {g.lostTitle}
                  </h4>
                  <p className="arcade__overlay-text">
                    {g.finalScore}: {game.score} {g.pts}
                  </p>
                  <button type="button" className="arcade__start" onClick={begin}>
                    {g.again}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
