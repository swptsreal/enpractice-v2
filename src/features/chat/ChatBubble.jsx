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
export function ChatBubble({ role, children, failed = false, streaming = false, lexiMood = null, className = '' }) {
    const { t } = useTranslation();
    const isUser = role === 'user';

    return (
        <div className={cn('flex items-end gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
            {!isUser ? <Lexi mood={lexiMood ?? (streaming ? 'thinking' : 'idle')} size="xs" /> : null}
            <div
                className={cn(
                    'bubble min-w-0 max-w-[min(84%,540px)]',
                    isUser ? 'bubble--user bubble--right' : 'bubble--lexi bubble--left',
                    failed && 'border-[var(--wrong)]',
                    className
                )}
            >
                <span className="sr-only">{isUser ? t('aiChat.you') : t('aiChat.lexi')}</span>
                {children}
            </div>
        </div>
    );
}

export default ChatBubble;
