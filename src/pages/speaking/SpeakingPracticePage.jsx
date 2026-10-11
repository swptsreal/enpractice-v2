import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Sparkles, Coins } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Lexi } from '../../components/mascot/Lexi';
import { RecordingControl } from '../../components/speaking/RecordingControl';
import { useSpeechRecording } from '../../hooks/useSpeechRecording';
import { useCredit } from '../../contexts/CreditContextCore';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import {
    useSpeakingTopic,
    useSubmitSpeaking,
    buildSpeechAnalytics,
    detectFillers,
} from '../../features/speaking/useSpeaking';

/**
 * Speaking practice — `/speaking/practice/:topicId` (screen 25).
 *
 * THE RECORDING STATE IS THE WHOLE JOB of this screen, so it is delegated to
 * `RecordingControl`, which states "Đang ghi âm" in words, shows the clock as the
 * accessible value, and keeps the 48-bar waveform `aria-hidden` and
 * `motion-safe`-only. A user must never wonder whether they are being recorded.
 *
 * THE CUE CARD IS OPTIONAL. Verified live: `cueCard` is NULL for PART_3 topics,
 * because the cue card is a Part 2 device. The screen therefore renders the cue card
 * only when there is one, and falls back to the question plus follow-ups. Rendering an
 * empty card would look like missing data.
 *
 * THE TIMING RULE IS STATED, NOT ENFORCED. "1 minute to prepare, 2 to speak" is real
 * exam structure, so it is shown as guidance; the countdown is information and the
 * recording is not cut off, because a hard stop mid-sentence would destroy the
 * attempt without warning.
 *
 * WHAT IS SENT: the transcript from the Web Speech API, the recording duration, and
 * analytics the BROWSER can honestly measure. Pause durations and word confidence are
 * NOT invented — see `buildSpeechAnalytics`.
 */
const PREP_SECONDS = 60;
const SPEAK_SECONDS = 120;

export default function SpeakingPracticePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { topicId } = useParams();

    const { topic, loading, error, reload } = useSpeakingTopic(topicId);
    const { submit, submitting } = useSubmitSpeaking();
    const credit = useCredit();

    const [phase, setPhase] = useState('prepare');
    const [submitError, setSubmitError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [prepLeft, setPrepLeft] = useState(PREP_SECONDS);

    const {
        recording,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        audioChunksRef,
        startRecording,
        stopRecording,
    } = useSpeechRecording({
        onError: () => setSubmitError(new Error('speech')),
    });

    const costEntry = credit.getCost(CREDIT_ACTIONS.SPEAKING_START);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable = !cost || !balanceKnown || balance >= Number(costEntry?.cost ?? 0);

    /* Preparation countdown, the real exam structure. It counts DOWN to the speaking
       phase and stops there rather than auto-starting the microphone: recording must
       only ever begin from an explicit press. */
    useEffect(() => {
        if (phase !== 'prepare') return undefined;
        const id = setInterval(() => {
            setPrepLeft((s) => {
                if (s <= 1) {
                    clearInterval(id);
                    setPhase('ready');
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    const words = useMemo(() => (transcript.trim() ? transcript.trim().split(/\s+/).length : 0), [transcript]);
    const fillers = useMemo(() => detectFillers(transcript), [transcript]);

    async function onStopAndGrade() {
        stopRecording();
        setPhase('recorded');

        /* The recorder writes its chunks on stop, so the blob is read after a tick. */
        await new Promise((r) => setTimeout(r, 150));
        const chunks = audioChunksRef.current ?? [];
        if (chunks.length) {
            try {
                setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' })));
            } catch {
                setAudioUrl(null);
            }
        }

        if (!transcript.trim()) {
            /* Nothing was transcribed — usually an unsupported browser or a denied
               permission. Sending an empty transcript would spend a credit on a blank
               answer, so the screen asks for one instead. */
            setPhase('needsTranscript');
            return;
        }
        await send();
    }

    async function send() {
        setSubmitError(null);
        try {
            const attempt = await submit(topicId, {
                transcript,
                audioUrl: null,
                timeSpentSeconds: timer,
                speechAnalytics: buildSpeechAnalytics({ transcript, seconds: timer, fillers }),
            });
            if (attempt?.id) navigate(`/speaking/result/${attempt.id}`, { replace: true });
        } catch (err) {
            setSubmitError(err);
        }
    }

    function onRestart() {
        setTranscript('');
        setAudioUrl(null);
        setPhase('ready');
        setSubmitError(null);
    }

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button variant="ghost" size="sm" iconOnly aria-label={t('common.back')} onClick={() => navigate('/speaking')}>
                    <ArrowLeft size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-label block">{t('speaking.practiceTitle')}</span>
                    <span className="t-micro muted">
                        {topic ? t(`speaking.part.${topic.part}`) : t('speaking.title')}
                    </span>
                </div>
                {topic ? <Chip tone="neutral">{t('speaking.prepRule')}</Chip> : null}
            </header>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !topic}
                onRetry={reload}
                skeleton={
                    <div className="mx-auto w-full max-w-[680px] p-4">
                        <SkeletonCard lines={7} />
                    </div>
                }
                emptyTitle={t('speaking.topicMissingTitle')}
                emptyBody={t('speaking.topicMissingBody')}
                emptyAction={
                    <ButtonLink to="/speaking" variant="primary" size="sm">
                        {t('speaking.title')}
                    </ButtonLink>
                }
            >
                <main className="mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-4 p-4">
                    {/* --- cue card ------------------------------------------- */}
                    <Card level="hero" padding="xl" className="flex flex-col gap-3">
                        <h1 className="t-h2">{topic?.question}</h1>

                        {/* The cue card exists for PART_2 only; verified null on PART_3. */}
                        {topic?.cueCard ? (
                            <div className="prose-reading whitespace-pre-line border-l-2 border-[var(--teal)] pl-3">
                                {topic.cueCard}
                            </div>
                        ) : null}

                        {(topic?.followUpQuestions ?? []).length > 0 ? (
                            <section className="border-t-2 border-[var(--border)] pt-3">
                                <h2 className="t-label">{t('speaking.followUps')}</h2>
                                <ul className="mt-2 flex flex-col gap-1.5">
                                    {topic.followUpQuestions.map((q) => (
                                        <li key={q} className="t-body soft flex items-start gap-2">
                                            <span aria-hidden="true" className="text-[var(--teal)]">
                                                •
                                            </span>
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}

                        <p className="t-micro muted">{t('speaking.timingRule')}</p>
                    </Card>

                    {/* --- preparation --------------------------------------- */}
                    {phase === 'prepare' ? (
                        <Card level="edge" padding="xl" className="flex flex-col items-center gap-3 text-center">
                            <Lexi mood="thinking" size="md" />
                            <h2 className="t-h3">{t('speaking.prepareTitle')}</h2>
                            <p className="t-body soft">{t('speaking.prepareBody')}</p>
                            <span className="t-mono text-2xl tabular-nums text-[var(--teal)]">
                                {String(Math.floor(prepLeft / 60)).padStart(2, '0')}:
                                {String(prepLeft % 60).padStart(2, '0')}
                            </span>
                            <Button variant="primary" size="lg" onClick={() => setPhase('ready')}>
                                <Sparkles size={18} aria-hidden="true" />
                                {t('speaking.readyToSpeak')}
                            </Button>
                        </Card>
                    ) : null}

                    {/* --- recording ----------------------------------------- */}
                    {phase === 'ready' || recording ? (
                        <Card level="edge" padding="xl">
                            {!sttSupported ? (
                                <p className="t-micro mb-3 text-[var(--amber)]">{t('speaking.sttUnsupported')}</p>
                            ) : null}
                            <RecordingControl
                                recording={recording}
                                seconds={timer}
                                maxSeconds={SPEAK_SECONDS}
                                audioUrl={audioUrl}
                                onStart={startRecording}
                                onStop={onStopAndGrade}
                                onRestart={onRestart}
                            />
                        </Card>
                    ) : null}

                    {/* --- transcript ---------------------------------------- */}
                    {(transcript || phase === 'needsTranscript' || phase === 'recorded') ? (
                        <Card level="edge" padding="xl">
                            <label className="flex flex-col gap-1.5">
                                <span className="t-label">{t('speaking.transcriptLabel')}</span>
                                <span className="t-micro muted">{t('speaking.transcriptHint')}</span>
                                <textarea
                                    className="mt-1 min-h-[120px] resize-y rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-3.5"
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder={t('speaking.transcriptPlaceholder')}
                                    spellCheck={false}
                                    lang="en"
                                />
                            </label>

                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <span className="t-mono text-sm">{t('speaking.wordCount', { count: words })}</span>
                                {fillers.length > 0 ? (
                                    <Chip tone="amber">
                                        {t('speaking.fillerDetected', { count: fillers.length, words: fillers.join(', ') })}
                                    </Chip>
                                ) : null}
                            </div>

                            {phase === 'needsTranscript' ? (
                                <p role="alert" className="t-micro mt-3 text-[var(--amber)]">
                                    {t('speaking.needsTranscript')}
                                </p>
                            ) : null}

                            {submitError ? (
                                <p role="alert" className="t-micro mt-3 text-[var(--wrong)]">
                                    {t('common.error.generic')}
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-[var(--border)] pt-4">
                                {/* The cost is on the button, before it is pressed. */}
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={submitting || !transcript.trim() || !affordable}
                                    onClick={send}
                                >
                                    {submitting ? (
                                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                    ) : (
                                        <Sparkles size={18} aria-hidden="true" />
                                    )}
                                    {cost
                                        ? t('speaking.submitWithCost', { amount: cost.amountLabel })
                                        : t('speaking.submit')}
                                </Button>
                                <Button variant="ghost" size="lg" onClick={onRestart}>
                                    {t('speaking.recordAgain')}
                                </Button>
                                <span className="t-micro muted inline-flex items-center gap-1.5">
                                    <Coins size={14} aria-hidden="true" />
                                    {affordable ? t('speaking.gradingWait') : t('speaking.insufficient')}
                                </span>
                            </div>
                        </Card>
                    ) : null}
                </main>
            </AsyncBoundary>
        </div>
    );
}
