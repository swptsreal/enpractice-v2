import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Mic, Square } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Primitives';
import { cn } from '../../lib/cn';
import { useSpeechRecording } from '../../hooks/useSpeechRecording';
import { speakWithVoice, stopSpeaking } from '../../utils/ttsHelper';
import { stripMarkdownForSpeech } from './chatSpeech';

/**
 * THE VOICE PAIR OF THE AI COACH: hearing Lexi, and speaking to her.
 *
 * Both live here, in one file, because the full page (`/ai-chat`) and the floating panel render
 * the SAME conversation and must not drift — an affordance that exists in one of the two would be
 * a difference nobody could explain. The two callers differ only in the class of the input
 * (`inputClassName`), which is sizing.
 *
 * TWO DECISIONS WORTH KNOWING:
 *
 *  1. **No autoplay.** Screen 24b reads a conversation question aloud the moment it appears,
 *     because that question is one sentence the learner must answer. A coach answer is a page of
 *     explanation, and starting to talk while someone is reading — or in a library — is not a
 *     favour. The answer waits for a press, and the button says it is playing.
 *  2. **The mic is ABSENT on a browser that cannot transcribe**, not disabled. A control that
 *     cannot work and cannot be fixed from this screen is worse than no control, and the input
 *     still does the whole job.
 */

/** Turn `seconds` into the `mm:ss` the recording chip shows. */
function clockOf(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * One listen control per Lexi answer.
 *
 * The state is per button, and `ttsHelper` settles the PREVIOUS clip's promise when a new one
 * starts — without that, the first button would stay on "Đang phát…" for good, because a clip
 * stopped by hand never fires `ended`.
 */
export function SpeakButton({ text, className }) {
    const { t } = useTranslation();
    const [playing, setPlaying] = useState(false);
    const plain = stripMarkdownForSpeech(text);

    useEffect(() => () => stopSpeaking(), []);

    if (!plain) return null;

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={playing}
            className={cn('mt-2.5', className)}
            onClick={async () => {
                setPlaying(true);
                try {
                    await speakWithVoice(plain);
                } catch {
                    /* A blocked autoplay or a failed synthesis is not a broken screen: the answer
                       is on screen in full, and the button is the way to hear it. */
                } finally {
                    setPlaying(false);
                }
            }}
        >
            <Headphones size={15} aria-hidden="true" />
            {playing ? t('aiChat.listening') : t('aiChat.listen')}
        </Button>
    );
}

/**
 * The composer's voice half: a mic button, or — while recording — the recording strip that
 * replaces the input, plus the input itself the rest of the time.
 */
export function ChatComposerField({
    value,
    onChange,
    maxLength,
    placeholder,
    label,
    inputClassName,
    inputRef,
}) {
    const { t } = useTranslation();
    const {
        recording,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        startRecording,
        stopRecording,
    } = useSpeechRecording({});

    /* A ref, not a dependency: `stopRecording` is a new function every render, and this effect must
       run exactly once, on unmount. Leaving the screen mid-recording would otherwise keep the
       microphone open. */
    const stopRef = useRef(stopRecording);
    useEffect(() => {
        stopRef.current = stopRecording;
    });
    useEffect(
        () => () => {
            stopRef.current?.();
            stopSpeaking();
        },
        []
    );

    const start = useCallback(() => {
        /* Lexi is silenced BEFORE the microphone opens, or her voice ends up inside the learner's
           question. */
        stopSpeaking();
        setTranscript('');
        startRecording();
    }, [setTranscript, startRecording]);

    const stop = useCallback(() => {
        const spoken = transcript.trim();
        stopRecording();
        if (!spoken) return;
        /* THE TRANSCRIPT LANDS IN THE INPUT, it is not sent: speech recognition errs, and a
           question sent to a paid coach should not be something nobody checked. Appending rather
           than replacing keeps whatever the learner had already typed. */
        onChange(value?.trim() ? `${value.trim()} ${spoken}` : spoken);
    }, [onChange, stopRecording, transcript, value]);

    if (recording) {
        return (
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <Button
                    type="button"
                    variant="primary"
                    iconOnly
                    aria-label={t('aiChat.recordStop')}
                    onClick={stop}
                >
                    <Square size={18} aria-hidden="true" />
                </Button>
                <Chip tone="wrong" icon={Mic}>
                    {t('aiChat.recording')}
                </Chip>
                <span role="timer" className="t-mono tabular-nums">
                    {clockOf(timer)}
                </span>
            </div>
        );
    }

    return (
        <>
            {sttSupported ? (
                <Button
                    type="button"
                    variant="ghost"
                    iconOnly
                    aria-label={t('aiChat.recordLabel')}
                    onClick={start}
                >
                    <Mic size={20} aria-hidden="true" />
                </Button>
            ) : null}
            <label className="min-w-0 flex-1">
                <span className="sr-only">{label}</span>
                <input
                    ref={inputRef}
                    className={inputClassName}
                    value={value}
                    onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
            </label>
        </>
    );
}
