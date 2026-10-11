import { useTranslation } from 'react-i18next';
import { Mic, Square, RotateCcw, Play, Pause, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Primitives';
import { cn } from '../../lib/cn';

/**
 * The recording control, built so a user is NEVER unsure whether they are being
 * recorded. The approved design is explicit about this, and it drives every choice:
 *
 *  - A red chip that literally says "Đang ghi âm", not a colour change.
 *  - The clock is 40px `mono` and is the accessible value; the waveform is
 *    `aria-hidden` decoration.
 *  - The waveform animates only under `prefers-reduced-motion: no-preference`.
 *    Motion that cannot be switched off is a vestibular hazard, and the animation here
 *    carries no information — the clock does.
 *  - Controls are large and separated: pause, stop-and-grade, restart, play back.
 *
 * The 48 bars are deterministic pseudo-random heights seeded by index, so they look
 * like a waveform without pretending to be one. A REAL amplitude meter would need an
 * AnalyserNode, and a fake one that moved with nothing would be worse than static bars
 * — hence static, clearly decorative, and hidden from assistive tech.
 */
const BAR_COUNT = 48;

/** Deterministic height per bar so it is stable across renders. */
const barHeight = (i) => {
    const wave = Math.sin(i * 0.7) * 0.5 + Math.sin(i * 0.23) * 0.5;
    return 20 + Math.abs(wave) * 60;
};

export function RecordingControl({
    recording,
    seconds,
    onStart,
    onStop,
    onRestart,
    audioUrl = null,
    paused = false,
    onTogglePause,
    maxSeconds = null,
    className,
}) {
    const { t } = useTranslation();
    const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const remaining = maxSeconds != null ? Math.max(0, maxSeconds - seconds) : null;

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* State, stated in words and as a chip, never by colour alone. */}
            <Chip tone={recording ? 'wrong' : 'neutral'} icon={Mic}>
                {recording ? t('speaking.recording') : t('speaking.notRecording')}
            </Chip>

            {/* The clock is the real information, so it is the accessible one. */}
            <span
                role="timer"
                aria-live={recording ? 'off' : 'polite'}
                className="font-mono text-[2.5rem] leading-none font-bold tabular-nums text-[var(--ink)]"
            >
                {clock}
            </span>

            {/* Decorative waveform: motion-reduce cancels the pulse, and aria-hidden
                keeps 48 meaningless bars out of the accessibility tree. */}
            <div
                aria-hidden="true"
                className="flex h-16 w-full max-w-[420px] items-center justify-center gap-[3px]"
            >
                {Array.from({ length: BAR_COUNT }, (_, i) => (
                    <span
                        key={i}
                        className={cn(
                            'w-[3px] rounded-full',
                            recording && !paused ? 'bg-[var(--wrong)] motion-safe:animate-pulse' : 'bg-[var(--border-strong)]'
                        )}
                        style={{
                            height: `${barHeight(i)}%`,
                            /* Each bar pulses on its own offset so the strip reads as
                               movement rather than a single blinking block. */
                            animationDelay: `${(i % 12) * 90}ms`,
                        }}
                    />
                ))}
            </div>

            {remaining != null && recording ? (
                <p className="t-micro muted">
                    {remaining > 0
                        ? t('speaking.countdown', { seconds: remaining })
                        : t('speaking.timeUp')}
                </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3">
                {!recording && !audioUrl ? (
                    <Button variant="primary" size="lg" onClick={onStart}>
                        <Mic size={20} aria-hidden="true" />
                        {t('speaking.startRecording')}
                    </Button>
                ) : null}

                {recording ? (
                    <>
                        {onTogglePause ? (
                            <Button variant="secondary" size="lg" onClick={onTogglePause}>
                                {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
                                {paused ? t('speaking.resume') : t('speaking.pause')}
                            </Button>
                        ) : null}
                        <Button variant="primary" size="lg" onClick={onStop}>
                            <Square size={20} aria-hidden="true" />
                            {t('speaking.stopAndGrade')}
                        </Button>
                    </>
                ) : null}

                {audioUrl ? (
                    <>
                        <audio controls src={audioUrl} className="w-full max-w-[320px]" />
                        <Button variant="ghost" size="lg" onClick={onRestart}>
                            <RotateCcw size={20} aria-hidden="true" />
                            {t('speaking.recordAgain')}
                        </Button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

/** Pre-flight notice, shown ABOVE the list rather than at the moment of recording. */
export function MicrophoneNotice({ status, className }) {
    const { t } = useTranslation();

    if (status === 'available') {
        return (
            <div
                className={cn(
                    'flex items-start gap-2.5 rounded-[var(--r-card)] bg-[var(--teal-soft)] p-3.5',
                    className
                )}
            >
                <Mic size={16} className="mt-0.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                <p className="t-micro">{t('speaking.micReady')}</p>
            </div>
        );
    }

    const messageKey =
        status === 'insecure'
            ? 'speaking.micInsecure'
            : status === 'unsupported'
              ? 'speaking.micUnsupported'
              : 'speaking.micUnknown';

    return (
        <div
            role="note"
            className={cn(
                'flex items-start gap-2.5 rounded-[var(--r-card)] border-2 border-[var(--amber)] bg-[var(--amber-soft)] p-3.5',
                className
            )}
        >
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--amber)]" aria-hidden="true" />
            <div className="min-w-0">
                <p className="t-micro">{t(messageKey)}</p>
                {/* Reading practice stays usable without a microphone, so the notice
                    says so rather than implying the screen is broken. */}
                {status !== 'unknown' ? (
                    <p className="t-micro muted mt-1">{t('speaking.micFallback')}</p>
                ) : null}
            </div>
        </div>
    );
}
