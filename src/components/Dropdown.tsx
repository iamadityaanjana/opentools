import { useEffect, useRef, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface Option {
  value: string;
  label: string;
}

export interface OptionGroup {
  label: string;
  options: Option[];
}

/** Custom styled select — replaces the native browser dropdown. */
export function Dropdown({
  value,
  options,
  groups,
  onChange,
  ariaLabel,
}: {
  value: string;
  options?: Option[];
  groups?: OptionGroup[];
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const flat = options ?? (groups ? groups.flatMap((g) => g.options) : []);
  const selected = flat.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className={`dd ${open ? 'dd--open' : ''}`} ref={ref}>
      <button type="button" className="dd__btn" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="dd__value">{selected?.label ?? 'Select'}</span>
        <CaretDown size={13} weight="bold" className="dd__caret" />
      </button>
      {open && (
        <ul className="dd__menu" role="listbox">
          {groups
            ? groups.map((g) => (
              <li key={g.label} className="dd__group">
                <div className="dd__grouphead">{g.label}</div>
                <ul>
                  {g.options.map((o) => <Opt key={o.value} o={o} value={value} onPick={(v) => { onChange(v); setOpen(false); }} />)}
                </ul>
              </li>
            ))
            : flat.map((o) => <Opt key={o.value} o={o} value={value} onPick={(v) => { onChange(v); setOpen(false); }} />)}
        </ul>
      )}
    </div>
  );
}

function Opt({ o, value, onPick }: { o: Option; value: string; onPick: (v: string) => void }) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={o.value === value}
        className={`dd__opt ${o.value === value ? 'is-active' : ''}`}
        onClick={() => onPick(o.value)}
      >
        <span>{o.label}</span>
        {o.value === value && <Check size={13} weight="bold" />}
      </button>
    </li>
  );
}
