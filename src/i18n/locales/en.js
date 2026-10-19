export default {
    common: {
        appName: 'EN Practice',
        loading: 'Loading…',
        login: 'Sign in',
        logout: 'Sign out',
        later: 'Later',
        allow: 'Allow',
        cancel: 'Cancel',
        language: 'Language',
        english: 'English',
        vietnamese: 'Vietnamese',
        eng: 'EN',
        vie: 'VI',
        learner: 'Learner',
        global: 'Global',
        sameTargetBand: 'Same Target Band',
        updating: 'Updating',
        retry: 'Try again',
        tryAgain: 'Try Again',
        slogan: 'One step a day',
        streakDays: '{{count}} days',
        skipToContent: 'Skip to content',
        back: 'Back',
        close: 'Close',
        save: 'Save',
        delete: 'Delete',
        loadMore: 'Load more',
        error: {
            generic: 'Something went wrong',
            sessionExpired: 'Your session has expired',
            notFound: 'We could not find that',
            tooManyRequests: 'That was a bit fast, try again in a moment',
            server: 'The server is having a problem',
            network: 'Could not reach the server',
            networkHint: 'Check your connection. If you are running locally, make sure the backend is running.',
            notEnoughCredits: 'You do not have enough credits for this',
            notEnoughCreditsHint: 'Tests and AI actions cost credits. Core learning — sitting a test, the vocabulary notebook, progress reports — costs nothing.'
        },
        empty: {
            defaultTitle: 'Nothing here yet'
        }
    },
    app: {
        pageTitleSuffix: 'EN Practice',
        seoDefault: 'EN Practice - IELTS and English vocabulary practice',
        pageTitles: {
            home: 'Home',
            dictionary: 'Personal Dictionary',
            vocabularyCheck: 'Check Word & Ask AI',
            vocabulary: 'AI Vocabulary Test',
            history: 'Vocabulary History',
            review: 'Vocabulary Review',
            evaluation: 'Learning Insights',
            aiChat: 'AI English Coach',
            login: 'Log In',
            ielts: 'IELTS Practice Tests',
            writing: 'IELTS Writing',
            writingPractice: 'IELTS Writing Practice',
            speaking: 'IELTS Speaking',
            customSpeaking: 'Custom Speaking Conversation',
            leaderboard: 'Leaderboard',
            rewards: 'Rewards',
            credits: 'Credit wallet',
            xpHistory: 'XP History',
            profile: 'User Profile',
            notifications: 'Notifications',
            settings: 'Settings',
            weeklyReport: 'Weekly Report',
            weeklyReportHistory: 'Report History',
            weeklyReportDetail: 'Report Detail',
            challenges: 'Challenges'
        },
        sidebar: {
            home: 'Home',
            leaderboard: 'Leaderboard',
            rewards: 'Rewards',
            credits: 'Credit wallet',
            aiChat: 'AI Chat',
            vocabulary: 'Vocabulary',
            dictionary: 'Dictionary',
            vocabCheckAi: 'Check Word & Ask AI',
            vocabTest: 'AI Vocabulary Test',
            history: 'History',
            review: 'Review',
            evaluation: 'Evaluation',
            ielts: 'IELTS',
            ieltsTest: 'IELTS Test',
            ieltsWriting: 'IELTS Writing',
            writingPractice: 'Writing Practice',
            ieltsSpeaking: 'IELTS Speaking',
            customSpeaking: 'Custom Speaking',
            weeklyReport: 'Weekly Report',
            challenges: 'Challenges',
            adminPanel: 'Admin Panel',
            slogan: 'Grow your vocabulary and build IELTS confidence every day'
        },
        notifications: {
            enableTitle: 'Turn on learning reminders',
            enableDescription: 'Allow EN Practice to send encouraging reminders so you can stay consistent every day.',
            enableSuccessTitle: 'Notifications are on',
            enableSuccessDescription: 'You will now receive helpful reminders to review and keep your learning streak alive.',
            newNoticeFallback: 'You have a new notification.'
        },
        auth: {
            sessionExpiredTitle: 'Session expired',
            sessionExpiredDescription: 'Your sign-in session has ended. Please log in again to continue learning.'
        },
        theme: {
            toggleLabel: 'Theme: {{mode}}',
            currentMode: 'Current theme: {{mode}}',
            lockedMode: '{{theme}} locks light and dark mode to preserve visual compatibility.',
            lockedBackground: '{{theme}} locks the system background to preserve its design language.',
            profileLabel: 'Interface style',
            modes: {
                light: 'Light',
                dark: 'Dark',
                system: 'System'
            },
            profiles: {
                glass: {
                    label: 'Aurora Glass',
                    family: 'Glassmorphism',
                    hint: 'Frosted, luminous, and layered with richer depth.'
                },
                calm: {
                    label: 'Calm Flow',
                    family: 'Soft Minimal',
                    hint: 'Softer, quieter, and more balanced for long study sessions.'
                },
                contrast: {
                    label: 'Precision',
                    family: 'High Contrast',
                    hint: 'Sharper, cleaner, and more content-focused.'
                },
                editorial: {
                    label: 'Neo Editorial',
                    family: 'Editorial',
                    hint: 'Modern magazine energy with warmer surfaces and serif display type.'
                },
                pulse: {
                    label: 'Pulse Studio',
                    family: 'Creative Tech',
                    hint: 'Vivid, energetic, and bolder for high-motion product moments.'
                },
                focus: {
                    label: 'Focus Grid',
                    family: 'Flat Focus',
                    hint: 'Bright blue with disciplined solid surfaces, zero blur, and no decorative depth.'
                },
                signal: {
                    label: 'Signal Desk',
                    family: 'Minimal Accent',
                    hint: 'Warm bright accents, solid blocks, and a quieter workspace for concentrated tasks.'
                },
                solid: {
                    label: 'Solid System',
                    family: 'Solid Minimal',
                    hint: 'Flat surfaces, tighter corners, lower shadow, and no gradient language.'
                },
                mono: {
                    label: 'Mono System',
                    family: 'Monochrome',
                    hint: 'Black-and-white first, tighter corners, and highly disciplined surfaces.'
                },
                fixedBehavior: 'Fixed theme'
            },
            backgrounds: {
                balanced: 'Balanced',
                sage: 'Sage',
                ocean: 'Ocean',
                dawn: 'Dawn',
                amethyst: 'Amethyst',
                blossom: 'Blossom',
                petal: 'Petal',
                midnight: 'Midnight',
                ember: 'Ember',
                canopy: 'Canopy'
            },
            solidPrimaryOptions: {
                violet: 'Violet',
                blue: 'Blue',
                emerald: 'Emerald',
                amber: 'Amber',
                rose: 'Rose'
            }
        }
    },
    profileDropdown: {
        noTarget: 'No target set yet',
        streak: '{{count}}-day streak',
        level: 'Lv. {{count}}',
        levelProgress: 'Level progress',
        currentLevelXp: '{{count}} XP in the current level',
        targetBand: 'Target {{score}}',
        profileSummaryFallback: 'Unable to load your profile summary. Showing basic account details instead.',
        overallBand: 'Overall band',
        noBandEstimate: 'No band estimate yet',
        weeklyXp: 'Weekly XP',
        totalXp: 'Total XP',
        streakLabel: 'Streak',
        startStreak: 'Start your streak today',
        viewProfile: 'View profile',
        openSettings: 'Settings',
        languageLabel: 'Language',
        themeLabel: 'Appearance',
        backgroundLabel: 'Background tone',
        backgroundHint: 'Choose a calmer page background to make the overall interface feel more balanced.'
    },
    settingsPage: {
        header: {
            title: 'Settings',
            description: 'Manage the system-wide interface, notifications, and future preference groups from one focused settings screen.',
            viewNotifications: 'View notifications'
        },
        navigation: {
            title: 'Setting sections',
            description: 'This page is designed to grow as the app adds more preference groups.',
            appearance: 'Appearance',
            appearanceHint: 'Choose the global theme, color mode, and background tone.',
            notifications: 'Notifications',
            notificationsHint: 'Control push, email, and reminder preferences.',
            account: 'Account',
            accountHint: 'Coming soon',
            learning: 'Learning',
            learningHint: 'Coming soon'
        },
        theme: {
            title: 'System-wide interface',
            description: 'Choose the design language applied across the whole product. Some fixed themes intentionally lock color mode or background selection to preserve visual compatibility.',
            activeLabel: 'Active theme',
            currentMode: 'Display mode',
            currentBackground: 'Background tone',
            fixedTitle: 'This theme uses a fixed configuration',
            fixedDescription: '{{theme}} locks part of the appearance controls to preserve its intended design language and avoid visual drift.',
            profileSectionTitle: 'Choose a design language',
            profileSectionDescription: 'Each profile updates color language, corner radius, typography, surface depth, and motion feel across the full system.',
            modeControl: 'Light and dark mode',
            modeControlHint: 'Switch between light, dark, or system mode for themes that support dynamic variants.',
            backgroundControl: 'System background',
            backgroundControlHint: 'Choose the background tone applied across the app when the current theme allows it.',
            solidPrimarySectionTitle: 'Solid System primary color',
            solidPrimarySectionDescription: 'Choose the global primary color used by buttons, selected states, and system accents while Solid System is active.',
            compatibilityTitle: 'Visual compatibility',
            compatibilityDescription: 'Fixed themes such as Solid System or Mono System automatically lock the background and color mode so every screen stays aligned with the intended style.'
        },
        overview: {
            title: 'A cleaner home for preferences',
            description: 'System-wide appearance and notification preferences now live together here so the user experience stays easier to manage and more consistent.',
            futureTitle: 'Ready for more settings',
            futureDescription: 'Future groups like account, privacy, or learning preferences can be added here without changing the overall flow.'
        }
    },
    notificationCenter: {
        hero: {
            eyebrow: 'Notification Inbox',
            title: 'Notifications',
            description: 'Follow reminders, grading results, and product updates in one calmer, more focused inbox.'
        },
        login: {
            title: 'Log in to see your notifications',
            description: 'Realtime alerts, grading history, and notification preferences will appear here after you sign in.',
            cta: 'Log in now'
        },
        actions: {
            refresh: 'Refresh',
            markAll: 'Mark all as read'
        },
        messages: {
            loadError: 'Unable to load notifications.',
            loadMoreError: 'Unable to load more notifications.',
            refreshSuccess: 'Notifications refreshed.',
            refreshError: 'Unable to refresh notifications.',
            markAllSuccess: 'All notifications have been marked as read.',
            markAllError: 'Unable to update notification status.',
            deleteSuccess: 'Notification deleted.',
            deleteError: 'Unable to delete this notification.',
            markReadError: 'Unable to mark this notification as read.'
        },
        summary: {
            total: {
                label: 'Filtered total',
                detail: '{{count}} items currently loaded in this view'
            },
            unread: {
                label: 'Unread',
                detail: '{{count}} unread items in the current filter'
            },
            focus: {
                label: 'Current focus',
                detail: 'Filtered by {{type}}'
            }
        },
        filters: {
            statusLabel: 'Status',
            typeLabel: 'Notification type'
        },
        list: {
            title: 'Recent activity',
            description: '{{count}} notifications matched your current filters.',
            unreadPill: '{{count}} unread in view',
            loadingMore: 'Loading more notifications...',
            endMessage: 'You have reached the end of this list.',
            errorTitle: 'Unable to load notifications',
            emptyTitle: 'No notifications yet',
            emptyDescription: 'Reminders, grading results, and important updates will appear here once they arrive.'
        },
        item: {
            markRead: 'Mark as read',
            delete: 'Delete'
        },
        side: {
            settingsTitle: 'Notification preferences',
            settingsDescription: 'Adjust reminders, grading updates, and system broadcasts from your settings page without crowding the inbox.',
            openSettings: 'Open settings',
            insightsTitle: 'Inbox snapshot',
            insightsDescription: 'A quick view of what still needs attention in the current filtered list.',
            unreadInView: 'Unread in this view',
            readInView: 'Read in this view',
            actionable: 'Notifications with links',
            refreshHint: 'Refresh this inbox'
        },
        statuses: {
            ALL: 'All',
            UNREAD: 'Unread',
            READ: 'Read'
        },
        types: {
            ALL: 'All types',
            VOCABULARY_REMINDER: 'Vocabulary reminder',
            VOCABULARY_TEST_READY: 'Vocabulary test ready',
            VOCABULARY_TEST_FAILED: 'Vocabulary test failed',
            WRITING_RESULT_READY: 'Writing result',
            SPEAKING_RESULT_READY: 'Speaking result',
            SPEAKING_CONVERSATION_RESULT_READY: 'Speaking conversation result',
            CUSTOM_CONVERSATION_RESULT_READY: 'Custom conversation result',
            ADMIN_BROADCAST: 'System announcement'
        },
        preferences: {
            title: 'Notification settings',
            description: 'Choose which types of notifications you want to receive.',
            save: 'Save changes',
            updatedAt: 'Last updated: {{value}}',
            updatedFallback: 'Your changes will be saved across the whole account.',
            messages: {
                saved: 'Notification settings updated.',
                loadError: 'Unable to load notification settings.',
                saveError: 'Unable to update notification settings.'
            },
            fields: {
                allowPush: {
                    label: 'Push notifications',
                    description: 'Receive immediate alerts when results or reminders are ready.'
                },
                allowEmail: {
                    label: 'Email notifications',
                    description: 'Receive important updates and summaries by email.'
                },
                allowVocabularyReminder: {
                    label: 'Vocabulary reminders',
                    description: 'Get nudges when you have words ready for review.'
                },
                allowGradingResult: {
                    label: 'Grading results',
                    description: 'Get notified when Writing or Speaking results are available.'
                },
                allowAdminBroadcast: {
                    label: 'System announcements',
                    description: 'Receive broadcasts from admins and major product updates.'
                }
            }
        }
    },
    loginPage: {
        eyebrow: 'Learning Access',
        title: 'Keep your progress with you',
        description: 'Sign in to sync your learning history, save important words, and continue your IELTS journey across devices.',
        benefits: {
            sync: {
                title: 'Cloud sync',
                description: 'Keep vocabulary, history, and activity in one connected account.'
            },
            progress: {
                title: 'Progress tracking',
                description: 'Follow your streaks, XP, and grading results in one place.'
            },
            secure: {
                title: 'Safer learning space',
                description: 'Your settings and notification preferences stay attached to your account.'
            },
            ai: {
                title: 'Feedback from AI grading',
                description: 'Writing and Speaking are marked against the four IELTS criteria, with the reason for every mark.'
            }
        },
        modes: {
            login: 'Log in',
            register: 'Register'
        },
        form: {
            loginTitle: 'Welcome back',
            loginDescription: 'Pick up where you left off and keep your learning flow steady.',
            registerTitle: 'Create your account',
            registerDescription: 'Set up a learning profile so your progress can grow with you.',
            divider: 'or',
            guestCta: 'Continue without logging in',
            guestHint: 'Your progress will stay on this device only.',
            switchToRegisterPrompt: 'Don\'t have an account?',
            switchToRegisterCta: 'Create one now',
            switchToLoginPrompt: 'Already have an account?',
            switchToLoginCta: 'Log in'
        },
        fields: {
            email: {
                label: 'Email',
                placeholder: 'example@email.com',
                required: 'Please enter your email.',
                invalid: 'This email address is not valid.'
            },
            displayName: {
                label: 'Display name',
                placeholder: 'Your name',
                required: 'Please enter a display name.',
                min: 'Display name must be at least 2 characters.'
            },
            password: {
                label: 'Password',
                placeholder: 'Enter your password',
                required: 'Please enter your password.',
                min: 'Password must be at least 8 characters.'
            },
            confirmPassword: {
                label: 'Confirm password',
                placeholder: 'Enter your password again',
                required: 'Please confirm your password.',
                mismatch: 'Passwords do not match.'
            }
        },
        actions: {
            login: 'Log in',
            register: 'Create account'
        },
        messages: {
            loginSuccess: 'Logged in successfully.',
            registerSuccess: 'Account created successfully.',
            errorFallback: 'Something went wrong. Please try again.'
        }
    },
    credits: {
        hero: {
            eyebrow: 'Learning credits',
            title: 'Credit wallet',
            description: 'Track available, reserved, and previously used credits.',
            earn: 'Earn credits'
        },
        summary: {
            available: 'Available',
            reserved: 'Reserved',
            status: 'Wallet status'
        },
        status: {
            ACTIVE: 'Active',
            FROZEN: 'Frozen',
            UNKNOWN: 'Unknown'
        },
        cost: {
            title: 'Current costs',
            subtitle: 'Costs are controlled by the server and may change.',
            summary: '{{count}} actions currently use credits',
            loadingSummary: 'Loading credit costs...',
            unavailableSummary: 'Credit costs are temporarily unavailable',
            view: 'View credit costs',
            close: 'Close',
            observe: 'Observation mode; credits are not deducted yet.',
            amount: '-{{count}} credits',
            trial: '{{count}} credits · Trial',
            newAttemptOnly: 'Credits apply only when a new attempt is created.',
            empty: 'No credit costs are available.'
        },
        actions: {
            AI_CHAT: 'AI Chat',
            VOCABULARY_TEST_GENERATE: 'Generate vocabulary test',
            IELTS_START: 'Start IELTS',
            WRITING_START: 'Submit IELTS Writing',
            WRITING_PRACTICE_START: 'Start Writing Practice',
            SPEAKING_START: 'Start Speaking',
            WRITING_PRACTICE_GENERATE: 'Generate Writing Practice',
            AI_EXPLAIN: 'AI explanation'
        },
        actionExplain: {
            AI_CHAT: 'Credits will be deducted for each question answered by AI',
            VOCABULARY_TEST_GENERATE: 'Credits will be deducted when you click Generate with AI',
            IELTS_START: 'Credits will be deducted when you click Start',
            WRITING_START: 'Credits will only be deducted when you submit the Writing task',
            WRITING_PRACTICE_START: 'Credits will be deducted immediately when you click Start',
            SPEAKING_START: 'For practice exercises, credits will be deducted when you submit a recording. For conversations, credits will be deducted as soon as the conversation starts',
            WRITING_PRACTICE_GENERATE: 'This feature is currently available to admins only',
            AI_EXPLAIN: 'Credits will be deducted when you ask AI for an explanation'
        },
        transactions: {
            title: 'Transaction history',
            subtitle: 'Credit grants, reservations, usage, and releases.',
            empty: 'No credit transactions yet.',
            loadError: 'Unable to load credit transactions.',
            details: 'Transaction details',
            source: 'Source: {{value}}',
            reference: 'Reference: {{type}} · {{id}}',
            balanceAfter: 'Available after transaction: {{count}}',
            reservedAfter: 'Reserved after transaction: {{count}}',
            types: {
                GRANT: 'Credit granted',
                SPEND: 'Credit spent',
                RESERVE: 'Credit reserved',
                CAPTURE: 'Credit captured',
                RELEASE: 'Credit released',
                OBSERVATION: 'Trial observed',
                UNKNOWN: 'Credit transaction'
            }
        },
        modal: {
            insufficientTitle: 'Not enough credits',
            insufficientDescription: 'This action needs {{required}} credits; you currently have {{available}}.',
            frozenTitle: 'Wallet is frozen',
            frozenDescription: 'This wallet cannot perform enforced credit actions.',
            viewWallet: 'View wallet',
            earnCredits: 'Earn credits'
        },
        errors: {
            balance: 'Unable to load credit balance.',
            costs: 'Unable to load credit costs.'
        },
        subtitle: 'Credits pay for the AI features. Core learning is free.',
        balanceLabel: 'Available credits',
        balanceNote: 'Credits held for a running task are returned if that task fails.',
        reserved: '{{count}} held',
        walletStatus: 'Wallet status',
        costsTitle: 'What costs what',
        someUnavailable: '{{count}} features are switched off',
        unavailable: 'Unavailable',
        free: 'Free',
        costAmount: '−{{count}}',
        observeNote: 'Not charged yet — recorded for monitoring only.',
        freeSurfaceNote: 'Sitting tests, the vocabulary notebook and progress reports cost no credits. Only the features that call the AI are charged.',
        transactionsTitle: 'Credit history',
        noTransactionsTitle: 'No transactions yet',
        noTransactionsBody: 'When you spend credits on something, the transaction appears here.',
        balanceAfter: '{{count}} left',
        showAll: 'Show all {{count}}',
        showLess: 'Show less',
        action: {
            AI_CHAT: 'Chat with the AI',
            AI_EXPLAIN: 'AI word explanation',
            VOCABULARY_TEST_GENERATE: 'Generate a vocabulary test',
            IELTS_START: 'Start an IELTS test',
            WRITING_START: 'Mark a Writing task',
            WRITING_PRACTICE_START: 'Writing practice',
            WRITING_PRACTICE_GENERATE: 'Generate a Writing task',
            SPEAKING_START: 'Speaking practice'
        }
    },
    rewards: {
        hero: {
            eyebrow: 'Motivation loop',
            title: 'Rewards',
            description: 'Check in daily, unlock XP milestones, and equip owned reward items.'
        },
        checkIn: {
            title: 'Today\'s check-in',
            subtitle: 'More steak, more xp',
            claim: 'Check in',
            claimed: 'Checked in',
            alreadyClaimed: 'You already checked in today.',
            claimSuccess: '+{{xp}} XP for today’s check-in.',
            currentStreak: 'Current streak',
            todayXp: 'Today gives {{xp}} XP',
            dayChecked: 'Claimed',
            today: 'Today',
            dayPending: 'Pending'
        },
        milestones: {
            title: 'XP Milestones',
            subtitle: 'Rewards are based on lifetime total XP.',
            empty: 'No reward milestones are available yet.',
            requiredXp: '{{xp}} lifetime XP',
            claim: 'Claim',
            reward: 'Rewards',
            states: {
                locked: 'Locked',
                claimable: 'Claimable',
                claimed: 'Claimed'
            }
        },
        missions: {
            title: 'Reward Missions',
            subtitle: 'Complete learning goals to unlock consumable rewards.',
            empty: 'No reward missions match this filter.',
            viewInventory: 'View inventory',
            claimedAt: 'Claimed {{date}}',
            lockedHint: 'Keep learning to unlock this reward.',
            rewardItems: 'Rewards',
            creditExpiry: 'Expires in {{count}} days.',
            tabs: {
                LOCKED: 'Unclaimed',
                CLAIMED: 'Claimed'
            },
            emptyByStatus: {
                LOCKED: 'No unclaimed reward missions.',
                CLAIMED: 'No claimed reward missions.'
            },
            triggers: {
                DAILY_TASK_PLAN_COMPLETED: 'Daily',
                WEEKLY_CHALLENGE_COMPLETED: 'Weekly',
                IELTS_SKILL_COMPLETED: 'IELTS'
            },
            statuses: {
                LOCKED: 'Locked',
                CLAIMED: 'Claimed'
            }
        },
        inventory: {
            title: 'Inventory',
            subtitle: 'Equip badges and avatar frames, or use consumable reward cards.',
            empty: 'No items match this filter.',
            equip: 'Equip',
            unequip: 'Unequip',
            use: 'Use',
            used: 'Used',
            equipped: 'Equipped',
            equipSuccess: 'Item equipped.',
            unequipSuccess: 'Item unequipped.',
            useSuccess: 'Item used.',
            totalItems: '{{total}} items',
            filters: {
                ALL: 'All',
                BADGE: 'Badge',
                AVATAR_FRAME: 'Avatar frame',
                REWARD_CARD: 'Reward card'
            },
            usageFilters: {
                ALL: 'All statuses',
                UNUSED: 'Unused',
                USED: 'Used'
            },
            sort: {
                NEWEST: 'Newest',
                NAME: 'Name'
            },
            types: {
                REWARD_CARD: 'Reward card',
                BADGE: 'Badge',
                AVATAR_FRAME: 'Avatar frame',
                TITLE: 'Title',
                EMOTE: 'Emote',
                STICKER: 'Sticker',
                BACKGROUND: 'Background',
                CREDIT_PACK: 'Credit pack',
                OTHER: 'Other'
            },
            loadMore: 'Load more',
            filtersLabel: 'Filter items'
        },
        screenTabs: {
            missions: 'Missions',
            inventory: 'Items'
        },
        screenTabsLabel: 'Section',
        rewardModal: {
            title: 'Reward unlocked',
            equipNow: 'Equip now',
            useNow: 'Use now',
            later: 'Later'
        },
        useEffect: {
            title: 'Reward used',
            instructions: 'How to redeem',
            close: 'Close',
            cta: 'Open link'
        },
        errors: {
            checkIn: 'Unable to load check-in status.',
            milestones: 'Unable to load XP milestones.',
            missions: 'Unable to load reward missions.',
            inventory: 'Unable to load inventory.',
            claimCheckIn: 'Check-in failed.',
            claimMilestone: 'Milestone claim failed.',
            equip: 'Unable to equip item.',
            unequip: 'Unable to unequip item.',
            use: 'Unable to use item.'
        },
        subtitle: 'XP and rewards from real study',
        xpTitle: 'Total XP',
        weeklyXp: '{{count}} XP this week',
        automaticNote: 'Rewards are granted automatically when you meet the condition. There is no claim button because the system has already granted it — we do not ship a button for something that needs no press.',
        inProgressTitle: 'Working towards',
        claimedTitle: 'Received',
        claimed: 'Received',
        granted: 'Granted',
        credits: '{{count}} credits',
        xp: '{{count}} XP',
        progressAria: '{{name}}: {{current}} of {{target}}',
        emptyTitle: 'No rewards yet',
        emptyBody: 'Finish one study session to unlock your first reward.',
        historyTitle: 'XP history',
        noHistory: 'No XP yet. Finishing one task starts it.',
        noPurchase: 'XP and rewards cannot be bought.'
    },
    profilePage: {
        loadError: 'Unable to load your profile right now.',
        header: {
            title: 'User Profile',
            description: 'A complete view of your learning progress, activity, and goals across the platform.',
            editProfile: 'Edit Profile'
        },
        membershipHeader: {
            eyebrow: 'Membership',
            comingSoon: 'Coming soon',
            status: {
                active: 'Active membership',
                expired: 'Membership expired',
                expiresAt: 'Expires {{date}}',
                noExpiry: 'No expiry date'
            },
            actions: {
                renew: 'Renew membership'
            },
            tiers: {
                free: {
                    title: 'Free',
                    message: 'Your starting membership for the core learning journey.',
                    cta: 'Explore Premium'
                },
                premium: {
                    title: 'Premium',
                    message: 'An elevated membership identity for your learning journey.',
                    cta: 'Explore Pro'
                },
                pro: {
                    title: 'Pro',
                    message: 'The highest membership tier available to users.',
                    cta: 'Highest tier'
                },
                special: {
                    title: 'Special',
                    message: 'Special system access granted through admin promotion.',
                    cta: 'Granted by administrator'
                }
            }
        },
        common: {
            na: 'N/A',
            notSet: 'Not set',
            notSelected: 'Not selected'
        },
        units: {
            daysLong_one: '{{count}} day',
            daysLong_other: '{{count}} days',
            minutesShort: '{{count}} min',
            hoursShort: '{{count}} hr',
            hoursMinutesShort: '{{hours}} hr {{minutes}} min',
            daysLong: '{{count}} days'
        },
        compactStats: {
            weeklyXp: 'Weekly XP',
            lessons: 'Lessons',
            studyTime: 'Study Time',
            wordsLearned: 'Words Learned',
            reviewToday: 'Review Today',
            currentStreak: 'Current Streak',
            overallBand: 'Overall Band',
            target: 'Target'
        },
        skills: {
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking',
            vocabulary: 'Vocabulary'
        },
        vocabulary: {
            mastered: 'Mastered',
            reviewing: 'Reviewing',
            building: 'Building',
            wordsCount_one: '{{count}} word',
            wordsCount_other: '{{count}} words',
            wordsCount: '{{count}} words'
        },
        goalMessages: {
            completed: 'You completed today\'s goal.',
            remaining_one: '{{count}} minute left to reach today\'s goal.',
            remaining_other: '{{count}} minutes left to reach today\'s goal.',
            remaining: 'Only {{count}} minutes to go before you hit today\'s goal!'
        },
        hero: {
            defaultBio: 'Add a short bio, your IELTS target, and your favorite skill so we can tailor a more encouraging learning journey for you.',
            joined: 'Joined {{date}}',
            lastLogin: 'Last login {{date}}',
            targetBand: 'Target {{score}}',
            totalXp: 'Total XP',
            currentLevel: 'Level progress',
            progressToLevel: '{{percentage}}% to level {{level}}',
            xpToNextLevel: '{{xp}} left to reach the next level',
            overallBand: 'Overall Band',
            weeklyXp: 'Weekly XP',
            streak: 'Streak',
            longest: 'Longest',
            goalToday: 'Goal Today'
        },
        momentum: {
            eyebrow: 'Momentum',
            title: 'Weekly Learning Rhythm',
            subtitle: 'A smooth chart view of your study rhythm over the last 7 days.',
            xpToNext: 'XP to next',
            currentLevel: 'Current level',
            dailyGoal: 'Daily goal',
            chart: {
                xp: 'XP',
                minutes: 'Minutes'
            }
        },
        todayGoal: {
            eyebrow: 'Focus',
            title: 'Today Goal',
            subtitle: 'Keep today\'s target front and center so it feels easier to stay on pace.',
            studied: 'Studied',
            target: 'Target'
        },
        skillsSection: {
            eyebrow: 'Skill Radar',
            title: 'Skill Progress',
            subtitle: 'A quick view of your current performance across the four IELTS skills.',
            band: 'Band'
        },
        vocabularySection: {
            eyebrow: 'Vocabulary',
            title: 'Vocabulary Balance',
            subtitle: 'A compact donut chart showing how your vocabulary is spreading across mastery stages.',
            masteryRate: 'Mastery Rate',
            masteredWords: '{{mastered}} / {{total}} words mastered',
            favorites: 'Favorites',
            learning: 'Learning',
            reviewToday: 'Review Today'
        },
        consistency: {
            eyebrow: 'Consistency',
            title: 'Streak Heatmap',
            subtitle: 'Your learning streak over the last 30 days.',
            currentStreak: 'Current streak',
            longestStreak: 'Longest streak',
            activeDays: 'Active days',
            less: 'Less',
            more: 'More',
            heatmapActive: '{{date}} - Active',
            heatmapInactive: '{{date}} - No activity',
            empty: 'No data available yet'
        },
        goals: {
            eyebrow: 'Goals',
            title: 'Goal Roadmap',
            subtitle: 'Your IELTS target, study habits, and focus areas all in one place.',
            targetIelts: 'Target IELTS',
            examDate: 'Exam Date',
            dailyGoal: 'Daily Goal',
            weeklyWords: 'Weekly Words',
            preferred: 'Preferred',
            needsFocus: 'Needs focus'
        },
        recommendations: {
            eyebrow: 'Recommendations',
            title: 'Recommended Practice',
            subtitle: 'Priority practice suggestions shaped by your current goals and weaker areas.',
            emptySubtitle: 'Add your IELTS target to unlock more accurate practice recommendations.',
            empty: 'No practice recommendations yet',
            startNow: 'Start now'
        },
        leaderboard: {
            eyebrow: 'Leaderboard',
            title: 'Weekly Ranking',
            subtitle: 'A quick snapshot of your current position and the closest competition around you.',
            viewLeaderboard: 'View leaderboard',
            snapshot: 'Your snapshot',
            rank: 'Rank',
            xp: 'XP',
            nextRank: 'Next Rank',
            rankAndStreak: 'Rank #{{rank}} • {{count}}-day streak',
            empty: 'No leaderboard data for this week yet'
        },
        recentActivity: {
            eyebrow: 'Recent Activity',
            title: 'Learning Timeline',
            subtitle: 'A compact timeline for following your most recent study sessions.',
            emptySubtitle: 'Your latest learning actions help reveal how your momentum is evolving.',
            empty: 'No recent activity yet',
            fallbackDescription: 'Learning activity'
        }
    },
    profileEdit: {
        modal: {
            title: 'Edit profile',
            save: 'Save changes'
        },
        messages: {
            updateSuccess: 'Profile updated successfully.',
            updateError: 'Unable to update profile.',
            imageOnly: 'Please upload an image file.',
            imageTooLarge: 'Avatar image must be smaller than {{count}} MB.',
            avatarMissingUrl: 'Avatar upload succeeded but no image URL was returned.',
            avatarUploadSuccess: 'Avatar uploaded successfully.',
            avatarUploadError: 'Unable to upload avatar.'
        },
        avatar: {
            title: 'Profile avatar',
            description: 'Upload a square image for the best result. JPG, PNG, GIF, or WebP up to {{count}} MB.',
            cropTitle: 'Crop avatar',
            apply: 'Apply',
            upload: 'Upload avatar'
        },
        fields: {
            displayName: {
                label: 'Display name',
                required: 'Please enter a display name.',
                length: 'Display name must be between 1 and 100 characters.',
                placeholder: 'Alex Johnson'
            },
            bio: {
                label: 'Bio',
                length: 'Bio must be 500 characters or fewer.',
                placeholder: 'Share a few lines about your learning goals and motivation.'
            },
            preferredLanguage: {
                label: 'Preferred language',
                required: 'Please choose your preferred language.',
                placeholder: 'Select a language'
            },
            targetBand: {
                label: 'Target IELTS band',
                range: 'Band score must be between 0.0 and 9.0.',
                placeholder: '6.5'
            },
            targetExamDate: {
                label: 'Target exam date',
                placeholder: 'Select exam date'
            },
            dailyGoalMinutes: {
                label: 'Daily goal (minutes)',
                range: 'Daily goal must be between 1 and 1440 minutes.',
                placeholder: '45'
            },
            weeklyWordGoal: {
                label: 'Weekly vocabulary goal',
                range: 'Vocabulary goal must be between 1 and 10000.',
                placeholder: '80'
            },
            preferredSkill: {
                label: 'Preferred skill',
                placeholder: 'Select a skill'
            }
        }
    },
    vocabularyTest: {
        title: 'AI Vocabulary Test',
        subtitle: 'Create a new test from your own learning history.',
        common: {
            na: 'N/A',
            secondsOnly: '{{count}}s',
            minutesSeconds: '{{minutes}}m {{seconds}}s'
        },
        login: {
            title: 'Log in to generate a personal vocabulary test',
            description: 'This feature builds questions from your own saved words, review history, and recent lookups.',
            cta: 'Log in now'
        },
        hero: {
            eyebrow: 'Personal Test Lab',
            aiBadge: 'AI-generated',
            generated: 'Generated tests',
            attempts: 'Attempts',
            focus: 'Focus',
            focusValue: 'Personal vocabulary'
        },
        generate: {
            eyebrow: 'Create with AI',
            title: 'Build a fresh test from your vocabulary sources',
            description: 'Choose how many questions you want and which personal sources AI should use to build this test.',
            questionCount: 'Question count',
            questionCountValue: '{{count}} questions',
            sources: 'Sources',
            aiBadge: 'AI is building from your real learning data',
            helper: 'The generated test stays fixed after creation, while retake creates a new attempt on the same test.',
            cta: 'Generate test with AI',
            loading: 'Generating questions from your vocabulary...',
            queued: 'Test generation has been queued. We will notify you when it is ready.'
        },
        history: {
            title: 'Your generated tests',
            description: 'Review the tests AI already created for you or open your attempt history.',
            generatedTab: 'Generated tests',
            attemptsTab: 'Attempts',
            pageTitle: 'Vocabulary test history',
            pageDescription: 'Review completed attempts and continue any in-progress test still available on this device.',
            loadError: 'Unable to load vocabulary test history.',
            backToTests: 'Back to tests'
        },
        list: {
            aiBadge: 'AI-generated',
            latestAccuracy: 'Latest accuracy: {{value}}%',
            noAttemptYet: 'No attempts yet',
            pendingDescription: 'AI is generating this test now. It will appear here when ready.',
            failedDescription: 'This test could not be generated. You can create another one.',
            cardMeta: '{{questions}} questions • {{minutes}} min • {{sources}}',
            createdAt: 'Created {{value}}',
            attemptCount: '{{count}} attempts',
            emptyTitle: 'You have not created any AI vocabulary tests yet',
            emptyDescription: 'Choose your sources and generate your first personal vocabulary test.'
        },
        attempts: {
            scoreLine: '{{correct}}/{{total}} correct • {{accuracy}}% accuracy',
            inProgressLine: 'In progress • {{total}} questions',
            startedAt: 'Started: {{value}}',
            completedAt: 'Completed: {{value}}',
            emptyTitle: 'No vocabulary test attempts yet',
            emptyDescription: 'Your recent attempts will appear here after you start a generated test.'
        },
        preview: {
            eyebrow: 'Preview',
            aiBadge: 'AI-generated',
            description: 'Built from {{sources}}.',
            questionCount: 'Questions',
            estimatedMinutes: 'Suggested time',
            minutesValue: '{{count}} min',
            sources: 'Selected sources',
            statusLabel: 'Status',
            helperTitle: 'Before you start',
            helper: 'This preview does not reveal correct answers. Start when you are ready to take the test.',
            start: 'Start test',
            generateAnother: 'Generate another',
            questionsTitle: 'Question preview',
            questionsDescription: 'Review the generated structure before starting your attempt.',
            questionLabel: 'Question {{order}}',
            pendingTitle: 'This generated test is still being created',
            pendingDescription: 'This page will refresh automatically when the test is ready. You will also receive a notification.',
            failedTitle: 'This generated test is not ready',
            failedDescription: 'Try generating another test or adjust the selected sources.',
            notFoundTitle: 'Vocabulary test not found',
            notFoundDescription: 'We could not load this generated test. Please return to your test list.',
            status: {
                PENDING: 'Generating',
                READY: 'Ready to start',
                FAILED: 'Generation failed'
            }
        },
        take: {
            eyebrow: 'Take test',
            meta: '{{answered}}/{{total}} answered • {{minutes}} min suggested',
            footerHint: '{{answered}} of {{total}} questions answered',
            questionLabel: 'Question {{order}}',
            submitTitle: 'Submit this vocabulary test?',
            submitConfirm: 'You answered {{answered}} of {{total}} questions. You can still submit now.',
            submit: 'Submit test',
            notFoundTitle: 'Attempt data is not available',
            notFoundDescription: 'We could not restore this vocabulary test session on this device.'
        },
        result: {
            eyebrow: 'Result',
            description: 'Review your answers, accuracy, and the correct options for each question.',
            retake: 'Retake this test',
            accuracy: 'Accuracy',
            correctCount: 'Correct answers',
            timeSpent: 'Time spent',
            reviewTitle: 'Answer review',
            reviewDescription: 'See where your choices matched the correct answer and where you should review again.',
            selectedAnswer: 'Your answer',
            noAnswer: 'No answer',
            correctAnswer: 'Correct answer',
            sourceWord: 'Source word',
            questionLabel: 'Question {{order}}',
            correct: 'Correct',
            incorrect: 'Incorrect',
            notFoundTitle: 'Result not found',
            notFoundDescription: 'We could not load this attempt result. Please return to the test list.'
        },
        actions: {
            preview: 'Preview',
            viewResult: 'View result',
            continueAttempt: 'Continue attempt',
            resumeUnavailable: 'Resume unavailable',
            startThisTest: 'Start this test',
            generatingTest: 'Generating test',
            testUnavailable: 'Unavailable',
            retakeThisTest: 'Retake this test',
            backToTests: 'Back to tests',
            backToPreview: 'Back to preview'
        },
        status: {
            PENDING: 'Generating',
            READY: 'Ready',
            FAILED: 'Failed',
            IN_PROGRESS: 'In progress',
            COMPLETED: 'Completed'
        },
        error: {
            notEnoughData: 'There are not enough words in the selected sources to build this test.',
            notFound: 'We could not find this vocabulary test.',
            generic: 'Something went wrong. Please try again.'
        },
        sources: {
            options: {
                ALL: 'All sources',
                VOCABULARY_RECORD: 'Review history',
                USER_DICTIONARY: 'My dictionary',
                USER_WORD_LOOKUP_EVENT: 'Recent lookups'
            }
        }
    },
    vocabularyCheck: {
        title: 'Vocabulary Check',
        description: 'Validate an English word, guess its Vietnamese meaning, and ask AI for extra explanation when you want deeper understanding.',
        eyebrow: 'Vocabulary Lab',
        stats: {
            validate: 'Validate',
            answer: 'Answer',
            aiCoach: 'AI Coach',
            ready: 'Ready',
            enabled: 'Enabled',
            login: 'Log in'
        },
        validateCard: {
            title: 'Step 1. Validate the word',
            description: 'Enter an English word first so we can confirm it is valid before you answer.',
            label: 'English word',
            placeholder: 'Enter an English word, for example: beautiful, knowledge...',
            cta: 'Validate',
            success: 'Valid word. Now enter the Vietnamese meaning below.',
            error: 'We could not find this word. Please check the spelling.'
        },
        meaningCard: {
            title: 'Step 2. Enter the meaning',
            description: 'Type the Vietnamese meaning you believe matches the word.',
            label: 'Vietnamese meaning',
            placeholder: 'Enter the Vietnamese meaning of the word...',
            cta: 'Submit answer'
        },
        messages: {
            enterEnglishWord: 'Please enter an English word first.',
            enterVietnameseMeaning: 'Please enter the Vietnamese meaning first.',
            validWord: 'Valid word. Keep going.',
            invalidWord: 'This word is not valid. Please check it again.',
            apiError: 'Connection error. Please try again.',
            checkError: 'Unable to check the meaning right now.',
            saveRecordError: 'The answer was checked, but the record could not be saved right now.',
            correct: 'Correct. Excellent work!',
            incorrect: 'Not quite right yet. Review the correct meaning below.',
            askAiError: 'Unable to ask AI right now. Please try again later.',
            aiQueryRequired: 'Please enter a word or question for AI.',
            saveSuccess: 'Saved to your dictionary.',
            saveError: 'Unable to save this word right now.',
            removeSuccess: 'Removed from your dictionary.',
            removeError: 'Unable to remove this word right now.'
        },
        result: {
            correctTitle: 'Correct answer',
            incorrectTitle: 'Not quite right',
            correctDescription: 'You matched the meaning correctly. Keep this momentum going.',
            incorrectDescription: 'No worries. Review the correct meaning once more and try the next word.',
            correctMeaning: 'Correct meaning',
            alternatives: 'Other possible meanings',
            synonyms: 'English synonyms',
            explanation: 'Extra explanation',
            examples: 'Usage examples'
        },
        enrichment: {
            loading: 'Checking saved meaning data...',
            aiExplainCta: 'Ask AI',
            pendingHint: 'If this word is an idiom or phrasal verb, I will need a bit more time to check and fetch the enrichment data for you. You can check back in about 10 seconds.',
            waitEnrichment: 'AI is fetching extra data to enrich this word. Please check back in a moment. (Usually less than 10 seconds)'
        },
        actions: {
            nextWord: 'Next word',
            retryCheck: 'Check again',
            askAi: 'Ask AI about this word'
        },
        empty: {
            title: 'Start with one English word',
            description: 'We will validate the word first, then help you check the Vietnamese meaning with clear feedback.'
        },
        ai: {
            title: 'Ask AI',
            description: 'Ask about vocabulary, grammar, usage, or examples to understand the word more deeply.',
            loginRequired: 'Log in to use this AI feature.',
            loginHint: 'Sign in to ask AI about vocabulary, grammar, and usage.',
            placeholder: 'Enter a word...',
            cta: 'Ask AI',
            loading: 'AI is preparing a helpful explanation...',
            responseTitle: 'AI explanation',
            streaming: 'AI is streaming the explanation...',
            errors: {
                invalidRequest: 'The word or request is invalid.',
                connectionClosed: 'The realtime connection closed. Please try again.',
                tooManyActive: 'You already have three active explanations. Close one and retry.',
                timeout: 'AI took too long to respond. Please retry.',
                streamFailed: 'The AI stream failed. Please retry.',
                emptyResponse: 'AI returned no explanation. Please retry.',
                generic: 'The explanation could not be completed. Please retry.'
            }
        }
    },
    vocabularyHistory: {
        title: 'Vocabulary History',
        description: 'Review previous answers, spot patterns, and keep your vocabulary progress moving in a steady direction.',
        eyebrow: 'Progress Log',
        stats: {
            total: 'Total records',
            correct: 'Correct answers',
            focus: 'Current focus',
            allStatuses: 'All statuses'
        },
        filters: {
            searchPlaceholder: 'Search by word or meaning...',
            all: 'All',
            correct: 'Correct',
            incorrect: 'Incorrect',
            from: 'From date',
            to: 'To date',
            records: '{{count}} records',
            clearAll: 'Clear all'
        },
        table: {
            englishWord: 'English word',
            userAnswer: 'Your answer',
            correctMeaning: 'Correct meaning',
            result: 'Result',
            testedAt: 'Tested at',
            correctTag: 'Correct',
            incorrectTag: 'Incorrect',
            empty: 'No vocabulary history yet.',
            pagination: '{{start}}-{{end}} / {{total}} records'
        },
        actions: {
            delete: 'Delete',
            deleteTitle: 'Delete this record?',
            deleteDescription: 'This record will be removed from your history.',
            clearTitle: 'Clear all history?',
            clearDescription: 'This action cannot be undone.'
        },
        messages: {
            deleteSuccess: 'Record deleted.',
            clearSuccess: 'All history has been cleared.'
        }
    },
    vocabularyReview: {
        eyebrow: 'Memory Studio',
        title: 'Vocabulary Review',
        descriptions: {
            config: 'Choose a review mode, set the direction, and start a focused session that fits your current energy.',
            practice: 'Stay with one word at a time and keep your recall active.',
            result: 'See what stayed strong, what slipped, and what deserves another quick round.'
        },
        stats: {
            readyWords: 'Ready words',
            direction: 'Direction',
            currentStage: 'Current stage',
            setup: 'Setup',
            practice: 'Practice',
            result: 'Result',
            config: 'Config'
        },
        range: {
            title: 'Pick a review window',
            description: 'Review exactly the period you want: recent days, a specific week, or a specific month.',
            selected: 'Selected: {{label}}',
            modes: {
                range: 'Date range',
                week: 'By week',
                month: 'By month',
                all: 'All time'
            },
            allHistoryHint: 'Use every saved word without a time limit',
            presets: {
                allHistory: 'Full history',
                last7: 'Last 7 days',
                last30: 'Last 30 days',
                thisWeek: 'By week',
                thisMonth: 'By month',
                custom: 'Custom'
            }
        },
        groups: {
            title: 'Pick a word group',
            description: 'Prefer words you have never reviewed, or focus on the ones you keep missing.',
            unreviewed: 'Not reviewed yet',
            unreviewedHint: 'Never appeared in a review session',
            wrong: 'Frequently missed',
            wrongHint: 'Wrong ratio above 50%',
            all: 'All words',
            allHint: 'Every word in the selected window'
        },
        directions: {
            enVi: 'English to Vietnamese',
            viEn: 'Vietnamese to English'
        },
        config: {
            modeTitle: 'Choose your review mode',
            modeDescription: 'Pick the word group you want to revisit so the session feels targeted and worthwhile.',
            directionTitle: 'Set the review direction',
            directionDescription: 'Switch direction depending on whether you want recognition or active recall.',
            countTitle: 'Choose how many words to review',
            countDescription: 'A shorter focused round often works better than a long session you cannot finish.',
            availableWords: 'Words available',
            readyCount: '{{count}} words ready',
            sessionCount: '{{count}} words in this session',
            emptyTitle: 'No words are ready for this review mode yet',
            emptyDescription: 'Try another filter, or build a few vocabulary records first so review has material to work with.',
            start: 'Start review'
        },
        practice: {
            progress: 'Review progress',
            cardPromptEnVi: 'English word',
            cardPromptViEn: 'Vietnamese meaning',
            pronounce: 'Pronounce',
            answerLabelEnVi: 'Enter the Vietnamese meaning',
            answerLabelViEn: 'Enter the English word',
            answerPlaceholderEnVi: 'Type the Vietnamese meaning...',
            answerPlaceholderViEn: 'Type the English word...',
            check: 'Check',
            next: 'Next',
            finish: 'Finish',
            enterEnglish: 'Please enter the English word.',
            enterVietnamese: 'Please enter the Vietnamese meaning.',
            correctToast: 'Correct. Nice recall!',
            incorrectToast: 'Not quite right. Review the correct answer below.',
            correctTitle: 'Correct answer',
            incorrectTitle: 'Not quite right',
            correctDescription: 'Great job. You remembered this one well.',
            incorrectDescription: 'No worries. Seeing the correct answer again will help it stick.',
            correctAnswerEnVi: 'Correct meaning',
            correctAnswerViEn: 'Correct English word',
            alternatives: 'Other accepted meanings',
            showMore: 'Show more',
            showLess: 'Show less',
            explanation: 'Extra explanation',
            examples: 'Usage examples'
        },
        result: {
            excellent: 'Excellent',
            good: 'Good work',
            improving: 'Keep building',
            needsReview: 'Needs another round',
            summary: 'You answered {{correct}} out of {{total}} words correctly.',
            total: 'Total',
            correct: 'Correct',
            incorrect: 'Incorrect',
            accuracy: 'Accuracy',
            accuracyTitle: 'Accuracy rate',
            comparedToLast: '{{diff}}% compared with your previous session',
            detailsTitle: 'Session details',
            retryAll: 'Review again',
            retryWrong: 'Retry {{count}} difficult words',
            table: {
                prompt: 'Prompt',
                yourAnswer: 'Your answer',
                correctAnswer: 'Correct answer',
                result: 'Result',
                correctTag: 'Correct',
                incorrectTag: 'Incorrect'
            }
        }
    },
    vocabularyEvaluation: {
        eyebrow: 'Insight Board',
        title: 'Learning Insights',
        description: 'See how your vocabulary practice is trending, where accuracy is improving, and which words still need more attention.',
        periods: {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            today: 'Today',
            thisWeek: 'This week',
            thisMonth: 'This month'
        },
        stats: {
            total: 'Words checked',
            correct: 'Correct answers',
            incorrect: 'Incorrect answers',
            streak: 'Learning streak',
            words: '{{count}} words',
            days: '{{count}} days',
            accuracy: '{{count}}% accuracy',
            needsReview: 'Needs another review',
            keepGoing: 'Keep the streak alive'
        },
        chart: {
            title: 'Progress trend',
            description: 'A clear view of how many answers were correct or incorrect during this period.',
            empty: 'No chart data is available yet for this period.',
            correct: 'Correct',
            incorrect: 'Incorrect',
            tooltipCorrect: 'Correct: {{count}}',
            tooltipIncorrect: 'Incorrect: {{count}}'
        },
        weakWords: {
            title: 'Words that need more care',
            description: 'These words show up repeatedly in incorrect answers, so they are the best candidates for focused review.',
            count: '{{count}} words',
            emptyTitle: 'No difficult words right now',
            emptyDescription: 'Great work. You do not have any frequently missed words in this period.',
            columns: {
                word: 'English word',
                meaning: 'Correct meaning',
                wrongCount: 'Missed count',
                level: 'Priority'
            },
            wrongCountValue: '{{count}} times',
            levels: {
                urgent: 'Urgent review',
                improve: 'Needs improvement',
                watch: 'Watch list'
            }
        }
    },
    leaderboard: {
        title: 'Leaderboard',
        description: 'Compete, stay consistent, and climb the rankings by completing more learning activities.',
        loadError: 'Unable to load the leaderboard',
        filtersEyebrow: 'Leaderboard Filters',
        filtersTitle: 'Track the learning race in real time',
        filtersSubtitle: 'Choose a time range and comparison scope to see exactly where you stand.',
        rankingScope: 'Ranking Scope',
        period: {
            WEEKLY: 'This week',
            MONTHLY: 'This month',
            ALL_TIME: 'All time'
        },
        scope: 'Scope',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        allTime: 'All Time',
        yourRanking: 'Your Ranking',
        progressToRank: 'Progress to rank #{{rank}}',
        xpLeft: '{{count}} XP left',
        fromLastSnapshot: 'from last snapshot',
        viewXpHistory: 'View XP History',
        noRanking: 'No ranking yet. Complete more activities to start earning XP.',
        startPracticing: 'Start Practicing',
        viewMore: 'View {{count}} more',
        tiedRank: 'Tied at rank #{{rank}}',
        learner: 'Learner',
        you: '(You)',
        totalXp: 'Total XP',
        rankChange: 'Rank Change',
        streak: 'Streak',
        subtitle: 'An XP leaderboard — for information, not pressure',
        yourPosition: 'Your position · {{period}}',
        ofParticipants: 'of {{count}} people',
        xpToNext: '{{count}} XP to the next rank',
        topOfBoard: 'You are near the top of the board.',
        unrankedTitle: 'You are not on this week’s board yet',
        unrankedBody: 'The board ranks XP earned. One session puts you on it — and nothing is lost by staying off it.',
        yourXp: 'Your XP',
        earnXp: 'How to earn XP',
        periodLabel: 'Time range',
        rankLabel: 'Rank {{rank}}',
        tied: 'tied',
        anonymous: 'Anonymous learner',
        emptyTitle: 'The leaderboard is empty',
        emptyBody: 'Nobody has earned XP in this range yet. One session opens the board.',
        ethicsNote: 'This board is only there so you can see your own rhythm next to other people. No reward is locked behind a rank, and a tie is shown as a tie rather than split into a winner and a loser.'
    },
    xpHistory: {
        loadError: 'Unable to load XP history',
        back: 'Back to Leaderboard',
        title: 'XP History',
        description: 'Review a detailed timeline of how you have earned XP.',
        totalXpEarned: 'Total XP Earned',
        xpThisWeek: 'XP This Week',
        activities: 'Activities',
        recentActivity: 'Recent Activity',
        activitiesCount: '{{count}} activities',
        emptyTitle: 'No XP history yet',
        emptyDescription: 'Start practicing to earn your first XP.',
        sources: {
            fullTest: 'Completed an IELTS test',
            miniTest: 'Completed a mini test',
            vocabReview: 'Reviewed vocabulary',
            speakingPractice: 'Practiced speaking',
            writingSubmission: 'Submitted a writing task',
            dailyTask: 'Completed a daily task',
            allDailyTasksBonus: 'Bonus for completing all daily tasks',
            streakBonus: 'Streak bonus',
            quickPractice: 'Quick practice',
            bandIncrease: 'Band score increased',
            weeklyReward: 'Weekly leaderboard reward',
            other: 'Other activity'
        }
    },
    home: {
        hero: {
            eyebrow: 'Learning dashboard',
            title: 'A clear view of today’s learning progress',
            description: 'Track your streak, today’s goal, and {{count}} completed tasks to keep your momentum steady.',
            streak: 'Current streak',
            goal: 'Today goal',
            recommendations: 'Ready recommendations',
            pending: 'Updating'
        },
        loadError: 'Unable to load your learning dashboard. Please try again.',
        streakToastStrong: '🔥 {{count}}-day streak! You are building amazing momentum!',
        streakToastWarm: '🔥 {{count}}-day streak! Keep going, you are doing great!',
        todayLearning: {
            streak: '{{count}}-day streak',
            title: 'Let\'s keep learning today',
            goal: 'Today: {{studied}} / {{target}} minutes',
            continue: 'Continue Learning',
            vocabulary: 'Vocabulary',
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking'
        },
        dailyTasks: {
            title: 'Today\'s Tasks',
            subtitle: 'Complete your daily tasks and build steady progress.',
            completed: 'Completed'
        },
        streakHeatmap: {
            title: 'Weekly Heatmap',
            subtitle: 'Stay active every day and keep your streak alive.',
            days: 'Days',
            studied: 'Studied',
            missed: 'Missed'
        },
        progressOverview: {
            title: 'Progress Overview',
            subtitle: 'Track your IELTS and vocabulary growth clearly.',
            bandScore: 'IELTS Band Score',
            vocabulary: 'Vocabulary',
            total: 'Total',
            mastered: 'Mastered',
            reviewing: 'Reviewing',
            bandLabel: 'Band'
        },
        quickPractice: {
            title: 'Quick Practice',
            subtitle: 'Fit in a focused practice session anytime.'
        },
        recentActivity: {
            title: 'Recent Activity',
            subtitle: 'Your latest learning steps and results.',
            empty: 'No recent activity yet. Your next study session starts the story.'
        },
        weakSkills: 'Needs work',
        recommendations: {
            title: 'Recommended for You',
            subtitle: 'Thoughtfully chosen to match your current level and next goals.',
            start: 'Start'
        },
        leaderboardWidget: {
            title: 'Weekly Leaderboard',
            empty: 'No leaderboard data yet',
            yourRank: 'Your rank',
            noRank: 'You do not have a rank yet. A few more activities will get you on the board.',
            viewFull: 'View Full Leaderboard',
            loadError: 'Unable to load leaderboard'
        },
        launchpad: {
            minutes: '{{count}} min',
            timeUnknown: 'Flexible pace',
            continueCta: 'Continue learning',
            invalidRoute: 'This learning route is not available on the current client yet.',
            fallbackContinueTitle: 'Start a short learning session',
            fallbackContinueDescription: 'We could not load your recommended next step, so here is a safe fallback into the study flow.',
            dailyEyebrow: 'Daily Tasks',
            dailyTitle: 'Short actions for today',
            dailyDescription: 'Keep the plan small and direct so the next learning step feels obvious.',
            dailyEmpty: 'No daily tasks are ready yet. Use quick practice to keep the streak moving.',
            dailyCompleted: '{{completed}}/{{total}} done',
            xpEarned: '{{count}} XP earned',
            availableXp: '+{{count}} XP available',
            goalLabel: 'Today target',
            listTask: 'List of tasks',
            doneBadge: 'Done',
            startTask: 'Start',
            drawerLabel: 'Daily plan',
            dailyLoadError: 'Unable to load today\'s daily tasks.',
            drawerLoginTitle: 'Log in to view today\'s daily tasks',
            drawerLoginDescription: 'Your daily plan is tied to your account and real progress, so sign in to load the correct task list.',
            openAgain: 'Open again',
            quickEyebrow: 'Quick Practice',
            quickTitle: 'One-click warm-up options',
            quickDescription: 'Action-first cards for fast sessions under ten minutes.',
            progressEyebrow: 'Progress Snapshot',
            progressTitle: 'Today and this week',
            progressLabels: {
                studied: 'Studied today',
                target: 'Target today',
                streak: 'Current streak',
                weeklyXp: 'Weekly XP'
            },
            todayProgress: 'Today progress',
            reasons: {
                unfinished: 'Resume now',
                dueReview: 'Due review',
                weakSkill: 'Recommended focus',
                shortRecommendation: 'Short recommendation',
                getStarted: 'Get started',
                USER_DICTIONARY_FOUNDATION: 'Personal vocabulary',
                NEW_WORD_LOOKUP: 'New word discovery',
                TASK_1: 'Writing Task 1',
                TASK_2: 'Writing Task 2',
                EASY: 'Easy',
                MEDIUM: 'Medium',
                HARD: 'Hard',
                PART_1: 'Speaking Part 1',
                PART_2: 'Speaking Part 2',
                PART_3: 'Speaking Part 3',
                LISTENING: 'Listening',
                READING: 'Reading',
                WRITING: 'Writing',
                SPEAKING: 'Speaking'
            },
            taskTypes: {
                DEFAULT: 'Task',
                VOCABULARY: 'Vocabulary',
                WRITING: 'Writing',
                SPEAKING_PRACTICE: 'Speaking practice',
                SPEAKING_CONVERSATION: 'Speaking conversation',
                IELTS_FULL_TEST: 'IELTS full test',
                IELTS_QUICK_TEST: 'IELTS quick test'
            },
            difficulty: {
                EASY: 'Easy',
                MEDIUM: 'Medium',
                HARD: 'Hard',
                DEFAULT: 'Recommended'
            },
            xpBadge: '+{{count}} XP',
            feedback: {
                fallbackTask: 'this task',
                default: '{{task}} complete. +{{xp}} XP.',
                generic: '{{task}} complete. Progress saved.'
            },
            quickStartIeltsError: 'Unable to start a mini IELTS session right now. Please pick a test manually.',
            remainingTargetToday: 'You are {{remaining}} minutes away from reaching todays target. Keep up the great work and finish strong!',
            overTargetToday: 'Youve already exceeded your todays target with {{studied}} minutes of study!'
        },
        reminder: {
            dismiss: 'Dismiss reminder'
        },
        title: 'Home',
        greetingPrompt: 'You missed 3 True/False/Not Given questions yesterday. Shall we practise for 10 minutes?',
        greeting: 'Hi {{name}} 👋',
        continueTitle: 'Continue: Reading — Matching Headings',
        continueMeta: 'Lesson 4 of your path · about 12 minutes',
        start: 'Start',
        seePlan: 'See today\'s plan',
        todayPlan: 'Today\'s plan',
        rhythm: 'Last 5 weeks',
        suggestions: 'Suggested for you',
        seeAll: 'See all',
        statStreak: 'Day streak',
        statWeeklyXp: 'XP this week',
        xpValue: '{{val, number}}',
        statToday: 'Minutes today',
        statBand: 'Estimated band',
        statCredit: 'Credits',
        todayProgress: '{{done}} / {{goal}} minutes of today’s goal',
        minutes: '{{count}} min',
        doNow: 'Do it',
        done: 'Done',
        graceDaysLeft: '{{count}} grace days left',
        rhythmAria: 'Study density over the last 5 weeks',
        suggestListening: 'Listening Section 3',
        suggestVocab: 'Vocabulary test — Education',
        suggestWriting: 'Writing Task 1 — Chart',
        emptyNextTitle: 'No suggestion yet',
        emptyNextBody: 'Do one short piece of work first so we can see where you are and suggest the right thing.',
        emptyPlanTitle: 'No plan for today yet',
        emptyPlanBody: 'Your plan appears after you complete your first piece of work.'
    },
    recommendations: {
        start: 'Open',
        feedbackError: 'Unable to open this recommendation right now.',
        dismissError: 'Unable to dismiss this recommendation right now.',
        snoozeError: 'Unable to snooze this recommendation right now.',
        priorityBadge: 'P{{count}}',
        snooze: {
            oneHour: 'Remind in 1 hour',
            tomorrow: 'Remind tomorrow'
        },
        difficulty: {
            EASY: 'Easy',
            MEDIUM: 'Medium',
            HARD: 'Hard',
            DEFAULT: 'Recommended'
        },
        types: {
            DEFAULT: 'Recommendation',
            IELTS_RESUME: 'Resume IELTS',
            VOCAB_REVIEW: 'Vocabulary review',
            VOCAB_MICRO_SESSION: 'Micro vocabulary session',
            DAILY_SPEAKING_PROMPT: 'Daily speaking prompt',
            WEAK_SKILL_DRILL: 'Weak-skill drill',
            WEAK_SKILL_QUICK_PRACTICE: 'Quick practice',
            SHORT_RECOMMENDATION: 'Short recommendation'
        },
        references: {
            DAILY_SPEAKING_PROMPT: 'Daily speaking prompt',
            IELTS_ATTEMPT: 'IELTS attempt',
            READING_DRILL: 'Reading drill',
            VOCAB_MICRO_SESSION: 'Micro vocabulary session',
            VOCAB_REVIEW: 'Vocabulary review',
            WRITING_TASK: 'Writing task'
        }
    },
    flagshipRetention: {
        eyebrow: 'Flagship retention',
        title: 'Keep today moving with one focused action',
        description: 'Short speaking, micro vocab and your weekly challenge',
        startSpeaking: 'Start speaking',
        resumeSpeaking: 'Resume speaking',
        emptySpeaking: 'No speaking prompt for this moment.',
        reviewWords: 'Review words',
        targetWords: '{{count}} words target',
        openChallenge: 'Open challenge',
        viewWeeklyProgress: 'View progress',
        rewardXp: '+{{count}} XP'
    },
    weeklyReport: {
        loginTitle: 'Sign in for reports',
        loginDescription: 'Weekly reports use learning data from your account.',
        loginCta: 'Sign in',
        current: {
            title: 'Weekly report',
            historyLink: 'History'
        },
        history: {
            title: 'Report history',
            backToCurrent: 'Current week',
            emptyTitle: 'No report history',
            emptyDescription: 'Finalized weekly reports will appear here.'
        },
        status: {
            open: 'Updating',
            closing: 'Finalizing',
            finalized: 'Finalized'
        },
        freshness: {
            delayed: 'Update delayed',
            stale: 'Data may be stale'
        },
        states: {
            errorTitle: 'Unable to load',
            errorDescription: 'Try again shortly.',
            retry: 'Retry',
            notReadyTitle: 'Report not ready',
            notReadyDescription: 'Weekly data is still being prepared.',
            noActivity: 'No activity'
        },
        highlights: {
            TOTAL_STUDY_TIME: 'Study time',
            ACTIVE_DAYS: 'Active days',
            SPEAKING_AVERAGE: 'Speaking avg',
            WRITING_AVERAGE: 'Writing avg',
            IELTS_FULL_BAND: 'IELTS band',
            IELTS_QUICK_ACCURACY: 'IELTS accuracy',
            VOCABULARY_NEW_WORDS: 'New words'
        },
        trend: {
            up: 'Up',
            down: 'Down',
            stable: 'Stable',
            new: 'New',
            insufficientData: 'Not enough data'
        },
        modules: {
            ielts: 'IELTS',
            speaking: 'Speaking',
            writing: 'Writing',
            vocabulary: 'Vocabulary'
        },
        metrics: {
            studyTime: 'Study time',
            activeDays: 'Active days',
            sessions: 'Sessions',
            completed: 'Completed',
            xp: 'XP',
            assignedTasks: 'Assigned',
            completedTasks: 'Completed',
            startedAttempts: 'Started',
            graded: 'Graded',
            average: 'Average',
            best: 'Best',
            latest: 'Latest',
            accuracy: 'Accuracy',
            newWords: 'New words',
            reviewedWords: 'Reviewed',
            masteredWords: 'Mastered',
            correct: 'Correct',
            incorrect: 'Incorrect'
        },
        activity: {
            title: 'Weekly activity',
            active: 'Active',
            noActivity: 'No activity',
            future: 'Future'
        },
        gamification: {
            title: 'Progress',
            dailyTasks: 'Daily tasks',
            xpBySource: 'XP earned',
            challenges: 'Challenges',
            achievements: 'Achievements'
        },
        common: {
            updatedAt: 'Updated',
            finalizedAt: 'Finalized',
            range: 'Week',
            scoreUnavailable: 'Score unavailable'
        }
    },
    weeklyChallenge: {
        loginTitle: 'Sign in to view weekly challenges',
        loginDescription: 'Challenge progress and unlocked achievements are tied to your account, so this page opens after login.',
        loginCta: 'Go to login',
        eyebrow: 'Weekly challenges',
        title: 'Keep this week moving forward',
        description: 'Track every challenge assigned this week and see which rewards have already been granted.',
        openWeeklyReport: 'Open weekly report',
        rangeLabel: '{{start}} - {{end}}',
        noPeriod: 'Current weekly period',
        listTitle: 'This week’s challenges',
        completedCount: '{{completed}} / {{total}} completed',
        status: {
            not_started: 'Not started',
            in_progress: 'In progress',
            completed: 'Completed',
            rewarded: 'Rewarded',
            unknown: 'Status unavailable'
        },
        progressAriaLabel: '{{title}} progress: {{current}} of {{target}}',
        remaining: '{{value}} remaining',
        rewardXp: '+{{xp}} XP',
        completedAt: 'Completed {{date}}',
        rewardGrantedAt: 'Reward granted {{date}}',
        pendingReward: 'Reward pending',
        loadErrorTitle: 'Unable to load weekly challenges',
        loadErrorDescription: 'Your other weekly information is still available. Try loading the challenges again.',
        retry: 'Try again',
        empty: 'There are no active weekly challenges right now.',
        achievements: {
            title: 'Achievements',
            description: 'Unlocked milestones stay pinned first, then the next goals remain visible underneath.',
            locked: 'Locked',
            empty: 'Achievements will appear here as you build weekly momentum.'
        }
    },
    ielts: {
        title: 'IELTS tests',
        description: 'Build confidence with realistic IELTS Listening and Reading practice tests.',
        guestTitle: 'IELTS Test',
        guestDescription: 'Try IELTS practice tests for free',
        guestLoginRequired: 'Log in to unlock IELTS practice tests',
        guestLoginHint: 'Sign in to start practicing and track your progress.',
        tabs: {
            tests: 'Practice Tests',
            history: 'Attempt History'
        },
        history: 'History',
        loadError: 'Unable to load IELTS tests right now.',
        empty: 'No tests found yet. Try adjusting the filters.',
        filter: {
            label: 'Filter:',
            allSkills: 'All Skills',
            allDifficulties: 'All Difficulties',
            reading: 'Reading',
            listening: 'Listening',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        card: {
            completed: 'Completed',
            notStarted: 'Not started',
            bandScore: 'Band Score',
            correct: '{{correct}} / {{total}} correct',
            questions: '{{count}} questions',
            minutes: '{{count}} min'
        },
        common: {
            fullTest: 'Full test',
            quickTest: 'Quick test',
            test: 'Test',
            section: 'Section',
            passage: 'Passage',
            accuracy: 'Accuracy',
            accuracyValue: 'Accuracy {{value}}%',
            bandValue: 'Band {{value}}',
            questionMinuteMeta: '{{questions}} questions • {{minutes}} min',
            minutesShort: '{{count}} min'
        },
        historyTable: {
            test: 'Test',
            result: 'Result',
            score: 'Score',
            band: 'Band',
            time: 'Time',
            date: 'Date'
        },
        detail: {
            loadError: 'Failed to load test details',
            startError: 'Failed to start test: {{message}}',
            notFound: 'Test not found',
            backToTests: 'Back to Tests',
            back: 'Back',
            difficultySuffix: '{{skill}} • {{difficulty}} difficulty',
            questions: 'Questions',
            minutes: 'Minutes',
            sections: 'Sections',
            sectionsOverview: 'Sections Overview',
            sectionQuestions: '{{count}} Qs',
            start: 'Start',
            practiceOptionsTitle: 'Choose how to practice',
            fullTestTitle: 'Full test',
            fullTestDescription: 'Take the entire test to receive a full result and complete band score.',
            quickTestDescription: 'Pick the exact section or passage you want to practice right now in 5-15 minutes.',
            startFull: 'Take full test',
            startSection: 'Do section',
            startPassage: 'Do passage',
            timerNote: 'You will have {{count}} minutes to complete this test. The test will be auto-submitted when time runs out.'
        },
        taking: {
            backBlocked: 'You cannot go back while taking the test. Please submit or stop the test first.',
            refreshBlocked: 'You cannot refresh the page while taking the test.',
            loadError: 'Failed to load test',
            audioCompleted: 'This section is complete. You can move to the next section now.',
            audioBlocked: 'Please finish listening to the audio before moving to the next section.',
            submitSuccess: 'Test submitted successfully!',
            submitError: 'Failed to submit: {{message}}',
            submitTitle: 'Submit Test?',
            submitConfirm: 'Are you sure you want to submit?',
            answeredProgress: '{{answered}} / {{total}} questions answered',
            submit: 'Submit',
            cancel: 'Cancel',
            stopTitle: 'Stop Test?',
            stopConfirm: 'Are you sure you want to stop the test?',
            stopWarning: 'Your current answers will be submitted as they are.',
            stopAndSubmit: 'Stop & Submit',
            continue: 'Continue Test',
            notFound: 'Test not found',
            backToTests: 'Back to Tests',
            stopButton: 'Stop Test',
            audioLabel: 'Audio',
            audioDone: 'Completed',
            audioPlaying: 'Playing...',
            audioSeekHintLabel: 'Audio hint:',
            sharedContext: 'Open shared passage',
            sharedContextShortcutAction: 'Popup',
            passageLabel: 'Passage {{count}}',
            passageWithTitle: 'Passage {{count}} - {{title}}',
            submitButton: 'Submit Test'
        },
        result: 'Result',
        transcript: {
            title: 'Listening Transcript',
            description: 'Available after submission so you can compare the audio with your answers.',
            section: 'Section {{count}}',
            sectionWithTitle: 'Section {{count}} - {{title}}',
            audio: 'Audio',
            transcript: 'Transcript'
        },
        answerReview: {
            yourAnswer: 'Your answer:',
            correct: 'Correct:',
            empty: '(empty)'
        },
        summary: {
            bandScore: 'Band Score',
            accuracy: 'Accuracy',
            correct: 'Correct ({{accuracy}}%)',
            correctCount: 'Correct answers',
            bandEstimate: 'Band estimate',
            timeSpent: 'Time Spent',
            minutesSeconds: 'min {{seconds}}s'
        },
        navigator: 'Question navigator',
        questionsUi: {
            unsupported: 'Unsupported question type: {{type}}',
            matchingHint: 'Choose the best answer',
            matchingPlaceholder: 'Select an answer...',
            matchingHeadingsHint: 'Choose the best heading',
            matchingHeadingsPlaceholder: 'Select a heading...',
            summaryHint: 'Complete the summary',
            sentenceHint: 'Complete the sentence',
            fillBlankHint: 'Fill in the blank',
            mapHint: 'Fill in the map label',
            mapPlaceholder: 'Select a label...',
            typeAnswer: 'Type your answer...'
        },
        subtitle: 'Listening & Reading · updated weekly',
        all: 'All',
        available: 'Available tests',
        startTest: 'Start',
        retake: 'Retake',
        fullTest: 'Full test',
        section: 'Section',
        untitled: 'Untitled test',
        bestAccuracy: 'Best {{value}}%',
        skill: {
            all: 'All',
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking'
        },
        emptyTitle: 'No tests yet',
        emptyBody: 'The test library is empty. While you wait, vocabulary practice keeps your rhythm going.',
        emptyFilterTitle: 'No tests match this filter',
        clearFilter: 'Clear filter',
        takeTitle: 'Test',
        questionProgress: '{{done}} of {{total}} answered',
        questionLabel: 'Question {{number}} of {{total}}',
        questionCount: '{{count}} questions',
        timeLimit: '{{count}} min',
        paneSwitchLabel: 'Switch between passage and questions',
        audioTab: 'Audio',
        passageTab: 'Passage',
        questionsTab: 'Questions',
        yourAnswerLabel: 'Your answer',
        prevQuestion: 'Previous',
        nextQuestion: 'Next',
        answered: 'answered',
        emptyPaperTitle: 'This test has no questions yet',
        emptyPaperBody: 'The paper may not be finished. Try another test.',
        accuracyChip: '{{value}}% correct',
        correctOfTotal: '{{correct}} of {{total}} correct',
        correctAnswersStat: 'Correct',
        wrongAnswersStat: 'Wrong',
        skillLabel: 'Skill',
        detailMissingTitle: 'That test was not found',
        detailMissingBody: 'It may have been hidden or removed. Pick another from the library.',
        questionCountStat: 'Questions',
        minutesStat: 'Minutes',
        sectionCountStat: 'Sections',
        sectionsTitle: 'Test structure',
        sectionN: 'Section {{number}}',
        transcriptPolicy: 'The Listening transcript appears only after you submit, to keep the experience close to a real test.',
        costToStart: 'Start the test · {{amount}} credit',
        freeToStart: 'Free',
        insufficientToStart: 'You need {{need}} credits and have {{have}}.',
        startFullTest: 'Start the test',
        attemptsStat: 'Attempts',
        historyEmptyTitle: 'No attempts yet',
        historyEmptyBody: 'Your results appear here after you submit. Start with a short test.',
        chartTitle: 'Band by week',
        chartEmpty: 'No marked attempts yet, so there is nothing to plot.',
        chartLabel: 'Band by week chart: {{series}}',
        chartPointListening: 'Listening band {{band}}',
        chartPointReading: 'Reading band {{band}}',
        wrongCount: '{{count}} wrong',
        allCorrect: 'Nothing wrong. Sit another test to keep the rhythm going.',
        blankAnswer: 'left blank',
        anotherTest: 'Another test',
        lexiResult: 'Lexi on your result',
        resultNoAttemptTitle: 'No attempt selected',
        resultNoAttemptBody: 'Open a result from your history to review a paper you sat.',
        resultEmptyTitle: 'No attempt data',
        resultEmptyBody: 'This attempt may have been removed, or it is still being marked.',
        hint: 'Hint',
        hintBody: 'A paragraph usually states its point in the first or last sentence.',
        difficulty: {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        estimatedBand: 'Estimated band',
        submit: 'Submit',
        reviewAnswers: 'Review answers',
        transcriptLocked: 'The Listening transcript is shown only after you submit, to keep the experience close to a real test.',
        correctAnswer: 'Correct answer',
        yourAnswer: 'You chose',
        timeSpent: 'Minutes spent',
        xpEarned: 'XP earned'
    },
    speaking: {
        title: 'Speaking practice',
        description: 'Practice speaking with AI support and receive helpful, confidence-building feedback.',
        loadError: 'Unable to load speaking topics right now.',
        filtersEyebrow: 'Speaking Focus',
        errorTitle: 'We could not load your speaking topics',
        errorDescription: 'Please try again in a moment so you can continue practicing with a smoother flow.',
        stats: {
            topics: 'Topics',
            attempted: 'Started',
            focus: 'Current Focus'
        },
        list: {
            eyebrow: 'Topic Library',
            title: 'Choose a prompt and keep your speaking momentum going',
            subtitle_one: '{{count}} topic ready for practice',
            subtitle_other: '{{count}} topics ready for practice',
            subtitle: '{{count}} speaking topics ready to practise'
        },
        empty: {
            title: 'No speaking topics match this filter yet',
            description: 'Try a different part or difficulty, or start a custom speaking session to keep your confidence growing.',
            cta: 'Start Custom Speaking'
        },
        common: {
            backToTopics: 'Back to Topics',
            backToSetup: 'Back to setup',
            back: 'Back',
            you: 'You',
            aiPartner: 'AI partner',
            connected: 'Connected',
            connecting: 'Connecting...',
            realtimeReady: 'Realtime ready',
            realtimeReconnecting: 'Realtime reconnecting',
            loadingTopicError: 'Cannot load speaking topic',
            loadingConversationError: 'Failed to load conversations',
            loadingAttemptError: 'Failed to load attempts'
        },
        filters: {
            allParts: 'All Parts',
            allLevels: 'All Levels',
            part1: 'Part 1',
            part2: 'Part 2',
            part3: 'Part 3',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        actions: {
            history: 'Practice History',
            custom: 'Custom Speaking',
            conversationHistory: 'Conversation History',
            practice: 'Practice',
            conversation: 'Conversation'
        },
        card: {
            graded: 'Graded',
            submitted: 'Submitted',
            notStarted: 'Not started',
            highestScore: 'Highest score',
            practiceSource: 'Practice',
            conversationSource: 'Conversation',
            attemptSource: 'Attempt',
            awaitingGrade: 'Submitted and waiting for grading',
            noSubmission: 'No submission yet'
        },
        history: {
            title: 'Speaking History',
            description: 'Review the conversations and continue any that you haven’t finished.',
            columns: {
                question: 'Question',
                part: 'Part',
                band: 'Band',
                status: 'Status',
                date: 'Date'
            },
            status: {
                SUBMITTED: 'Submitted',
                GRADING: 'Grading',
                GRADED: 'Graded',
                FAILED: 'Failed'
            }
        },
        practice: {
            loadError: 'Unable to load this speaking topic.',
            emptyTranscript: 'Please say something first.',
            submitTitle: 'Submit your speaking response?',
            submitDescription: 'Your recording will be sent to AI for scoring. Do you want to continue?',
            submit: 'Submit',
            cancel: 'Cancel',
            submitSuccess: 'Submitted. AI is grading your response...',
            submitError: 'Unable to submit your speaking response.',
            description: '{{part}} • {{difficulty}}',
            cueCard: 'Cue Card',
            followUpQuestions: 'Follow-up Questions',
            startRecording: 'Start Recording',
            stopRecording: 'Stop Recording',
            cancelRecording: 'Cancel',
            sttUnsupportedTitle: 'Your browser does not support automatic speech recognition',
            sttUnsupportedDescription: 'Use Chrome or Edge for live transcription, or type your response manually after recording.',
            liveTranscript: 'Live Transcript',
            manualTranscript: 'Type your response',
            manualTranscriptPlaceholder: 'Type what you said here...',
            analytics: 'Speech Analytics',
            wpm: 'WPM',
            pauses: 'Pauses',
            fillers: 'Fillers',
            avgConfidence: 'Avg Confidence',
            submitForGrading: 'Submit for AI Grading'
        },
        resultPage: {
            status: {
                SUBMITTED: 'Submitted and waiting for AI...',
                GRADING: 'AI is grading...',
                GRADED: 'Graded',
                FAILED: 'Grading failed'
            },
            celebrateBand: 'Speaking Band {{score}}! Well done!',
            celebrateDefault: 'Speaking scored! Check your feedback.',
            scoreBreakdown: 'Score Breakdown',
            overallBand: 'Overall Band Score',
            fluency: 'Fluency & Coherence',
            lexical: 'Lexical Resource',
            grammar: 'Grammar',
            pronunciation: 'Pronunciation',
            aiFeedback: 'AI Feedback',
            transcript: 'Your Transcript',
            speechAnalytics: 'Speech Analytics',
            wordDetails: 'Word-level details ({{count}} words)',
            word: 'Word',
            confidence: 'Confidence',
            timeMs: 'Time (ms)',
            na: 'N/A'
        },
        conversation: {
            error: 'Conversation error',
            connectionError: 'Unable to start the realtime speaking room.',
            completeMessage: 'Conversation complete. AI is grading your speaking...',
            topicLoadError: 'Cannot load speaking topic',
            emptyTranscript: 'Please say something before sending.',
            nextTurnError: 'Cannot get the next turn.',
            hint: 'Hint',
            aiReplying: 'AI is replying...',
            recordAnswer: 'Record answer',
            answerFinalQuestion: 'Answer final question',
            creditChargedOnSubmit: 'Credits are charged only when you submit your answer.',
            status: {
                IN_PROGRESS: 'In progress',
                COMPLETED: 'Completed',
                GRADING: 'Grading',
                GRADED: 'Graded',
                FAILED: 'Failed'
            }
        },
        conversationResult: {
            backToTopics: 'Back to Topics',
            status: {
                IN_PROGRESS: 'In progress...',
                COMPLETED: 'Completed and waiting for AI grading...',
                GRADING: 'AI is grading...',
                GRADED: 'Graded',
                FAILED: 'Grading failed'
            },
            celebrateBand: 'Conversation Band {{score}}! Great speaking!',
            celebrateDefault: 'Conversation scored! See your feedback.',
            overallBand: 'Overall Band Score',
            scoreBreakdown: 'Score Breakdown',
            aiFeedback: 'AI Feedback',
            transcript: 'Conversation Transcript',
            fluency: 'Fluency & Coherence',
            lexical: 'Lexical Resource',
            grammar: 'Grammar',
            pronunciation: 'Pronunciation',
            confidence: '{{count}}% confidence'
        },
        conversationHistory: {
            title: 'Conversation History',
            description: 'Review the conversations and continue any that you haven’t finished.',
            columns: {
                question: 'Question',
                part: 'Part',
                band: 'Band',
                status: 'Status',
                turns: 'Turns',
                date: 'Date'
            },
            status: {
                IN_PROGRESS: 'In progress',
                COMPLETED: 'Completed',
                GRADING: 'Grading',
                GRADED: 'Graded',
                FAILED: 'Failed'
            }
        },
        custom: {
            setupTitle: 'Custom Speaking Conversation',
            setupDescription: 'Configure a freestyle English conversation, then continue the session on a dedicated chat page.',
            history: 'History',
            conversationSetup: 'Conversation Setup',
            setupHint: 'After you press start, we create a conversation and move you into the main chat screen so the session can be restored by URL.',
            restStart: 'REST start',
            topic: 'Topic',
            topicPlaceholder: 'Example: How technology changes the way people learn',
            style: 'Style',
            personality: 'Personality',
            expertise: 'Expertise',
            voice: 'Voice',
            grading: 'AI grading',
            gradingDescription: 'Receive a score and feedback after finishing.',
            startConversation: 'Start conversation',
            missingTopic: 'Please enter a topic first.',
            startError: 'Cannot start a custom conversation right now.',
            chatLoadError: 'Cannot load this conversation detail.',
            chatError: 'Conversation error',
            notActiveTitle: 'This conversation is no longer active.',
            notActiveDescription: 'You will be redirected to the detail page automatically, or you can open the result manually.',
            openResult: 'Open result',
            typeAnswer: 'Type your answer before sending...',
            replayAi: 'Replay AI',
            cancel: 'Cancel',
            stopAndSend: 'Stop and send',
            sendAnswer: 'Send answer',
            finishConversation: 'Finish conversation',
            customConversation: 'Custom conversation',
            gradingOn: 'Grading on',
            gradingOff: 'Grading off',
            turns: 'Turns: {{current}}{{max}}',
            aiPreparing: 'AI is preparing the next reply...',
            resultTitleFallback: 'Custom conversation',
            overallScore: 'Overall score',
            userTurns: 'User turns',
            userTurnsWithMax: '{{count}} / {{max}}',
            scoreBreakdown: 'Score breakdown',
            scoresPending: 'Scores will appear after grading is completed.',
            summary: 'Summary',
            summaryStatus: 'Status',
            startedAt: 'Started at',
            completedAt: 'Completed at',
            gradedAt: 'Graded at',
            timeSpent: 'Time spent',
            aiFeedback: 'AI feedback',
            transcript: 'Transcript',
            turn: 'Turn {{count}}',
            continueConversation: 'Continue Conversation',
            viewResult: 'View Result',
            historyTitle: 'Custom Speaking History',
            historyDescription: 'Review freestyle conversations and follow grading progress.',
            historyColumns: {
                title: 'Title',
                profile: 'Profile',
                score: 'Score',
                status: 'Status',
                turns: 'Turns',
                started: 'Started'
            },
            historyStatus: {
                IN_PROGRESS: 'In progress',
                COMPLETED: 'Completed',
                GRADING: 'Grading',
                GRADED: 'Graded',
                FAILED: 'Failed'
            },
            styles: {
                CASUAL: 'Casual',
                PROFESSIONAL: 'Professional',
                ENCOURAGING: 'Encouraging',
                CHALLENGING: 'Challenging',
                PLAYFUL: 'Playful',
                FLIRTY: 'Flirty',
                DEEP: 'Deep',
                DEBATE: 'Debate',
                STREET: 'Street',
                UNFILTERED: 'Unfiltered'
            },
            personalities: {
                FRIENDLY: 'Friendly',
                HUMOROUS: 'Humorous',
                PATIENT: 'Patient',
                STRAIGHTFORWARD: 'Straightforward',
                CONFIDENT: 'Confident',
                CURIOUS: 'Curious',
                EMPATHETIC: 'Empathetic',
                BOLD: 'Bold',
                FLIRTY: 'Flirty',
                EDGY: 'Edgy',
                REBELLIOUS: 'Rebellious'
            },
            expertises: {
                GENERAL: 'General',
                BUSINESS: 'Business',
                TECHNOLOGY: 'Technology',
                EDUCATION: 'Education',
                TRAVEL: 'Travel',
                RELATIONSHIPS: 'Relationships',
                ENTERTAINMENT: 'Entertainment',
                GAMING: 'Gaming',
                FITNESS: 'Fitness',
                PSYCHOLOGY: 'Psychology',
                SOCIAL_MEDIA: 'Social Media',
                STREET_CULTURE: 'Street Culture'
            },
            voices: {
                US_NEURAL_J: 'Deep male voice',
                US_NEURAL_I: 'Balanced male voice',
                US_NEURAL_F: 'Female voice',
                US_STUDIO_O: 'Natural female voice',
                US_CHIRP_F: 'Ultra-natural female voice'
            }
        },
        subtitle: 'Speak to a prompt and get marked against the four IELTS criteria',
        filterLabel: 'Filter by part',
        filterAll: 'All',
        part: {
            PART_1: 'Part 1',
            PART_2: 'Part 2',
            PART_3: 'Part 3'
        },
        micReady: 'Your browser is ready to record. The first time you press record it will ask for microphone access — choose "Allow".',
        micInsecure: 'This page is not on a secure connection, so the browser will not allow microphone access.',
        micUnsupported: 'This browser does not support recording.',
        micUnknown: 'Checking whether recording is available…',
        micFallback: 'You can still practise reading the prompt and see feedback, but pronunciation cannot be assessed.',
        statusGrading: 'Being marked',
        statusFailed: 'Marking failed',
        start: 'Practise',
        practiceAgain: 'Practise again',
        tryAgain: 'Try again',
        viewStatus: 'View status',
        viewResult: 'View result',
        historyLink: 'Your attempts',
        typicalLength: 'About 2 minutes of speaking per attempt',
        emptyTitle: 'No Speaking topics yet',
        emptyBody: 'The topic library is empty. Try again later, or practise vocabulary while you wait.',
        topicMissingTitle: 'That topic was not found',
        topicMissingBody: 'It may have been hidden or removed. Pick another from the list.',
        practiceTitle: 'Speaking practice',
        prepRule: '1 minute to prepare · 2 minutes to speak',
        timingRule: 'This matches the real exam: about 1 minute to prepare and 2 minutes to speak. The clock is information — your recording is not cut off.',
        followUps: 'Follow-up questions',
        recording: 'Recording',
        notRecording: 'Not recording',
        startRecording: 'Start recording',
        stopAndGrade: 'Stop and get marked',
        recordAgain: 'Record again',
        pause: 'Pause',
        resume: 'Resume',
        countdown: '{{seconds}} seconds left of the recommended length',
        timeUp: 'You have reached the recommended length — you can stop or keep going.',
        prepareTitle: 'One minute to prepare',
        prepareBody: 'Read the prompt and plan your main points. You can start early — no need to wait it out.',
        readyToSpeak: 'Ready to speak',
        sttUnsupported: 'This browser cannot transcribe speech automatically, so you will need to type what you said for it to be marked.',
        transcriptLabel: 'What you said',
        transcriptHint: 'This is what the system marks. You can correct it so it matches what you actually said.',
        transcriptPlaceholder: 'Your speech will appear here…',
        needsTranscript: 'No speech was captured. Type what you said and submit, so a credit is not spent on an empty answer.',
        wordCount: '{{count}} words',
        fillerDetected: '{{count}} filler words: {{words}}',
        submit: 'Get marked',
        submitWithCost: 'Get marked · {{amount}} credit',
        gradingWait: 'Marking takes about 30–60 seconds.',
        insufficient: 'You do not have enough credits to have this marked.',
        noAttemptTitle: 'No attempt selected',
        noAttemptBody: 'Open one of your attempts to see its result.',
        attemptGoneTitle: 'No attempt data',
        attemptGoneBody: 'This attempt may have been removed.',
        gradingTitle: 'Your speaking is being marked',
        gradingBody: 'The system is analysing the recording and scoring each criterion.',
        gradingWaitShort: 'Usually takes 30–60 seconds',
        gradingLexi: 'Lexi waiting for the speaking to be marked',
        gradingFailedTitle: 'This attempt could not be marked',
        gradingFailedBody: 'Your recording was saved. You can try again or record a new answer.',
        lexiResult: 'Lexi on your result',
        bandEstimateNote: 'This is an estimated band from your practice on the platform, not an official test result.',
        criteriaScores: 'Scores by criterion',
        criterion: {
            fluency: 'Fluency',
            lexical: 'Vocabulary (Lexical Resource)',
            grammar: 'Grammar',
            pronunciation: 'Pronunciation'
        },
        analyticsTitle: 'Speech measurements',
        analyticsNote: 'These are measurements, not scores. Each one only means something next to what is typical.',
        wpm: 'Speech rate (words/min)',
        analyticsWords: 'Words spoken',
        fillers: 'Filler words',
        pauses: 'Pauses',
        wpmInRange: '{{value}} words/min — inside the natural range of {{min}}–{{max}}.',
        wpmBelowRange: '{{value}} words/min — slower than the typical {{min}}–{{max}}. Speaking slowly is not wrong, but it can read as less fluent.',
        wpmAboveRange: '{{value}} words/min — faster than the typical {{min}}–{{max}}. Rushing can make pronunciation harder to follow.',
        fillersUsed: 'Filler words used:',
        transcriptTitle: 'What was marked',
        transcriptCaveat: 'Speech recognition can mishear. This is exactly the text the marking was based on.',
        noTranscript: 'No transcript was captured for this attempt.',
        feedbackTitle: 'Detailed feedback',
        noFeedback: 'No detailed feedback was returned for this attempt.',
        practiceAgainHint: 'Practising the same prompt again is the fastest way to see where you improved.',
        allTopics: 'All topics',
        historyEmptyTitle: 'No attempts yet',
        historyEmptyBody: 'Your results appear here after you get marked.',

        /* --- Topic conversation (screens 24/24b/24c/24d) -----------------------------------
           One set of keys for the conversation and its history. THE LABELS ARE SHARED with the
           practice result — `speaking.criterion.*`, `speaking.feedbackTitle`,
           `speaking.transcriptTitle` — so the two result screens cannot drift apart in wording.
           These sit flat because the `speaking` block already has `card`/`actions`/`history`
           groups above, and reopening one here would duplicate keys in the same object literal. */
        creditNotice:
            'Practising alone charges credit when you submit the recording; a conversation charges as soon as it starts. Each topic is charged once per mode.',
        resumeConversation: 'Continue conversation',
        conversationWithCost: 'Conversation · {{amount}} credit',
        conversationAnswerLabel: 'Your answer',
        conversationTurnCounter: 'Question {{current}} / {{total}}',
        conversationLastTurn: 'final question',
        conversationReplay: 'Replay the question',
        conversationPlaying: 'Playing…',
        conversationTranscriptHint:
            'After you speak, the transcript appears so you can correct it before sending. The transcript is what the AI marks.',
        conversationAnswerLength: '30–60 seconds',
        conversationCostLine: 'A conversation charges {{amount}} credit as soon as it starts · {{balance}} credit left',
        conversationResumeLine: 'You are continuing a conversation that already started — no extra credit.',
        conversationStartError: 'The conversation could not start. Please try again.',
        conversationWpmChip: '{{count}} wpm',
        conversationResultTurns: '{{turns}} turns · {{time}}',
        conversationResultBandLabel: 'Conversation band',
        conversationResultGradingTitle: 'Lexi is marking the conversation',
        conversationResultGradingBody:
            'All four criteria are being scored across the whole conversation. The result appears right here.',
        conversationResultFailedTitle: 'This conversation could not be marked',
        conversationResultTurnLabel: 'Turn {{index}}',
        conversationResultAnswerLabel: 'You answered',
        conversationResultRestart: 'Do this conversation again',
        conversationResultNoTranscript: 'This conversation has no transcript.',
        conversationResultAllTopics: 'Back to topics',
        historySubtitle: 'Review your speaking turns and conversations, and continue any you have not finished',
        historyTabsLabel: 'Type of turn',
        historyStatAttempts: 'Turns done',
        historyStatConversations: 'Conversations',
        historyStatAverage: 'Average band',
        historyStatBest: 'Best band',
        historyEmptyConversationTitle: 'No conversations yet',
        historyEmptyConversationBody: 'Open a topic and press "Conversation" to start your first one.',
        historyResume: 'Continue',
        historyStatusInProgress: 'In progress',
        historyTurnsChip: '{{count}} turns',
        durationMinutesSeconds: '{{minutes}} min {{seconds}} sec',
        durationSeconds: '{{seconds}} sec',
        conversationResultRepeatedWord: 'This word repeats in the conversation'
    },
    writingPractice: {
        filters: {
            allTaskTypes: 'All task types',
            keywordPlaceholder: 'Search practice sets'
        },
        list: {
            title: 'Sentence Translation Practice',
            subtitle: 'Practice Writing by translating each sentence with AI assistance.',
            loadError: 'Unable to load writing practice sets.',
            empty: 'No practice sets found.',
            createdAt: 'Created at: {{value}}',
            attemptCount: '{{count}} attempts',
            lastAttemptAt: 'Last attempt: {{value}}',
            neverAttempted: 'Never attempted',
            viewDetail: 'View detail'
        },
        detail: {
            loadError: 'Unable to load practice set details.',
            start: 'Start practice',
            resume: 'Resume practice',
            startError: 'Unable to start this practice attempt.',
            notFound: 'Practice set not found',
            backToList: 'Back to practice list',
            variantsTitle: 'Difficulty variants',
            variantSummary: '{{sentenceCount}} sentences • {{estimatedMinutes}} minutes',
            variantSentenceCount: '{{count}} sentences ready',
            estimatedMinutesSuffix: ' min',
            emptyVariants: 'No variants available.',
            difficulty: 'Difficulty',
            variantSentence: '{{count}} sentences',
            estimatedMinutes: 'About {{count}} minutes'
        },
        attempt: {
            loadError: 'Unable to load this attempt.',
            notFound: 'Practice attempt not found',
            emptyTranslation: 'Please enter a translation before submitting.',
            submit: 'Submit translation',
            submitError: 'Unable to submit this sentence.',
            gradingInProgress: 'AI grading is in progress. Please wait',
            gradingFailed: 'AI grading failed. You can submit this sentence again.',
            skip: 'Skip sentence',
            skipError: 'Unable to skip this sentence.',
            placeholder: 'Type your English translation here',
            completed: 'Practice completed',
            completedDescription: 'This attempt is complete. Review your history or start a new set.',
            progressLabel: 'Sentence {{current}} of {{total}}',
            leftPanelTitle: 'Vietnamese paragraph',
            rightPanelTitle: 'Set content',
            currentSentenceTitle: 'Current sentence',
            attemptNumber: 'Attempt {{count}}',
            sentenceLabel: 'Sentence {{order}}',
            noParagraph: 'This variant has no sentence content yet.',
            noStaticContent: 'Set content is unavailable right now.',
            feedbackTitle: 'Latest AI feedback',
            correctionTitle: 'Suggested correction',
            noFeedback: 'Submit a translation to see AI feedback here.',
            scoreTitle: 'Latest evaluation',
            aiCoachLabel: 'AI writing coach',
            feedbackPassedTitle: 'Nice streak! This sentence passed.',
            feedbackRetryTitle: 'Almost there! Polish this sentence.',
            hintForSkip: 'You can skip this question after 5 failed attempts.',
            scoreLabel: {
                accuracy: 'Accuracy',
                grammar: 'Grammar',
                naturalness: 'Naturalness',
                overall: 'Overall'
            },
            feedback: {
                strengths: 'What worked',
                issues: 'Next fix',
                hint: 'Power-up hint'
            },
            score: {
                accuracy: 'Accuracy: {{value}}',
                grammar: 'Grammar: {{value}}',
                naturalness: 'Naturalness: {{value}}',
                overall: 'Overall: {{value}}'
            }
        },
        history: {
            title: 'Practice history',
            loadError: 'Unable to load writing practice history.',
            empty: 'No practice attempts yet.',
            openAttempt: 'Open attempt',
            columns: {
                title: 'Practice set',
                taskType: 'Task type',
                difficulty: 'Difficulty',
                status: 'Status',
                updatedAt: 'Last updated',
                action: 'Action'
            }
        },
        taskType: {
            task1: 'Task 1',
            task2: 'Task 2'
        },
        difficulty: {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        media: {
            title: 'Image List',
            alt: 'Task 1 chart image {{index}}'
        }
    },
    writing: {
        title: 'Writing practice',
        description: 'Practice Task 1 and Task 2 with AI-powered scoring and encouraging feedback.',
        loadError: 'Unable to load writing tasks right now.',
        filtersEyebrow: 'Writing Studio',
        errorTitle: 'We could not load your writing tasks',
        errorDescription: 'Please try again in a moment so you can get back into a calm writing flow.',
        stats: {
            tasks: 'Tasks',
            attempted: 'Started',
            focus: 'Current Focus'
        },
        list: {
            eyebrow: 'Writing Library',
            title: 'Choose a task and build your writing rhythm with clarity',
            subtitle_one: '{{count}} writing task is ready for practice',
            subtitle_other: '{{count}} writing tasks are ready for practice',
            subtitle: '{{count}} writing tasks ready to practise'
        },
        filters: {
            allTypes: 'All Types',
            allLevels: 'All Levels',
            task1: 'Task 1',
            task2: 'Task 2',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        },
        actions: {
            history: 'Submission History',
            loadMore: 'Load More'
        },
        card: {
            graded: 'Graded',
            submitted: 'Submitted',
            notStarted: 'Not started',
            highestScore: 'Highest score',
            awaitingGrade: 'Submitted and waiting for grading',
            noSubmission: 'No submission yet',
            gradedLabel: 'Graded',
            minutes: '{{count}} min',
            words: '{{min}}-{{max}} words'
        },
        history: {
            title: 'Writing Submission History',
            description: 'Review your writing submissions and the feedback you have earned along the way.',
            total: '{{count}} submissions',
            columns: {
                task: 'Task',
                type: 'Type',
                status: 'Status',
                band: 'Band',
                words: 'Words',
                submitted: 'Submitted'
            },
            status: {
                SUBMITTED: 'Submitted',
                GRADING: 'Grading',
                GRADED: 'Graded',
                FAILED: 'Failed'
            }
        },
        detail: {
            loadError: 'Unable to load the writing task details.',
            notFound: 'Writing task not found',
            back: 'Back',
            backToWriting: 'Back to Writing',
            difficultySuffix: '{{taskType}} • {{difficulty}} difficulty',
            minutes: 'Minutes',
            wordCount: 'Word Count',
            images: 'Images',
            taskContent: 'Task Prompt',
            instruction: 'Instruction',
            imagesCount: 'Images ({{count}})',
            startWriting: 'Start Writing',
            timerNote: 'You have {{count}} minutes to complete this writing task. It will be submitted automatically when time runs out.'
        },
        taskPage: {
            loadError: 'Unable to load the writing task.',
            backBlocked: 'You cannot go back while writing. Please submit or stop first.',
            refreshBlocked: 'You cannot refresh the page while writing.',
            submitSuccess: 'Essay submitted. AI is grading it now...',
            submitError: 'Unable to submit your essay.',
            emptyEssay: 'Please write something before submitting.',
            submitTooShort: 'Your draft is {{count}} words. Please write at least {{min}} words before submitting.',
            submitTitle: 'Submit your essay?',
            submitDescription: 'Your {{count}}-word essay will be sent for AI grading.',
            submitHint: 'You will not be able to edit it after submission.',
            submit: 'Submit Essay',
            continueWriting: 'Continue Writing',
            stopTitle: 'Stop writing?',
            stopDescription: 'Are you sure you want to stop? Your current draft ({{count}} words) will be discarded and you will return to the task list.',
            stopAndSubmit: 'Discard Draft & Leave',
            notFound: 'Writing task not found',
            stopWriting: 'Stop Writing',
            taskPrompt: 'Task Prompt',
            yourEssay: 'Your Essay',
            instruction: 'Instruction:',
            requirements: 'Requirements: {{min}}-{{max}} words • Time: {{time}} minutes',
            essayPlaceholder: 'Start writing your essay here...',
            wordWarning: 'Your draft is {{count}} words. The minimum is {{min}} words.',
            words: '{{count}} words'
        },
        submission: {
            titleFallback: 'Writing Submission',
            notFound: 'Submission not found',
            status: {
                SUBMITTED: 'Submitted',
                GRADING: 'AI is grading...',
                GRADED: 'Graded',
                FAILED: 'Grading failed'
            },
            celebrateBand: 'Writing Band {{score}}! Excellent work!',
            celebrateDefault: 'Writing scored! Your feedback is ready.',
            pendingTitle: 'AI is grading your writing...',
            pendingDescription: 'This page will refresh automatically when the results are ready. You will also receive a notification.',
            overallBand: 'Overall Band Score',
            taskResponse: 'Task Response',
            coherence: 'Coherence & Cohesion',
            lexical: 'Lexical Resource',
            grammar: 'Grammar Range & Accuracy',
            aiFeedback: 'AI Feedback',
            info: 'Information',
            wordCount: 'Word Count',
            timeSpent: 'Time Spent',
            submittedAt: 'Submitted At',
            gradedAt: 'Graded At',
            yourEssay: 'Your Essay',
            words: '{{count}} words',
            duration: '{{minutes}} min {{seconds}} sec'
        },
        empty: {
            title: 'No writing tasks are available with this filter yet',
            description: 'Try another task type or difficulty and we will help you keep your writing momentum going.'
        },
        subtitle: 'Write an essay and get it marked against the four IELTS criteria',
        filterLabel: 'Filter by task type',
        filterAll: 'All',
        type: {
            TASK_1: 'Task 1',
            TASK_2: 'Task 2'
        },
        wordRange: '{{min}}–{{max}} words',
        statusGrading: 'Being marked',
        statusFailed: 'Marking failed',
        start: 'Write',
        rewrite: 'Rewrite',
        tryAgain: 'Try again',
        viewStatus: 'View status',
        viewResult: 'View result',
        historyLink: 'Submitted essays',
        emptyTitle: 'No Writing tasks yet',
        emptyBody: 'The task library is empty. Try again later, or practise vocabulary while you wait.',
        draftNote: 'Your draft is saved on this device',
        taskMissingTitle: 'That task was not found',
        taskMissingBody: 'It may have been hidden or removed. Pick another from the list.',
        criteriaTitle: 'Your essay is marked against four criteria',
        criterion: {
            taskResponse: 'Answering the task (Task Response)',
            coherence: 'Coherence and cohesion',
            lexicalResource: 'Vocabulary (Lexical Resource)',
            grammar: 'Grammar (Range & Accuracy)'
        },
        criterionAria: '{{criterion}}: {{value}} out of 9',
        lexiTip: 'Spend two minutes planning before you write. A clear structure reliably scores higher on coherence.',
        editorLabel: 'Your essay',
        promptTab: 'Prompt',
        editorTab: 'Essay',
        paneSwitchLabel: 'Switch between prompt and essay',
        wordsShort: 'words',
        editorPlaceholder: 'Start writing here…',
        wordCount: '{{count}} words',
        wordCountOf: '{{count}} / {{target}} words',
        underTarget: 'Below the minimum length',
        overMax: 'Over the maximum length',
        savedLocally: 'Draft saved on this device',
        submit: 'Submit',
        submitWithCost: 'Submit · {{amount}} credit',
        gradingWait: 'Marking takes about 30–60 seconds.',
        insufficient: 'You do not have enough credits to have this marked.',
        chartAlt: 'The Task 1 chart',
        noSubmissionTitle: 'No submission selected',
        noSubmissionBody: 'Open a submitted essay to see its result.',
        submissionGoneTitle: 'No submission data',
        submissionGoneBody: 'This submission may have been removed.',
        gradingTitle: 'Your essay is being marked',
        gradingBody: 'The system is reading your essay and scoring each criterion. You can leave this tab open.',
        gradingWaitShort: 'Usually takes 30–60 seconds',
        gradingLexi: 'Lexi waiting for the marking to finish',
        gradingFailedTitle: 'This essay could not be marked',
        gradingFailedBody: 'Your essay was saved. You can try submitting again or rewrite it.',
        lexiResult: 'Lexi on your result',
        bandEstimateNote: 'This is an estimated band from your practice on the platform, not an official test result.',
        criteriaScores: 'Scores by criterion',
        finalWordCount: 'Words',
        gradedAt: 'Marked at',
        submittedAt: 'Submitted at',
        yourEssay: 'Your essay',
        feedbackTitle: 'Detailed feedback',
        noFeedback: 'No detailed feedback was returned for this essay.',
        rewriteHint: 'Read the feedback, then rewrite this same task. Rewriting the same prompt is the fastest way to see where you improved.',
        rewriteThis: 'Rewrite this task',
        allTasks: 'All tasks',
        historyTitle: 'Submitted essays',
        historyEmptyTitle: 'Nothing submitted yet',
        historyEmptyBody: 'Your results appear here after you submit an essay.'
    },
    guestAiTrial: {
        errors: {
            disabled: 'Guest AI trial is currently disabled.',
            tokenExpired: 'Guest session expired. Reconnecting...',
            guestDailyLimit: 'You have used today\'s free AI attempts. Try again after reset.',
            ipDailyLimit: 'This network has reached today\'s free AI limit.',
            unavailable: 'Guest AI trial is temporarily unavailable. Please retry later.',
            duplicateRequest: 'This request was already processed. Please send a new request.',
            generic: 'Guest AI request could not be completed.'
        }
    },
    dictionary: {
        hero: {
            eyebrow: 'Vocabulary Library',
            title: 'Personal Dictionary',
            description: 'Save important words, revisit them with confidence, and build a vocabulary system that supports your IELTS progress every day.',
            offline: 'Offline',
            localModeHint: 'Your words are currently saved on this device. Log in to sync them to the cloud.'
        },
        actions: {
            review: 'Review Now',
            addWord: 'Add Word',
            tryAgain: 'Try Again'
        },
        searchPlaceholder: 'Search a word or meaning…',
        filters: {
            all: 'All',
            favorite: 'Favorites',
            verb: 'Verbs',
            noun: 'Nouns',
            adjective: 'Adjectives'
        },
        list: {
            eyebrow: 'Saved Words',
            title: 'Your Vocabulary Collection',
            subtitle_one: '{{count}} word is ready for review and practice.',
            subtitle_other: '{{count}} words are ready for review and practice.',
            subtitle: '{{count}} saved words ready to review'
        },
        stats: {
            eyebrow: 'Progress',
            title: 'Learning Snapshot',
            totalWords: 'Words Saved',
            masteredWords: 'Mastered'
        },
        reviewCard: {
            dueTitle_one: '{{count}} word is due today',
            dueTitle_other: '{{count}} words are due today',
            doneTitle: 'All caught up today',
            dueDescription: 'A quick review now will help lock these words into long-term memory.',
            doneDescription: 'Excellent work. You have completed all vocabulary reviews for today.',
            cta: 'Start Review',
            doneCta: 'Done for Today',
            dueTitle: '{{count}} words are due today'
        },
        tip: {
            eyebrow: 'Study Tip',
            title: 'Save words while they are fresh',
            description: 'Add new vocabulary right after you meet it in Reading or Listening practice. That small habit makes review much more effective later.'
        },
        errorTitle: 'Unable to load your dictionary',
        errorDescription: 'Please try again in a moment. We will keep your learning flow moving as soon as the data is ready.',
        empty: {
            title: 'No words found',
            description: 'Try another filter, or start building your dictionary with the first word you want to remember.',
            cta: 'Add Your First Word'
        },
        drawer: {
            eyebrow: 'Word Detail',
            title: 'Vocabulary Insight',
            examples: {
                eyebrow: 'Usage',
                title: 'Examples'
            },
            tags: {
                eyebrow: 'Organization',
                title: 'Tags'
            },
            note: {
                eyebrow: 'Memory Note',
                title: 'Your Note'
            },
            messages: {
                favoriteSuccess: 'Added to favorites.',
                unfavoriteSuccess: 'Removed from favorites.',
                favoriteError: 'Something went wrong while updating favorites.',
                deleteSuccess: 'Word removed from your dictionary.',
                deleteError: 'Unable to delete this word right now.'
            },
            deleteConfirm: {
                title: 'Delete this word?',
                description: 'This word will be removed from your personal dictionary.',
                confirm: 'Delete'
            },
            deleteButton: 'Remove from Dictionary'
        },
        reviewPage: {
            eyebrow: 'Dictionary Review',
            description: 'Review your vocabulary with an efficient, smart review system that adapts to your learning rhythm.',
            loading: 'Preparing your review session...',
            progressLabel: 'Review progress',
            footnote: 'Each grade updates the smart review schedule for that word.',
            actions: {
                backToDictionary: 'Back to Dictionary'
            },
            messages: {
                loadError: 'Unable to load the review list.',
                gradeError: 'Unable to submit this grade.'
            },
            empty: {
                title: 'All vocabulary is reviewed',
                description: 'Excellent work. You do not have any more words due today. Take a short break and come back later to keep your momentum going.'
            },
            finished: {
                title: 'Congratulations!',
                description: 'You completed this review session with {{count}} vocabulary items. Great rhythm, keep it going.',
                xpLabel: 'Experience earned'
            },
            flashcard: {
                pronounce: 'Pronounce',
                prompt: 'Do you still remember this word?',
                flipHint: 'Tap to reveal the meaning',
                gradePrompt: 'How well do you remember this word?',
                grades: {
                    again: {
                        label: 'Forgot it',
                        sublabel: 'Review soon'
                    },
                    hard: {
                        label: 'Still hard',
                        sublabel: 'Keep going'
                    },
                    good: {
                        label: 'Pretty good',
                        sublabel: 'Nice work'
                    },
                    easy: {
                        label: 'Too easy',
                        sublabel: 'Excellent'
                    }
                }
            }
        },
        subtitle: 'Vocabulary notebook — newest words first; the "forgetful" filter orders by what is due next',
        statTotal: 'Total words',
        statDue: 'Due today',
        statLearning: 'Learning',
        statMastered: 'Mastered',
        startReview: 'Review',
        addWord: 'Add a word',
        fieldWord: 'Word',
        fieldMeaning: 'Meaning',
        fieldNote: 'Note',
        searchLabel: 'Search the notebook',
        memoryFilterLabel: 'Filter by memory',
        filterAll: 'All',
        filterForgetful: 'Forgetful',
        filterNew: 'New',
        filterLearning: 'Learning',
        filterMastered: 'Mastered',
        tierLow: 'Forgetful',
        tierMid: 'Remembering',
        tierHigh: 'Mastered',
        masteryAria: 'Mastery {{level}} of {{total}} — {{tier}}',
        favorite: 'Mark as favourite',
        unfavorite: 'Remove favourite',
        reviewCount: 'Reviews',
        nextReview: 'Next review',
        dueNow: 'Due now',
        notScheduled: 'Not scheduled',
        ttsNote: 'The listen button uses your browser’s built-in voice.',
        emptyTitle: 'Your notebook is empty',
        emptyBody: 'Save words as you meet them in reading or listening, then review them on a schedule.',
        noMatchTitle: 'No words matched',
        noMatchBody: 'Try another keyword, or clear the filters to see the whole notebook.',
        clearFilters: 'Clear filters',
        reviewTitle: 'Vocabulary review',
        reviewProgress: '{{done}} of {{total}} words',
        reviewProgressLabel: 'Review progress',
        listen: 'Listen',
        showMeaning: 'Show meaning',
        meaningLabel: 'Meaning',
        howWell: 'How well did you remember this?',
        recallForgot: 'Forgot',
        recallForgotHint: 'Review sooner',
        recallHard: 'Hard',
        recallHardHint: 'Hold the level',
        recallGood: 'Good',
        recallGoodHint: 'Up one level',
        recallEasy: 'Easy',
        recallEasyHint: 'Up two levels',
        savingReview: 'Saving…',
        nextReviewIs: 'Next review: {{date}}',
        reviewEmptyTitle: 'Nothing due today',
        reviewEmptyBody: 'The schedule follows each word’s memory level. Come back when words are due, or add new ones.',
        backToNotebook: 'Back to the notebook',
        reviewDoneTitle: 'Review finished',
        reviewDoneBody: 'You reviewed {{count}} words. Their next dates are updated.',
        reviewDoneLexi: 'Lexi celebrating a finished review'
    },
    landing: {
        navbar: {
            features: 'Features',
            skills: 'Skills',
            aiCoach: 'AI Coach',
            gamification: 'Gamification',
            faq: 'FAQ',
            login: 'Log in',
            startFree: 'Start free',
            openApp: 'Open app',
            menu: 'Menu'
        },
        hero: {
            badge: 'AI-powered English learning',
            titlePrefix: 'Learn English. Master IELTS.',
            titleHighlight: 'With an AI coach by your side.',
            description: 'Practice vocabulary, Listening, Reading, Writing and Speaking with instant AI feedback — personalized tests, instant AI conversation, speech analytics, and daily motivation to keep you going.',
            primaryCta: 'Start learning free',
            secondaryCta: 'Try the AI coach',
            exploreCta: 'Explore features',
            appName: 'EN Practice',
            appSlogan: 'Your AI companion for English and IELTS',
            mockup: {
                goalLabel: 'Today\'s goal',
                goalProgress: '35 / 50 min studied',
                coachMessage: 'Your Writing is at band 6.5. Practice Task 2 on education today to push it to 7.0.',
                writingScore: 'Writing 6.5',
                speakingScore: 'Speaking 6.0',
                gradingTitle: 'AI Grading',
                gradingHint: 'Band score + feedback',
                instantTitle: 'Instant AI',
                instantHint: 'Instant answers'
            }
        },
        stats: {
            skills: {
                value: '4',
                label: 'IELTS skills',
                hint: 'Listening · Reading · Writing · Speaking'
            },
            ai: {
                value: 'AI',
                label: 'grading & feedback',
                hint: 'Writing, Speaking & vocabulary'
            },
            instant: {
                value: 'Instant',
                label: 'AI conversation',
                hint: 'Streamed responses, no waiting'
            },
            free: {
                value: 'Free',
                label: 'to start learning',
                hint: 'Guest trial available too'
            }
        },
        features: {
            title: 'An AI companion that learns with you',
            description: 'From grading to conversation, AI is woven into every step of your learning journey.',
            items: {
                grading: {
                    title: 'AI essay & speaking grading',
                    description: 'Get band scores and detailed feedback on your Writing and Speaking automatically, shortly after you submit.'
                },
                chat: {
                    title: 'Instant AI chat',
                    description: 'Chat with Lexi, your AI English coach, for instant explanations, translations and grammar help — answered instantly.'
                },
                vocabTest: {
                    title: 'AI-generated vocabulary tests',
                    description: 'AI builds personalized tests from your own saved words, review history and recent lookups.'
                },
                speech: {
                    title: 'Speech analytics',
                    description: 'Track word count, speaking speed, pauses and filler words so you can speak more naturally.'
                },
                recommendation: {
                    title: 'Smart recommendations',
                    description: 'Personalized practice suggestions shaped by your goals, weaker areas and progress.'
                },
                dictionary: {
                    title: 'Personal dictionary',
                    description: 'Save, organize and review the words that matter to you, with AI explanations on demand.'
                }
            },
            chatMockup: {
                heading: 'Meet Lexi, your AI English coach',
                status: 'Online',
                hint: 'Practice the way you actually talk — Lexi answers instantly and adjusts to your level.',
                user: 'How can I improve my speaking?',
                ai: 'Start with short daily practice: repeat one IELTS prompt aloud, record it, and review the speech feedback. Want to try one together?',
                typing: 'Lexi is typing...'
            }
        },
        skills: {
            title: 'Master all four skills',
            description: 'Structured practice across the full IELTS test, plus daily vocabulary to build a strong foundation.',
            items: {
                listening: {
                    title: 'Listening',
                    description: 'Section-based practice with real test structure and transcript review after each attempt.'
                },
                reading: {
                    title: 'Reading',
                    description: 'A wide variety of question types with instant scoring and band estimation.'
                },
                writing: {
                    title: 'Writing',
                    description: 'Submit essays and get AI grading with detailed feedback and a suggested band score.'
                },
                speaking: {
                    title: 'Speaking',
                    description: 'Answer topics or hold multi-turn conversations with AI, then review your speech analytics.'
                },
                vocabulary: {
                    title: 'Vocabulary',
                    description: 'Daily word learning, AI explanations and smart review sessions that adapt to you.'
                }
            }
        },
        gamification: {
            title: 'Learning that keeps you coming back',
            description: 'XP, streaks, leaderboards and rewards turn consistent practice into a daily habit.',
            items: {
                xp: 'XP & levels',
                streak: 'Daily streaks',
                leaderboard: 'Leaderboard ranking',
                rewards: 'Rewards & check-ins',
                weeklyReport: 'Weekly reports'
            }
        },
        howItWorks: {
            title: 'Start improving in three simple steps',
            steps: {
                signup: {
                    title: 'Create your account',
                    description: 'Sign up in seconds and set your IELTS target.'
                },
                practice: {
                    title: 'Learn a little every day',
                    description: 'Take a quick vocabulary test, a listening drill, or chat with AI in just a few minutes.'
                },
                grow: {
                    title: 'See real progress',
                    description: 'Track bands, streaks, XP and weekly reports as AI fine-tunes recommendations for you.'
                }
            }
        },
        faq: {
            title: 'Questions? We have answers',
            items: [
                {
                    q: 'Is EN Practice free?',
                    a: 'Yes — the core learning experience is free to start. You can sign up and begin practicing right away.'
                },
                {
                    q: 'Do I need to log in to try the AI?',
                    a: 'No. You can try AI chat and vocabulary explanations as a guest, and progress is saved on your device. Logging in keeps everything synced across devices.'
                },
                {
                    q: 'How does AI grading work?',
                    a: 'AI evaluates your Writing and Speaking against IELTS-style criteria and returns a band score with detailed feedback shortly after you submit.'
                },
                {
                    q: 'Which IELTS skills can I practice?',
                    a: 'Listening, Reading, Writing and Speaking, plus daily vocabulary training to support all four skills.'
                },
                {
                    q: 'Can I practice speaking with AI?',
                    a: 'Yes. Answer IELTS topics or hold free multi-turn conversations with the AI partner, then review your fluency analytics afterwards.'
                }
            ]
        },
        cta: {
            title: 'Ready to learn with an AI by your side?',
            description: 'Join EN Practice today — it is free to start, and your AI coach is ready whenever you are.',
            primaryCta: 'Start learning free',
            secondaryCta: 'Try the AI coach'
        },
        footer: {
            tagline: 'Your AI-powered English & IELTS learning companion.',
            product: 'Product',
            resources: 'Resources',
            account: 'Account',
            productLinks: [
                'Features',
                'Skills',
                'AI Coach',
                'Gamification'
            ],
            resourceLinks: [
                'AI Chat',
                'Vocabulary Check',
                'IELTS Tests',
                'Dictionary'
            ],
            accountLinks: [
                'Log in',
                'Create account'
            ],
            copyright: '© {{year}} EN Practice. All rights reserved.'
        },
        navLabel: 'Landing page navigation',
        navHow: 'How it works',
        navFree: 'Free',
        navFaq: 'FAQ',
        goToApp: 'Go to the app',
        startFree: 'Start learning',
        eyebrow: 'IELTS practice for students',
        headline: 'Practise IELTS in a way that shows you exactly where you are weak',
        subtext: 'Tests, writing, speaking and vocabulary — every part tells you what to fix.',
        guestCaveat: 'Try it without an account, with a daily limit on free tries.',
        noCard: 'No card needed, nothing charged automatically.',
        mockCaption: 'An illustration of the product, not a real user’s work.',
        skillsTitle: 'Four skills, one place',
        skillsBody: 'Each skill has its own way of practising, but they share one rule: you must be told what you got wrong.',
        skillReadingTitle: 'Reading & Listening',
        skillReadingBody: 'Real exam structure, with a clock and a review of every question after you submit.',
        skillSpeakingTitle: 'Speaking',
        skillSpeakingBody: 'Record an answer, get four criterion scores plus measurements like speech rate and filler count.',
        skillWritingTitle: 'Writing',
        skillWritingBody: 'Submit an essay for feedback against four criteria, with a prompt to rewrite the same task.',
        skillVocabTitle: 'Vocabulary',
        skillVocabBody: 'A notebook ordered by memory, reviewed just before you forget, and tests built from your own words.',
        vocabTitle: 'Met a word you do not know? Look it up in your own sentence',
        vocabBody: 'Paste the sentence you met it in, and the explanation follows your context instead of printing a generic definition.',
        tryLookup: 'Try a lookup',
        howTitle: 'How it works',
        step1Title: 'Pick what you need to practise',
        step1Body: 'Sit a test, write an essay, record an answer, or review a few words that are about to lapse.',
        step2Title: 'Do it and submit',
        step2Body: 'The clock and the structure match the real exam, so you get used to the time pressure.',
        step3Title: 'Read the corrections',
        step3Body: 'Every task points at something specific to fix. This is where most of the learning happens.',
        freeTitle: 'What is free, and what is not',
        freeBody: 'We state it here rather than letting you find out. Core learning is free; only the features that call the AI cost credits.',
        freeColumnTitle: 'Free',
        freeItem1: 'Sit IELTS tests and review every question',
        freeItem2: 'The vocabulary notebook and scheduled review',
        freeItem3: 'Weekly progress reports',
        freeItem4: 'Try it without an account',
        paidColumnTitle: 'Costs credits',
        paidItem1: 'AI word explanations in context',
        paidItem2: 'Writing marked against four criteria',
        paidItem3: 'Speaking marked with recording analysis',
        seeCosts: 'See the cost table',
        faqTitle: 'Common questions',
        faqFreeQ: 'Is the core learning actually free?',
        faqFreeA: 'Yes. Sitting tests, the vocabulary notebook, scheduled review and progress reports are all free. Only the parts that call the AI — word explanations, Writing marking, Speaking marking — cost credits, and you see the cost on the button before you press it.',
        faqPaidQ: 'What are credits, and where do they go?',
        faqPaidA: 'Credits pay for the AI features. The full cost table is in the Credits section, and every button that spends credits states the amount before you press it.',
        faqBandQ: 'Are the scores here the same as a real exam?',
        faqBandA: 'No. The score you see is a band estimated from your practice on this platform, not an official test result. We do not promise your band will improve by any amount.',
        faqStreakQ: 'What happens if I miss a day?',
        faqStreakA: 'Nothing. You get 2 rest days a month, applied automatically and impossible to buy more of. A streak is there to show your habit, not to be a debt.',
        ctaTitle: 'Start with one short session today',
        ctaBody: 'No card needed. Try it first, then make an account if it suits you.'
    },
    nav: {
        primary: 'Main navigation',
        more: 'More',
        home: 'Home',
        learn: 'Vocabulary',
        practice: 'Practice',
        progress: 'Progress',
        account: 'Account',
        path: 'Learning path',
        dictionary: 'Vocabulary notebook',
        vocabCheck: 'Look up & ask AI',
        vocabTest: 'Vocabulary test',
        review: 'Vocabulary review',
        writing: 'Writing practice',
        speaking: 'Speaking practice',
        customSpeaking: 'Custom conversation',
        aiChat: 'AI Coach',
        challenges: 'Weekly challenges',
        leaderboard: 'Leaderboard',
        rewards: 'Rewards',
        credits: 'Credits',
        notifications: 'Notifications',
        settings: 'Settings'
    },
    login: {
        modeLabel: 'Sign-in mode',
        register: 'Sign up',
        subtitle: 'Pick up your learning path where you left it.',
        displayName: 'Display name',
        email: 'Email',
        password: 'Password',
        passwordHint: 'At least 8 characters.',
        errorCredentials: 'That email or password is not right',
        or: 'or',
        guestTrial: 'Try it without an account',
        guestNote: 'Guest mode uses AI within a daily limit and does not save your progress.',
        heroTitle: 'Hi, I am Lexi.',
        heroBody: 'I will keep your study rhythm going and point out mistakes in your own work.',
        lexiGreeting: 'Lexi says hello',
        benefit1: 'Feedback against the IELTS marking criteria',
        benefit2: 'A vocabulary notebook that knows what you forget',
        benefit3: 'A daily plan that fits in 10 minutes',
        illustrationNote: 'This is an interface illustration. No real user figures are shown.'
    },
    vocabTest: {
        title: 'Vocabulary test',
        subtitle: 'AI-built tests from your own vocabulary',
        generateTitle: 'Build a new test',
        generateBody: 'Tests are built from the words you have saved, looked up or learned.',
        generateCount: '{{count}} questions',
        generatingNow: 'Building your test…',
        generateFailedBody: 'Could not build a test right now. Try again in a moment.',
        notEnoughDataTitle: 'Not enough vocabulary data yet',
        notEnoughDataBody: 'Tests are built from your own vocabulary, so you need a few words first. Save some into the notebook and come back.',
        openDictionary: 'Open the vocabulary notebook',
        sourcesNote: 'Word sources: {{sources}}',
        source: {
            VOCABULARY_RECORD: 'Words learned',
            USER_DICTIONARY: 'Notebook',
            USER_WORD_LOOKUP_EVENT: 'Words looked up',
            ALL: 'All sources'
        },
        sourceOther: 'Other source',
        statusGenerating: 'Building',
        statusFailed: 'Failed',
        statusReady: 'Ready',
        tagNew: 'New',
        waitForReady: 'Building, one moment…',
        viewFailed: 'View details',
        untitled: 'Untitled test',
        questionCount: '{{count}} questions',
        questionCountLabel: 'Questions',
        attemptCount: 'Attempted {{count}} times',
        start: 'Start',
        historyLink: 'Attempt history',
        emptyTitle: 'No tests yet',
        emptyBody: 'Build your first test from your own vocabulary.',
        takingTitle: 'Vocabulary test',
        progress: '{{done}} of {{total}} answered',
        questionOf: 'Question {{number}} of {{total}}',
        check: 'Check',
        submit: 'Submit',
        choiceRecorded: 'Choice recorded',
        choiceRecordedBody: 'You picked {{option}}. The correct answer appears after you submit.',
        emptyPaperTitle: 'This test has no questions yet',
        emptyPaperBody: 'It may still be building. Go back to the list and try again.',
        resultNoAttemptTitle: 'No attempt selected',
        resultNoAttemptBody: 'Open a result from your history to review an attempt.',
        resultEmptyTitle: 'No attempt data',
        resultEmptyBody: 'This attempt may have been removed, or it is still being marked.',
        lexiResult: 'Lexi on your result',
        wrongSummary: '{{count}} words to review. See below.',
        answerReview: 'Every question',
        anotherTest: 'Another test',
        historyEmptyTitle: 'No attempts yet',
        historyEmptyBody: 'Your results appear here after you submit.',
        attemptsStat: 'Attempts',
        averageStat: 'Average',
        bestStat: 'Best',
        correctOf: '{{correct}}/{{total}} correct'
    },
    vocabCheck: {
        subtitle: 'Look a word up and have the AI explain it in the sentence you met',
        wordLabel: 'Word to look up',
        wordPlaceholder: 'Type an English word…',
        contextLabel: 'Sentence or context (optional)',
        contextPlaceholder: 'Paste the sentence you met this word in…',
        contextHint: 'With context, the explanation follows your sentence instead of printing a generic definition.',
        explain: 'Explain',
        explainWithCost: 'Explain · {{amount}} credit',
        freeNote: 'Core learning costs no credits; only the AI explanation is charged.',
        insufficient: 'You need {{need}} credits and have {{have}}.',
        wordRequired: 'Type a word first.',
        wordTooLong: 'A word can be at most 100 characters.',
        quotaReached: 'You have used today’s free tries. Sign in to continue.',
        connecting: 'Connecting to the AI service…',
        statusStreaming: 'Writing',
        statusComplete: 'Done',
        statusError: 'Error',
        streamError: 'Could not get the explanation',
        saveToNotebook: 'Save to notebook',
        saved: 'Saved to notebook',
        savedFromExplain: 'Saved from an AI explanation',
        recent: 'Recent lookups',
        reopen: 'Reopen',
        intro: 'Type a word to see its meaning, usage and the confusions worth knowing. Adding the sentence you met it in makes the explanation follow your own context.',
        goToNotebook: 'Open the vocabulary notebook'
    },
    weekly: {
        subtitle: 'The weekly report is built from your real practice data',
        thisWeek: 'This week',
        period: '{{from}} – {{to}}',
        headline: 'You studied {{count}} minutes this week',
        measuredNote: 'Every number here is measured from your practice, not predicted.',
        studyMinutes: 'Minutes studied',
        activeDays: 'Days active',
        sessions: 'Sessions',
        xp: 'XP',
        dailyTitle: 'Day by day',
        dailyNote: 'Bar height is study time. A rest day still shows as a rest day, not as missing data.',
        day_ACTIVE: '{{date}}: {{count}} minutes studied',
        day_PARTIAL: '{{date}}: light day, {{count}} minutes',
        day_REST: '{{date}}: rest day',
        day_NONE: '{{date}}: no activity',
        highlightsTitle: 'Worth noting',
        thisWeekValue: 'This week: {{value}} {{unit}}',
        delta: '{{value}} vs last week',
        highlight: {
            TOTAL_STUDY: 'Total study time',
            ACTIVE_DAYS: 'Days active',
            XP_EARNED: 'XP earned',
            IELTS_ACCURACY: 'IELTS accuracy',
            VOCAB_REVIEW_ACCURACY: 'Vocabulary review accuracy',
            WORDS_LEARNED: 'New words learned',
            WRITING_BAND: 'Estimated Writing band',
            SPEAKING_BAND: 'Estimated Speaking band'
        },
        modulesTitle: 'By skill',
        moduleIelts: 'IELTS',
        moduleSpeaking: 'Speaking',
        moduleWriting: 'Writing',
        moduleVocabulary: 'Vocabulary',
        moduleMinutes: '{{count}} min',
        moduleNoActivity: 'No activity this week',
        moduleStatus: {
            ACTIVE: 'Active',
            NO_DATA: 'No data yet',
            INACTIVE: 'Idle'
        },
        open: 'Open',
        notReadyTitle: 'Your weekly report is not ready yet',
        notReadyBody: 'The report is put together once the week ends. Keep practising and it will appear here.'
    },
    profile: {
        unnamed: 'Learner',
        emptyTitle: 'Could not load your profile',
        emptyBody: 'Try reloading the page. If it still fails, check your connection.',
        levelChip: 'Level {{level}}',
        bandChip: 'Band {{value}}',
        studyMinutes: 'Minutes studied',
        wordsLearned: 'Words learned',
        lessons: 'Activities',
        weeklyXp: 'XP this week',
        goalsTitle: 'Learning goals',
        targetBand: 'Target band',
        currentBand: 'Currently {{value}}',
        examDate: 'Target exam date',
        daysLeft: '{{count}} days left',
        datePassed: 'That date has passed',
        noGoalBody: 'You have not set a target band or exam date yet. Setting one gives your progress something to measure against, instead of an empty bar.',
        setGoal: 'Set a goal',
        dailyGoal: '{{count}} minutes a day',
        weeklyWords: '{{count}} words a week',
        levelTitle: 'Lexi’s level',
        levelOf: 'Level {{level}} → {{next}}',
        levelAria: 'Level progress: {{into}} of {{needed}} XP',
        xpToNext: '{{needed}} XP to the next level ({{into}} so far)',
        xpExplainer: 'XP comes from real study: finishing a test, submitting Writing or Speaking, and reviewing vocabulary when it is due.',
        levelCosmetic: 'The level only changes how Lexi looks. Nothing is locked behind it, so there is nothing to grind for.',
        activityTitle: 'Recent activity',
        activityEmpty: 'No activity yet. Do one short session to get started.',
        xpEarned: '+{{count}} XP',
        streakCalm: 'Current streak {{current}} days, longest {{longest}}. Missing a day is fine — a streak is not a debt.',
        graceDays: '2 rest days a month',
        rankNote: 'You are ranked {{rank}} on this week’s board.',
        rankUnranked: 'You are not on this week’s board yet. One session puts you on it.'
    },
    settings: {
        subtitle: 'Manage your reminders, appearance and data',
        sectionsLabel: 'Settings sections',
        sectionReminders: 'Reminders & streak',
        sectionLearning: 'Learning',
        sectionAppearance: 'Appearance',
        sectionData: 'Data',
        pauseAll: 'Pause every reminder',
        pauseAllHelp: 'Turns off all notifications and reminders. Switching it back on restores exactly the ones you had enabled.',
        pausedChip: 'Paused',
        streakTracking: 'Stop tracking my streak',
        streakTrackingHelp: 'When this is on, the day count renders as a switched-off feature — not as a debt waiting to be paid.',
        graceDaysTitle: 'Automatic rest days',
        graceDaysBody: 'You get 2 rest days a month, applied automatically with no notice needed. They cannot be bought and they do not affect your progress.',
        individualReminders: 'Individual reminders',
        syncedNote: 'These are saved to your account.',
        notify: {
            allowVocabularyReminder: 'Vocabulary review reminders',
            allowGradingResult: 'Tell me when marking finishes',
            allowProgressReminder: 'Progress reminders',
            allowWeeklySummary: 'Weekly report',
            allowXpRewardNotification: 'XP notifications',
            allowLeaderboardNotification: 'Leaderboard notifications',
            allowPersonalizedRecommendation: 'Personalised suggestions',
            allowNewContentNotification: 'New content',
            allowReengagementNotification: 'Come back and study',
            allowBandImprovementNotification: 'Estimated band changes',
            allowAdminBroadcast: 'System announcements'
        },
        textSize: 'Text size',
        textSizeHelp: 'Text size applies to reading passages too, not only the interface.',
        textSizeOption: {
            medium: 'Medium',
            large: 'Large',
            xlarge: 'Very large'
        },
        localOnlyNote: 'Text size is saved on this device. There is no API to store it against your account yet, so another device uses the default.',
        theme: 'Theme',
        themeOption: {
            light: 'Light',
            dark: 'Dark',
            system: 'System'
        },
        themeNote: 'v2 has only these three. v1’s nine separate theme profiles were merged into one interface — if you liked the old mono set, that is why it is gone.',
        dataNote: 'Your study data belongs to you. The items below need APIs that do not exist yet.',
        exportData: 'Download my data',
        deleteChatHistory: 'Delete AI chat history',
        dataUnavailable: 'These are switched off because the backend has no endpoint for them. We do not ship working buttons for work that is not done.',
        deleteAccount: 'Delete account',
        deleteAccountHelp: 'Deleting your account cannot be undone: every attempt, your vocabulary notebook and your history would be gone.',
        deleteAccountUnavailable: 'Account deletion has no API yet, so it cannot be used.'
    },
    notifications: {
        unreadSummary: '{{count}} unread',
        allRead: 'You have read everything.',
        markAllRead: 'Mark all as read',
        markRead: 'Mark as read',
        deleteOne: 'Delete notification',
        preferences: 'Reminder settings',
        unread: 'unread',
        statusFilterLabel: 'Filter by read state',
        typeFilterLabel: 'Filter by notification type',
        statusAll: 'All',
        typeAll: 'Any type',
        typeOther: 'Other',
        status: {
            UNREAD: 'Unread',
            READ: 'Read'
        },
        type: {
            VOCABULARY_REMINDER: 'Vocabulary reminder',
            VOCABULARY_TEST_READY: 'Vocabulary test is ready',
            VOCABULARY_TEST_FAILED: 'Vocabulary test failed',
            WRITING_RESULT_READY: 'Writing has been marked',
            SPEAKING_RESULT_READY: 'Speaking has been marked',
            SPEAKING_CONVERSATION_RESULT_READY: 'Speaking conversation has been marked',
            CUSTOM_CONVERSATION_RESULT_READY: 'Custom conversation has been marked',
            ADMIN_BROADCAST: 'System announcement'
        },
        emptyTitle: 'No notifications yet',
        emptyBody: 'Notifications about marked work and review reminders will appear here.',
        noMatchTitle: 'No notifications matched',
        noMatchBody: 'Try clearing the filters to see everything.',
        streakGrace: 'Missing a day is fine — you get 2 rest days a month, applied automatically, and they cannot be bought.'
    },
    aiChat: {
        title: 'Ask Lexi',
        subtitle: 'Ask about how to study, how to approach a task, or where you are weak',
        logLabel: 'Conversation',
        you: 'You',
        lexi: 'Lexi',
        connecting: 'Connecting…',
        thinking: 'Lexi is answering',
        balance: '{{count}} credits left',
        send: 'Send',
        sendWithCost: 'Send · {{amount}} credit',
        costNote: 'Each question costs the credits shown on the button.',
        insufficient: 'You do not have enough credits for this question.',
        composerLabel: 'Your question',
        composerPlaceholder: 'Ask Lexi anything about studying for IELTS…',
        messageRequired: 'Type a question first.',
        sendFailed: 'This message could not be sent.',
        openingWithWeakness: 'Hello. Looking at your recent practice, you are weakest at {{skills}}. Shall we start there, or is there something else on your mind?',
        openingNoWeakness: 'Hello. You have some practice data but not enough for me to point at a specific weakness yet. What would you like to work on today?',
        openingNewAccount: 'Hello. I have no practice data from you yet, so I cannot say where you are weak — and I will not guess. What would you like to start with?',
        panelContext: 'Viewing: {{page}}',
        panelOpening:
            'You are on {{page}}. Ask me about what you are working on, or ask me to point out what is going wrong.',
        suggestion1: 'How do I get better at Matching Headings?',
        suggestion2: 'Give me an outline for a Task 2 essay on education',
        suggestion3: 'Why did my Writing essay score low?',
        suggestion4: 'What should I practise if I only have 20 minutes a day?'
    },
    challenges: {
        title: 'Weekly challenges',
        subtitle: 'Short goals for the week, with XP — never a requirement',
        thisWeek: 'This week',
        weekOf: '{{from}} – {{to}}',
        progressHeadline: '{{done}}/{{total}} challenges done this week',
        xpAvailable: '{{count}} XP available across this week’s challenges',
        activeChip: 'In progress',
        inProgress: 'In progress',
        completed: 'Done',
        granted: 'Reward granted',
        valueOf: '{{current}}/{{target}}',
        progressAria: '{{title}}: {{current}} of {{target}}',
        remaining: '{{count}} more to finish.',
        completedStat: 'Completed',
        emptyTitle: 'No challenges this week yet',
        emptyBody: 'Weekly challenges are published at the start of the week. Keep studying and they will appear here.',
        optOutNote: 'If you would rather not receive challenges and their notifications, you can switch them off under Reminders & streak.',
        optOutAction: 'Turn off in settings'
    },
    evaluation: {
        subtitle: 'An ability check built from your real practice data',
        estimatedBandLabel: 'Band estimated from your practice data',
        measuredSkills: '{{count}}/4 skills measured',
        estimateNote: 'This is a band estimated from your practice on the platform, not an official test result. We do not promise your band will improve by any amount.',
        toleranceNote: 'A difference of about ±0.5 between measurements is normal.',
        noDataNote: 'You have not had anything marked yet, so there is no band to show. We show a dash rather than 0.0 — 0.0 is a score, and this is simply not measured.',
        skillsTitle: 'The four skills',
        measured: 'Measured',
        notMeasured: 'Not measured yet',
        weakTitle: 'Skills to watch',
        weakNote: 'These are the foundation skill areas the platform tracks for you, not a list of mistakes you have made.',
        noWeakSkills: 'Nothing flagged yet. Do a few tasks so the system can see where you are weaker.',
        addToPath: 'Add to my path',
        practiceTitle: 'Suggested practice',
        startPractice: 'Start',
        noPractice: 'No suggestions yet. One task gives the system something to work from.',
        wordsTotal: 'Words in the notebook',
        wordsReviewing: 'Reviewing',
        wordsMastered: 'Mastered'
    },
    review: {
        title: 'Vocabulary review',
        configSubtitle: 'Pick the period, the word group and the count',
        resultSubtitle: 'Session result',
        readyHeadline: 'You have {{count}} words due. Finishing them takes about {{minutes}} minutes.',
        emptyTitle: 'No words match this yet',
        emptyBody: 'This period has no words in the group you picked. Try a wider period, or pick another group.',
        windowTitle: 'Period',
        windowBody: 'Review exactly the stretch you want: recent days, a specific week, or a specific month.',
        preset: {
            allHistory: 'All time',
            last7: 'Last 7 days',
            last30: 'Last 30 days',
            thisWeek: 'This week',
            thisMonth: 'This month',
            custom: 'Custom'
        },
        weekLabel: 'Pick a week',
        monthLabel: 'Pick a month',
        fromDate: 'From',
        toDate: 'To',
        selectedWindow: 'Selected: {{label}}',
        groupTitle: 'Word group',
        groupBody: 'Prefer words you have never reviewed so none slip through, or focus on the ones you keep missing.',
        group: {
            unreviewed: 'Never reviewed',
            unreviewedHint: 'Has not appeared in any review session yet',
            wrong: 'Frequently missed',
            wrongHint: 'Wrong more than half the time',
            all: 'All words',
            allHint: 'Every word in the selected period'
        },
        countTitle: 'Words in this session',
        countBody: 'A short, focused round usually beats a long session you cannot finish.',
        countMax: 'Up to {{count}} words — how many have not been reviewed in the chosen period.',
        directionTitle: 'Direction',
        direction: {
            EN_TO_VI: 'English → Vietnamese',
            VI_TO_EN: 'Vietnamese → English'
        },
        directionNote: 'Change the direction to suit the goal: fast recognition or deeper active recall.',
        wordCount: '{{count}} words',
        startWithDuration: 'Start review ({{count}} words · {{minutes}} min)',
        nothingToReview: 'Nothing to review',
        later: 'Later',
        back: 'Back',
        practice: {
            exit: 'Leave the review',
            progress: 'Review progress',
            promptEnVi: 'English word',
            promptViEn: 'Vietnamese meaning',
            pronounce: 'Listen',
            answerLabelEnVi: 'Enter the Vietnamese meaning',
            answerLabelViEn: 'Enter the English word',
            answerPlaceholderEnVi: 'Type the Vietnamese meaning…',
            answerPlaceholderViEn: 'Type the English word…',
            keyboardHint: 'Enter to check · Esc to leave',
            check: 'Check',
            next: 'Next',
            correctTitle: 'Correct',
            correctBody: 'Nice — that one is solid.',
            wrongTitle: 'Not quite right',
            wrongBody: 'No worries. Seeing the correct answer once more is what makes it stick.',
            correctAnswerEnVi: 'Correct meaning',
            correctAnswerViEn: 'Correct English word',
            alternatives: 'Other accepted meanings',
            explanation: 'More detail',
            examples: 'Usage examples'
        },
        result: {
            excellent: 'Excellent',
            good: 'Good work',
            improving: 'Building up',
            needsReview: 'Needs another round',
            summary: 'You answered {{correct}} of {{total}} words correctly.',
            meta: '{{count}} words · {{direction}} · {{duration}}',
            total: 'Total',
            correct: 'Correct',
            incorrect: 'Wrong',
            accuracy: 'Accuracy',
            accuracyTitle: 'Accuracy rate',
            compareLabel: 'Versus the previous session',
            comparedToLast: '{{diff}}% vs the previous session',
            noComparison: 'First session — nothing to compare with yet.',
            detailsTitle: 'Session details',
            retryAll: 'Review again',
            retryWrong: 'Retry {{count}} tricky words',
            notebook: 'Vocabulary notebook',
            table: {
                prompt: 'Prompt',
                yourAnswer: 'Your answer',
                correctAnswer: 'Correct answer',
                result: 'Result',
                correctTag: 'Correct',
                incorrectTag: 'Wrong'
            }
        },
        level0: 'review again in 4 hours',
        level1: 'review again in 1 day',
        level2: 'review again in 3 days',
        level3: 'review again in 1 week',
        level4: 'review again in 2 weeks'
    },
    customSpeaking: {
        title: 'Custom conversation',
        setupTitle: 'Choose who you are talking to',
        setupBody: 'Pick a topic, a style and a partner. Lexi plays exactly the role you choose, and corrects your sentences as you go.',
        topicLabel: 'Topic',
        topicHint: 'Free text — the more specific, the closer the conversation stays to what you want.',
        topicPlaceholder: 'For example: backpacking around Southeast Asia',
        styleLabel: 'Speaking style',
        personalityLabel: 'Partner personality',
        expertiseLabel: 'Area of expertise',
        voiceLabel: 'Voice',
        gradingLabel: 'Mark this conversation',
        gradingHint: 'Turn this on for scores and feedback at the end. Off means it is unmarked speaking practice — and costs nothing extra.',
        costPerTurn: 'Each turn · {{amount}} credit',
        freeTurn: 'Free',
        sttNote: 'This browser cannot transcribe speech automatically, so you will type what you said. Marking still works normally.',
        start: 'Start the conversation',
        record: 'Speak',
        stopRecording: 'Stop and use this',
        replyLabel: 'Your reply',
        replyPlaceholder: 'Answer Lexi…',
        speakingNow: 'Lexi is speaking…',
        suggestHeading: 'Suggestions',
        suggestion1: 'Give me a harder question',
        suggestion2: 'Correct my grammar mistakes',
        suggestion3: 'Suggest more natural vocabulary',
        send: 'Send',
        sendWithCost: 'Send · {{amount}} credit',
        costLine: 'Each AI turn costs {{amount}} credit · {{balance}} credits left',
        freeLine: 'This turn costs nothing.',
        insufficient: 'You do not have enough credits for the next turn.',
        gradingOn: 'This conversation will be marked when you finish.',
        gradingOff: 'This conversation is unmarked — speaking practice only.',
        finish: 'Finish',
        newConversation: 'New conversation',
        yourTurns: 'Your turns',
        turnsLeft: '{{count}} turns left',
        turnsTaken: '{{count}} of your turns',
        totalTurns: 'Total turns',
        turnN: 'Turn {{number}}',
        conversationTitle: 'Conversation',
        noConversationTitle: 'No conversation selected',
        noConversationBody: 'Start a new conversation and its result will appear here.',
        goneTitle: 'No conversation data',
        goneBody: 'This conversation may have been removed.',
        gradingTitle: 'Your conversation is being marked',
        gradingBody: 'The system is reading back the exchange and scoring each criterion.',
        gradingLexi: 'Lexi waiting for the conversation to be marked',
        notGradedNote: 'You turned marking off for this conversation, so there is no score and no feedback. That was your choice, not a failure.',
        overall: 'Overall',
        coherence: 'Coherence',
        finishedAt: 'Finished at',
        transcriptTitle: 'The conversation',
        option: {
            style: {
                CASUAL: 'Casual',
                PROFESSIONAL: 'Professional',
                ENCOURAGING: 'Encouraging',
                CHALLENGING: 'Challenging',
                PLAYFUL: 'Playful',
                FLIRTY: 'Flirty',
                DEEP: 'Deep',
                DEBATE: 'Debate',
                STREET: 'Street',
                UNFILTERED: 'Unfiltered'
            },
            personality: {
                FRIENDLY: 'Friendly',
                HUMOROUS: 'Humorous',
                PATIENT: 'Patient',
                STRAIGHTFORWARD: 'Straightforward',
                CONFIDENT: 'Confident',
                CURIOUS: 'Curious',
                EMPATHETIC: 'Empathetic',
                BOLD: 'Bold',
                FLIRTY: 'Flirty',
                EDGY: 'Edgy',
                REBELLIOUS: 'Rebellious'
            },
            expertise: {
                GENERAL: 'General',
                BUSINESS: 'Business',
                TECHNOLOGY: 'Technology',
                EDUCATION: 'Education',
                TRAVEL: 'Travel',
                RELATIONSHIPS: 'Relationships',
                ENTERTAINMENT: 'Entertainment',
                GAMING: 'Gaming',
                FITNESS: 'Fitness',
                PSYCHOLOGY: 'Psychology',
                SOCIAL_MEDIA: 'Social media'
            }
        },
        voice: {
            US_NEURAL_J: 'Deep male',
            US_NEURAL_I: 'Young male',
            US_NEURAL_F: 'Young female',
            US_NEURAL_C: 'Mid female',
            US_NEURAL_H: 'Mid female 2',
            US_STUDIO_O: 'Natural female',
            US_CHIRP_F: 'Ultra-natural female'
        }
    },
    onboarding: {
        stepCount: 'Step {{current}} / {{total}}',
        skip: 'Skip',
        back: 'Back',
        next: 'Continue',
        start: 'Start learning',
        later: 'Later',
        saving: 'Saving…',
        saveError: "We couldn't save your choices. Please try again.",
        unsupported: 'The server cannot save this setup yet. Please try again once the system is updated.',
        unset: 'Not set',
        reopen: 'Redo the first-run setup',
        reopenHelp:
            'The four setup questions. Your current answers are kept — you only change what you want to.',
        lexi: {
            goal: 'What band are you aiming for? I will pick practice that fits.',
            skill: 'Which skill is hardest for you? I will give it more of your time.',
            time: 'How long can you study each day? A little every day beats a lot in one go.',
            confirm: 'All set! Have a look at your choices.'
        },
        goal: {
            title: 'Which band are you aiming for?',
            body: 'Pick one goal. You can change it any time in your profile.',
            foundation: 'Foundation · build the habit',
            common: 'The most common goal',
            precision: 'Needs high accuracy',
            unknownWhy: 'Let Lexi suggest one after your first attempt'
        },
        skill: {
            title: 'Which skill is hardest for you?',
            body: 'Pick one skill for Lexi to prioritise. Not sure? Leave it empty — your first attempt will decide.',
            whyListening: 'Listening · gap fill · dictation',
            whyReading: 'Reading · True/False/Not Given · matching headings',
            whyWriting: 'Task 1 · Task 2 · marked on four criteria',
            whySpeaking: 'Parts 1–3 · fluency and pronunciation',
            unknown: 'Not sure',
            unknownWhy: 'No priority skill — let the first attempt decide'
        },
        time: {
            title: 'How long can you study each day?',
            body: 'This goal counts real study time, and you will see it on your home screen every day.',
            opt10: '10 minutes',
            opt20: '20 minutes',
            opt30: '30 minutes',
            opt45: '45 minutes',
            opt60: '60 minutes',
            why10: 'Enough to keep the habit',
            why20: 'One short exercise a day',
            why30: 'The system default',
            why45: 'A full exercise plus vocabulary',
            why60: 'Serious study every day'
        },
        confirm: {
            title: 'All set!',
            body: 'This is what I will use to choose your practice. Change anything right below.',
            bandLabel: 'Target band',
            skillLabel: 'Priority skill',
            timeLabel: 'Each day',
            edit: 'Change',
            note: 'Nothing is locked after this step.',
            settingsLink: 'Change in your profile'
        }
    },
    learningPath: {
        goalLine: 'Target band {{band}}',
        noGoal: 'No target band set',
        currentLine: 'Current band {{band}}',
        notMeasured: 'No band measured yet — that needs at least one marked test.',
        xp: '{{value, number}} XP',
        unitLabel: 'Unit {{index}}',
        unitMeta: '{{nodes}} lessons · 1 end-of-unit check',
        unitProgress: 'Unit progress',
        costLine: 'Costs {{amount}} credits',
        unitProgressLabel: 'Unit progress: {{done}} of {{total}} lessons',
        progressRatio: '{{done}}/{{total}}',
        drillProgress: 'question {{answered}}/{{target}}',
        practiceProgress: 'Done · {{done}}/{{total}}',
        stateDone: 'Done',
        stateCurrent: 'In progress',
        stateLocked: 'Locked',
        stateMilestone: 'End-of-unit check',
        starterTitle: 'Start here — diagnostic',
        starterReason:
            'Not enough data to lay out a path yet. Do these {{nodes}} first and it will re-sort after your first attempt.',
        vocabUnit: 'Vocabulary — review schedule',
        nextUnitTitle: 'Next up: {{unit}}',
        nextUnitHint: 'Opens when you finish the Unit {{index}} check',
        setGoal: 'Set a target band',
        emptyTitle: 'No path to show yet',
        emptyBody: 'Do any one exercise and come back — the path is sorted from where you are weakest.',
        skill: {
            vocabulary: 'Vocabulary',
            other: 'Other skill'
        },
        writingTask1: 'Writing Task 1',
        writingTask2: 'Writing Task 2',
        speakingPart1: 'Speaking Part 1',
        speakingPart2: 'Speaking Part 2',
        speakingPart3: 'Speaking Part 3',
        type: {
            formCompletion: 'Form completion',
            singleChoice: 'Single choice',
            multipleChoice: 'Multiple choice',
            mapLabeling: 'Map labelling',
            sentenceCompletion: 'Sentence completion',
            matching: 'Matching',
            trueFalseNotGiven: 'True / False / Not Given',
            matchingHeadings: 'Matching headings',
            summaryCompletion: 'Summary completion',
            yesNoNotGiven: 'Yes / No / Not Given',
            passageCompletion: 'Passage completion'
        },
        reason: {
            drillTargetMet: 'You have hit the target on this question type',
            drillInProgress: 'The question type you are weakest at',
            drillNotStarted: 'A question type you have never practised',
            practiceCompleted: 'You have finished this one',
            practiceNotStarted: 'The next practice that fits your level',
            submissionGraded: 'This essay has been marked',
            submissionNotGraded: 'This essay has no marked result yet',
            attemptGraded: 'This speaking attempt has been marked',
            attemptNotGraded: 'This speaking attempt has no marked result yet',
            vocabDue: 'Words due for review today',
            vocabClear: 'Nothing due for review today',
            needsPreviousNode: 'Opens after the previous lesson',
            needsAllUnitNodes: 'Opens when the unit lessons are done',
            weakestMeasuredType: 'The type you get wrong most',
            nextInUnit: 'Next lesson in this unit',
            unitCheck: 'End-of-unit check',
            diagnosticBaseline: 'A diagnostic to set your baseline'
        }
    },
    a11y: {
        notification: 'Notifications',
        profile: 'Profile',
        askLexi: 'Ask Lexi',
        accountMenu: 'Account menu'
    }
};
