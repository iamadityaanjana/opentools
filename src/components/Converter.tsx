import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UploadSimple,
  DownloadSimple,
  ArrowRight,
  Lightning,
  Trash,
  X,
  ImageBroken,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import {
  ENCODE_TARGETS,
  CATEGORY_LABELS,
  detectFormat,
  type FormatCategory,
} from '../formats/registry';
import { convertFile, formatBytes, type ConversionResult } from '../lib/convert';
import { StatusBadge, type JobStatus } from './StatusBadge';
import { DotsThinking } from './Thinking';
import { Dropdown } from './Dropdown';

interface Job {
  id: string;
  file: File;
  sourceLabel: string;
  previewUrl: string;
  status: JobStatus;
  result?: ConversionResult;
  error?: string;
}

const GROUPED = ENCODE_TARGETS.reduce<Record<string, typeof ENCODE_TARGETS>>((acc, f) => {
  (acc[f.category] ??= []).push(f);
  return acc;
}, {});

let idSeq = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Thumb({ job }: { job: Job }) {
  const [broken, setBroken] = useState(false);
  const src = job.result?.url ?? job.previewUrl;
  if (broken) {
    return (
      <div className="thumb thumb--fallback">
        <ImageBroken size={20} />
        <span>{job.sourceLabel}</span>
      </div>
    );
  }
  return <img className="thumb" src={src} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

export default function Converter() {
  const posthog = usePostHog();
  const [target, setTarget] = useState('webp');
  const [quality, setQuality] = useState(0.9);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLossy = ['jpeg', 'webp', 'avif', 'pdf'].includes(target);

  // Changing the target format or quality rolls already-converted images back
  // to "pending" so the user can just press Convert again on the same uploads —
  // no need to re-add the files.
  useEffect(() => {
    setJobs((prev) => prev.map((j) => {
      if (j.status !== 'success' && j.status !== 'failed') return j;
      if (j.result) URL.revokeObjectURL(j.result.url);
      return { ...j, status: 'pending', result: undefined, error: undefined };
    }));
  }, [target, quality]);

  const setJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const runJob = useCallback(
    async (job: Job, targetId: string, q: number) => {
      const fmt = detectFormat(job.file);
      if (fmt && !fmt.canDecode) {
        setJob(job.id, { status: 'unsupported', error: fmt.note ?? 'Not decodable in-browser.' });
        return;
      }
      setJob(job.id, { status: 'working', error: undefined });
      try {
        const result = await convertFile(job.file, targetId, { quality: q });
        setJob(job.id, { status: 'success', result });
      } catch (e) {
        setJob(job.id, { status: 'failed', error: e instanceof Error ? e.message : String(e) });
        posthog?.captureException(e instanceof Error ? e : new Error(String(e)), { target_format: targetId });
      }
    },
    [setJob, posthog],
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const newJobs: Job[] = Array.from(files).map((file) => {
      const fmt = detectFormat(file);
      return {
        id: `job-${idSeq++}`,
        file,
        sourceLabel: fmt?.label ?? file.name.split('.').pop()?.toUpperCase() ?? 'Unknown',
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as JobStatus,
      };
    });
    // No automatic conversion — files just wait until the user clicks Convert.
    setJobs((prev) => [...newJobs, ...prev]);
    posthog?.capture('images_added', { file_count: newJobs.length, target_format: target });
  }, [posthog, target]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const pendingCount = useMemo(() => jobs.filter((j) => j.status === 'pending').length, [jobs]);
  const doneCount = useMemo(() => jobs.filter((j) => j.result).length, [jobs]);
  const isWorking = useMemo(() => jobs.some((j) => j.status === 'working'), [jobs]);

  // Explicit conversion: convert everything that hasn't succeeded yet.
  const convertAll = useCallback(() => {
    const pending = jobs.filter((j) => j.status === 'pending' || j.status === 'failed');
    posthog?.capture('conversion_started', {
      file_count: pending.length,
      target_format: target,
      quality: Math.round(quality * 100),
    });
    pending.forEach((j) => runJob(j, target, quality));
  }, [jobs, runJob, target, quality, posthog]);

  const downloadAll = useCallback(async () => {
    const completed = jobs.filter((j) => j.result);
    posthog?.capture('image_downloaded', { file_count: completed.length, download_type: 'bulk', target_format: target });
    for (const j of completed) {
      const a = document.createElement('a');
      a.href = j.result!.url;
      a.download = j.result!.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      await sleep(150);
    }
  }, [jobs, posthog, target]);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const j = prev.find((x) => x.id === id);
      if (j) {
        URL.revokeObjectURL(j.previewUrl);
        if (j.result) URL.revokeObjectURL(j.result.url);
      }
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setJobs((prev) => {
      prev.forEach((j) => {
        URL.revokeObjectURL(j.previewUrl);
        if (j.result) URL.revokeObjectURL(j.result.url);
      });
      return [];
    });
  }, []);

  return (
    <section className="converter" id="converter">
      <div className="panel">
        <div className="converter__controls">
          <label className="field">
            <span className="field__label">Convert to</span>
            <Dropdown
              value={target}
              onChange={setTarget}
              ariaLabel="Convert to"
              groups={Object.entries(GROUPED).map(([cat, formats]) => ({
                label: CATEGORY_LABELS[cat as FormatCategory],
                options: formats.map((f) => ({ value: f.id, label: f.label })),
              }))}
            />
          </label>

          {isLossy && (
            <label className="field">
              <span className="field__label">Quality · {Math.round(quality * 100)}</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="range"
              />
            </label>
          )}

          <div className="controls__actions">
            <button
              className="btn btn--dark btn--icon"
              onClick={convertAll}
              disabled={jobs.length === 0 || isWorking || pendingCount === 0}
            >
              <Lightning size={16} weight="fill" />
              {isWorking ? 'Converting…' : `Convert${pendingCount ? ` ${pendingCount}` : ''}`}
            </button>
            {doneCount > 1 && (
              <button className="btn btn--icon" onClick={downloadAll} disabled={isWorking}>
                <DownloadSimple size={15} weight="bold" /> All
              </button>
            )}
            {jobs.length > 0 && (
              <button className="btn btn--ghost btn--icon" onClick={clearAll} disabled={isWorking}>
                <Trash size={15} /> Clear
              </button>
            )}
          </div>
        </div>

        <div
          className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2"
            hidden
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <div className="dropzone__inner">
            <UploadSimple size={34} weight="light" className="dropzone__icon" />
            <p className="dropzone__title">
              Drop images here <span className="muted">or click to browse</span>
            </p>
            <p className="dropzone__hint">Files convert only when you press Convert.</p>
          </div>
        </div>
      </div>

      <ul className="joblist">
        <AnimatePresence initial={false}>
          {jobs.map((job) => {
            const delta =
              job.result && job.file.size > 0
                ? Math.round(((job.result.blob.size - job.file.size) / job.file.size) * 100)
                : null;
            return (
              <motion.li
                key={job.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="job"
              >
                <Thumb job={job} />

                <div className="job__main">
                  <div className="job__name" title={job.file.name}>
                    {job.file.name}
                  </div>
                  <div className="job__meta">
                    <span className="chip">{job.sourceLabel}</span>
                    <ArrowRight size={13} className="job__arrow" />
                    <span className="chip chip--target">{target.toUpperCase()}</span>
                    <span className="job__size">{formatBytes(job.file.size)}</span>
                    {job.result && (
                      <>
                        <ArrowRight size={12} className="job__arrow" />
                        <span className="job__size job__size--out">
                          {formatBytes(job.result.blob.size)}
                        </span>
                        {delta !== null && (
                          <span className={`delta ${delta <= 0 ? 'delta--good' : 'delta--bad'}`}>
                            {delta <= 0 ? '' : '+'}
                            {delta}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {job.status === 'working' && (
                    <div className="job__working">
                      <DotsThinking label="Converting" />
                    </div>
                  )}
                  {job.error && <div className="job__error">{job.error}</div>}
                </div>

                <div className="job__side">
                  <StatusBadge status={job.status} />
                  <div className="job__side-actions">
                    {job.result && (
                      <a
                        className="btn btn--dark btn--icon btn--sm"
                        href={job.result.url}
                        download={job.result.filename}
                        onClick={() => posthog?.capture('image_downloaded', { file_count: 1, download_type: 'single', source_format: job.sourceLabel.toLowerCase(), target_format: target })}
                      >
                        <DownloadSimple size={14} weight="bold" /> Download
                      </a>
                    )}
                    {job.status !== 'working' && (
                      <button
                        className="job__remove"
                        onClick={() => removeJob(job.id)}
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
