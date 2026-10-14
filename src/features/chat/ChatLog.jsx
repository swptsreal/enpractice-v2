import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Markdown } from '../../components/ui/Markdown';
import { ChatBubble } from './ChatBubble';

/**
 * The conversation log: Lexi's opening line, the messages, and the streaming placeholder.
 *
 * Extracted for the same reason as `ChatBubble`: the full-page coach (`/ai-chat`) and the floating
 * panel render THE SAME conversation, and two copies of this loop would drift — the second one
 * would quietly lose the failed-send retry, or the skeleton-inside-the-bubble, because nobody
 * re-reads markup they did not write.
 *
 * `className` is the one thing the callers differ on, and it is sizing only (the panel is short).
 */
export function ChatLog({ chat, opening, logRef, className }) {
    const { t } = useTranslation();

    return (
        <div
            ref={logRef}
            aria-live="polite"
            aria-label={t('aiChat.logLabel')}
            className={className}
        >
            {chat.hasMoreHistory ? (
                <div className="flex justify-center py-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={chat.loadingOlder}
                        onClick={chat.loadOlder}
                        className="gap-2 text-xs"
                    >
                        {chat.loadingOlder ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        ) : null}
                        {t('common.loadMore')}
                    </Button>
                </div>
            ) : null}

            {/* Lexi opens, demonstrating what she knows — or saying she does not know yet, which is
                the honest version for a new account. */}
            {opening?.key ? (
                <ChatBubble role="assistant" lexiMood="explain">
                    <p>{t(opening.key, opening.values)}</p>
                </ChatBubble>
            ) : null}

            {chat.messages.map((message) => {
                const isUser = message.role === 'user';
                const failed = message.status === 'failed' || message.status === 'error';
                return (
                    <ChatBubble
                        key={message.id}
                        role={isUser ? 'user' : 'assistant'}
                        failed={failed}
                        streaming={message.status === 'streaming'}
                    >
                        {isUser ? (
                            <p className="whitespace-pre-line">{message.content}</p>
                        ) : (
                            <Markdown content={message.content} />
                        )}

                        {/* The streaming state is a skeleton INSIDE the bubble, so the answer grows
                            where it will end up rather than in a spinner somewhere else. */}
                        {message.status === 'streaming' && !message.content ? (
                            <span aria-hidden="true" className="mt-2 flex flex-col gap-2">
                                <span className="block h-3.5 w-full animate-pulse rounded bg-[var(--surface-alt)]" />
                                <span className="block h-3.5 w-3/5 animate-pulse rounded bg-[var(--surface-alt)]" />
                            </span>
                        ) : null}

                        {failed ? (
                            <span className="t-micro mt-2 flex flex-wrap items-center gap-2 text-[var(--wrong)]">
                                <AlertTriangle size={14} aria-hidden="true" />
                                {t('aiChat.sendFailed')}
                                <Button size="sm" variant="ghost" onClick={() => chat.retry(message.content)}>
                                    <RefreshCw size={14} aria-hidden="true" />
                                    {t('common.retry')}
                                </Button>
                            </span>
                        ) : null}
                    </ChatBubble>
                );
            })}

            {chat.streaming && chat.messages.at(-1)?.role === 'user' ? (
                <ChatBubble role="assistant" streaming>
                    <span aria-hidden="true" className="flex flex-col gap-2">
                        <span className="block h-3.5 w-full animate-pulse rounded bg-[var(--surface-alt)]" />
                        <span className="block h-3.5 w-2/5 animate-pulse rounded bg-[var(--surface-alt)]" />
                    </span>
                    <span className="sr-only">{t('aiChat.thinking')}</span>
                </ChatBubble>
            ) : null}
        </div>
    );
}

export default ChatLog;
