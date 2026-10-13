import { useTranslation } from 'react-i18next';
import { Lexi } from '../../components/mascot/Lexi';
import { cn } from '../../lib/cn';

/**
 * One message bubble in the AI coach conversation.
 *
 * Extracted from `AiChatPage` when the floating panel was built, so the full-page chat and the
 * panel cannot drift into two different-looking conversations. It is presentational only: state,
 * streaming and retry live in `useAiChat`.
 *
 * TWO THINGS IT ENCODES:
 *
 *  - **The speaker is named in text**, not only by alignment and colour (`aiChat.you` /
 *    `aiChat.lexi`). Alignment is the fastest signal and the only one a screen reader gets, so the
 *    label has to be there too.
 *  - **`failed` gets its own border colour** and the caller adds the retry affordance. A send that
 *    did not go through must not look like the ones that did.
 */
export function ChatBubble({ role, children, failed = false, streaming = false, lexiMood = null }) {
    const { t } = useTranslation();
    const isUser = role === 'user';

    return (
        <div className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}>
            {!isUser ? <Lexi mood={lexiMood ?? (streaming ? 'thinking' : 'idle')} size="xs" /> : null}
            <div
                className={cn(
                    'min-w-0 max-w-[86%] rounded-[var(--r-card)] border-2 p-3.5',
                    isUser
                        ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                        : failed
                          ? 'border-[var(--wrong)] bg-[var(--surface)]'
                          : 'border-[var(--border)] bg-[var(--surface)]'
                )}
            >
                <span className="t-micro muted mb-1 block">{isUser ? t('aiChat.you') : t('aiChat.lexi')}</span>
                {children}
            </div>
        </div>
    );
}

export default ChatBubble;
