import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationCenter } from '../features/notification/useNotificationCenter';
import {
    rememberLearningLaunch,
    trackLearningEvent,
} from '../features/learning/learningAnalytics';
import { resolveLearningActionTarget } from '../features/learning/learningAction';

export function useNotificationAction({
    onAfterAction,
    source = 'NOTIFICATION_CENTER',
} = {}) {
    const navigate = useNavigate();
    const notificationCenter = useNotificationCenter();

    return useCallback(
        async (notification) => {
            if (!notification) return;

            if (!notification.read) {
                try {
                    await notificationCenter.markNotificationRead(
                        notification.id
                    );
                } catch (error) {
                    console.error(
                        'Failed to mark notification as read:',
                        error
                    );
                }
            }

            const action = resolveLearningActionTarget({
                actionUrl: notification.actionUrl,
                referenceType: notification.referenceType,
                referenceId: notification.referenceId,
                module: notification.type,
                metadata: notification.metadata,
            });

            const eventMetadata = {
                triggerType: notification.metadata?.triggerType || null,
                reason: notification.metadata?.reason || null,
                estimatedMinutes:
                    notification.metadata?.estimatedMinutes ?? null,
                usedFallback: action.usedFallback,
            };

            trackLearningEvent({
                eventName: 'NOTIFICATION_OPENED',
                source,
                module: notification.type,
                route: action.href || notification.actionUrl || null,
                referenceType: 'USER_NOTIFICATION',
                referenceId: notification.id,
                metadata: eventMetadata,
            });

            trackLearningEvent({
                eventName: 'NOTIFICATION_CLICKED',
                source,
                module: notification.type,
                route: action.href || notification.actionUrl || null,
                referenceType: 'USER_NOTIFICATION',
                referenceId: notification.id,
                metadata: eventMetadata,
            });

            if (action.kind === 'external') {
                window.location.assign(action.href);
            } else if (action.kind === 'internal') {
                if (action.isLearningSession) {
                    rememberLearningLaunch({
                        source,
                        module: notification.type,
                        route: action.href,
                        referenceType:
                            notification.referenceType || 'USER_NOTIFICATION',
                        referenceId:
                            notification.referenceId || notification.id,
                        reason: notification.metadata?.reason || null,
                        estimatedMinutes:
                            notification.metadata?.estimatedMinutes ?? null,
                        metadata: {
                            entryPoint: 'notification',
                            notificationId: notification.id,
                            triggerType:
                                notification.metadata?.triggerType || null,
                            reason: notification.metadata?.reason || null,
                        },
                    });
                }

                navigate(action.href);
            }

            onAfterAction?.(notification);
        },
        [navigate, notificationCenter, onAfterAction, source]
    );
}

export default useNotificationAction;
