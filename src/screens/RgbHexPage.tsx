'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Swatches, Copy, Check, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { ToolEditorial } from '../components/ToolEditorial';
import {
  type RGB,
  type HSL,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  normalizeRgb,
  rgbToString,
  hslToString,
  contrastText,
} from '../lib/color';

function CopyChip({ label, value, onCopy }: { label: string; value: string; onCopy?: (label: string) => void }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
    onCopy?.(label);
  };
  return (
    <button className="copychip" onClick={copy} title={`Copy ${label}`}>
      <span className="copychip__label">{label}</span>
      <span className="copychip__value">{value}</span>
      <span className="copychip__icon">{done ? <Check size={13} weight="bold" /> : <Copy size={13} />}</span>
    </button>
  );
}

// A labelled numeric input constrained to [min, max].
function NumField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="select"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          onChange(Math.min(max, Math.max(min, Math.round(n))));
        }}
      />
    </label>
  );
}

export default function RgbHexPage({ children }: { children?: ReactNode }) {
  const posthog = usePostHog();
  // RGB is the single source of truth; HEX & HSL derive from it.
  const [rgb, setRgb] = useState<RGB>({ r: 79, g: 70, b: 229 });
  const [hexInput, setHexInput] = useState<string>('#4F46E5');
  const [hexValid, setHexValid] = useState(true);

  const hex = useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const textColor = useMemo(() => contrastText(rgb), [rgb]);

  const applyRgb = useCallback((next: RGB) => {
    const n = normalizeRgb(next);
    setRgb(n);
    setHexInput(rgbToHex(n));
    setHexValid(true);
  }, []);

  const onHexChange = useCallback((raw: string) => {
    setHexInput(raw);
    const parsed = hexToRgb(raw);
    if (parsed) {
      setRgb(parsed);
      setHexValid(true);
    } else {
      setHexValid(false);
    }
  }, []);

  const onHsl = useCallback(
    (patch: Partial<HSL>) => {
      applyRgb(hslToRgb({ ...hsl, ...patch }));
    },
    [hsl, applyRgb],
  );

  const handleCopy = useCallback((format: string) => {
    posthog?.capture('color_value_copied', { format });
  }, [posthog]);

  return (
    <div className="page page--tool">
      <TopNav />
      <main>

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" href="/image">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Color Tools</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">RGB ↔ HEX Converter</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><Swatches size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">RGB ↔ HEX Converter</h1>
          <p className="tool-desc">Convert between HEX, RGB and HSL with a live preview directly in your browser.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> Local calculation</span>
      </div>

      <div className="colorconv">
        <div
          className="colorconv__preview"
          style={{ background: hex, color: textColor }}
        >
          <span className="colorconv__preview-hex">{hex}</span>
          <span className="colorconv__preview-sub">{rgbToString(rgb)} · {hslToString(hsl)}</span>
        </div>

        <div className="colorconv__panel">
          <div className="colorconv__group">
            <div className="colorconv__group-head">HEX</div>
            <label className="field field--grow">
              <span className="field__label">Hex code</span>
              <input
                className={`select colorconv__hexinput ${hexValid ? '' : 'is-invalid'}`}
                type="text"
                value={hexInput}
                spellCheck={false}
                placeholder="#4F46E5"
                onChange={(e) => onHexChange(e.target.value)}
              />
              {!hexValid && <span className="colorconv__err">Enter a valid hex like #4F46E5</span>}
            </label>
            <label className="field">
              <span className="field__label">Native picker</span>
              <input
                className="color-input"
                type="color"
                value={hex}
                onChange={(e) => onHexChange(e.target.value)}
              />
            </label>
          </div>

          <div className="colorconv__group">
            <div className="colorconv__group-head">RGB</div>
            <div className="colorconv__row">
              <NumField label="R" value={rgb.r} min={0} max={255} onChange={(r) => applyRgb({ ...rgb, r })} />
              <NumField label="G" value={rgb.g} min={0} max={255} onChange={(g) => applyRgb({ ...rgb, g })} />
              <NumField label="B" value={rgb.b} min={0} max={255} onChange={(b) => applyRgb({ ...rgb, b })} />
            </div>
          </div>

          <div className="colorconv__group">
            <div className="colorconv__group-head">HSL</div>
            <div className="colorconv__row">
              <NumField label="H" value={hsl.h} min={0} max={360} onChange={(h) => onHsl({ h })} />
              <NumField label="S %" value={hsl.s} min={0} max={100} onChange={(s) => onHsl({ s })} />
              <NumField label="L %" value={hsl.l} min={0} max={100} onChange={(l) => onHsl({ l })} />
            </div>
          </div>

          <div className="colorconv__group">
            <div className="colorconv__group-head">Copy</div>
            <div className="colorconv__copies">
              <CopyChip label="HEX" value={hex} onCopy={handleCopy} />
              <CopyChip label="RGB" value={rgbToString(rgb)} onCopy={handleCopy} />
              <CopyChip label="HSL" value={hslToString(hsl)} onCopy={handleCopy} />
            </div>
          </div>
        </div>
      </div>

      <div className="colorconv__foot">
        <Link className="btn btn--pill btn--icon" href="/tools/color-picker"><ArrowLeft size={15} weight="bold" /> Color Picker</Link>
      </div>

      <ToolEditorial>{children}</ToolEditorial>
      </main>
      <SiteFooter />
    </div>
  );
}
