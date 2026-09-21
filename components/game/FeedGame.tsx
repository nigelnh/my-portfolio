"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import { BLOB_ANIM, BlobSprite } from "../blob/sprites";
import { FaintBlob, FOODS, FoodSprite, type FoodType } from "./sprites";
import { BLOB, useFeedGame, WIN_SCORE } from "./useFeedGame";

const LEGEND: FoodType[] = ["boba", "donut", "coffee"];

const pad = (n: number) => (n >= 0 && n < 10 ? `0${n}` : `${n}`);
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/**
 * "Feed The Blob" — snacks rain down the arena and you drag Blob along the
 * floor to catch the good ones. Nothing moves until START is pressed, so the
 * page stays still for anyone scrolling past.
 */
export function FeedGame() {
  const { t } = useLang();
  const g = t.game;
  const arenaRef = useRef<HTMLDivElement>(null);
  const game = useFeedGame(arenaRef);

  const playing = game.phase === "playing";

  return (
    <div className="arcade">
      <div className="arcade__intro">
        <span className="arcade__kicker">{g.kicker}</span>
        <h3 className="h3">{g.title}</h3>
        <p className="muted">{g.rules}</p>
        <p className="arcade__warn">{g.warn}</p>
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
            <b className="arcade__clock" data-low={game.timeLeft <= 10}>
              {game.timeLeft}s
            </b>
          </span>
        </div>

        <div ref={arenaRef} className="arcade__arena" data-playing={playing}>
          {playing ? <span className="arcade__zone-hint">{g.dragHint}</span> : null}

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
            data-held={game.held}
            style={{ left: `${Math.round(game.blobX)}px`, bottom: `${BLOB.floor}px` }}
            onPointerDown={game.onGrab}
            onPointerMove={game.onDrag}
            onPointerUp={game.onRelease}
            onPointerCancel={game.onRelease}
            role="slider"
            aria-label={g.dragHint}
            aria-valuemin={0}
            aria-valuenow={Math.round(game.blobX)}
            aria-valuemax={arenaRef.current ? arenaRef.current.clientWidth - BLOB.w : 0}
            tabIndex={playing ? 0 : -1}
          >
            <BlobSprite
              // Re-keying on the landing counter replays the impact squash.
              key={`land-${game.landing}-${game.mood}`}
              state={game.mood}
              size={BLOB.w}
              className={`pixel-blob ${
                game.held ? "anim-dangle" : game.landing ? "anim-impact" : BLOB_ANIM[game.mood]
              }`}
            />
          </div>

          {game.phase === "intro" ? (
            <div className="arcade__overlay">
              <BlobSprite state="idle" size={64} className="pixel-blob anim-idle" />
              <h4 className="arcade__overlay-title">{g.introTitle}</h4>
              <p className="arcade__overlay-text">{g.introText}</p>
              <button type="button" className="arcade__start" onClick={game.start}>
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
              <button type="button" className="arcade__start" onClick={game.start}>
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
              <button type="button" className="arcade__start" onClick={game.start}>
                {g.again}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
