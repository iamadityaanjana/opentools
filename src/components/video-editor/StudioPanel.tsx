'use client';

import {
  FilmStrip, Image as ImageIcon, Stack, TextT,
} from '@phosphor-icons/react';
import type { EditorProject, TextLayer, ImageLayer, Selection, VideoClip } from '../../lib/videoEditor/types';
import { VIDEO_TRACK_IDS } from '../../lib/videoEditor/types';
import { videoTrackLabel } from '../../lib/videoEditor/tracks';
import { EASING_PRESETS, speedCurvePath } from '../../lib/videoEditor/speed';
import type { SpeedEasing } from '../../lib/videoEditor/speed';
import { fmtShort } from '../../lib/videoEditor/utils';

const COLORS = ['#ffffff', '#000000', '#facc15', '#ef4444', '#3b82f6', '#22c55e'];
const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4];

const SIDEBAR_TABS = [
  { id: 'layers' as const, label: 'Layers', icon: Stack },
  { id: 'clip' as const, label: 'Clip', icon: FilmStrip },
  { id: 'text' as const, label: 'Text', icon: TextT },
  { id: 'overlay' as const, label: 'Overlay', icon: ImageIcon },
];

interface StudioPanelProps {
  tab: 'layers' | 'clip' | 'text' | 'overlay';
  setTab: (t: 'layers' | 'clip' | 'text' | 'overlay') => void;
  project: EditorProject;
  selectedClip: VideoClip | null;
  selectedText: TextLayer | null;
  selectedImage: ImageLayer | null;
  onSelect: (sel: Selection) => void;
  onUpdateClip: (id: string, patch: Partial<Pick<VideoClip, 'speedStart' | 'speedEnd' | 'easing'>>) => void;
  onUpdateText: (id: string, patch: Partial<TextLayer>) => void;
  onUpdateImage: (id: string, patch: Partial<ImageLayer>) => void;
  onToggleMute: (trackId: string) => void;
  onToggleVisible: (trackId: string) => void;
  onAddToTrack: (trackId: string) => void;
}

export function StudioPanel({
  tab, setTab, project, selectedClip, selectedText, selectedImage,
  onSelect, onUpdateClip, onUpdateText, onUpdateImage, onToggleMute, onToggleVisible, onAddToTrack,
}: StudioPanelProps) {
  return (
    <aside className="ve-sidebar vstudio-sidebar">
      <nav className="vstudio-sidebar__nav" aria-label="Editor options">
        {SIDEBAR_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`vstudio-sidebar__nav-btn${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
            title={label}
          >
            <Icon size={20} weight={tab === id ? 'fill' : 'regular'} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="vstudio-sidebar__content">
        <h3 className="vstudio-sidebar__title">
          {SIDEBAR_TABS.find((t) => t.id === tab)?.label}
        </h3>

        <div className="vstudio-sidebar__body">
        {tab === 'layers' && (
          <div className="vstudio-layers">
            <p className="vstudio-panel__hint">
              Top timeline row (Video 1) stacks above Video 2. Drag clips between rows to change layering.
            </p>
            <div className="vstudio-stack-legend" aria-hidden>
              <div className="vstudio-stack-legend__row vstudio-stack-legend__row--top">Video 1 — top layer</div>
              <div className="vstudio-stack-legend__row">Video 2 — under Video 1</div>
            </div>
            {project.tracks.map((tr) => (
              <div key={tr.id} className="vstudio-layer-row">
                <span className="vstudio-layer-row__name">
                  {VIDEO_TRACK_IDS.includes(tr.id as typeof VIDEO_TRACK_IDS[number])
                    ? videoTrackLabel(tr.id as typeof VIDEO_TRACK_IDS[number])
                    : tr.name}
                </span>
                <div className="vstudio-layer-row__actions">
                  {VIDEO_TRACK_IDS.includes(tr.id as typeof VIDEO_TRACK_IDS[number]) && (
                    <>
                      <button type="button" className="btn btn--sm" onClick={() => onAddToTrack(tr.id)}>
                        + Video
                      </button>
                      <button type="button" className="btn btn--sm" onClick={() => onToggleVisible(tr.id)}>
                        {tr.visible ? 'Hide' : 'Show'}
                      </button>
                    </>
                  )}
                  {tr.type === 'audio' && (
                    <button type="button" className="btn btn--sm" onClick={() => onToggleMute(tr.id)}>
                      {tr.muted ? 'Unmute' : 'Mute'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <hr className="vstudio-divider" />
            {project.clips.map((c) => {
              const asset = project.assets.find((a) => a.id === c.assetId);
              const track = project.tracks.find((t) => t.id === c.trackId);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`vstudio-layer-item${project.selection?.kind === 'clip' && project.selection.id === c.id ? ' is-selected' : ''}`}
                  onClick={() => onSelect({ kind: 'clip', id: c.id })}
                >
                  <span>{asset?.name ?? 'Clip'} · {track?.name ?? 'Track'}</span>
                  <span className="muted">{fmtShort(c.start)} – {fmtShort(c.start + c.duration)}</span>
                </button>
              );
            })}
            {project.textLayers.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`vstudio-layer-item${project.selection?.kind === 'text' && project.selection.id === t.id ? ' is-selected' : ''}`}
                onClick={() => onSelect({ kind: 'text', id: t.id })}
              >
                <span>Text: {t.text.slice(0, 20)}</span>
              </button>
            ))}
            {project.imageLayers.map((im) => {
              const asset = project.assets.find((a) => a.id === im.assetId);
              return (
                <button
                  key={im.id}
                  type="button"
                  className={`vstudio-layer-item${project.selection?.kind === 'image' && project.selection.id === im.id ? ' is-selected' : ''}`}
                  onClick={() => onSelect({ kind: 'image', id: im.id })}
                >
                  <span>Image: {asset?.name ?? 'overlay'}</span>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'clip' && (
          <div className="vstudio-form">
            {!selectedClip ? (
              <p className="vstudio-panel__hint">Select a video clip on the timeline to adjust speed and easing.</p>
            ) : (
              <>
                <div className="vstudio-speed-preview">
                  <svg viewBox="0 0 120 48" className="vstudio-speed-preview__svg" aria-hidden>
                    <path
                      d={speedCurvePath(selectedClip.speedStart, selectedClip.speedEnd, selectedClip.easing)}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <line x1="0" y1="24" x2="120" y2="24" stroke="#ddd" strokeDasharray="3 3" />
                  </svg>
                  <span className="vstudio-speed-preview__label">Speed curve</span>
                </div>

                <label className="field">
                  <span className="field__label">Start speed — {selectedClip.speedStart.toFixed(2)}×</span>
                  <input type="range" min={0.25} max={4} step={0.05} value={selectedClip.speedStart}
                    onChange={(e) => onUpdateClip(selectedClip.id, { speedStart: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">End speed — {selectedClip.speedEnd.toFixed(2)}×</span>
                  <input type="range" min={0.25} max={4} step={0.05} value={selectedClip.speedEnd}
                    onChange={(e) => onUpdateClip(selectedClip.id, { speedEnd: Number(e.target.value) })} />
                </label>

                <div className="vstudio-speed-presets">
                  {SPEED_PRESETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn--sm${selectedClip.speedStart === s && selectedClip.speedEnd === s ? ' btn--dark' : ''}`}
                      onClick={() => onUpdateClip(selectedClip.id, { speedStart: s, speedEnd: s })}
                    >
                      {s}×
                    </button>
                  ))}
                </div>

                <div className="field">
                  <span className="field__label">Easing curve</span>
                  <div className="vstudio-easing-grid">
                    {(Object.keys(EASING_PRESETS) as SpeedEasing[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`vstudio-easing-btn${selectedClip.easing === key ? ' is-active' : ''}`}
                        onClick={() => onUpdateClip(selectedClip.id, { easing: key })}
                      >
                        <svg viewBox="0 0 40 24" aria-hidden>
                          <path
                            d={speedCurvePath(0.25, 2, key, 40, 24)}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <span>{EASING_PRESETS[key].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'text' && (
          <div className="vstudio-form">
            {!selectedText ? (
              <p className="vstudio-panel__hint">Select a text layer or click <strong>Text</strong> in the toolbar. Drag edge handles on the timeline to adjust duration.</p>
            ) : (
              <>
                <label className="field">
                  <span className="field__label">Content</span>
                  <input className="select" value={selectedText.text}
                    onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })} />
                </label>
                <label className="field">
                  <span className="field__label">Size — {selectedText.fontSize}px</span>
                  <input type="range" min={24} max={200} value={selectedText.fontSize}
                    onChange={(e) => onUpdateText(selectedText.id, { fontSize: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">Duration — {(selectedText.end - selectedText.start).toFixed(1)}s</span>
                  <input
                    type="range"
                    min={0.3}
                    max={Math.max(30, project.duration)}
                    step={0.1}
                    value={selectedText.end - selectedText.start}
                    onChange={(e) => onUpdateText(selectedText.id, { end: selectedText.start + Number(e.target.value) })}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Start (s)</span>
                  <input className="select" type="number" min={0} step={0.1} value={Number(selectedText.start.toFixed(2))}
                    onChange={(e) => onUpdateText(selectedText.id, { start: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">End (s)</span>
                  <input className="select" type="number" min={0} step={0.1} value={Number(selectedText.end.toFixed(2))}
                    onChange={(e) => onUpdateText(selectedText.id, { end: Number(e.target.value) })} />
                </label>
                <div className="field">
                  <span className="field__label">Color</span>
                  <div className="vstudio-colors">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`vstudio-swatch${selectedText.color === c ? ' is-active' : ''}`}
                        style={{ background: c }}
                        onClick={() => onUpdateText(selectedText.id, { color: c })}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'overlay' && (
          <div className="vstudio-form">
            {!selectedImage ? (
              <p className="vstudio-panel__hint">Click <strong>Overlay</strong> to add an image, then drag it anywhere on the video preview.</p>
            ) : (
              <>
                <label className="field">
                  <span className="field__label">Position X — {Math.round(selectedImage.x)}%</span>
                  <input type="range" min={0} max={Math.max(0, 100 - selectedImage.width)} value={selectedImage.x}
                    onChange={(e) => onUpdateImage(selectedImage.id, { x: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">Position Y — {Math.round(selectedImage.y)}%</span>
                  <input type="range" min={0} max={100} value={selectedImage.y}
                    onChange={(e) => onUpdateImage(selectedImage.id, { y: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">Width — {selectedImage.width}%</span>
                  <input type="range" min={5} max={80} value={selectedImage.width}
                    onChange={(e) => onUpdateImage(selectedImage.id, { width: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">Opacity — {Math.round(selectedImage.opacity * 100)}%</span>
                  <input type="range" min={0.1} max={1} step={0.05} value={selectedImage.opacity}
                    onChange={(e) => onUpdateImage(selectedImage.id, { opacity: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">Duration — {(selectedImage.end - selectedImage.start).toFixed(1)}s</span>
                  <input
                    type="range"
                    min={0.3}
                    max={Math.max(30, project.duration)}
                    step={0.1}
                    value={selectedImage.end - selectedImage.start}
                    onChange={(e) => onUpdateImage(selectedImage.id, { end: selectedImage.start + Number(e.target.value) })}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Start (s)</span>
                  <input className="select" type="number" min={0} step={0.1} value={Number(selectedImage.start.toFixed(2))}
                    onChange={(e) => onUpdateImage(selectedImage.id, { start: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field__label">End (s)</span>
                  <input className="select" type="number" min={0} step={0.1} value={Number(selectedImage.end.toFixed(2))}
                    onChange={(e) => onUpdateImage(selectedImage.id, { end: Number(e.target.value) })} />
                </label>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </aside>
  );
}
