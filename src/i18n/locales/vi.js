export default {
    common: {
        appName: 'EN Practice',
        loading: 'Đang tải…',
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        later: 'Để sau',
        allow: 'Cho phép',
        cancel: 'Huỷ',
        language: 'Ngôn ngữ',
        english: 'Tiếng Anh',
        vietnamese: 'Tiếng Việt',
        eng: 'EN',
        vie: 'VI',
        learner: 'Học viên',
        global: 'Toàn hệ thống',
        sameTargetBand: 'Cùng mục tiêu band',
        updating: 'Đang cập nhật',
        retry: 'Thử lại',
        tryAgain: 'Thử lại',
        slogan: 'Mỗi ngày một bước',
        streakDays: '{{count}} ngày',
        skipToContent: 'Bỏ qua tới nội dung',
        back: 'Quay lại',
        close: 'Đóng',
        save: 'Lưu',
        delete: 'Xoá',
        error: {
            generic: 'Đã có lỗi xảy ra',
            sessionExpired: 'Phiên đăng nhập đã hết hạn',
            notFound: 'Không tìm thấy nội dung này',
            tooManyRequests: 'Bạn thao tác hơi nhanh, thử lại sau một chút',
            server: 'Máy chủ đang gặp sự cố',
            network: 'Không kết nối được tới máy chủ',
            networkHint: 'Kiểm tra kết nối mạng của bạn. Nếu bạn đang chạy thử ở máy, hãy chắc chắn backend đã bật.',
            notEnoughCredits: 'Bạn không đủ credit cho hành động này',
            notEnoughCreditsHint: 'Bài thi và các hành động AI tốn credit. Phần học cốt lõi — làm đề, sổ tay từ vựng, báo cáo tiến độ — không tốn credit.'
        },
        empty: {
            defaultTitle: 'Chưa có gì ở đây'
        }
    },
    app: {
        pageTitleSuffix: 'EN Practice',
        seoDefault: 'EN Practice - Luyện IELTS và từ vựng tiếng Anh',
        pageTitles: {
            home: 'Trang chủ',
            dictionary: 'Từ điển cá nhân',
            vocabularyCheck: 'Kiểm tra từ & hỏi AI',
            vocabulary: 'AI Vocabulary Test',
            history: 'Lịch sử từ vựng',
            review: 'Ôn tập từ vựng',
            evaluation: 'Phân tích học tập',
            aiChat: 'Trợ lý AI tiếng Anh',
            login: 'Đăng nhập',
            ielts: 'Luyện đề IELTS',
            writing: 'IELTS Writing',
            writingPractice: 'Luyện IELTS Writing',
            speaking: 'IELTS Speaking',
            customSpeaking: 'Hội thoại Speaking tùy chỉnh',
            leaderboard: 'Bảng xếp hạng',
            rewards: 'Phần thưởng',
            credits: 'Ví credit',
            xpHistory: 'Lịch sử XP',
            profile: 'Hồ sơ học tập',
            notifications: 'Thông báo',
            settings: 'Cài đặt',
            weeklyReport: 'Báo cáo tuần',
            weeklyReportHistory: 'Lịch sử báo cáo',
            weeklyReportDetail: 'Chi tiết báo cáo',
            challenges: 'Thử thách'
        },
        sidebar: {
            home: 'Trang chủ',
            leaderboard: 'Bảng xếp hạng',
            rewards: 'Phần thưởng',
            credits: 'Ví credit',
            aiChat: 'AI Chat',
            vocabulary: 'Từ vựng',
            dictionary: 'Từ điển',
            vocabCheckAi: 'Kiểm tra từ & hỏi AI',
            vocabTest: 'AI Vocabulary Test',
            history: 'Lịch sử',
            review: 'Ôn tập',
            evaluation: 'Đánh giá',
            ielts: 'IELTS',
            ieltsTest: 'IELTS Test',
            ieltsWriting: 'IELTS Writing',
            writingPractice: 'Writing Practice',
            ieltsSpeaking: 'IELTS Speaking',
            customSpeaking: 'Speaking tùy chỉnh',
            weeklyReport: 'Báo cáo tuần',
            challenges: 'Thử thách',
            adminPanel: 'Quản trị',
            slogan: 'Mỗi ngày tiến bộ một chút để tự tin hơn với từ vựng và IELTS'
        },
        notifications: {
            enableTitle: 'Bật nhắc nhở học tập',
            enableDescription: 'Cho phép EN Practice gửi những lời nhắc tích cực để bạn duy trì nhịp học mỗi ngày.',
            enableSuccessTitle: 'Đã bật thông báo',
            enableSuccessDescription: 'Bạn sẽ nhận được những lời nhắc hữu ích để ôn tập đều đặn và giữ vững chuỗi học tập.',
            newNoticeFallback: 'Bạn có một thông báo mới.'
        },
        auth: {
            sessionExpiredTitle: 'Phiên đăng nhập đã hết hạn',
            sessionExpiredDescription: 'Bạn cần đăng nhập lại để tiếp tục học và đồng bộ tiến độ.'
        },
        theme: {
            toggleLabel: 'Giao diện: {{mode}}',
            currentMode: 'Giao diện hiện tại: {{mode}}',
            lockedMode: '{{theme}} đang khóa chế độ sáng/tối để giữ tương thích hiển thị.',
            lockedBackground: '{{theme}} đang khóa nền hệ thống để giữ đúng ngôn ngữ thiết kế.',
            profileLabel: 'Ngôn ngữ giao diện',
            modes: {
                light: 'Sáng',
                dark: 'Tối',
                system: 'Theo hệ thống'
            },
            profiles: {
                glass: {
                    label: 'Aurora Glass',
                    family: 'Glassmorphism',
                    hint: 'Kính mờ phát sáng, nổi khối và giàu chiều sâu.'
                },
                calm: {
                    label: 'Calm Flow',
                    family: 'Soft Minimal',
                    hint: 'Mềm, sạch, dịu mắt và nhịp điệu ổn định hơn.'
                },
                contrast: {
                    label: 'Precision',
                    family: 'High Contrast',
                    hint: 'Sắc nét, gọn, giảm trang trí để tập trung nội dung.'
                },
                editorial: {
                    label: 'Neo Editorial',
                    family: 'Editorial',
                    hint: 'Cảm giác tạp chí hiện đại với serif nổi bật và nền ấm.'
                },
                pulse: {
                    label: 'Pulse Studio',
                    family: 'Creative Tech',
                    hint: 'Năng lượng cao, màu điện tử, hợp các màn cần sức bật.'
                },
                focus: {
                    label: 'Focus Grid',
                    family: 'Flat Focus',
                    hint: 'Xanh sáng chủ đạo, bề mặt đặc, không blur và gần như bỏ toàn bộ chiều sâu trang trí.'
                },
                signal: {
                    label: 'Signal Desk',
                    family: 'Minimal Accent',
                    hint: 'Điểm nhấn cam-vàng sáng, khối màu đặc và không gian làm việc yên tĩnh hơn để tập trung.'
                },
                solid: {
                    label: 'Solid System',
                    family: 'Solid Minimal',
                    hint: 'Nền đơn sắc, ít bo góc, ít bóng đổ và không gradient.'
                },
                mono: {
                    label: 'Mono System',
                    family: 'Monochrome',
                    hint: 'Đen trắng chủ đạo, ít bo góc, giảm hiệu ứng để rất kỷ luật.'
                },
                fixedBehavior: 'Theme cố định'
            },
            backgrounds: {
                balanced: 'Cân bằng',
                sage: 'Xanh sage',
                ocean: 'Biển dịu',
                dawn: 'Bình minh',
                amethyst: 'Thạch anh tím',
                blossom: 'Hồng nở',
                petal: 'Cánh hoa',
                midnight: 'Đêm sâu',
                ember: 'Hổ phách lửa',
                canopy: 'Tán rừng'
            },
            solidPrimaryOptions: {
                violet: 'Tím',
                blue: 'Xanh dương',
                emerald: 'Xanh ngọc',
                amber: 'Hổ phách',
                rose: 'Hồng'
            }
        }
    },
    profileDropdown: {
        noTarget: 'Chưa đặt mục tiêu',
        streak: 'Chuỗi {{count}} ngày',
        level: 'Cấp {{count}}',
        levelProgress: 'Tiến độ cấp độ',
        currentLevelXp: '{{count}} XP trong cấp độ hiện tại',
        targetBand: 'Mục tiêu {{score}}',
        profileSummaryFallback: 'Chưa tải được tóm tắt hồ sơ. Hệ thống đang hiển thị thông tin cơ bản để bạn tiếp tục học thuận tiện.',
        overallBand: 'Band tổng quan',
        noBandEstimate: 'Chưa có ước lượng band',
        weeklyXp: 'XP tuần này',
        totalXp: 'Tổng XP',
        streakLabel: 'Chuỗi học',
        startStreak: 'Bắt đầu ngay',
        viewProfile: 'Xem hồ sơ',
        openSettings: 'Cài đặt',
        languageLabel: 'Ngôn ngữ',
        themeLabel: 'Giao diện',
        backgroundLabel: 'Tông nền',
        backgroundHint: 'Chọn một nền dịu hơn để toàn bộ giao diện cân bằng và đỡ chói mắt hơn.'
    },
    settingsPage: {
        header: {
            title: 'Cài đặt',
            description: 'Quản lý giao diện toàn hệ thống, thông báo và các nhóm tùy chọn khác trong một màn hình tập trung hơn.',
            viewNotifications: 'Xem thông báo'
        },
        navigation: {
            title: 'Nhóm cài đặt',
            description: 'Màn này được tách riêng để sau này có thể thêm nhiều nhóm thiết lập hơn mà không làm chật inbox.',
            appearance: 'Giao diện',
            appearanceHint: 'Chọn theme, chế độ sáng tối và tông nền cho toàn hệ thống.',
            notifications: 'Thông báo',
            notificationsHint: 'Bật tắt push, email và các nhắc học.',
            account: 'Tài khoản',
            accountHint: 'Sắp có',
            learning: 'Học tập',
            learningHint: 'Sắp có'
        },
        theme: {
            title: 'Giao diện toàn hệ thống',
            description: 'Chọn ngôn ngữ thiết kế áp dụng cho toàn bộ ứng dụng. Một số theme cố định sẽ khóa chế độ sáng tối hoặc nền để giữ độ tương thích hiển thị.',
            activeLabel: 'Theme đang dùng',
            currentMode: 'Chế độ hiển thị',
            currentBackground: 'Tông nền',
            fixedTitle: 'Theme đang dùng là theme cố định',
            fixedDescription: '{{theme}} đang khóa một phần tùy chọn giao diện để giữ đúng ngôn ngữ thiết kế và tránh lệch hiển thị.',
            profileSectionTitle: 'Chọn ngôn ngữ thiết kế',
            profileSectionDescription: 'Mỗi profile thay đổi đồng thời màu sắc, bo góc, typography, độ sâu bề mặt và cảm giác chuyển động của toàn bộ hệ thống.',
            modeControl: 'Chế độ sáng tối',
            modeControlHint: 'Đổi light, dark hoặc theo hệ thống cho các theme có hỗ trợ biến thể động.',
            backgroundControl: 'Nền hệ thống',
            backgroundControlHint: 'Chọn tông nền áp dụng cho toàn bộ app khi theme hiện tại cho phép đổi nền.',
            solidPrimarySectionTitle: 'Màu primary cho Solid System',
            solidPrimarySectionDescription: 'Chọn màu primary áp dụng cho button, trạng thái chọn và các điểm nhấn toàn hệ thống khi đang dùng Solid System.',
            compatibilityTitle: 'Tương thích hiển thị',
            compatibilityDescription: 'Các theme cố định như Solid System hoặc Mono System sẽ tự khóa nền và light/dark mode để đảm bảo mọi màn hình luôn đúng phong cách đã định nghĩa.'
        },
        overview: {
            title: 'Một nơi gọn hơn cho tùy chọn',
            description: 'Giao diện toàn hệ thống và cài đặt thông báo đã được gom vào đây để người dùng quản lý trải nghiệm nhất quán hơn.',
            futureTitle: 'Sẵn sàng cho các nhóm mới',
            futureDescription: 'Sau này có thể thêm các nhóm như tài khoản, quyền riêng tư hoặc tùy chọn học tập mà không cần đổi lại luồng hiện tại.'
        }
    },
    notificationCenter: {
        hero: {
            eyebrow: 'Hộp thư thông báo',
            title: 'Thông báo',
            description: 'Theo dõi nhắc học, kết quả chấm bài và cập nhật hệ thống trong một inbox gọn và dễ theo dõi hơn.'
        },
        login: {
            title: 'Đăng nhập để xem thông báo của bạn',
            description: 'Thông báo realtime, lịch sử chấm bài và tùy chọn nhận thông báo sẽ xuất hiện ở đây sau khi bạn đăng nhập.',
            cta: 'Đăng nhập ngay'
        },
        actions: {
            refresh: 'Làm mới',
            markAll: 'Đánh dấu tất cả đã đọc'
        },
        messages: {
            loadError: 'Không thể tải danh sách thông báo.',
            loadMoreError: 'Không thể tải thêm thông báo.',
            refreshSuccess: 'Đã làm mới thông báo.',
            refreshError: 'Không thể làm mới dữ liệu.',
            markAllSuccess: 'Đã đánh dấu tất cả thông báo là đã đọc.',
            markAllError: 'Không thể cập nhật trạng thái thông báo.',
            deleteSuccess: 'Đã xóa thông báo.',
            deleteError: 'Không thể xóa thông báo.',
            markReadError: 'Không thể đánh dấu thông báo là đã đọc.'
        },
        summary: {
            total: {
                label: 'Tổng theo bộ lọc',
                detail: 'Đang hiển thị {{count}} mục trong màn hình hiện tại'
            },
            unread: {
                label: 'Chưa đọc',
                detail: '{{count}} mục chưa đọc trong bộ lọc hiện tại'
            },
            focus: {
                label: 'Trọng tâm hiện tại',
                detail: 'Đang lọc theo {{type}}'
            }
        },
        filters: {
            statusLabel: 'Trạng thái',
            typeLabel: 'Loại thông báo'
        },
        list: {
            title: 'Hoạt động gần đây',
            description: 'Có {{count}} thông báo phù hợp với bộ lọc bạn đang chọn.',
            unreadPill: '{{count}} chưa đọc trong khung này',
            loadingMore: 'Đang tải thêm thông báo...',
            endMessage: 'Bạn đã xem hết danh sách này.',
            errorTitle: 'Không thể tải thông báo',
            emptyTitle: 'Chưa có thông báo nào',
            emptyDescription: 'Nhắc học, kết quả chấm bài và các cập nhật quan trọng sẽ xuất hiện ở đây khi có mới.'
        },
        item: {
            markRead: 'Đánh dấu đã đọc',
            delete: 'Xóa'
        },
        side: {
            settingsTitle: 'Tùy chọn thông báo',
            settingsDescription: 'Điều chỉnh nhắc học, kết quả chấm bài và broadcast hệ thống trong trang cài đặt riêng để inbox luôn gọn gàng.',
            openSettings: 'Mở cài đặt',
            insightsTitle: 'Tóm tắt inbox',
            insightsDescription: 'Xem nhanh những gì còn cần chú ý trong danh sách đang được lọc.',
            unreadInView: 'Chưa đọc trong khung này',
            readInView: 'Đã đọc trong khung này',
            actionable: 'Thông báo có liên kết',
            refreshHint: 'Làm mới inbox này'
        },
        statuses: {
            ALL: 'Tất cả',
            UNREAD: 'Chưa đọc',
            READ: 'Đã đọc'
        },
        types: {
            ALL: 'Tất cả loại',
            VOCABULARY_REMINDER: 'Nhắc ôn từ vựng',
            VOCABULARY_TEST_READY: 'Vocabulary test sẵn sàng',
            VOCABULARY_TEST_FAILED: 'Vocabulary test thất bại',
            WRITING_RESULT_READY: 'Kết quả Writing',
            SPEAKING_RESULT_READY: 'Kết quả Speaking',
            SPEAKING_CONVERSATION_RESULT_READY: 'Kết quả Speaking Conversation',
            CUSTOM_CONVERSATION_RESULT_READY: 'Kết quả Custom Conversation',
            ADMIN_BROADCAST: 'Thông báo hệ thống'
        },
        preferences: {
            title: 'Cài đặt thông báo',
            description: 'Chọn những loại thông báo bạn muốn nhận.',
            save: 'Lưu thay đổi',
            updatedAt: 'Cập nhật lần cuối: {{value}}',
            updatedFallback: 'Thay đổi của bạn sẽ được lưu cho toàn bộ tài khoản.',
            messages: {
                saved: 'Đã cập nhật cài đặt thông báo.',
                loadError: 'Không thể tải cài đặt thông báo.',
                saveError: 'Không thể cập nhật cài đặt thông báo.'
            },
            fields: {
                allowPush: {
                    label: 'Push notification',
                    description: 'Nhận thông báo ngay khi có kết quả mới hoặc nhắc học.'
                },
                allowEmail: {
                    label: 'Email notification',
                    description: 'Nhận các cập nhật quan trọng và tổng hợp qua email.'
                },
                allowVocabularyReminder: {
                    label: 'Nhắc ôn từ vựng',
                    description: 'Nhận nhắc nhở khi bạn có từ cần ôn tập.'
                },
                allowGradingResult: {
                    label: 'Kết quả chấm bài',
                    description: 'Thông báo khi Writing hoặc Speaking có kết quả mới.'
                },
                allowAdminBroadcast: {
                    label: 'Thông báo hệ thống',
                    description: 'Nhận broadcast từ quản trị viên và cập nhật lớn của hệ thống.'
                }
            }
        }
    },
    loginPage: {
        eyebrow: 'Truy cập học tập',
        title: 'Giữ toàn bộ tiến độ luôn đồng hành cùng bạn',
        description: 'Đăng nhập để đồng bộ lịch sử học, lưu từ quan trọng và tiếp tục hành trình IELTS trên nhiều thiết bị.',
        benefits: {
            sync: {
                title: 'Đồng bộ đám mây',
                description: 'Giữ từ vựng, lịch sử và hoạt động học tập trong cùng một tài khoản.'
            },
            progress: {
                title: 'Theo dõi tiến độ',
                description: 'Xem streak, XP và kết quả chấm bài ở một nơi gọn gàng hơn.'
            },
            ai: {
                title: 'Trợ lý AI cá nhân',
                description: 'AI sẽ đồng hành cùng bạn, đánh giá bài viết, luyện nói và giải thích từ vựng sâu hơn.'
            },
            secure: {
                title: 'Tiến độ của bạn được lưu lại',
                description: 'Từ vựng, kết quả và lịch sử nằm trong tài khoản của bạn, dùng được trên cả điện thoại và máy tính.'
            }
        },
        modes: {
            login: 'Đăng nhập',
            register: 'Đăng ký'
        },
        form: {
            loginTitle: 'Chào mừng quay lại',
            loginDescription: 'Tiếp tục từ nơi bạn đang dừng lại và giữ nhịp học thật ổn định.',
            registerTitle: 'Tạo tài khoản mới',
            registerDescription: 'Tạo hồ sơ học tập để tiến độ của bạn được lưu lại lâu dài.',
            divider: 'hoặc',
            guestCta: 'Tiếp tục không đăng nhập',
            guestHint: 'Tiến độ của bạn sẽ chỉ được lưu trên thiết bị này.',
            switchToRegisterPrompt: 'Chưa có tài khoản?',
            switchToRegisterCta: 'Tạo ngay',
            switchToLoginPrompt: 'Đã có tài khoản?',
            switchToLoginCta: 'Đăng nhập'
        },
        fields: {
            email: {
                label: 'Email',
                placeholder: 'example@email.com',
                required: 'Vui lòng nhập email.',
                invalid: 'Email không hợp lệ.'
            },
            displayName: {
                label: 'Tên hiển thị',
                placeholder: 'Tên của bạn',
                required: 'Vui lòng nhập tên hiển thị.',
                min: 'Tên hiển thị cần ít nhất 2 ký tự.'
            },
            password: {
                label: 'Mật khẩu',
                placeholder: 'Nhập mật khẩu',
                required: 'Vui lòng nhập mật khẩu.',
                min: 'Mật khẩu cần ít nhất 8 ký tự.'
            },
            confirmPassword: {
                label: 'Xác nhận mật khẩu',
                placeholder: 'Nhập lại mật khẩu',
                required: 'Vui lòng xác nhận mật khẩu.',
                mismatch: 'Mật khẩu không khớp.'
            }
        },
        actions: {
            login: 'Đăng nhập',
            register: 'Tạo tài khoản'
        },
        messages: {
            loginSuccess: 'Đăng nhập thành công.',
            registerSuccess: 'Đăng ký thành công.',
            errorFallback: 'Có lỗi xảy ra. Vui lòng thử lại.'
        }
    },
    credits: {
        hero: {
            eyebrow: 'Credit học tập',
            title: 'Ví credit',
            description: 'Theo dõi số dư, credit đang giữ và lịch sử sử dụng.',
            earn: 'Kiếm credit'
        },
        summary: {
            available: 'Có thể sử dụng',
            reserved: 'Đang tạm giữ',
            status: 'Trạng thái ví'
        },
        status: {
            ACTIVE: 'Đang hoạt động',
            FROZEN: 'Đang đóng băng',
            UNKNOWN: 'Chưa xác định'
        },
        cost: {
            title: 'Bảng phí hiện tại',
            subtitle: 'Chi phí do hệ thống cập nhật và có thể thay đổi.',
            summary: '{{count}} chức năng đang áp dụng phí',
            loadingSummary: 'Đang tải bảng phí...',
            unavailableSummary: 'Bảng phí đang tạm gián đoạn',
            view: 'Xem bảng phí',
            close: 'Đóng',
            observe: 'Chế độ quan sát, chưa thực sự trừ credit.',
            amount: '-{{count}} credit',
            trial: '{{count}} credit · Dùng thử',
            newAttemptOnly: 'Chỉ tính credit khi tạo lượt làm mới.',
            empty: 'Chưa có bảng phí khả dụng.'
        },
        actions: {
            AI_CHAT: 'AI Chat',
            VOCABULARY_TEST_GENERATE: 'Tạo bài kiểm tra từ vựng',
            IELTS_START: 'Bắt đầu IELTS',
            WRITING_START: 'Nộp bài IELTS Writing',
            WRITING_PRACTICE_START: 'Bắt đầu Writing Practice',
            SPEAKING_START: 'Bắt đầu Speaking',
            WRITING_PRACTICE_GENERATE: 'Sinh bài Writing Practice',
            AI_EXPLAIN: 'AI giải thích'
        },
        actionExplain: {
            AI_CHAT: 'Credit sẽ bị trừ với mỗi câu hỏi đáp với AI',
            VOCABULARY_TEST_GENERATE: 'Credit sẽ bị trừ khi bấm Tạo bài với AI',
            IELTS_START: 'Credit sẽ bị trừ khi nhấn Bắt đầu',
            WRITING_START: 'Credit sẽ chỉ bị trừ khi nộp bài Writing',
            WRITING_PRACTICE_START: 'Credit sẽ bị trừ ngay khi nhấn Bắt đầu',
            SPEAKING_START: 'Với bài luyện tập, credit sẽ bị trừ khi gửi bản ghi âm. Với hội thoại, sẽ trừ ngay khi bắt đầu',
            WRITING_PRACTICE_GENERATE: 'Chức năng hiện chỉ dùng cho admin',
            AI_EXPLAIN: 'Credit sẽ bị trừ khi yêu cầu AI giải thích'
        },
        transactions: {
            title: 'Lịch sử giao dịch',
            subtitle: 'Các lần cộng, giữ, sử dụng và hoàn credit.',
            empty: 'Chưa có giao dịch credit.',
            loadError: 'Không thể tải lịch sử giao dịch.',
            details: 'Chi tiết giao dịch',
            source: 'Nguồn: {{value}}',
            reference: 'Tham chiếu: {{type}} · {{id}}',
            balanceAfter: 'Khả dụng sau giao dịch: {{count}}',
            reservedAfter: 'Tạm giữ sau giao dịch: {{count}}',
            types: {
                GRANT: 'Được cấp credit',
                SPEND: 'Sử dụng credit',
                RESERVE: 'Tạm giữ credit',
                CAPTURE: 'Hoàn tất sử dụng',
                RELEASE: 'Hoàn lại credit',
                OBSERVATION: 'Ghi nhận dùng thử',
                UNKNOWN: 'Giao dịch credit'
            }
        },
        modal: {
            insufficientTitle: 'Không đủ credit',
            insufficientDescription: 'Thao tác cần {{required}} credit, số dư hiện tại là {{available}}.',
            frozenTitle: 'Ví đang bị đóng băng',
            frozenDescription: 'Ví hiện không thể thực hiện hành động tiêu credit.',
            viewWallet: 'Xem ví',
            earnCredits: 'Kiếm credit'
        },
        errors: {
            balance: 'Không thể tải số dư credit.',
            costs: 'Không thể tải bảng phí credit.'
        },
        subtitle: 'Credit dùng cho các phần AI. Phần học cốt lõi thì miễn phí.',
        balanceLabel: 'Credit khả dụng',
        balanceNote: 'Credit bị giữ cho một tác vụ đang chạy sẽ được trả lại nếu tác vụ đó lỗi.',
        reserved: 'Đang giữ {{count}}',
        walletStatus: 'Trạng thái ví',
        costsTitle: 'Việc gì tốn bao nhiêu',
        someUnavailable: '{{count}} tính năng đang tắt',
        unavailable: 'Đang tắt',
        free: 'Miễn phí',
        costAmount: '−{{count}}',
        observeNote: 'Hiện chưa trừ credit, chỉ ghi nhận để theo dõi.',
        freeSurfaceNote: 'Làm đề, sổ tay từ vựng và báo cáo tiến độ không tốn credit. Chỉ những việc gọi tới AI mới tính.',
        transactionsTitle: 'Lịch sử credit',
        noTransactionsTitle: 'Chưa có giao dịch nào',
        noTransactionsBody: 'Khi bạn dùng credit cho một tác vụ, giao dịch sẽ hiện ở đây.',
        balanceAfter: 'Còn lại {{count}}',
        showAll: 'Xem tất cả {{count}}',
        showLess: 'Thu gọn',
        action: {
            AI_CHAT: 'Trò chuyện với AI',
            AI_EXPLAIN: 'AI giải thích từ vựng',
            VOCABULARY_TEST_GENERATE: 'Tạo bài test từ vựng',
            IELTS_START: 'Bắt đầu một bài thi IELTS',
            WRITING_START: 'Chấm bài Writing',
            WRITING_PRACTICE_START: 'Luyện Writing',
            WRITING_PRACTICE_GENERATE: 'Tạo đề Writing',
            SPEAKING_START: 'Luyện Speaking'
        }
    },
    rewards: {
        hero: {
            eyebrow: 'Vòng lặp động lực',
            title: 'Phần thưởng',
            description: 'Điểm danh mỗi ngày, mở khóa mốc XP và trang bị vật phẩm bạn sở hữu.'
        },
        checkIn: {
            title: 'Điểm danh hôm nay',
            subtitle: 'Steak càng cao thì xp nhận được càng nhiều',
            claim: 'Điểm danh',
            claimed: 'Đã điểm danh',
            alreadyClaimed: 'Bạn đã điểm danh hôm nay.',
            claimSuccess: '+{{xp}} XP cho điểm danh hôm nay.',
            currentStreak: 'Streak hiện tại',
            todayXp: 'Hôm nay nhận {{xp}} XP',
            dayChecked: 'Đã nhận',
            today: 'Hôm nay',
            dayPending: 'Chưa nhận'
        },
        milestones: {
            title: 'Mốc XP',
            subtitle: 'Mốc thưởng dựa trên tổng XP tích lũy',
            empty: 'Chưa có mốc thưởng khả dụng.',
            requiredXp: 'Xp tích lũy',
            claim: 'Nhận',
            reward: 'Phần thưởng',
            states: {
                locked: 'Đang khóa',
                claimable: 'Có thể nhận',
                claimed: 'Đã nhận'
            }
        },
        missions: {
            title: 'Nhiệm vụ thưởng',
            subtitle: 'Hoàn thành mục tiêu học tập để mở khóa phần thưởng.',
            empty: 'Không có nhiệm vụ thưởng trong bộ lọc này.',
            viewInventory: 'Xem kho',
            claimedAt: 'Đã nhận {{date}}',
            lockedHint: 'Tiếp tục học để mở khóa phần thưởng này.',
            rewardItems: 'Phần thưởng',
            creditExpiry: 'Hết hạn sau {{count}} ngày.',
            tabs: {
                LOCKED: 'Chưa nhận',
                CLAIMED: 'Đã nhận'
            },
            emptyByStatus: {
                LOCKED: 'Không có nhiệm vụ thưởng chưa nhận.',
                CLAIMED: 'Không có nhiệm vụ thưởng đã nhận.'
            },
            triggers: {
                DAILY_TASK_PLAN_COMPLETED: 'Hằng ngày',
                WEEKLY_CHALLENGE_COMPLETED: 'Hằng tuần',
                IELTS_SKILL_COMPLETED: 'IELTS'
            },
            statuses: {
                LOCKED: 'Đang khóa',
                CLAIMED: 'Đã nhận'
            }
        },
        inventory: {
            title: 'Kho vật phẩm',
            subtitle: 'Trang bị badge, khung avatar hoặc dùng thẻ thưởng consumable.',
            empty: 'Chưa có vật phẩm trong bộ lọc này.',
            equip: 'Trang bị',
            unequip: 'Gỡ trang bị',
            use: 'Dùng',
            used: 'Đã dùng',
            equipped: 'Đang trang bị',
            equipSuccess: 'Đã trang bị vật phẩm.',
            unequipSuccess: 'Đã gỡ trang bị.',
            useSuccess: 'Đã dùng vật phẩm.',
            totalItems: '{{total}} vật phẩm',
            filters: {
                ALL: 'Tất cả',
                BADGE: 'Badge',
                AVATAR_FRAME: 'Khung avatar',
                REWARD_CARD: 'Thẻ thưởng'
            },
            usageFilters: {
                ALL: 'Tất cả trạng thái',
                UNUSED: 'Chưa dùng',
                USED: 'Đã dùng'
            },
            sort: {
                NEWEST: 'Mới nhất',
                NAME: 'Tên'
            },
            types: {
                REWARD_CARD: 'Thẻ thưởng',
                BADGE: 'Badge',
                AVATAR_FRAME: 'Khung avatar'
            }
        },
        rewardModal: {
            title: 'Bạn nhận được phần thưởng',
            equipNow: 'Trang bị ngay',
            useNow: 'Dùng ngay',
            later: 'Để sau'
        },
        useEffect: {
            title: 'Đã dùng phần thưởng',
            instructions: 'Cách nhận thưởng',
            close: 'Đóng',
            cta: 'Mở liên kết'
        },
        errors: {
            checkIn: 'Không tải được trạng thái điểm danh.',
            milestones: 'Không tải được mốc XP.',
            missions: 'Không tải được nhiệm vụ thưởng.',
            inventory: 'Không tải được kho vật phẩm.',
            claimCheckIn: 'Điểm danh thất bại.',
            claimMilestone: 'Claim mốc XP thất bại.',
            equip: 'Trang bị thất bại.',
            unequip: 'Gỡ trang bị thất bại.',
            use: 'Dùng vật phẩm thất bại.'
        },
        subtitle: 'XP và phần thưởng từ việc học thật',
        xpTitle: 'Tổng XP',
        weeklyXp: 'Tuần này {{count}} XP',
        automaticNote: 'Phần thưởng được trao tự động khi bạn hoàn thành điều kiện. Không có nút nhận, vì hệ thống đã tự trao — chúng tôi không đặt nút cho việc không cần bấm.',
        inProgressTitle: 'Đang tiến tới',
        claimedTitle: 'Đã nhận',
        claimed: 'Đã nhận',
        granted: 'Đã trao',
        credits: '{{count}} credit',
        xp: '{{count}} XP',
        progressAria: '{{name}}: {{current}} trên {{target}}',
        emptyTitle: 'Chưa có phần thưởng nào',
        emptyBody: 'Hoàn thành một phiên học để mở phần thưởng đầu tiên.',
        historyTitle: 'Lịch sử XP',
        noHistory: 'Chưa có XP nào. Hoàn thành một bài là bắt đầu có.',
        noPurchase: 'XP và phần thưởng không thể mua.'
    },
    profilePage: {
        loadError: 'Chưa thể tải hồ sơ học tập lúc này.',
        header: {
            title: 'Hồ sơ học tập',
            description: 'Theo dõi toàn cảnh tiến bộ, hoạt động học tập và mục tiêu của bạn trên nền tảng.',
            editProfile: 'Chỉnh sửa hồ sơ'
        },
        membershipHeader: {
            eyebrow: 'Hạng thành viên',
            comingSoon: 'Sắp ra mắt',
            status: {
                active: 'Membership đang hoạt động',
                expired: 'Membership đã hết hạn',
                expiresAt: 'Hết hạn {{date}}',
                noExpiry: 'Không có ngày hết hạn'
            },
            actions: {
                renew: 'Gia hạn membership'
            },
            tiers: {
                free: {
                    title: 'Free',
                    message: 'Gói khởi đầu cho hành trình học tập cốt lõi.',
                    cta: 'Khám phá Premium'
                },
                premium: {
                    title: 'Premium',
                    message: 'Dấu ấn membership nâng cao cho hành trình học tập.',
                    cta: 'Khám phá Pro'
                },
                pro: {
                    title: 'Pro',
                    message: 'Cấp membership cao nhất dành cho người dùng.',
                    cta: 'Gói cao nhất'
                },
                special: {
                    title: 'Special',
                    message: 'Đặc quyền hệ thống được cấp thông qua admin promote.',
                    cta: 'Do quản trị viên cấp'
                }
            }
        },
        common: {
            na: 'Chưa có',
            notSet: 'Chưa thiết lập',
            notSelected: 'Chưa chọn'
        },
        units: {
            daysLong: '{{count}} ngày',
            minutesShort: '{{count}} phút',
            hoursShort: '{{count}} giờ',
            hoursMinutesShort: '{{hours}} giờ {{minutes}} phút',
            daysLong_one: '{{count}} ngày',
            daysLong_other: '{{count}} ngày'
        },
        compactStats: {
            weeklyXp: 'XP tuần này',
            lessons: 'Bài học',
            studyTime: 'Thời gian học',
            wordsLearned: 'Từ đã học',
            reviewToday: 'Ôn hôm nay',
            currentStreak: 'Chuỗi hiện tại',
            overallBand: 'Band tổng quan',
            target: 'Mục tiêu'
        },
        skills: {
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking',
            vocabulary: 'Từ vựng'
        },
        vocabulary: {
            mastered: 'Đã thành thạo',
            reviewing: 'Đang ôn',
            building: 'Đang xây nền',
            wordsCount: '{{count}} từ',
            wordsCount_one: '{{count}} từ',
            wordsCount_other: '{{count}} từ'
        },
        goalMessages: {
            completed: 'Bạn đã hoàn thành mục tiêu hôm nay rồi, thật tuyệt!',
            remaining: 'Chỉ còn {{count}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!',
            remaining_one: 'Chỉ còn {{count}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!',
            remaining_other: 'Chỉ còn {{count}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!'
        },
        hero: {
            defaultBio: 'Hãy thêm một vài dòng giới thiệu, mục tiêu IELTS và kỹ năng bạn muốn tập trung để chúng tôi đồng hành sát hơn trên hành trình học của bạn.',
            joined: 'Tham gia từ {{date}}',
            lastLogin: 'Lần đăng nhập gần nhất {{date}}',
            targetBand: 'Mục tiêu {{score}}',
            totalXp: 'Tổng XP',
            currentLevel: 'Tiến độ cấp độ',
            progressToLevel: '{{percentage}}% để lên cấp {{level}}',
            xpToNextLevel: 'Còn {{xp}} nữa để lên cấp {{level}}',
            overallBand: 'Band tổng quan',
            weeklyXp: 'XP tuần này',
            streak: 'Chuỗi học',
            longest: 'Dài nhất',
            goalToday: 'Mục tiêu hôm nay'
        },
        momentum: {
            eyebrow: 'Nhịp học',
            title: 'Nhịp học trong tuần',
            subtitle: 'Biểu đồ giúp bạn nhìn rõ nhịp học trong 7 ngày gần nhất.',
            xpToNext: 'XP để lên cấp',
            currentLevel: 'Cấp hiện tại',
            dailyGoal: 'Mục tiêu ngày',
            chart: {
                xp: 'XP',
                minutes: 'Phút'
            }
        },
        todayGoal: {
            eyebrow: 'Tập trung',
            title: 'Mục tiêu hôm nay',
            subtitle: 'Giữ mục tiêu hôm nay thật rõ ràng để bạn dễ duy trì nhịp học hơn.',
            studied: 'Đã học',
            target: 'Mục tiêu'
        },
        skillsSection: {
            eyebrow: 'Biểu đồ kỹ năng',
            title: 'Tiến độ kỹ năng',
            subtitle: 'Xem nhanh năng lực hiện tại của bạn trên bốn kỹ năng IELTS.',
            band: 'Band'
        },
        vocabularySection: {
            eyebrow: 'Từ vựng',
            title: 'Cân bằng từ vựng',
            subtitle: 'Biểu đồ donut nhỏ gọn giúp bạn thấy từ vựng đang phân bổ ở từng mức độ thành thạo.',
            masteryRate: 'Tỷ lệ thành thạo',
            masteredWords: '{{mastered}} / {{total}} từ đã thành thạo',
            favorites: 'Yêu thích',
            learning: 'Đang học',
            reviewToday: 'Ôn hôm nay'
        },
        consistency: {
            eyebrow: 'Độ đều đặn',
            title: 'Bản đồ chuỗi học',
            subtitle: 'Chuỗi học tập của bạn trong 30 ngày gần nhất.',
            currentStreak: 'Chuỗi hiện tại',
            longestStreak: 'Chuỗi dài nhất',
            activeDays: 'Ngày hoạt động',
            less: 'Ít',
            more: 'Nhiều',
            heatmapActive: '{{date}} - Có hoạt động',
            heatmapInactive: '{{date}} - Chưa hoạt động',
            empty: 'Chưa có dữ liệu hiển thị'
        },
        goals: {
            eyebrow: 'Mục tiêu',
            title: 'Lộ trình mục tiêu',
            subtitle: 'Gói gọn mục tiêu IELTS, thói quen học và các điểm cần ưu tiên trong một nơi.',
            targetIelts: 'Mục tiêu IELTS',
            examDate: 'Ngày thi',
            dailyGoal: 'Mục tiêu ngày',
            weeklyWords: 'Từ mỗi tuần',
            preferred: 'Ưu tiên',
            needsFocus: 'Cần tập trung thêm'
        },
        recommendations: {
            eyebrow: 'Gợi ý',
            title: 'Luyện tập được đề xuất',
            subtitle: 'Những gợi ý ưu tiên dựa trên mục tiêu hiện tại và các điểm bạn nên cải thiện thêm.',
            emptySubtitle: 'Hãy thêm mục tiêu IELTS để nhận được gợi ý luyện tập sát hơn với hành trình của bạn.',
            empty: 'Chưa có gợi ý luyện tập nào',
            startNow: 'Bắt đầu ngay'
        },
        leaderboard: {
            eyebrow: 'Bảng xếp hạng',
            title: 'Xếp hạng tuần',
            subtitle: 'Xem nhanh vị trí hiện tại của bạn và những người đang bám sát phía trước.',
            viewLeaderboard: 'Xem bảng xếp hạng',
            snapshot: 'Tóm tắt của bạn',
            rank: 'Hạng',
            xp: 'XP',
            nextRank: 'Hạng kế tiếp',
            rankAndStreak: 'Hạng #{{rank}} • chuỗi {{count}} ngày',
            empty: 'Tuần này chưa có dữ liệu bảng xếp hạng'
        },
        recentActivity: {
            eyebrow: 'Hoạt động gần đây',
            title: 'Dòng thời gian học tập',
            subtitle: 'Theo dõi nhanh những phiên học gần nhất để thấy đà tiến bộ của bạn.',
            emptySubtitle: 'Những hoạt động mới nhất sẽ giúp bạn nhìn rõ cách nhịp học đang phát triển.',
            empty: 'Chưa có hoạt động gần đây',
            fallbackDescription: 'Hoạt động học tập'
        }
    },
    profileEdit: {
        modal: {
            title: 'Chỉnh sửa hồ sơ',
            save: 'Lưu thay đổi'
        },
        messages: {
            updateSuccess: 'Cập nhật hồ sơ thành công.',
            updateError: 'Chưa thể cập nhật hồ sơ.',
            imageOnly: 'Vui lòng tải lên một tệp hình ảnh.',
            imageTooLarge: 'Ảnh đại diện cần nhỏ hơn {{count}} MB.',
            avatarMissingUrl: 'Tải ảnh đại diện thành công nhưng hệ thống chưa nhận được đường dẫn ảnh.',
            avatarUploadSuccess: 'Tải ảnh đại diện thành công.',
            avatarUploadError: 'Chưa thể tải ảnh đại diện.'
        },
        avatar: {
            title: 'Ảnh đại diện',
            description: 'Hãy dùng ảnh vuông để hiển thị đẹp nhất. Hỗ trợ JPG, PNG, GIF hoặc WebP tối đa {{count}} MB.',
            cropTitle: 'Cắt ảnh đại diện',
            apply: 'Áp dụng',
            upload: 'Tải ảnh lên'
        },
        fields: {
            displayName: {
                label: 'Tên hiển thị',
                required: 'Vui lòng nhập tên hiển thị.',
                length: 'Tên hiển thị cần từ 1 đến 100 ký tự.',
                placeholder: 'Alex Johnson'
            },
            bio: {
                label: 'Giới thiệu',
                length: 'Phần giới thiệu tối đa 500 ký tự.',
                placeholder: 'Chia sẻ vài dòng về mục tiêu và động lực học tập của bạn.'
            },
            preferredLanguage: {
                label: 'Ngôn ngữ ưu tiên',
                required: 'Vui lòng chọn ngôn ngữ ưu tiên.',
                placeholder: 'Chọn ngôn ngữ'
            },
            targetBand: {
                label: 'Band IELTS mục tiêu',
                range: 'Band score cần nằm trong khoảng từ 0.0 đến 9.0.',
                placeholder: '6.5'
            },
            targetExamDate: {
                label: 'Ngày thi mục tiêu',
                placeholder: 'Chọn ngày thi'
            },
            dailyGoalMinutes: {
                label: 'Mục tiêu mỗi ngày (phút)',
                range: 'Mục tiêu mỗi ngày cần từ 1 đến 1440 phút.',
                placeholder: '45'
            },
            weeklyWordGoal: {
                label: 'Mục tiêu từ vựng mỗi tuần',
                range: 'Mục tiêu từ vựng cần từ 1 đến 10000.',
                placeholder: '80'
            },
            preferredSkill: {
                label: 'Kỹ năng ưu tiên',
                placeholder: 'Chọn một kỹ năng'
            }
        }
    },
    vocabularyTest: {
        title: 'AI Vocabulary Test',
        subtitle: 'Tạo một bài test mới từ chính lịch sử học từ vựng của bạn.',
        common: {
            na: 'N/A',
            secondsOnly: '{{count}} giây',
            minutesSeconds: '{{minutes}} phút {{seconds}} giây'
        },
        login: {
            title: 'Đăng nhập để tạo bài test từ vựng cá nhân',
            description: 'Tính năng này tạo câu hỏi từ từ đã lưu, lịch sử ôn tập và các lần tra từ gần đây của chính bạn.',
            cta: 'Đăng nhập ngay'
        },
        hero: {
            eyebrow: 'Phòng test cá nhân',
            aiBadge: 'AI-generated',
            generated: 'Đề đã tạo',
            attempts: 'Lần làm',
            focus: 'Trọng tâm',
            focusValue: 'Từ vựng cá nhân'
        },
        generate: {
            eyebrow: 'Tạo với AI',
            title: 'Tạo đề mới từ các nguồn từ vựng của bạn',
            description: 'Chọn số lượng câu hỏi và nguồn dữ liệu cá nhân để AI tạo bài test mới cho bạn.',
            questionCount: 'Số câu',
            questionCountValue: '{{count}} câu',
            sources: 'Nguồn từ',
            aiBadge: 'AI đang tạo đề từ dữ liệu học thật của bạn',
            helper: 'Đề sau khi tạo sẽ giữ nguyên nội dung câu hỏi, còn retake chỉ tạo lần làm mới trên cùng đề đó.',
            cta: 'Tạo đề',
            loading: 'AI đang tạo câu hỏi từ vốn từ của bạn...',
            queued: 'Đã đưa yêu cầu tạo đề vào hàng chờ. Mình sẽ thông báo khi đề sẵn sàng.'
        },
        history: {
            title: 'Danh sách',
            description: 'Xem lại các đề AI đã tạo cho bạn hoặc mở lịch sử các lần làm gần đây.',
            generatedTab: 'Đề đã tạo',
            attemptsTab: 'Lịch sử',
            pageTitle: 'Lịch sử vocabulary test',
            pageDescription: 'Xem lại các lần làm đã hoàn thành và tiếp tục bài đang làm còn lưu trên thiết bị này.',
            loadError: 'Không thể tải lịch sử vocabulary test.',
            backToTests: 'Quay lại danh sách'
        },
        list: {
            aiBadge: 'AI-generated',
            latestAccuracy: 'Độ chính xác gần nhất: {{value}}%',
            noAttemptYet: 'Chưa có lần làm nào',
            pendingDescription: 'AI đang tạo đề này. Đề sẽ xuất hiện tại đây khi sẵn sàng.',
            failedDescription: 'Đề này đã tạo không thành công. Bạn có thể tạo lại đề khác.',
            cardMeta: '{{questions}} câu • {{minutes}} phút • {{sources}}',
            createdAt: 'Tạo lúc {{value}}',
            attemptCount: '{{count}} lần làm',
            emptyTitle: 'Bạn chưa tạo AI vocabulary test nào',
            emptyDescription: 'Hãy chọn nguồn từ và tạo bài test cá nhân đầu tiên của bạn.'
        },
        attempts: {
            scoreLine: '{{correct}}/{{total}} câu đúng • {{accuracy}}% chính xác',
            inProgressLine: 'Đang làm • {{total}} câu',
            startedAt: 'Bắt đầu: {{value}}',
            completedAt: 'Hoàn thành: {{value}}',
            emptyTitle: 'Chưa có lần làm vocabulary test nào',
            emptyDescription: 'Lịch sử các lần làm sẽ xuất hiện ở đây sau khi bạn bắt đầu một đề đã tạo.'
        },
        preview: {
            eyebrow: 'Xem trước',
            aiBadge: 'AI-generated',
            description: 'Được tạo từ {{sources}}.',
            questionCount: 'Số câu',
            estimatedMinutes: 'Thời lượng gợi ý',
            minutesValue: '{{count}} phút',
            sources: 'Nguồn đã chọn',
            statusLabel: 'Trạng thái',
            helperTitle: 'Trước khi bắt đầu',
            helper: 'Màn preview này không lộ đáp án đúng. Bạn bắt đầu khi đã sẵn sàng làm bài.',
            start: 'Bắt đầu test',
            generateAnother: 'Tạo đề khác',
            questionsTitle: 'Xem trước câu hỏi',
            questionsDescription: 'Xem cấu trúc đề trước khi bắt đầu attempt của bạn.',
            questionLabel: 'Câu {{order}}',
            pendingTitle: 'Bài test này vẫn đang được tạo',
            pendingDescription: 'Trang này sẽ tự làm mới khi đề sẵn sàng. Bạn cũng sẽ nhận được thông báo.',
            failedTitle: 'Đề đã tạo này chưa sẵn sàng',
            failedDescription: 'Hãy thử tạo đề khác hoặc điều chỉnh lại nguồn từ đã chọn.',
            notFoundTitle: 'Không tìm thấy vocabulary test',
            notFoundDescription: 'Không thể tải đề đã tạo này. Hãy quay lại danh sách đề của bạn.',
            status: {
                PENDING: 'Đang tạo',
                READY: 'Sẵn sàng bắt đầu',
                FAILED: 'Tạo đề thất bại'
            }
        },
        take: {
            eyebrow: 'Làm bài',
            meta: 'Đã trả lời {{answered}}/{{total}} • gợi ý {{minutes}} phút',
            footerHint: 'Đã trả lời {{answered}} trên {{total}} câu',
            questionLabel: 'Câu {{order}}',
            submitTitle: 'Nộp bài test này?',
            submitConfirm: 'Bạn đã trả lời {{answered}} trên {{total}} câu. Bạn vẫn có thể nộp ngay bây giờ.',
            submit: 'Nộp bài',
            notFoundTitle: 'Không còn dữ liệu attempt',
            notFoundDescription: 'Không thể khôi phục phiên làm vocabulary test này trên thiết bị hiện tại.'
        },
        result: {
            eyebrow: 'Kết quả',
            description: 'Xem lại đáp án, độ chính xác và đáp án đúng cho từng câu hỏi.',
            retake: 'Làm lại đề này',
            accuracy: 'Độ chính xác',
            correctCount: 'Số câu đúng',
            timeSpent: 'Thời gian làm',
            reviewTitle: 'Review đáp án',
            reviewDescription: 'Xem câu nào bạn làm đúng, câu nào cần ôn lại và đáp án đúng tương ứng.',
            selectedAnswer: 'Câu trả lời của bạn',
            noAnswer: 'Chưa trả lời',
            correctAnswer: 'Đáp án đúng',
            sourceWord: 'Từ nguồn',
            questionLabel: 'Câu {{order}}',
            correct: 'Đúng',
            incorrect: 'Sai',
            notFoundTitle: 'Không tìm thấy kết quả',
            notFoundDescription: 'Không thể tải kết quả attempt này. Hãy quay lại danh sách đề.'
        },
        actions: {
            preview: 'Xem trước',
            viewResult: 'Xem kết quả',
            continueAttempt: 'Tiếp tục attempt',
            resumeUnavailable: 'Không thể tiếp tục',
            startThisTest: 'Bắt đầu đề này',
            generatingTest: 'Đang tạo đề',
            testUnavailable: 'Chưa khả dụng',
            retakeThisTest: 'Làm lại đề này',
            backToTests: 'Quay lại danh sách đề',
            backToPreview: 'Quay lại preview'
        },
        status: {
            PENDING: 'Đang tạo',
            READY: 'Sẵn sàng',
            FAILED: 'Thất bại',
            IN_PROGRESS: 'Đang làm',
            COMPLETED: 'Đã hoàn thành'
        },
        error: {
            notEnoughData: 'Không đủ từ trong các nguồn đã chọn để tạo bài test này.',
            notFound: 'Không tìm thấy vocabulary test này.',
            generic: 'Có lỗi xảy ra. Vui lòng thử lại.'
        },
        sources: {
            options: {
                ALL: 'Tất cả nguồn',
                VOCABULARY_RECORD: 'Lịch sử ôn tập',
                USER_DICTIONARY: 'Từ điển của tôi',
                USER_WORD_LOOKUP_EVENT: 'Lần tra gần đây'
            }
        }
    },
    vocabularyCheck: {
        title: 'Kiểm tra từ vựng',
        description: 'Kiểm tra tính hợp lệ của từ tiếng Anh, đoán nghĩa tiếng Việt và nhờ AI giải thích sâu hơn khi bạn muốn hiểu thật chắc.',
        eyebrow: 'Phòng luyện từ vựng',
        stats: {
            validate: 'Xác thực từ',
            answer: 'Trả lời nghĩa',
            aiCoach: 'AI đồng hành',
            ready: 'Sẵn sàng',
            enabled: 'Đã bật',
            login: 'Đăng nhập'
        },
        validateCard: {
            title: 'Bước 1. Xác thực từ',
            description: 'Hãy nhập từ tiếng Anh trước để hệ thống kiểm tra từ có hợp lệ hay không.',
            label: 'Từ tiếng Anh',
            placeholder: 'Nhập từ tiếng Anh, ví dụ: beautiful, knowledge...',
            cta: 'Kiểm tra',
            success: 'Từ hợp lệ rồi. Hãy nhập nghĩa tiếng Việt ở bên dưới nhé.',
            error: 'Chưa tìm thấy từ này. Bạn thử kiểm tra lại chính tả nhé.'
        },
        meaningCard: {
            title: 'Bước 2. Nhập nghĩa',
            description: 'Hãy nhập nghĩa tiếng Việt mà bạn nghĩ là phù hợp nhất.',
            label: 'Nghĩa tiếng Việt',
            placeholder: 'Nhập nghĩa tiếng Việt của từ...',
            cta: 'Trả lời'
        },
        messages: {
            enterEnglishWord: 'Vui lòng nhập từ tiếng Anh trước nhé.',
            enterVietnameseMeaning: 'Vui lòng nhập nghĩa tiếng Việt trước nhé.',
            validWord: 'Từ hợp lệ rồi, bạn tiếp tục nhé.',
            invalidWord: 'Từ này chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.',
            apiError: 'Kết nối đang gặp trục trặc. Bạn thử lại sau nhé.',
            checkError: 'Chưa thể kiểm tra nghĩa lúc này.',
            saveRecordError: 'Đã kiểm tra xong nhưng chưa lưu được bản ghi lúc này.',
            correct: 'Chính xác rồi. Bạn làm rất tốt!',
            incorrect: 'Chưa đúng lần này, nhưng không sao. Mình xem lại nghĩa đúng bên dưới nhé.',
            askAiError: 'Chưa thể hỏi AI lúc này. Bạn thử lại sau nhé.',
            aiQueryRequired: 'Vui lòng nhập từ hoặc câu hỏi cho AI nhé.',
            saveSuccess: 'Đã lưu vào từ điển của bạn.',
            saveError: 'Chưa thể lưu từ này lúc này.',
            removeSuccess: 'Đã xóa khỏi từ điển của bạn.',
            removeError: 'Chưa thể xóa từ này lúc này.'
        },
        result: {
            correctTitle: 'Trả lời chính xác',
            incorrectTitle: 'Chưa đúng hoàn toàn',
            correctDescription: 'Bạn đã ghép đúng nghĩa của từ. Hãy giữ đà học này nhé.',
            incorrectDescription: 'Không sao cả. Xem lại nghĩa đúng một lần nữa rồi tiếp tục với từ tiếp theo nhé.',
            correctMeaning: 'Nghĩa đúng',
            alternatives: 'Các nghĩa khác',
            synonyms: 'Từ đồng nghĩa tiếng Anh',
            explanation: 'Giải thích rõ hơn',
            examples: 'Ví dụ dùng từ'
        },
        enrichment: {
            loading: 'Đang kiểm tra dữ liệu giải nghĩa...',
            aiExplainCta: 'Hỏi AI',
            pendingHint: 'Nếu từ này là idioms hoặc phrasal verbs, mình sẽ cần thêm chút thời gian để kiểm tra và lấy dữ liệu giải nghĩa cho bạn. Bạn có thể kiểm tra lại sau khoảng 10s nhé.',
            waitEnrichment: 'AI đang bổ sung dữ liệu giải nghĩa cho từ này, bạn chờ một chút nhé. (thử lại sau khoảng 10s)'
        },
        actions: {
            nextWord: 'Từ tiếp theo',
            retryCheck: 'Kiểm tra lại',
            askAi: 'Hỏi AI về từ này'
        },
        empty: {
            title: 'Bắt đầu với một từ tiếng Anh',
            description: 'Hệ thống sẽ xác thực từ trước, sau đó giúp bạn kiểm tra nghĩa tiếng Việt với phản hồi rõ ràng và dễ nhớ.'
        },
        ai: {
            title: 'Hỏi AI',
            description: 'Hỏi AI để hiểu sâu hơn về cách dùng từ, ví dụ thực tế',
            loginRequired: 'Bạn cần đăng nhập để dùng tính năng AI này.',
            loginHint: 'Đăng nhập để hỏi AI về từ vựng, ngữ pháp và cách dùng.',
            placeholder: 'Nhập từ vựng...',
            cta: 'Hỏi AI',
            loading: 'AI đang chuẩn bị lời giải thích hữu ích cho bạn...',
            responseTitle: 'Giải thích từ AI',
            streaming: 'AI đang gửi nội dung giải thích...',
            errors: {
                invalidRequest: 'Từ yêu cầu không hợp lệ.',
                connectionClosed: 'Kết nối realtime đã đóng. Vui lòng thử lại.',
                tooManyActive: 'Bạn đang có ba cửa sổ giải thích. Hãy đóng một cửa sổ rồi thử lại.',
                timeout: 'AI phản hồi quá lâu. Vui lòng thử lại.',
                streamFailed: 'Luồng AI gặp lỗi. Vui lòng thử lại.',
                emptyResponse: 'AI không trả nội dung giải thích. Vui lòng thử lại.',
                generic: 'Không thể hoàn tất giải thích. Vui lòng thử lại.'
            }
        }
    },
    vocabularyHistory: {
        title: 'Lịch sử từ vựng',
        description: 'Xem lại các câu trả lời trước đây, nhận ra điểm cần chú ý và duy trì đà tiến bộ từ vựng thật đều đặn.',
        eyebrow: 'Nhật ký tiến bộ',
        stats: {
            total: 'Tổng bản ghi',
            correct: 'Câu đúng',
            focus: 'Trọng tâm hiện tại',
            allStatuses: 'Tất cả trạng thái'
        },
        filters: {
            searchPlaceholder: 'Tìm theo từ hoặc nghĩa...',
            all: 'Tất cả',
            correct: 'Đúng',
            incorrect: 'Sai',
            from: 'Từ ngày',
            to: 'Đến ngày',
            records: '{{count}} bản ghi',
            clearAll: 'Xóa tất cả'
        },
        table: {
            englishWord: 'Từ tiếng Anh',
            userAnswer: 'Câu trả lời',
            correctMeaning: 'Nghĩa đúng',
            result: 'Kết quả',
            testedAt: 'Thời gian',
            correctTag: 'Đúng',
            incorrectTag: 'Sai',
            empty: 'Chưa có lịch sử kiểm tra từ vựng.',
            pagination: '{{start}}-{{end}} / {{total}} bản ghi'
        },
        actions: {
            delete: 'Xóa',
            deleteTitle: 'Xóa bản ghi này?',
            deleteDescription: 'Bản ghi này sẽ được xóa khỏi lịch sử của bạn.',
            clearTitle: 'Xóa toàn bộ lịch sử?',
            clearDescription: 'Hành động này sẽ không thể hoàn tác.'
        },
        messages: {
            deleteSuccess: 'Đã xóa bản ghi.',
            clearSuccess: 'Đã xóa toàn bộ lịch sử.'
        }
    },
    vocabularyReview: {
        eyebrow: 'Xưởng ghi nhớ',
        title: 'Ôn tập từ vựng',
        descriptions: {
            config: 'Chọn chế độ ôn, thiết lập hướng luyện và bắt đầu một phiên học vừa sức với nhịp của bạn lúc này.',
            practice: 'Đi từng từ một, giữ sự tập trung và kích hoạt khả năng ghi nhớ chủ động.',
            result: 'Nhìn lại phần đã vững, phần còn trượt và những từ nên ôn thêm một lượt ngắn.'
        },
        stats: {
            readyWords: 'Từ sẵn sàng',
            direction: 'Hướng ôn',
            currentStage: 'Giai đoạn hiện tại',
            setup: 'Thiết lập',
            practice: 'Ôn tập',
            result: 'Kết quả',
            config: 'Cấu hình'
        },
        range: {
            title: 'Chọn khoảng thời gian ôn',
            description: 'Ôn lại đúng giai đoạn bạn muốn: vài ngày gần đây, một tuần hoặc một tháng cụ thể.',
            selected: 'Đang chọn: {{label}}',
            modes: {
                range: 'Khoảng ngày',
                week: 'Theo tuần',
                month: 'Theo tháng',
                all: 'Toàn bộ'
            },
            allHistoryHint: 'Lấy mọi từ đã lưu, không giới hạn thời gian',
            presets: {
                allHistory: 'Toàn bộ',
                last7: '7 ngày',
                last30: '30 ngày',
                thisWeek: 'Theo tuần',
                thisMonth: 'Theo tháng',
                custom: 'Tùy chỉnh'
            }
        },
        groups: {
            title: 'Chọn nhóm từ cần ôn',
            description: 'Ưu tiên từ chưa ôn để không bỏ sót, hoặc tập trung vào nhóm từ hay sai.',
            unreviewed: 'Từ chưa ôn',
            unreviewedHint: 'Chưa từng xuất hiện trong phiên ôn nào',
            wrong: 'Từ hay sai',
            wrongHint: 'Tỷ lệ sai trên 50%',
            all: 'Toàn bộ từ',
            allHint: 'Mọi từ trong khoảng đã chọn'
        },
        directions: {
            enVi: 'Anh sang Việt',
            viEn: 'Việt sang Anh'
        },
        config: {
            modeTitle: 'Chọn chế độ ôn tập',
            modeDescription: 'Hãy chọn nhóm từ bạn muốn ôn để phiên học có trọng tâm và mang lại cảm giác đáng giá hơn.',
            directionTitle: 'Thiết lập hướng ôn',
            directionDescription: 'Đổi hướng ôn tùy theo mục tiêu: nhận diện nhanh hay nhớ chủ động sâu hơn.',
            countTitle: 'Chọn số lượng từ cần ôn',
            countDescription: 'Một lượt ôn ngắn nhưng tập trung thường hiệu quả hơn một phiên quá dài khó hoàn thành.',
            availableWords: 'Từ khả dụng',
            readyCount: '{{count}} từ sẵn sàng',
            sessionCount: '{{count}} từ trong phiên này',
            emptyTitle: 'Chưa có từ phù hợp với chế độ ôn này',
            emptyDescription: 'Bạn có thể thử bộ lọc khác, hoặc tạo thêm vài bản ghi từ vựng để bắt đầu ôn hiệu quả hơn.',
            start: 'Bắt đầu ôn tập'
        },
        practice: {
            progress: 'Tiến trình ôn tập',
            cardPromptEnVi: 'Từ tiếng Anh',
            cardPromptViEn: 'Nghĩa tiếng Việt',
            pronounce: 'Phát âm',
            answerLabelEnVi: 'Nhập nghĩa tiếng Việt',
            answerLabelViEn: 'Nhập từ tiếng Anh',
            answerPlaceholderEnVi: 'Nhập nghĩa tiếng Việt...',
            answerPlaceholderViEn: 'Nhập từ tiếng Anh...',
            check: 'Kiểm tra',
            next: 'Tiếp theo',
            finish: 'Hoàn thành',
            enterEnglish: 'Vui lòng nhập từ tiếng Anh.',
            enterVietnamese: 'Vui lòng nhập nghĩa tiếng Việt.',
            correctToast: 'Chính xác rồi. Bạn nhớ rất tốt!',
            incorrectToast: 'Chưa đúng hoàn toàn. Mình xem lại đáp án đúng ngay bên dưới nhé.',
            correctTitle: 'Trả lời chính xác',
            incorrectTitle: 'Chưa đúng hoàn toàn',
            correctDescription: 'Rất tốt. Bạn đã nhớ chắc từ này rồi.',
            incorrectDescription: 'Không sao cả. Xem lại đáp án đúng một lần nữa sẽ giúp bạn nhớ lâu hơn.',
            correctAnswerEnVi: 'Nghĩa đúng',
            correctAnswerViEn: 'Từ tiếng Anh đúng',
            alternatives: 'Các nghĩa khác có thể chấp nhận',
            showMore: 'Xem thêm',
            showLess: 'Thu gọn',
            explanation: 'Giải thích rõ hơn',
            examples: 'Ví dụ sử dụng'
        },
        result: {
            excellent: 'Xuất sắc',
            good: 'Rất tốt',
            improving: 'Đang tiến bộ',
            needsReview: 'Cần ôn thêm',
            summary: 'Bạn đã trả lời đúng {{correct}} trên {{total}} từ.',
            total: 'Tổng',
            correct: 'Đúng',
            incorrect: 'Sai',
            accuracy: 'Độ chính xác',
            accuracyTitle: 'Tỉ lệ chính xác',
            comparedToLast: '{{diff}}% so với phiên trước',
            detailsTitle: 'Chi tiết phiên ôn',
            retryAll: 'Ôn lại',
            retryWrong: 'Ôn lại {{count}} từ khó',
            table: {
                prompt: 'Thẻ nhắc',
                yourAnswer: 'Câu trả lời',
                correctAnswer: 'Đáp án đúng',
                result: 'Kết quả',
                correctTag: 'Đúng',
                incorrectTag: 'Sai'
            }
        }
    },
    vocabularyEvaluation: {
        eyebrow: 'Bảng phân tích',
        title: 'Phân tích học tập',
        description: 'Theo dõi xu hướng luyện từ vựng, nhìn rõ độ chính xác đang cải thiện ra sao và biết từ nào còn cần thêm sự chú ý.',
        periods: {
            day: 'Ngày',
            week: 'Tuần',
            month: 'Tháng',
            today: 'Hôm nay',
            thisWeek: 'Tuần này',
            thisMonth: 'Tháng này'
        },
        stats: {
            total: 'Từ đã kiểm tra',
            correct: 'Trả lời đúng',
            incorrect: 'Trả lời sai',
            streak: 'Chuỗi học',
            words: '{{count}} từ',
            days: '{{count}} ngày',
            accuracy: '{{count}}% chính xác',
            needsReview: 'Cần ôn lại thêm',
            keepGoing: 'Tiếp tục giữ nhịp học nhé'
        },
        chart: {
            title: 'Xu hướng tiến bộ',
            description: 'Biểu đồ giúp bạn nhìn rõ số câu đúng và số câu sai trong giai đoạn đang xem.',
            empty: 'Chưa có dữ liệu biểu đồ trong giai đoạn này.',
            correct: 'Đúng',
            incorrect: 'Sai',
            tooltipCorrect: 'Đúng: {{count}}',
            tooltipIncorrect: 'Sai: {{count}}'
        },
        weakWords: {
            title: 'Những từ cần chú ý hơn',
            description: 'Các từ này xuất hiện nhiều lần trong câu trả lời sai, nên rất phù hợp để bạn ôn tập tập trung.',
            count: '{{count}} từ',
            emptyTitle: 'Hiện chưa có từ nào cần cảnh báo',
            emptyDescription: 'Tuyệt lắm. Bạn chưa có từ nào bị sai nhiều trong giai đoạn này.',
            columns: {
                word: 'Từ tiếng Anh',
                meaning: 'Nghĩa đúng',
                wrongCount: 'Số lần sai',
                level: 'Mức ưu tiên'
            },
            wrongCountValue: '{{count}} lần',
            levels: {
                urgent: 'Cần ôn gấp',
                improve: 'Cần cải thiện',
                watch: 'Cần lưu ý'
            }
        }
    },
    leaderboard: {
        title: 'Bảng xếp hạng',
        description: 'Kiên trì luyện tập, bứt phá mỗi ngày và từng bước vươn lên trên bảng xếp hạng.',
        loadError: 'Chưa thể tải bảng xếp hạng lúc này',
        filtersEyebrow: 'Bộ lọc bảng xếp hạng',
        filtersTitle: 'Theo dõi cuộc đua học tập theo thời gian thực',
        filtersSubtitle: 'Chọn khoảng thời gian và phạm vi so sánh để xem vị trí hiện tại của bạn thật rõ ràng.',
        rankingScope: 'Phạm vi xếp hạng',
        period: {
            WEEKLY: 'Tuần này',
            MONTHLY: 'Tháng này',
            ALL_TIME: 'Tất cả'
        },
        scope: 'Phạm vi',
        thisWeek: 'Tuần này',
        thisMonth: 'Tháng này',
        allTime: 'Toàn thời gian',
        yourRanking: 'Thứ hạng của bạn',
        progressToRank: 'Tiến độ để lên hạng #{{rank}}',
        xpLeft: 'Còn {{count}} XP',
        fromLastSnapshot: 'so với lần ghi nhận trước',
        viewXpHistory: 'Xem lịch sử XP',
        noRanking: 'Bạn chưa có thứ hạng. Hoàn thành thêm hoạt động để tích lũy XP và bắt đầu bứt phá nhé.',
        startPracticing: 'Bắt đầu luyện tập',
        viewMore: 'Xem thêm {{count}} người',
        tiedRank: 'Đồng hạng #{{rank}}',
        learner: 'Học viên',
        you: '(Bạn)',
        totalXp: 'Tổng XP',
        rankChange: 'Biến động hạng',
        streak: 'Chuỗi',
        subtitle: 'Bảng xếp hạng theo XP — chỉ để tham khảo, không phải áp lực',
        yourPosition: 'Vị trí của bạn · {{period}}',
        ofParticipants: 'trong {{count}} người',
        xpToNext: 'Còn {{count}} XP để lên hạng tiếp theo',
        topOfBoard: 'Bạn đang ở nhóm đầu bảng.',
        unrankedTitle: 'Tuần này bạn chưa có điểm xếp hạng',
        unrankedBody: 'Bảng xếp hạng tính theo XP kiếm được. Học một bài là bạn có mặt ở đây — và không có gì bị mất nếu bạn không lên bảng.',
        yourXp: 'XP của bạn',
        earnXp: 'Cách kiếm XP',
        periodLabel: 'Khoảng thời gian',
        rankLabel: 'Hạng {{rank}}',
        tied: 'đồng hạng',
        anonymous: 'Người học ẩn danh',
        emptyTitle: 'Bảng xếp hạng đang trống',
        emptyBody: 'Chưa ai có XP trong khoảng thời gian này. Học một bài để mở bảng.',
        ethicsNote: 'Bảng này chỉ để bạn thấy nhịp học của mình so với người khác. Không có phần thưởng nào bị khoá sau thứ hạng, và đồng hạng được hiển thị là đồng hạng chứ không xếp hơn thua.'
    },
    xpHistory: {
        loadError: 'Chưa thể tải lịch sử XP',
        back: 'Quay lại bảng xếp hạng',
        title: 'Lịch sử XP',
        description: 'Theo dõi hành trình tích lũy XP để thấy rõ nỗ lực của bạn đang tạo ra tiến bộ mỗi ngày.',
        totalXpEarned: 'Tổng XP đã nhận',
        xpThisWeek: 'XP tuần này',
        activities: 'Hoạt động',
        recentActivity: 'Hoạt động gần đây',
        activitiesCount: '{{count}} hoạt động',
        emptyTitle: 'Chưa có lịch sử XP',
        emptyDescription: 'Hãy bắt đầu luyện tập để nhận những điểm XP đầu tiên của bạn.',
        sources: {
            fullTest: 'Hoàn thành bài thi IELTS',
            miniTest: 'Hoàn thành bài thi ngắn',
            vocabReview: 'Ôn tập từ vựng',
            speakingPractice: 'Luyện speaking',
            writingSubmission: 'Nộp bài writing',
            dailyTask: 'Hoàn thành nhiệm vụ hằng ngày',
            allDailyTasksBonus: 'Thưởng hoàn thành toàn bộ nhiệm vụ hằng ngày',
            streakBonus: 'Thưởng duy trì chuỗi học',
            quickPractice: 'Luyện tập nhanh',
            bandIncrease: 'Tăng band score',
            weeklyReward: 'Thưởng xếp hạng tuần',
            other: 'Hoạt động khác'
        }
    },
    home: {
        hero: {
            eyebrow: 'Bảng điều khiển học tập',
            title: 'Toàn cảnh tiến độ học hôm nay',
            description: 'Theo dõi chuỗi học, mục tiêu trong ngày và {{count}} nhiệm vụ đã hoàn thành để giữ nhịp tiến bộ ổn định.',
            streak: 'Chuỗi học',
            goal: 'Mục tiêu hôm nay',
            recommendations: 'Gợi ý sẵn sàng',
            pending: 'Đang cập nhật'
        },
        loadError: 'Chưa thể tải bảng điều khiển học tập lúc này. Hãy thử lại sau nhé.',
        streakToastStrong: '🔥 Chuỗi {{count}} ngày thật ấn tượng! Bạn đang tạo đà tiến bộ tuyệt vời!',
        streakToastWarm: '🔥 Chuỗi {{count}} ngày rồi! Tiếp tục duy trì nhé, bạn đang làm rất tốt!',
        todayLearning: {
            streak: 'Chuỗi {{count}} ngày',
            title: 'Tiếp tục học nào!',
            goal: 'Hôm nay: {{studied}} / {{target}} phút',
            continue: 'Tiếp tục học',
            vocabulary: 'Từ vựng',
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking'
        },
        dailyTasks: {
            title: 'Nhiệm vụ hôm nay',
            subtitle: 'Hoàn thành nhiệm vụ mỗi ngày để tiến bộ đều đặn hơn.',
            completed: 'Hoàn thành'
        },
        streakHeatmap: {
            title: 'Bản đồ học tập tuần này',
            subtitle: 'Giữ nhịp học mỗi ngày để duy trì chuỗi thật vững.',
            days: 'Ngày',
            studied: 'Đã học',
            missed: 'Bỏ lỡ'
        },
        progressOverview: {
            title: 'Tổng quan tiến độ',
            subtitle: 'Theo dõi rõ ràng hành trình IELTS và từ vựng của bạn.',
            bandScore: 'Điểm band IELTS',
            vocabulary: 'Từ vựng',
            total: 'Tổng',
            mastered: 'Đã thành thạo',
            reviewing: 'Đang ôn',
            bandLabel: 'Band'
        },
        quickPractice: {
            title: 'Luyện nhanh',
            subtitle: 'Tranh thủ một phiên học ngắn gọn bất cứ lúc nào.'
        },
        recentActivity: {
            title: 'Hoạt động gần đây',
            subtitle: 'Những bước tiến và kết quả học tập mới nhất của bạn.',
            empty: 'Chưa có hoạt động gần đây. Bài học tiếp theo sẽ mở đầu hành trình mới.'
        },
        weakSkills: 'Cần cải thiện',
        recommendations: {
            title: 'Gợi ý dành cho bạn',
            subtitle: 'Được chọn lọc để phù hợp với trình độ hiện tại và mục tiêu tiếp theo của bạn.',
            start: 'Bắt đầu'
        },
        leaderboardWidget: {
            title: 'Bảng xếp hạng tuần',
            empty: 'Chưa có dữ liệu xếp hạng',
            yourRank: 'Thứ hạng của bạn',
            noRank: 'Bạn chưa có thứ hạng. Chỉ cần thêm vài hoạt động nữa là bạn sẽ xuất hiện trên bảng xếp hạng.',
            viewFull: 'Xem toàn bộ bảng xếp hạng',
            loadError: 'Chưa thể tải bảng xếp hạng'
        },
        launchpad: {
            minutes: '{{count}} phút',
            timeUnknown: 'Linh hoạt theo nhịp của bạn',
            continueCta: 'Tiếp tục học',
            invalidRoute: 'Route học này chưa được client hiện tại hỗ trợ đầy đủ.',
            fallbackContinueTitle: 'Bắt đầu một phiên học ngắn',
            fallbackContinueDescription: 'Chưa tải được gợi ý tiếp theo từ hệ thống, nên đây là lối vào an toàn để bạn bắt đầu học ngay.',
            dailyEyebrow: 'Nhiệm Vụ Hôm Nay',
            dailyTitle: 'Các bước ngắn cho hôm nay',
            dailyDescription: 'Giữ plan thật gọn và trực tiếp để user biết ngay nên làm gì tiếp theo.',
            dailyEmpty: 'Chưa có task phù hợp lúc này. Bạn vẫn có thể dùng luyện nhanh để giữ nhịp học.',
            dailyCompleted: '{{completed}}/{{total}} đã xong',
            xpEarned: '{{count}} XP đã nhận',
            availableXp: '+{{count}} XP khả dụng',
            goalLabel: 'Hôm nay',
            listTask: 'Danh sách nhiệm vụ',
            doneBadge: 'Hoàn thành',
            startTask: 'Bắt đầu',
            drawerLabel: 'Daily plan',
            dailyLoadError: 'Không thể tải danh sách nhiệm vụ hôm nay.',
            drawerLoginTitle: 'Đăng nhập để xem nhiệm vụ hôm nay',
            drawerLoginDescription: 'Daily plan gắn với tài khoản và tiến độ thật của bạn, nên cần đăng nhập để tải đúng danh sách.',
            openAgain: 'Mở lại',
            quickEyebrow: 'Luyện Nhanh',
            quickTitle: 'Các lựa chọn vào học chỉ với một chạm',
            quickDescription: 'Ưu tiên action trước, mô tả sau, để phiên học ngắn bắt đầu ngay.',
            progressEyebrow: 'Tóm Tắt Tiến Độ',
            progressTitle: 'Hôm nay và tuần này',
            progressLabels: {
                studied: 'Đã học hôm nay',
                target: 'Mục tiêu hôm nay',
                streak: 'Chuỗi hiện tại',
                weeklyXp: 'XP tuần này'
            },
            todayProgress: 'Tiến độ hôm nay',
            reasons: {
                unfinished: 'Tiếp tục ngay',
                dueReview: 'Đến hạn ôn',
                weakSkill: 'Nên ưu tiên',
                shortRecommendation: 'Gợi ý ngắn',
                getStarted: 'Bắt đầu học',
                USER_DICTIONARY_FOUNDATION: 'Từ vựng của bạn',
                NEW_WORD_LOOKUP: 'Từ mới',
                TASK_1: 'Writing Task 1',
                TASK_2: 'Writing Task 2',
                EASY: 'Dễ',
                MEDIUM: 'Trung bình',
                HARD: 'Khó',
                PART_1: 'Speaking Part 1',
                PART_2: 'Speaking Part 2',
                PART_3: 'Speaking Part 3',
                LISTENING: 'Listening',
                READING: 'Reading',
                WRITING: 'Writing',
                SPEAKING: 'Speaking'
            },
            taskTypes: {
                DEFAULT: 'Nhiệm vụ',
                VOCABULARY: 'Từ vựng',
                WRITING: 'Writing',
                SPEAKING_PRACTICE: 'Speaking luyện tập',
                SPEAKING_CONVERSATION: 'Speaking hội thoại',
                IELTS_FULL_TEST: 'IELTS full test',
                IELTS_QUICK_TEST: 'IELTS quick test'
            },
            difficulty: {
                EASY: 'Dễ',
                MEDIUM: 'Trung bình',
                HARD: 'Khó',
                DEFAULT: 'Phù hợp'
            },
            xpBadge: '+{{count}} XP',
            feedback: {
                fallbackTask: 'bài vừa hoàn thành',
                default: 'Bạn vừa hoàn thành {{task}}. +{{xp}} XP.',
                generic: 'Bạn vừa hoàn thành {{task}}. Tiến độ đã được lưu.'
            },
            quickStartIeltsError: 'Chưa thể bắt đầu nhanh mini IELTS lúc này. Bạn hãy chọn bài thủ công nhé.',
            remainingTargetToday: 'Chỉ còn {{remaining}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!',
            overTargetToday: 'Bạn đã vượt mục tiêu hôm nay {{studied}} phút rồi, thật tuyệt!'
        },
        reminder: {
            dismiss: 'Ẩn nhắc nhở'
        },
        title: 'Trang chủ',
        greetingPrompt: 'Hôm qua bạn sai 3 câu dạng True/False/Not Given. Luyện 10 phút nhé?',
        greeting: 'Chào {{name}} 👋',
        continueTitle: 'Tiếp tục: Reading — Matching Headings',
        continueMeta: 'Bài 4 trong lộ trình · khoảng 12 phút',
        start: 'Bắt đầu',
        seePlan: 'Xem kế hoạch hôm nay',
        todayPlan: 'Kế hoạch hôm nay',
        rhythm: 'Nhịp học 5 tuần',
        suggestions: 'Gợi ý cho bạn',
        seeAll: 'Xem tất cả',
        statStreak: 'Chuỗi ngày',
        statWeeklyXp: 'XP tuần này',
        xpValue: '{{val, number}}',
        statToday: 'Phút học hôm nay',
        statBand: 'Band ước tính',
        statCredit: 'Credit',
        todayProgress: '{{done}} / {{goal}} phút mục tiêu hôm nay',
        minutes: '{{count}} phút',
        doNow: 'Làm',
        done: 'Xong',
        graceDaysLeft: 'Còn {{count}} ngày nghỉ phép',
        rhythmAria: 'Mật độ học trong 5 tuần gần nhất',
        suggestListening: 'Listening Section 3',
        suggestVocab: 'Test từ vựng — Education',
        suggestWriting: 'Writing Task 1 — Biểu đồ',
        emptyNextTitle: 'Chưa có bài nào được gợi ý',
        emptyNextBody: 'Làm một bài ngắn trước để hệ thống biết bạn đang ở đâu và gợi ý đúng hơn.',
        emptyPlanTitle: 'Hôm nay chưa có kế hoạch',
        emptyPlanBody: 'Kế hoạch sẽ xuất hiện sau khi bạn hoàn thành bài đầu tiên.'
    },
    recommendations: {
        start: 'Mở',
        feedbackError: 'Chưa thể mở gợi ý này lúc này.',
        dismissError: 'Chưa thể ẩn gợi ý này lúc này.',
        snoozeError: 'Chưa thể nhắc lại gợi ý này lúc này.',
        priorityBadge: 'P{{count}}',
        snooze: {
            oneHour: 'Nhắc lại sau 1 giờ',
            tomorrow: 'Nhắc lại vào ngày mai'
        },
        difficulty: {
            EASY: 'Dễ',
            MEDIUM: 'Trung bình',
            HARD: 'Khó',
            DEFAULT: 'Gợi ý phù hợp'
        },
        types: {
            DEFAULT: 'Gợi ý học tập',
            IELTS_RESUME: 'Tiếp tục IELTS',
            VOCAB_REVIEW: 'Ôn từ vựng',
            VOCAB_MICRO_SESSION: 'Phiên học từ vựng ngắn',
            DAILY_SPEAKING_PROMPT: 'Bài nói hằng ngày',
            WEAK_SKILL_DRILL: 'Luyện điểm yếu',
            WEAK_SKILL_QUICK_PRACTICE: 'Luyện nhanh',
            SHORT_RECOMMENDATION: 'Gợi ý ngắn'
        },
        references: {
            DAILY_SPEAKING_PROMPT: 'Bài nói hằng ngày',
            IELTS_ATTEMPT: 'Lượt làm IELTS',
            READING_DRILL: 'Bài luyện Reading',
            VOCAB_MICRO_SESSION: 'Phiên học từ vựng ngắn',
            VOCAB_REVIEW: 'Ôn từ vựng',
            WRITING_TASK: 'Bài viết'
        }
    },
    flagshipRetention: {
        eyebrow: 'Giữ nhịp học',
        title: 'Tiếp tục duy trì đà tiến bộ',
        description: 'Speaking ngắn, vocab micro và weekly challenge',
        startSpeaking: 'Bắt đầu nói',
        resumeSpeaking: 'Tiếp tục nói',
        emptySpeaking: 'Hiện chưa có bài nói phù hợp ở thời điểm này.',
        reviewWords: 'Ôn từ',
        targetWords: 'Mục tiêu {{count}} từ',
        openChallenge: 'Mở thử thách',
        viewWeeklyProgress: 'Xem tiến độ',
        rewardXp: '+{{count}} XP'
    },
    weeklyReport: {
        loginTitle: 'Đăng nhập để xem báo cáo',
        loginDescription: 'Báo cáo tuần gắn với dữ liệu học tập của tài khoản.',
        loginCta: 'Đăng nhập',
        current: {
            title: 'Báo cáo tuần',
            historyLink: 'Lịch sử'
        },
        history: {
            title: 'Lịch sử báo cáo',
            backToCurrent: 'Tuần hiện tại',
            emptyTitle: 'Chưa có lịch sử',
            emptyDescription: 'Báo cáo các tuần đã chốt sẽ xuất hiện tại đây.'
        },
        status: {
            open: 'Đang cập nhật',
            closing: 'Đang hoàn tất',
            finalized: 'Đã chốt'
        },
        freshness: {
            delayed: 'Cập nhật chậm',
            stale: 'Dữ liệu có thể cũ'
        },
        states: {
            errorTitle: 'Không tải được',
            errorDescription: 'Vui lòng thử lại sau.',
            retry: 'Thử lại',
            notReadyTitle: 'Báo cáo chưa sẵn sàng',
            notReadyDescription: 'Dữ liệu tuần đang được tổng hợp.',
            noActivity: 'Chưa hoạt động'
        },
        highlights: {
            TOTAL_STUDY_TIME: 'Thời gian học',
            ACTIVE_DAYS: 'Ngày hoạt động',
            SPEAKING_AVERAGE: 'Speaking TB',
            WRITING_AVERAGE: 'Writing TB',
            IELTS_FULL_BAND: 'IELTS band',
            IELTS_QUICK_ACCURACY: 'IELTS chính xác',
            VOCABULARY_NEW_WORDS: 'Từ mới'
        },
        trend: {
            up: 'Tăng',
            down: 'Giảm',
            stable: 'Ổn định',
            new: 'Mới',
            insufficientData: 'Chưa đủ dữ liệu'
        },
        modules: {
            ielts: 'IELTS',
            speaking: 'Speaking',
            writing: 'Writing',
            vocabulary: 'Vocabulary'
        },
        metrics: {
            studyTime: 'Thời gian học',
            activeDays: 'Ngày hoạt động',
            sessions: 'Phiên học',
            completed: 'Hoàn thành',
            xp: 'XP',
            assignedTasks: 'Đã giao',
            completedTasks: 'Đã xong',
            startedAttempts: 'Đã bắt đầu',
            graded: 'Đã chấm',
            average: 'Trung bình',
            best: 'Cao nhất',
            latest: 'Gần nhất',
            accuracy: 'Chính xác',
            newWords: 'Từ mới',
            reviewedWords: 'Đã ôn',
            masteredWords: 'Đã thành thạo',
            correct: 'Đúng',
            incorrect: 'Sai'
        },
        activity: {
            title: 'Hoạt động tuần',
            active: 'Có học',
            noActivity: 'Không học',
            future: 'Sắp tới'
        },
        gamification: {
            title: 'Tiến độ',
            dailyTasks: 'Nhiệm vụ ngày',
            xpBySource: 'XP nhận được',
            challenges: 'Thử thách',
            achievements: 'Thành tựu'
        },
        common: {
            updatedAt: 'Cập nhật',
            finalizedAt: 'Chốt lúc',
            range: 'Tuần',
            scoreUnavailable: 'Chưa có điểm'
        }
    },
    weeklyChallenge: {
        loginTitle: 'Đăng nhập để xem các thử thách tuần',
        loginDescription: 'Tiến độ thử thách và các thành tựu đã mở khóa gắn với tài khoản của bạn, nên trang này sẽ mở sau khi đăng nhập.',
        loginCta: 'Đi tới đăng nhập',
        eyebrow: 'Thử thách tuần',
        title: 'Giữ nhịp tiến bộ trong tuần này',
        description: 'Theo dõi mọi thử thách được giao trong tuần và xem phần thưởng nào đã được trao.',
        openWeeklyReport: 'Mở báo cáo tuần',
        rangeLabel: '{{start}} - {{end}}',
        noPeriod: 'Khoảng thời gian tuần hiện tại',
        listTitle: 'Thử thách tuần này',
        completedCount: 'Đã hoàn thành {{completed}} / {{total}}',
        status: {
            not_started: 'Chưa bắt đầu',
            in_progress: 'Đang thực hiện',
            completed: 'Đã hoàn thành',
            rewarded: 'Đã nhận thưởng',
            unknown: 'Chưa xác định trạng thái'
        },
        progressAriaLabel: 'Tiến độ {{title}}: {{current}} trên {{target}}',
        remaining: 'Còn {{value}}',
        rewardXp: '+{{xp}} XP',
        completedAt: 'Hoàn thành lúc {{date}}',
        rewardGrantedAt: 'Nhận thưởng lúc {{date}}',
        pendingReward: 'Đang chờ trao thưởng',
        loadErrorTitle: 'Chưa thể tải thử thách tuần',
        loadErrorDescription: 'Các thông tin tuần khác vẫn khả dụng. Hãy thử tải lại danh sách thử thách.',
        retry: 'Thử lại',
        empty: 'Hiện chưa có thử thách tuần đang hoạt động.',
        achievements: {
            title: 'Thành tựu',
            description: 'Những mốc đã mở khóa được ghim lên trước, còn các mục tiêu tiếp theo vẫn luôn hiện rõ bên dưới.',
            locked: 'Chưa mở khóa',
            empty: 'Thành tựu sẽ xuất hiện ở đây khi bạn xây được đà học theo tuần.'
        }
    },
    ielts: {
        title: 'Kho đề IELTS',
        description: 'Tự tin hơn từng ngày với các bài luyện Listening và Reading sát đề thật.',
        guestTitle: 'IELTS Test',
        guestDescription: 'Thử ngay bài luyện IELTS miễn phí',
        guestLoginRequired: 'Bạn cần đăng nhập để sử dụng IELTS Test',
        guestLoginHint: 'Đăng nhập để bắt đầu luyện tập và theo dõi tiến bộ của mình.',
        tabs: {
            tests: 'Bài luyện',
            history: 'Lịch sử'
        },
        history: 'Lịch sử',
        loadError: 'Chưa thể tải danh sách bài IELTS lúc này.',
        empty: 'Chưa tìm thấy đề phù hợp. Hãy thử đổi bộ lọc nhé.',
        filter: {
            label: 'Bộ lọc:',
            allSkills: 'Tất cả',
            allDifficulties: 'Tất cả',
            reading: 'Reading',
            listening: 'Listening',
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó'
        },
        card: {
            completed: 'Đã hoàn thành',
            notStarted: 'Chưa bắt đầu',
            bandScore: 'Band score',
            correct: '{{correct}} / {{total}} câu đúng',
            questions: '{{count}} câu hỏi',
            minutes: '{{count}} phút'
        },
        common: {
            fullTest: 'Full test',
            quickTest: 'Quick test',
            test: 'Bài test',
            section: 'Section',
            passage: 'Passage',
            accuracy: 'Độ chính xác',
            accuracyValue: 'Accuracy {{value}}%',
            bandValue: 'Band {{value}}',
            questionMinuteMeta: '{{questions}} câu • {{minutes}} phút',
            minutesShort: '{{count}} phút'
        },
        historyTable: {
            test: 'Bài luyện',
            result: 'Kết quả',
            score: 'Điểm',
            band: 'Band',
            time: 'Thời gian',
            date: 'Ngày làm'
        },
        detail: {
            loadError: 'Chưa thể tải chi tiết bài test',
            startError: 'Chưa thể bắt đầu bài test: {{message}}',
            notFound: 'Không tìm thấy bài test',
            backToTests: 'Quay lại danh sách đề',
            back: 'Quay lại',
            difficultySuffix: '{{skill}} • độ khó {{difficulty}}',
            questions: 'Câu hỏi',
            minutes: 'Phút',
            sections: 'Phần thi',
            sectionsOverview: 'Tổng quan các phần',
            sectionQuestions: '{{count}} câu',
            start: 'Bắt đầu',
            practiceOptionsTitle: 'Chọn cách làm bài',
            fullTestTitle: 'Full test',
            fullTestDescription: 'Làm toàn bộ đề để có kết quả đầy đủ và band score hoàn chỉnh.',
            quickTestDescription: 'Chọn đúng section hoặc passage bạn muốn học ngay trong 5-15 phút.',
            startFull: 'Làm full test',
            startSection: 'Làm section',
            startPassage: 'Làm passage',
            timerNote: 'Bạn sẽ có {{count}} phút để hoàn thành bài test này. Hệ thống sẽ tự nộp bài khi hết giờ.'
        },
        taking: {
            backBlocked: 'Bạn không thể quay lại khi đang làm bài. Hãy nộp bài hoặc dừng test trước nhé.',
            refreshBlocked: 'Bạn không thể tải lại trang khi đang làm bài.',
            loadError: 'Chưa thể tải bài test',
            audioCompleted: 'Bạn đã hoàn thành section này. Có thể chuyển sang section tiếp theo rồi.',
            audioBlocked: 'Hãy nghe xong audio trước khi chuyển sang section tiếp theo nhé.',
            submitSuccess: 'Nộp bài thành công!',
            submitError: 'Chưa thể nộp bài: {{message}}',
            submitTitle: 'Nộp bài test?',
            submitConfirm: 'Bạn có chắc muốn nộp bài không?',
            answeredProgress: '{{answered}} / {{total}} câu đã trả lời',
            submit: 'Nộp bài',
            cancel: 'Hủy',
            stopTitle: 'Dừng bài test?',
            stopConfirm: 'Bạn có chắc muốn dừng bài test không?',
            stopWarning: 'Các câu đã làm sẽ được nộp với trạng thái hiện tại.',
            stopAndSubmit: 'Dừng và nộp bài',
            continue: 'Tiếp tục làm bài',
            notFound: 'Không tìm thấy bài test',
            backToTests: 'Quay lại danh sách đề',
            stopButton: 'Dừng test',
            audioLabel: 'Audio',
            audioDone: 'Đã hoàn thành',
            audioPlaying: 'Đang phát...',
            audioSeekHintLabel: 'Gợi ý audio:',
            sharedContext: 'Mở đoạn văn',
            sharedContextShortcutAction: 'Popup',
            passageLabel: 'Passage {{count}}',
            passageWithTitle: 'Passage {{count}} - {{title}}',
            submitButton: 'Nộp bài test'
        },
        result: 'Kết quả',
        transcript: {
            title: 'Transcript Listening',
            description: 'Xuất hiện sau khi nộp bài để bạn đối chiếu audio với câu trả lời của mình.',
            section: 'Section {{count}}',
            sectionWithTitle: 'Section {{count}} - {{title}}',
            audio: 'Audio',
            transcript: 'Transcript'
        },
        answerReview: {
            yourAnswer: 'Câu trả lời của bạn:',
            correct: 'Đáp án đúng:',
            empty: '(để trống)'
        },
        summary: {
            bandScore: 'Band score',
            accuracy: 'Độ chính xác',
            correct: 'Số câu đúng ({{accuracy}}%)',
            correctCount: 'Số câu đúng',
            bandEstimate: 'Band quy đổi',
            timeSpent: 'Thời gian làm bài',
            minutesSeconds: 'phút {{seconds}} giây'
        },
        navigator: 'Điều hướng câu hỏi',
        questionsUi: {
            unsupported: 'Loại câu hỏi chưa được hỗ trợ: {{type}}',
            matchingHint: 'Chọn đáp án phù hợp',
            matchingPlaceholder: 'Chọn một đáp án...',
            matchingHeadingsHint: 'Chọn heading phù hợp',
            matchingHeadingsPlaceholder: 'Chọn một heading...',
            summaryHint: 'Hoàn thành phần tóm tắt',
            sentenceHint: 'Hoàn thành câu',
            fillBlankHint: 'Điền vào chỗ trống',
            mapHint: 'Điền nhãn trên bản đồ',
            mapPlaceholder: 'Chọn một nhãn...',
            typeAnswer: 'Nhập câu trả lời của bạn...'
        },
        subtitle: 'Listening & Reading · cập nhật hằng tuần',
        all: 'Tất cả',
        available: 'Đề có sẵn',
        startTest: 'Bắt đầu',
        retake: 'Làm lại',
        fullTest: 'Full test',
        section: 'Section',
        untitled: 'Đề chưa có tên',
        lastScore: 'Lần trước {{value}}%',
        skill: {
            all: 'Tất cả',
            listening: 'Listening',
            reading: 'Reading',
            writing: 'Writing',
            speaking: 'Speaking'
        },
        emptyTitle: 'Chưa có đề nào',
        emptyBody: 'Kho đề đang trống. Trong lúc chờ, bạn có thể luyện từ vựng để giữ nhịp học.',
        /* An empty FILTERED list is not an empty library: saying "chưa có đề nào" while a
           filter hides 8 of 15 tests states something false about the product. */
        emptyFilterTitle: 'Không có đề nào khớp bộ lọc',
        clearFilter: 'Xoá bộ lọc',
        takeTitle: 'Bài thi',
        questionProgress: 'Đã trả lời {{done}} / {{total}}',
        questionLabel: 'Câu {{number}} / {{total}}',
        questionCount: '{{count}} câu',
        timeLimit: '{{count}} phút',
        paneSwitchLabel: 'Chuyển giữa bài đọc và câu hỏi',
        audioTab: 'Bài nghe',
        passageTab: 'Bài đọc',
        questionsTab: 'Câu hỏi',
        noPassage: 'Phần này không có bài đọc.',
        yourAnswerLabel: 'Câu trả lời của bạn',
        prevQuestion: 'Câu trước',
        nextQuestion: 'Câu sau',
        answered: 'đã trả lời',
        emptyPaperTitle: 'Đề này chưa có câu hỏi',
        emptyPaperBody: 'Nội dung đề có thể chưa được nhập xong. Thử chọn đề khác.',
        accuracyChip: 'Đúng {{value}}%',
        correctOfTotal: 'Đúng {{correct}} trên {{total}} câu',
        correctAnswersStat: 'Câu đúng',
        wrongAnswersStat: 'Câu sai',
        skillLabel: 'Kỹ năng',
        detailMissingTitle: 'Không tìm thấy đề này',
        detailMissingBody: 'Đề có thể đã bị ẩn hoặc xoá. Chọn đề khác trong kho.',
        detailIntro: 'Xem cấu trúc đề trước khi bắt đầu, để biết mình đang bước vào việc gì.',
        questionCountStat: 'Số câu',
        minutesStat: 'Phút',
        sectionCountStat: 'Số phần',
        sectionsTitle: 'Cấu trúc đề',
        sectionN: 'Phần {{number}}',
        hasAudio: 'Có audio',
        transcriptPolicy: 'Transcript bài Listening chỉ hiện sau khi bạn nộp bài, để giữ trải nghiệm giống thi thật. Điều này được nói trước, không phải để bạn phát hiện giữa bài.',
        costToStart: 'Bắt đầu làm bài · {{amount}} credit',
        freeToStart: 'Miễn phí',
        insufficientToStart: 'Cần {{need}} credit, bạn đang có {{have}}.',
        startFullTest: 'Bắt đầu làm bài',
        startHint: 'Khoảng {{count}} phút, có đồng hồ đếm',
        examConditionNote: 'Bài thi chạy ngoài giao diện chính: không có thanh điều hướng và không có Lexi, để bạn không bị phân tán giữa bài.',
        attemptsStat: 'Lượt làm bài',
        historyEmptyTitle: 'Chưa có lượt làm bài nào',
        historyEmptyBody: 'Kết quả sẽ hiện ở đây sau khi bạn nộp bài. Bắt đầu bằng một đề ngắn.',
        historyNote: 'Band hiển thị là ước tính từ bài luyện, không phải kết quả thi chính thức.',
        chartTitle: 'Band theo tuần',
        chartCaption: 'Mỗi cột là một tuần, lấy band cao nhất trong tuần đó. Tuần không có bài làm thì không xuất hiện — chúng tôi không vẽ cột 0 cho tuần bạn không học.',
        chartEmpty: 'Chưa có bài nào đã chấm để vẽ biểu đồ.',
        chartLabel: 'Biểu đồ band theo tuần: {{series}}',
        chartPointListening: 'Listening band {{band}}',
        chartPointReading: 'Reading band {{band}}',
        wrongCount: '{{count}} câu sai',
        allCorrect: 'Không có câu nào sai. Làm đề tiếp theo để giữ nhịp nhé.',
        blankAnswer: 'bỏ trống',
        anotherTest: 'Làm đề khác',
        lexiResult: 'Lexi nhận xét kết quả',
        resultNoAttemptTitle: 'Chưa chọn bài làm nào',
        resultNoAttemptBody: 'Mở kết quả từ lịch sử để xem lại bài đã làm.',
        resultEmptyTitle: 'Không có dữ liệu bài làm',
        resultEmptyBody: 'Bài làm này có thể đã bị xoá hoặc chưa được chấm xong.',
        hint: 'Gợi ý',
        hintBody: 'Mỗi đoạn thường có một câu chủ đề ở đầu hoặc cuối đoạn.',
        difficulty: {
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó'
        },
        estimatedBand: 'Band ước tính',
        estimatedNote: 'Đây là ước tính từ bài luyện trên nền tảng, không phải kết quả thi chính thức.',
        submit: 'Nộp bài',
        reviewAnswers: 'Review đáp án',
        transcriptLocked: 'Transcript Listening chỉ hiện sau khi nộp bài, để giữ trải nghiệm giống thi thật.',
        correctAnswer: 'Đáp án đúng',
        yourAnswer: 'Bạn chọn',
        timeSpent: 'Phút làm bài',
        xpEarned: 'XP nhận được'
    },
    speaking: {
        title: 'Luyện Speaking',
        description: 'Luyện speaking cùng AI để nhận phản hồi rõ ràng, tích cực và giúp bạn nói tự tin hơn.',
        loadError: 'Chưa thể tải danh sách chủ đề speaking lúc này.',
        filtersEyebrow: 'Trọng tâm luyện nói',
        errorTitle: 'Chúng tôi chưa tải được danh sách chủ đề speaking',
        errorDescription: 'Hãy thử lại sau ít phút để bạn tiếp tục luyện nói thật mượt và không bị ngắt nhịp nhé.',
        stats: {
            topics: 'Chủ đề',
            attempted: 'Đã bắt đầu',
            focus: 'Trọng tâm hiện tại'
        },
        list: {
            eyebrow: 'Thư viện chủ đề',
            title: 'Chọn một prompt phù hợp và giữ nhịp speaking thật đều',
            subtitle: 'Có {{count}} chủ đề sẵn sàng để bạn luyện tập',
            subtitle_one: '{{count}} chủ đề luyện nói',
            subtitle_other: '{{count}} chủ đề luyện nói'
        },
        empty: {
            title: 'Chưa có chủ đề phù hợp với bộ lọc này',
            description: 'Bạn hãy thử đổi part hoặc độ khó, hoặc bắt đầu một phiên custom speaking để tiếp tục giữ sự tự tin nhé.',
            cta: 'Bắt đầu Custom Speaking'
        },
        common: {
            backToTopics: 'Quay lại chủ đề',
            backToSetup: 'Quay lại',
            back: 'Quay lại',
            you: 'Bạn',
            aiPartner: 'Bạn đồng hành AI',
            connected: 'Đã kết nối',
            connecting: 'Đang kết nối...',
            realtimeReady: 'Realtime sẵn sàng',
            realtimeReconnecting: 'Realtime đang kết nối lại',
            loadingTopicError: 'Không thể tải chủ đề speaking',
            loadingConversationError: 'Không thể tải hội thoại',
            loadingAttemptError: 'Không thể tải lượt làm bài'
        },
        filters: {
            allParts: 'Tất cả part',
            allLevels: 'Tất cả độ khó',
            part1: 'Part 1',
            part2: 'Part 2',
            part3: 'Part 3',
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó'
        },
        actions: {
            history: 'Lịch sử',
            custom: 'Custom speaking',
            conversationHistory: 'Lịch sử hội thoại',
            practice: 'Luyện tập',
            conversation: 'Hội thoại'
        },
        card: {
            graded: 'Đã chấm',
            submitted: 'Đã nộp',
            notStarted: 'Chưa bắt đầu',
            highestScore: 'Điểm cao nhất',
            practiceSource: 'Luyện tập',
            conversationSource: 'Hội thoại',
            attemptSource: 'Lần làm',
            awaitingGrade: 'Đã nộp, đang chờ chấm điểm',
            noSubmission: 'Chưa có bài nộp nào'
        },
        history: {
            title: 'Lịch sử Speaking',
            description: 'Xem lại các cuộc hội thoại, tiếp tục nếu bạn chưa hoàn thành.',
            columns: {
                question: 'Câu hỏi',
                part: 'Part',
                band: 'Band',
                status: 'Trạng thái',
                date: 'Ngày nộp'
            },
            status: {
                SUBMITTED: 'Đã nộp',
                GRADING: 'Đang chấm',
                GRADED: 'Đã chấm',
                FAILED: 'Thất bại'
            }
        },
        practice: {
            loadError: 'Không thể tải thông tin chủ đề.',
            emptyTranscript: 'Bạn hãy nói gì đó trước nhé!',
            submitTitle: 'Gửi bài Speaking?',
            submitDescription: 'Bài nói sẽ được gửi cho AI chấm điểm. Bạn có muốn tiếp tục không?',
            submit: 'Gửi',
            cancel: 'Hủy',
            submitSuccess: 'Đã gửi! AI đang chấm điểm...',
            submitError: 'Không thể gửi bài speaking.',
            description: '{{part}} • {{difficulty}}',
            cueCard: 'Cue Card',
            followUpQuestions: 'Câu hỏi nối tiếp',
            startRecording: 'Bắt đầu ghi âm',
            stopRecording: 'Dừng ghi âm',
            cancelRecording: 'Hủy',
            sttUnsupportedTitle: 'Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tự động',
            sttUnsupportedDescription: 'Hãy dùng Chrome hoặc Edge để có live transcript, hoặc nhập nội dung bài nói thủ công sau khi ghi âm.',
            liveTranscript: 'Live Transcript',
            manualTranscript: 'Nhập nội dung bài nói',
            manualTranscriptPlaceholder: 'Nhập lại nội dung bạn vừa nói tại đây...',
            analytics: 'Phân tích giọng nói',
            wpm: 'WPM',
            pauses: 'Khoảng ngắt',
            fillers: 'Từ đệm',
            avgConfidence: 'Độ tin cậy TB',
            submitForGrading: 'Gửi AI chấm điểm'
        },
        resultPage: {
            status: {
                SUBMITTED: 'Đã gửi, đang chờ AI...',
                GRADING: 'AI đang chấm điểm...',
                GRADED: 'Đã chấm',
                FAILED: 'Chấm điểm thất bại'
            },
            celebrateBand: 'Speaking Band {{score}}! Bạn làm rất tốt!',
            celebrateDefault: 'Bài speaking đã được chấm! Xem phản hồi nhé.',
            scoreBreakdown: 'Phân tích điểm số',
            overallBand: 'Điểm band tổng',
            fluency: 'Fluency & Coherence',
            lexical: 'Lexical Resource',
            grammar: 'Grammar',
            pronunciation: 'Pronunciation',
            aiFeedback: 'Phản hồi từ AI',
            transcript: 'Transcript của bạn',
            speechAnalytics: 'Phân tích giọng nói',
            wordDetails: 'Chi tiết từng từ ({{count}} từ)',
            word: 'Từ',
            confidence: 'Độ tin cậy',
            timeMs: 'Thời gian (ms)',
            na: 'Không có'
        },
        conversation: {
            error: 'Có lỗi trong hội thoại',
            connectionError: 'Không thể bắt đầu phòng speaking realtime.',
            completeMessage: 'Cuộc hội thoại đã hoàn thành. AI đang chấm phần speaking của bạn...',
            topicLoadError: 'Không thể tải chủ đề speaking',
            emptyTranscript: 'Hãy nói gì đó trước khi gửi nhé.',
            nextTurnError: 'Không thể nhận lượt tiếp theo.',
            hint: 'Gợi ý',
            aiReplying: 'AI đang phản hồi...',
            recordAnswer: 'Ghi âm câu trả lời',
            answerFinalQuestion: 'Trả lời câu cuối',
            creditChargedOnSubmit: 'Chỉ trừ credit khi bạn nộp bài để chấm điểm.',
            status: {
                IN_PROGRESS: 'Đang diễn ra',
                COMPLETED: 'Đã hoàn thành',
                GRADING: 'Đang chấm',
                GRADED: 'Đã chấm',
                FAILED: 'Thất bại'
            }
        },
        conversationResult: {
            backToTopics: 'Quay lại chủ đề',
            status: {
                IN_PROGRESS: 'Đang diễn ra...',
                COMPLETED: 'Đã hoàn thành, đang chờ AI chấm...',
                GRADING: 'AI đang chấm điểm...',
                GRADED: 'Đã chấm',
                FAILED: 'Chấm điểm thất bại'
            },
            celebrateBand: 'Conversation Band {{score}}! Bạn nói rất tốt!',
            celebrateDefault: 'Hội thoại đã được chấm! Cùng xem phản hồi nhé.',
            overallBand: 'Điểm band tổng',
            scoreBreakdown: 'Phân tích điểm số',
            aiFeedback: 'Phản hồi từ AI',
            transcript: 'Transcript hội thoại',
            fluency: 'Fluency & Coherence',
            lexical: 'Lexical Resource',
            grammar: 'Grammar',
            pronunciation: 'Pronunciation',
            confidence: '{{count}}% độ tin cậy'
        },
        conversationHistory: {
            title: 'Lịch sử hội thoại',
            description: 'Xem lại các cuộc hội thoại, tiếp tục nếu bạn chưa hoàn thành.',
            columns: {
                question: 'Câu hỏi',
                part: 'Part',
                band: 'Band',
                status: 'Trạng thái',
                turns: 'Lượt',
                date: 'Ngày'
            },
            status: {
                IN_PROGRESS: 'Đang diễn ra',
                COMPLETED: 'Đã hoàn thành',
                GRADING: 'Đang chấm',
                GRADED: 'Đã chấm',
                FAILED: 'Thất bại'
            }
        },
        custom: {
            setupTitle: 'Hội thoại Speaking tùy chỉnh',
            setupDescription: 'Thiết lập một cuộc hội thoại tiếng Anh tự do rồi tiếp tục ở màn chat riêng để luyện nói thoải mái hơn.',
            history: 'Lịch sử',
            conversationSetup: 'Thiết lập hội thoại',
            setupHint: 'Sau khi bấm bắt đầu, hệ thống sẽ tạo cuộc hội thoại và chuyển bạn sang màn chat chính.',
            restStart: 'Sẵn sàng',
            topic: 'Chủ đề',
            topicPlaceholder: 'Ví dụ: Công nghệ thay đổi cách con người học tập như thế nào',
            style: 'Phong cách',
            personality: 'Tính cách',
            expertise: 'Chuyên môn',
            voice: 'Giọng đọc',
            grading: 'AI chấm điểm',
            gradingDescription: 'Nhận điểm số và phản hồi sau khi hoàn thành.',
            startConversation: 'Bắt đầu hội thoại',
            missingTopic: 'Hãy nhập chủ đề trước nhé.',
            startError: 'Hiện chưa thể bắt đầu hội thoại tùy chỉnh.',
            chatLoadError: 'Không thể tải chi tiết hội thoại này.',
            chatError: 'Có lỗi trong hội thoại',
            notActiveTitle: 'Cuộc hội thoại này không còn hoạt động.',
            notActiveDescription: 'Bạn sẽ được chuyển sang trang chi tiết tự động, hoặc có thể mở kết quả thủ công.',
            openResult: 'Mở kết quả',
            typeAnswer: 'Nhập câu trả lời trước khi gửi...',
            replayAi: 'Phát lại AI',
            cancel: 'Hủy',
            stopAndSend: 'Dừng và gửi',
            sendAnswer: 'Gửi câu trả lời',
            finishConversation: 'Kết thúc hội thoại',
            customConversation: 'Hội thoại tùy chỉnh',
            gradingOn: 'Bật chấm điểm',
            gradingOff: 'Tắt chấm điểm',
            turns: 'Lượt: {{current}}{{max}}',
            aiPreparing: 'AI đang chuẩn bị phản hồi tiếp theo...',
            resultTitleFallback: 'Hội thoại tùy chỉnh',
            overallScore: 'Điểm tổng',
            userTurns: 'Luợt đối thoại',
            userTurnsWithMax: '{{count}} / {{max}}',
            scoreBreakdown: 'Phân tích điểm',
            scoresPending: 'Điểm số sẽ xuất hiện sau khi hoàn tất chấm điểm.',
            summary: 'Tóm tắt',
            summaryStatus: 'Trạng thái',
            startedAt: 'Bắt đầu lúc',
            completedAt: 'Hoàn thành lúc',
            gradedAt: 'Chấm xong lúc',
            timeSpent: 'Thời gian làm',
            aiFeedback: 'Phản hồi từ AI',
            transcript: 'Transcript',
            turn: 'Lượt {{count}}',
            continueConversation: 'Tiếp tục hội thoại',
            viewResult: 'Xem kết quả',
            historyTitle: 'Lịch sử Speaking tùy chỉnh',
            historyDescription: 'Xem lại các cuộc hội thoại tự do và theo dõi tiến trình chấm điểm của bạn.',
            historyColumns: {
                title: 'Tiêu đề',
                profile: 'Hồ sơ',
                score: 'Điểm',
                status: 'Trạng thái',
                turns: 'Lượt',
                started: 'Bắt đầu'
            },
            historyStatus: {
                IN_PROGRESS: 'Đang diễn ra',
                COMPLETED: 'Đã hoàn thành',
                GRADING: 'Đang chấm',
                GRADED: 'Đã chấm',
                FAILED: 'Thất bại'
            },
            styles: {
                CASUAL: 'Thoải mái',
                PROFESSIONAL: 'Chuyên nghiệp',
                ENCOURAGING: 'Khích lệ',
                CHALLENGING: 'Thử thách',
                PLAYFUL: 'Tinh nghịch',
                FLIRTY: 'Tán tỉnh',
                DEEP: 'Sâu sắc',
                DEBATE: 'Tranh biện',
                STREET: 'Đường phố',
                UNFILTERED: 'Không kiêng nể'
            },
            personalities: {
                FRIENDLY: 'Thân thiện',
                HUMOROUS: 'Hài hước',
                PATIENT: 'Kiên nhẫn',
                STRAIGHTFORWARD: 'Thẳng thắn',
                CONFIDENT: 'Tự tin',
                CURIOUS: 'Tò mò',
                EMPATHETIC: 'Đồng cảm',
                BOLD: 'Táo bạo',
                FLIRTY: 'Tán tỉnh',
                EDGY: 'Gai góc',
                REBELLIOUS: 'Nổi loạn'
            },
            expertises: {
                GENERAL: 'Tổng quát',
                BUSINESS: 'Kinh doanh',
                TECHNOLOGY: 'Công nghệ',
                EDUCATION: 'Giáo dục',
                TRAVEL: 'Du lịch',
                RELATIONSHIPS: 'Mối quan hệ',
                ENTERTAINMENT: 'Giải trí',
                GAMING: 'Game',
                FITNESS: 'Thể hình',
                PSYCHOLOGY: 'Tâm lý học',
                SOCIAL_MEDIA: 'Mạng xã hội',
                STREET_CULTURE: 'Văn hóa đường phố'
            },
            voices: {
                US_NEURAL_J: 'Giọng nam trầm',
                US_NEURAL_I: 'Giọng nam trung',
                US_NEURAL_F: 'Giọng nữ',
                US_STUDIO_O: 'Giọng nữ tự nhiên',
                US_CHIRP_F: 'Giọng nữ siêu tự nhiên'
            }
        },
        subtitle: 'Nói theo đề và nhận chấm theo bốn tiêu chí IELTS',
        filterLabel: 'Lọc theo phần thi',
        filterAll: 'Tất cả',
        part: {
            PART_1: 'Part 1',
            PART_2: 'Part 2',
            PART_3: 'Part 3'
        },
        micReady: 'Trình duyệt đã sẵn sàng ghi âm. Lần đầu bấm ghi, trình duyệt sẽ hỏi quyền truy cập micro — chọn "Cho phép".',
        micInsecure: 'Trang này đang chạy trên kết nối không bảo mật nên trình duyệt không cho truy cập micro.',
        micUnsupported: 'Trình duyệt này không hỗ trợ ghi âm.',
        micUnknown: 'Đang kiểm tra khả năng ghi âm…',
        micFallback: 'Bạn vẫn có thể luyện đọc đề và xem nhận xét, nhưng sẽ không có phần chấm phát âm.',
        statusGrading: 'Đang chấm',
        statusFailed: 'Chấm lỗi',
        start: 'Luyện nói',
        practiceAgain: 'Luyện lại',
        tryAgain: 'Thử lại',
        viewStatus: 'Xem trạng thái',
        viewResult: 'Xem kết quả',
        historyLink: 'Các lượt đã làm',
        typicalLength: 'Mỗi lượt khoảng 2 phút nói',
        emptyTitle: 'Chưa có đề Speaking nào',
        emptyBody: 'Kho đề đang trống. Thử lại sau, hoặc luyện từ vựng trong lúc chờ.',
        topicMissingTitle: 'Không tìm thấy đề này',
        topicMissingBody: 'Đề có thể đã bị ẩn hoặc xoá. Chọn đề khác trong danh sách.',
        practiceTitle: 'Luyện nói',
        prepRule: '1 phút chuẩn bị · 2 phút nói',
        timingRule: 'Đúng cấu trúc thi thật: bạn có khoảng 1 phút chuẩn bị và 2 phút để nói. Đồng hồ chỉ là thông tin, bản ghi không bị cắt ngang.',
        followUps: 'Câu hỏi mở rộng',
        recording: 'Đang ghi âm',
        notRecording: 'Chưa ghi âm',
        startRecording: 'Bắt đầu ghi âm',
        stopAndGrade: 'Dừng và chấm bài',
        recordAgain: 'Ghi lại từ đầu',
        pause: 'Tạm dừng',
        resume: 'Tiếp tục',
        countdown: 'Còn {{seconds}} giây theo khuyến nghị',
        timeUp: 'Đã tới thời lượng khuyến nghị — bạn có thể dừng hoặc nói tiếp.',
        prepareTitle: 'Chuẩn bị trong 1 phút',
        prepareBody: 'Đọc kỹ đề và nghĩ nhanh ý chính. Bạn có thể bấm sẵn sàng nói luôn, không cần chờ hết.',
        readyToSpeak: 'Sẵn sàng nói',
        sttUnsupported: 'Trình duyệt này không nhận dạng giọng nói tự động, nên bạn cần gõ lại nội dung đã nói để hệ thống chấm.',
        transcriptLabel: 'Nội dung bạn đã nói',
        transcriptHint: 'Đây là phần hệ thống dùng để chấm. Bạn có thể sửa lại cho đúng với điều mình đã nói.',
        transcriptPlaceholder: 'Nội dung lời nói sẽ hiện ở đây…',
        needsTranscript: 'Chưa nhận được nội dung lời nói. Hãy gõ lại điều bạn đã nói rồi nộp, để không mất credit cho một bài trống.',
        wordCount: '{{count}} từ',
        fillerDetected: 'Có {{count}} từ đệm: {{words}}',
        submit: 'Chấm bài',
        submitWithCost: 'Chấm bài · {{amount}} credit',
        gradingWait: 'Chấm bài mất khoảng 30–60 giây.',
        insufficient: 'Bạn không đủ credit để chấm bài này.',
        noAttemptTitle: 'Chưa chọn lượt nào',
        noAttemptBody: 'Mở một lượt đã làm để xem kết quả.',
        attemptGoneTitle: 'Không có dữ liệu lượt làm',
        attemptGoneBody: 'Lượt làm này có thể đã bị xoá.',
        gradingTitle: 'Đang chấm bài nói của bạn',
        gradingBody: 'Hệ thống đang phân tích bản ghi và cho điểm theo từng tiêu chí.',
        gradingWaitShort: 'Thường mất 30–60 giây',
        gradingLexi: 'Lexi đang chờ chấm bài nói',
        gradingFailedTitle: 'Không chấm được bài này',
        gradingFailedBody: 'Bản ghi đã được lưu lại. Bạn có thể thử lại hoặc nói lại.',
        lexiResult: 'Lexi nhận xét kết quả',
        bandEstimateNote: 'Đây là band ước tính từ dữ liệu luyện tập trên nền tảng, không phải kết quả thi chính thức.',
        criteriaScores: 'Điểm theo tiêu chí',
        criterion: {
            fluency: 'Độ trôi chảy (Fluency)',
            lexical: 'Vốn từ (Lexical Resource)',
            grammar: 'Ngữ pháp (Grammar)',
            pronunciation: 'Phát âm (Pronunciation)'
        },
        analyticsTitle: 'Số đo khi nói',
        analyticsNote: 'Đây là các số đo, không phải điểm. Mỗi chỉ số chỉ có nghĩa khi đặt cạnh mức thông thường.',
        wpm: 'Tốc độ nói (từ/phút)',
        analyticsWords: 'Số từ đã nói',
        fillers: 'Từ đệm',
        pauses: 'Số lần ngắt',
        wpmInRange: '{{value}} từ/phút — nằm trong khoảng tự nhiên {{min}}–{{max}}.',
        wpmBelowRange: '{{value}} từ/phút — chậm hơn khoảng thông thường {{min}}–{{max}}. Nói chậm không sai, nhưng dễ bị coi là thiếu trôi chảy.',
        wpmAboveRange: '{{value}} từ/phút — nhanh hơn khoảng thông thường {{min}}–{{max}}. Nói quá nhanh có thể khiến phát âm khó rõ.',
        fillersUsed: 'Từ đệm đã dùng:',
        transcriptTitle: 'Nội dung đã chấm',
        transcriptCaveat: 'Phần nhận dạng giọng nói có thể nghe sai. Đây đúng là nội dung mà hệ thống đã dựa vào để chấm.',
        noTranscript: 'Không có nội dung lời nói cho lượt này.',
        feedbackTitle: 'Nhận xét chi tiết',
        noFeedback: 'Chưa có nhận xét chi tiết cho lượt này.',
        practiceAgainHint: 'Luyện lại chính đề này là cách nhanh nhất để thấy mình tiến bộ ở đâu.',
        allTopics: 'Tất cả đề',
        historyEmptyTitle: 'Chưa có lượt luyện nào',
        historyEmptyBody: 'Kết quả sẽ hiện ở đây sau khi bạn chấm bài.'
    },
    writingPractice: {
        filters: {
            allTaskTypes: 'Tất cả',
            keywordPlaceholder: 'Tìm kiếm'
        },
        list: {
            title: 'Luyện tập writing',
            subtitle: 'Luyện tập cho bài writing bằng cách dịch từng câu với sự đồng hành của AI',
            loadError: 'Không thể tải danh sách luyện tập writing.',
            empty: 'Chưa có bộ luyện tập phù hợp.',
            createdAt: 'Tạo lúc: {{value}}',
            attemptCount: '{{count}} lần làm',
            lastAttemptAt: 'Lần làm gần nhất: {{value}}',
            neverAttempted: 'Chưa làm',
            viewDetail: 'Xem chi tiết'
        },
        detail: {
            loadError: 'Không thể tải chi tiết bộ luyện tập.',
            start: 'Bắt đầu luyện tập',
            resume: 'Tiếp tục luyện tập',
            startError: 'Không thể bắt đầu lượt luyện tập này.',
            notFound: 'Không tìm thấy bộ luyện tập',
            backToList: 'Quay lại',
            variantsTitle: 'Các mức độ',
            difficulty: 'Độ khó',
            variantSentence: 'Số câu',
            estimatedMinutes: 'Thời gian dự kiến',
            variantSentenceCount: '{{count}} câu',
            estimatedMinutesSuffix: ' phút',
            emptyVariants: 'Chưa có mức độ khả dụng.',
            variantSummary: '{{sentenceCount}} câu • khoảng {{estimatedMinutes}} phút'
        },
        attempt: {
            loadError: 'Không thể tải lượt luyện tập này.',
            notFound: 'Không tìm thấy lượt luyện tập',
            emptyTranslation: 'Hãy nhập bản dịch trước khi gửi.',
            submit: 'Gửi bản dịch',
            submitError: 'Không thể gửi câu trả lời này.',
            skip: 'Bỏ qua câu',
            skipError: 'Không thể bỏ qua câu này.',
            placeholder: 'Nhập bản dịch tiếng Anh của bạn tại đây',
            completed: 'Đã hoàn thành luyện tập',
            completedDescription: 'Lượt luyện tập này đã xong. Bạn có thể xem lịch sử hoặc bắt đầu bộ mới.',
            progressLabel: 'Câu {{current}} / {{total}}',
            leftPanelTitle: 'Đoạn văn tiếng Việt',
            rightPanelTitle: 'Nội dung đề bài',
            currentSentenceTitle: 'Câu hiện tại',
            attemptNumber: 'Lần thử {{count}}',
            sentenceLabel: 'Câu {{order}}',
            noParagraph: 'Variant này chưa có dữ liệu đoạn văn.',
            noStaticContent: 'Chưa tải được nội dung tĩnh của bộ luyện tập.',
            feedbackTitle: 'Phản hồi AI gần nhất',
            correctionTitle: 'Câu sửa gợi ý',
            noFeedback: 'Gửi bản dịch để xem phản hồi AI tại đây.',
            scoreTitle: 'Đánh giá gần nhất',
            aiCoachLabel: 'AI đánh giá',
            feedbackPassedTitle: 'Chuỗi luyện tốt! Câu này đã đạt.',
            feedbackRetryTitle: 'Gần đạt rồi! Mài lại câu này nhé.',
            hintForSkip: 'Nếu thử 5 lần mà không được thì bạn có thể bỏ qua câu này để tiếp tục nhé',
            gradingInProgress: 'AI đang chấm bài của bạn. Chờ chút nhé',
            gradingFailed: 'Có lỗi xảy ra, bạn hãy thử lại nhé',
            scoreLabel: {
                accuracy: 'Độ chính xác',
                grammar: 'Ngữ pháp',
                naturalness: 'Độ tự nhiên',
                overall: 'Tổng điểm'
            },
            feedback: {
                strengths: 'Điểm làm tốt',
                issues: 'Cần sửa tiếp',
                hint: 'Gợi ý'
            },
            score: {
                accuracy: 'Độ chính xác: {{value}}',
                grammar: 'Ngữ pháp: {{value}}',
                naturalness: 'Độ tự nhiên: {{value}}',
                overall: 'Tổng điểm: {{value}}'
            }
        },
        history: {
            title: 'Lịch sử',
            loadError: 'Không thể tải lịch sử luyện tập writing.',
            empty: 'Bạn chưa có lượt luyện tập nào.',
            openAttempt: 'Mở lượt làm',
            columns: {
                title: 'Bộ luyện tập',
                taskType: 'Dạng bài',
                difficulty: 'Mức độ',
                status: 'Trạng thái',
                updatedAt: 'Cập nhật cuối',
                action: 'Hành động'
            }
        },
        taskType: {
            task1: 'Task 1',
            task2: 'Task 2'
        },
        difficulty: {
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó'
        },
        media: {
            title: 'Danh sách hình ảnh',
            alt: 'Ảnh biểu đồ Task 1 {{index}}'
        }
    },
    writing: {
        title: 'Luyện Writing',
        description: 'Luyện Task 1 và Task 2 với AI chấm điểm để tiến bộ đều đặn và viết tự tin hơn.',
        loadError: 'Chưa thể tải danh sách bài writing lúc này.',
        filtersEyebrow: 'Không gian luyện viết',
        errorTitle: 'Chúng tôi chưa tải được danh sách bài writing',
        errorDescription: 'Hãy thử lại sau ít phút để bạn tiếp tục giữ mạch viết thật ổn định nhé.',
        stats: {
            tasks: 'Đề bài',
            attempted: 'Đã bắt đầu',
            focus: 'Trọng tâm hiện tại'
        },
        list: {
            eyebrow: 'Thư viện bài viết',
            title: 'Chọn một đề phù hợp và xây nhịp writing thật rõ ràng',
            subtitle: 'Có {{count}} đề writing sẵn sàng để bạn luyện tập',
            subtitle_one: '{{count}} đề Writing',
            subtitle_other: '{{count}} đề Writing'
        },
        filters: {
            allTypes: 'Tất cả',
            allLevels: 'Tất cả',
            task1: 'Task 1',
            task2: 'Task 2',
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó'
        },
        actions: {
            history: 'Đã chấm',
            loadMore: 'Xem thêm'
        },
        card: {
            graded: 'Đã chấm',
            submitted: 'Đã nộp',
            notStarted: 'Chưa bắt đầu',
            highestScore: 'Điểm cao nhất',
            awaitingGrade: 'Đã nộp, đang chờ chấm điểm',
            noSubmission: 'Chưa có bài nộp nào',
            gradedLabel: 'Đã chấm',
            minutes: '{{count}} phút',
            words: '{{min}}-{{max}} từ'
        },
        history: {
            title: 'Lịch sử nộp bài Writing',
            description: 'Theo dõi các bài viết đã nộp và những phản hồi đang giúp bạn tiến bộ từng bước.',
            total: '{{count}} bài nộp',
            columns: {
                task: 'Đề bài',
                type: 'Dạng bài',
                status: 'Trạng thái',
                band: 'Band',
                words: 'Số từ',
                submitted: 'Thời gian nộp'
            },
            status: {
                SUBMITTED: 'Đã nộp',
                GRADING: 'Đang chấm',
                GRADED: 'Đã chấm',
                FAILED: 'Lỗi'
            }
        },
        detail: {
            loadError: 'Không thể tải thông tin đề bài writing.',
            notFound: 'Không tìm thấy đề bài',
            back: 'Quay lại',
            backToWriting: 'Quay lại Writing',
            difficultySuffix: '{{taskType}} • độ khó {{difficulty}}',
            minutes: 'Phút',
            wordCount: 'Số từ',
            images: 'Hình ảnh',
            taskContent: 'Nội dung đề bài',
            instruction: 'Hướng dẫn',
            imagesCount: 'Hình ảnh ({{count}})',
            startWriting: 'Bắt đầu viết',
            timerNote: 'Bạn có {{count}} phút để hoàn thành bài viết này. Hệ thống sẽ tự nộp bài khi hết thời gian.'
        },
        taskPage: {
            loadError: 'Không thể tải đề bài.',
            backBlocked: 'Bạn không thể quay lại khi đang viết bài. Hãy nộp bài hoặc dừng trước nhé.',
            refreshBlocked: 'Bạn không thể tải lại trang khi đang viết bài.',
            submitSuccess: 'Đã nộp bài! AI đang chấm điểm...',
            submitError: 'Không thể nộp bài.',
            emptyEssay: 'Hãy viết bài trước khi nộp.',
            submitTooShort: 'Bài viết hiện có {{count}} từ. Bạn cần viết ít nhất {{min}} từ mới có thể nộp bài.',
            submitTitle: 'Nộp bài viết?',
            submitDescription: 'Bài viết {{count}} từ sẽ được gửi để AI chấm điểm.',
            submitHint: 'Bạn sẽ không thể chỉnh sửa sau khi nộp.',
            submit: 'Nộp bài',
            continueWriting: 'Tiếp tục viết',
            stopTitle: 'Dừng viết bài?',
            stopDescription: 'Bạn có chắc muốn dừng viết không? Bài hiện tại ({{count}} từ) sẽ bị hủy và bạn sẽ quay về danh sách đề.',
            stopAndSubmit: 'Hủy bài và quay lại',
            notFound: 'Không tìm thấy đề bài',
            stopWriting: 'Dừng viết',
            taskPrompt: 'Đề bài',
            yourEssay: 'Bài viết của bạn',
            instruction: 'Hướng dẫn:',
            requirements: 'Yêu cầu: {{min}}-{{max}} từ • Thời gian: {{time}} phút',
            essayPlaceholder: 'Bắt đầu viết bài của bạn tại đây...',
            wordWarning: 'Bài viết hiện có {{count}} từ, tối thiểu cần {{min}} từ.',
            words: '{{count}} từ'
        },
        submission: {
            titleFallback: 'Bài nộp Writing',
            notFound: 'Không tìm thấy bài nộp',
            status: {
                SUBMITTED: 'Đã nộp',
                GRADING: 'AI đang chấm...',
                GRADED: 'Đã chấm',
                FAILED: 'Chấm điểm thất bại'
            },
            celebrateBand: 'Writing Band {{score}}! Bạn làm rất tốt!',
            celebrateDefault: 'Bài viết đã được chấm! Phản hồi đã sẵn sàng.',
            pendingTitle: 'AI đang chấm bài viết của bạn...',
            pendingDescription: 'Trang này sẽ tự cập nhật khi có kết quả. Bạn cũng sẽ nhận được thông báo.',
            overallBand: 'Điểm band tổng',
            taskResponse: 'Task Response',
            coherence: 'Coherence & Cohesion',
            lexical: 'Lexical Resource',
            grammar: 'Grammar Range & Accuracy',
            aiFeedback: 'Phản hồi từ AI',
            info: 'Thông tin',
            wordCount: 'Số từ',
            timeSpent: 'Thời gian làm bài',
            submittedAt: 'Thời gian nộp',
            gradedAt: 'Thời gian chấm',
            yourEssay: 'Bài viết của bạn',
            words: '{{count}} từ',
            duration: '{{minutes}} phút {{seconds}} giây'
        },
        empty: {
            title: 'Chưa có bài writing phù hợp với bộ lọc này',
            description: 'Bạn hãy thử đổi dạng bài hoặc độ khó để tiếp tục duy trì đà luyện viết nhé.'
        },
        subtitle: 'Viết bài và nhận chấm theo bốn tiêu chí IELTS',
        filterLabel: 'Lọc theo loại bài',
        filterAll: 'Tất cả',
        type: {
            TASK_1: 'Task 1',
            TASK_2: 'Task 2'
        },
        wordRange: '{{min}}–{{max}} từ',
        statusGrading: 'Đang chấm',
        statusFailed: 'Chấm lỗi',
        start: 'Viết bài',
        rewrite: 'Viết lại',
        tryAgain: 'Thử lại',
        viewStatus: 'Xem trạng thái',
        viewResult: 'Xem kết quả',
        historyLink: 'Bài đã nộp',
        emptyTitle: 'Chưa có đề Writing nào',
        emptyBody: 'Kho đề đang trống. Thử lại sau, hoặc luyện từ vựng trong lúc chờ.',
        draftNote: 'Bản nháp được lưu trên máy này',
        taskMissingTitle: 'Không tìm thấy đề này',
        taskMissingBody: 'Đề có thể đã bị ẩn hoặc xoá. Chọn đề khác trong danh sách.',
        criteriaTitle: 'Bài sẽ được chấm theo bốn tiêu chí',
        criterion: {
            taskResponse: 'Trả lời đúng yêu cầu đề (Task Response)',
            coherence: 'Mạch lạc và liên kết (Coherence & Cohesion)',
            lexicalResource: 'Vốn từ (Lexical Resource)',
            grammar: 'Ngữ pháp (Grammatical Range & Accuracy)'
        },
        criterionAria: '{{criterion}}: {{value}} trên 9',
        lexiTip: 'Dành hai phút lập dàn ý trước khi viết. Bài có bố cục rõ thường được điểm mạch lạc cao hơn hẳn.',
        editorLabel: 'Bài của bạn',
        editorPlaceholder: 'Bắt đầu viết ở đây…',
        wordCount: '{{count}} từ',
        wordCountOf: '{{count}} / {{target}} từ',
        underTarget: 'Chưa đủ số từ tối thiểu',
        overMax: 'Vượt số từ tối đa',
        savedLocally: 'Đã lưu nháp trên máy',
        submit: 'Nộp bài',
        submitWithCost: 'Nộp bài · {{amount}} credit',
        gradingWait: 'Chấm bài mất khoảng 30–60 giây.',
        insufficient: 'Bạn không đủ credit để chấm bài này.',
        chartAlt: 'Biểu đồ của đề Task 1',
        noSubmissionTitle: 'Chưa chọn bài nộp nào',
        noSubmissionBody: 'Mở một bài đã nộp để xem kết quả.',
        submissionGoneTitle: 'Không có dữ liệu bài nộp',
        submissionGoneBody: 'Bài nộp này có thể đã bị xoá.',
        gradingTitle: 'Đang chấm bài của bạn',
        gradingBody: 'Hệ thống đang đọc bài và cho điểm theo từng tiêu chí. Bạn có thể để tab này mở.',
        gradingWaitShort: 'Thường mất 30–60 giây',
        gradingLexi: 'Lexi đang chờ chấm bài',
        gradingFailedTitle: 'Không chấm được bài này',
        gradingFailedBody: 'Bài đã được lưu lại. Bạn có thể thử nộp lại hoặc viết lại.',
        lexiResult: 'Lexi nhận xét kết quả',
        bandEstimateNote: 'Đây là band ước tính từ dữ liệu luyện tập trên nền tảng, không phải kết quả thi chính thức.',
        criteriaScores: 'Điểm theo tiêu chí',
        finalWordCount: 'Số từ',
        gradedAt: 'Chấm lúc',
        submittedAt: 'Nộp lúc',
        yourEssay: 'Bài của bạn',
        feedbackTitle: 'Nhận xét chi tiết',
        noFeedback: 'Chưa có nhận xét chi tiết cho bài này.',
        rewriteHint: 'Đọc kỹ nhận xét rồi viết lại bài này. Viết lại chính đề cũ là cách nhanh nhất để thấy mình tiến bộ ở đâu.',
        rewriteThis: 'Viết lại bài này',
        allTasks: 'Tất cả đề',
        historyTitle: 'Bài đã nộp',
        historyEmptyTitle: 'Chưa nộp bài nào',
        historyEmptyBody: 'Kết quả sẽ hiện ở đây sau khi bạn nộp bài.'
    },
    guestAiTrial: {
        errors: {
            disabled: 'Bản dùng thử AI cho khách hiện đang tắt.',
            tokenExpired: 'Phiên dùng thử đã hết hạn. Đang kết nối lại...',
            guestDailyLimit: 'Bạn đã dùng hết lượt AI miễn phí hôm nay. Hãy thử lại sau khi hạn mức được đặt lại.',
            ipDailyLimit: 'Mạng này đã đạt giới hạn AI miễn phí hôm nay.',
            unavailable: 'Bản dùng thử AI tạm thời chưa khả dụng. Vui lòng thử lại sau.',
            duplicateRequest: 'Yêu cầu này đã được xử lý. Vui lòng gửi yêu cầu mới.',
            generic: 'Không thể hoàn tất yêu cầu AI cho khách.'
        }
    },
    dictionary: {
        hero: {
            eyebrow: 'Thư viện từ vựng',
            title: 'Từ điển cá nhân',
            description: 'Lưu những từ quan trọng, ôn lại thật tự tin và xây dựng hệ thống từ vựng hỗ trợ hành trình IELTS của bạn mỗi ngày.',
            offline: 'Ngoại tuyến',
            localModeHint: 'Từ vựng hiện đang được lưu trên thiết bị này. Hãy đăng nhập để đồng bộ lên đám mây.'
        },
        actions: {
            review: 'Ôn tập ngay',
            addWord: 'Thêm từ vựng',
            tryAgain: 'Thử lại'
        },
        searchPlaceholder: 'Tìm theo từ hoặc nghĩa…',
        filters: {
            all: 'Tất cả',
            favorite: 'Ưa thích',
            verb: 'Động từ',
            noun: 'Danh từ',
            adjective: 'Tính từ'
        },
        list: {
            eyebrow: 'Từ đã lưu',
            title: 'Bộ sưu tập từ vựng của bạn',
            subtitle: '{{count}} từ đang sẵn sàng để bạn ôn lại và ghi nhớ sâu hơn.',
            subtitle_one: '{{count}} từ đã lưu',
            subtitle_other: '{{count}} từ đã lưu'
        },
        stats: {
            eyebrow: 'Tiến độ',
            title: 'Tổng quan học tập',
            totalWords: 'Từ đã lưu',
            masteredWords: 'Đã thành thạo'
        },
        reviewCard: {
            dueTitle: '{{count}} từ đến hạn hôm nay',
            doneTitle: 'Hôm nay bạn đã hoàn thành rồi',
            dueDescription: 'Chỉ cần một lượt ôn ngắn lúc này cũng sẽ giúp bạn ghi nhớ lâu hơn rất nhiều.',
            doneDescription: 'Tuyệt lắm. Bạn đã hoàn thành toàn bộ lượt ôn từ vựng trong hôm nay.',
            cta: 'Bắt đầu ôn tập',
            doneCta: 'Đã xong hôm nay',
            dueTitle_one: '{{count}} từ đến hạn hôm nay',
            dueTitle_other: '{{count}} từ đến hạn hôm nay'
        },
        tip: {
            eyebrow: 'Mẹo học tập',
            title: 'Lưu từ ngay khi vừa gặp',
            description: 'Hãy thêm từ mới ngay sau khi bắt gặp trong bài Reading hoặc Listening. Thói quen nhỏ này sẽ giúp việc ôn tập sau đó hiệu quả hơn rất nhiều.'
        },
        errorTitle: 'Chưa thể tải từ điển của bạn',
        errorDescription: 'Hãy thử lại sau một chút nhé. Hệ thống sẽ sẵn sàng để bạn tiếp tục học ngay khi dữ liệu được tải xong.',
        empty: {
            title: 'Chưa tìm thấy từ phù hợp',
            description: 'Bạn có thể thử bộ lọc khác, hoặc bắt đầu xây dựng từ điển bằng từ đầu tiên mình muốn ghi nhớ.',
            cta: 'Thêm từ đầu tiên'
        },
        drawer: {
            eyebrow: 'Chi tiết từ',
            title: 'Góc nhìn từ vựng',
            examples: {
                eyebrow: 'Ngữ cảnh dùng',
                title: 'Ví dụ'
            },
            tags: {
                eyebrow: 'Phân loại',
                title: 'Gắn thẻ'
            },
            note: {
                eyebrow: 'Ghi nhớ',
                title: 'Ghi chú của bạn'
            },
            messages: {
                favoriteSuccess: 'Đã thêm vào yêu thích.',
                unfavoriteSuccess: 'Đã bỏ khỏi yêu thích.',
                favoriteError: 'Đã có lỗi khi cập nhật trạng thái yêu thích.',
                deleteSuccess: 'Đã xóa từ khỏi từ điển của bạn.',
                deleteError: 'Chưa thể xóa từ này lúc này.'
            },
            deleteConfirm: {
                title: 'Xóa từ này?',
                description: 'Từ này sẽ được xóa khỏi từ điển cá nhân của bạn.',
                confirm: 'Xóa'
            },
            deleteButton: 'Xóa khỏi từ điển'
        },
        reviewPage: {
            eyebrow: 'Ôn tập từ điển',
            description: 'Ôn tập từ vựng của bạn một cách hiệu quả.',
            loading: 'Đang chuẩn bị phiên ôn tập...',
            progressLabel: 'Tiến độ ôn tập',
            footnote: 'Mỗi lần chấm điểm sẽ cập nhật lịch ôn tập thông minh cho từ đó.',
            actions: {
                backToDictionary: 'Quay lại Từ điển'
            },
            messages: {
                loadError: 'Không tải được danh sách ôn tập.',
                gradeError: 'Lỗi khi chấm điểm.'
            },
            empty: {
                title: 'Tất cả từ vựng đã được ôn tập',
                description: 'Tuyệt vời! Bạn không còn từ nào cần ôn tập hôm nay. Nghỉ một chút và quay lại sau để tiếp tục giữ nhịp học.'
            },
            finished: {
                title: 'Chúc mừng!',
                description: 'Bạn đã hoàn thành phiên ôn tập với {{count}} từ vựng. Nhịp độ rất tốt, giữ vững phong độ này nhé.',
                xpLabel: 'Điểm kinh nghiệm nhận được'
            },
            flashcard: {
                pronounce: 'Phát âm',
                prompt: 'Bạn có nhớ từ này không?',
                flipHint: 'Bấm để xem nghĩa',
                gradePrompt: 'Bạn nhớ từ này ở mức nào?',
                grades: {
                    again: {
                        label: 'Quên mất',
                        sublabel: 'Ôn lại ngay'
                    },
                    hard: {
                        label: 'Còn khó',
                        sublabel: 'Cố lên nào'
                    },
                    good: {
                        label: 'Khá ổn',
                        sublabel: 'Tốt lắm'
                    },
                    easy: {
                        label: 'Dễ quá',
                        sublabel: 'Xuất sắc'
                    }
                }
            }
        },
        subtitle: 'Sổ tay từ vựng — từ mới thêm hiện lên đầu; bộ lọc "hay quên" xếp theo từ cần ôn tới hạn trước',
        statTotal: 'Tổng số từ',
        statDue: 'Cần ôn hôm nay',
        statLearning: 'Đang học',
        statMastered: 'Đã nhớ',
        startReview: 'Ôn tập',
        addWord: 'Thêm từ',
        fieldWord: 'Từ',
        fieldMeaning: 'Nghĩa',
        fieldNote: 'Ghi chú',
        searchLabel: 'Tìm từ trong sổ tay',
        memoryFilterLabel: 'Lọc theo mức ghi nhớ',
        filterAll: 'Tất cả',
        filterForgetful: 'Hay quên',
        filterNew: 'Từ mới',
        filterLearning: 'Đang học',
        filterMastered: 'Đã nhớ',
        tierLow: 'Hay quên',
        tierMid: 'Đang nhớ',
        tierHigh: 'Đã nhớ',
        masteryAria: 'Mức ghi nhớ {{level}}/{{total}} — {{tier}}',
        favorite: 'Đánh dấu yêu thích',
        unfavorite: 'Bỏ yêu thích',
        reviewCount: 'Số lần ôn',
        nextReview: 'Lần ôn tới',
        dueNow: 'Đã tới hạn',
        notScheduled: 'Chưa lên lịch',
        ttsNote: 'Nút nghe dùng giọng đọc sẵn có của trình duyệt.',
        emptyTitle: 'Sổ tay đang trống',
        emptyBody: 'Lưu từ mới khi bạn gặp trong bài đọc hoặc bài nghe, rồi ôn lại theo lịch.',
        noMatchTitle: 'Không tìm thấy từ nào',
        noMatchBody: 'Thử từ khoá khác, hoặc bỏ bộ lọc để xem toàn bộ sổ tay.',
        clearFilters: 'Bỏ bộ lọc',
        reviewTitle: 'Ôn tập từ vựng',
        reviewProgress: '{{done}} / {{total}} từ',
        reviewProgressLabel: 'Tiến độ ôn tập',
        listen: 'Nghe',
        showMeaning: 'Hiện nghĩa',
        meaningLabel: 'Nghĩa',
        howWell: 'Bạn nhớ từ này tới đâu?',
        recallForgot: 'Quên',
        recallForgotHint: 'Ôn lại sớm',
        recallHard: 'Khó',
        recallHardHint: 'Giữ nguyên mức',
        recallGood: 'Được',
        recallGoodHint: 'Lên một mức',
        recallEasy: 'Dễ',
        recallEasyHint: 'Lên hai mức',
        savingReview: 'Đang lưu…',
        nextReviewIs: 'Lần ôn tới: {{date}}',
        reviewEmptyTitle: 'Hôm nay không có từ nào cần ôn',
        reviewEmptyBody: 'Chu kỳ ôn tập dựa trên mức ghi nhớ của từng từ. Quay lại khi tới hạn, hoặc thêm từ mới.',
        backToNotebook: 'Về sổ tay',
        reviewDoneTitle: 'Xong lượt ôn hôm nay',
        reviewDoneBody: 'Bạn vừa ôn {{count}} từ. Lịch ôn tiếp theo đã được cập nhật.',
        reviewDoneLexi: 'Lexi chúc mừng hoàn thành lượt ôn'
    },
    landing: {
        navbar: {
            features: 'Tính năng',
            skills: 'Kỹ năng',
            aiCoach: 'AI Coach',
            gamification: 'Gamification',
            faq: 'FAQ',
            login: 'Đăng nhập',
            startFree: 'Bắt đầu miễn phí',
            openApp: 'Vào ứng dụng',
            menu: 'Menu'
        },
        hero: {
            badge: 'Học tiếng Anh với AI',
            titlePrefix: 'Học tiếng Anh. Chinh phục IELTS.',
            titleHighlight: 'Với trợ lý AI đồng hành bên bạn.',
            description: 'Luyện từ vựng, Listening, Reading, Writing và Speaking với phản hồi AI tức thì — đề thi cá nhân hóa, hội thoại AI tức thì, phân tích giọng nói và động lực học mỗi ngày.',
            primaryCta: 'Bắt đầu học miễn phí',
            secondaryCta: 'Dùng thử AI coach',
            exploreCta: 'Khám phá tính năng',
            appName: 'EN Practice',
            appSlogan: 'Trợ lý AI cho hành trình tiếng Anh & IELTS của bạn',
            mockup: {
                goalLabel: 'Mục tiêu hôm nay',
                goalProgress: '35 / 50 phút đã học',
                coachMessage: 'Bài Writing của bạn đang ở band 6.5. Làm Task 2 chủ đề giáo dục hôm nay để lên 7.0.',
                writingScore: 'Writing 6.5',
                speakingScore: 'Speaking 6.0',
                gradingTitle: 'AI chấm điểm',
                gradingHint: 'Band điểm + nhận xét',
                instantTitle: 'AI tức thì',
                instantHint: 'Trả lời ngay'
            }
        },
        stats: {
            skills: {
                value: '4',
                label: 'kỹ năng IELTS',
                hint: 'Listening · Reading · Writing · Speaking'
            },
            ai: {
                value: 'AI',
                label: 'chấm điểm & phản hồi',
                hint: 'Writing, Speaking & từ vựng'
            },
            instant: {
                value: 'Tức thì',
                label: 'hội thoại AI',
                hint: 'Phản hồi trực tiếp, không chờ đợi'
            },
            free: {
                value: 'Miễn phí',
                label: 'để bắt đầu học',
                hint: 'Có cả bản dùng thử không cần đăng nhập'
            }
        },
        features: {
            title: 'Trợ lý AI đồng hành cùng bạn',
            description: 'Từ chấm điểm đến hội thoại, AI hiện diện ở từng bước trong hành trình học của bạn.',
            items: {
                grading: {
                    title: 'Chấm Writing & Speaking bằng AI',
                    description: 'Nhận điểm band và phản hồi chi tiết cho bài Writing và Speaking của bạn ngay sau khi nộp bài.'
                },
                chat: {
                    title: 'Chat AI tức thì',
                    description: 'Trò chuyện với Lexi, trợ lý tiếng Anh AI của bạn, để được giải thích, dịch và hướng dẫn ngữ pháp tức thì — phản hồi trực tiếp từng dòng.'
                },
                vocabTest: {
                    title: 'Đề từ vựng do AI tạo',
                    description: 'AI tạo đề riêng từ chính từ đã lưu, lịch sử ôn tập và những từ bạn vừa tra cứu.'
                },
                speech: {
                    title: 'Phân tích giọng nói',
                    description: 'Theo dõi số từ, tốc độ nói, khoảng dừng và từ đệm để bạn nói tự nhiên hơn.'
                },
                recommendation: {
                    title: 'Gợi ý thông minh',
                    description: 'Đề xuất bài luyện được cá nhân hóa dựa trên mục tiêu, kỹ năng yếu và tiến độ của bạn.'
                },
                dictionary: {
                    title: 'Từ điển cá nhân',
                    description: 'Lưu, sắp xếp và ôn tập những từ quan trọng với bạn, kèm giải thích AI bất cứ lúc nào.'
                }
            },
            chatMockup: {
                heading: 'Gặp Lexi, trợ lý tiếng Anh AI của bạn',
                status: 'Trực tuyến',
                hint: 'Luyện tập đúng cách bạn giao tiếp thật — Lexi trả lời tức thì và điều chỉnh theo trình độ của bạn.',
                user: 'Làm sao để cải thiện kỹ năng nói?',
                ai: 'Hãy bắt đầu với những phiên ngắn mỗi ngày: đọc to một chủ đề IELTS, ghi âm lại và xem phản hồi về giọng nói. Bạn muốn thử ngay cùng tôi không?',
                typing: 'Lexi đang nhập...'
            }
        },
        skills: {
            title: 'Làm chủ cả 4 kỹ năng',
            description: 'Luyện tập bài bản theo cấu trúc đề IELTS thật, kèm từ vựng mỗi ngày để xây nền tảng vững chắc.',
            items: {
                listening: {
                    title: 'Listening',
                    description: 'Luyện theo từng section với cấu trúc đề thật và xem transcript sau mỗi lượt làm bài.'
                },
                reading: {
                    title: 'Reading',
                    description: 'Đa dạng dạng câu hỏi với chấm điểm tức thì và ước tính band điểm.'
                },
                writing: {
                    title: 'Writing',
                    description: 'Nộp bài luận và nhận chấm điểm AI với phản hồi chi tiết và band điểm đề xuất.'
                },
                speaking: {
                    title: 'Speaking',
                    description: 'Trả lời chủ đề hoặc trò chuyện nhiều lượt với AI, sau đó xem phân tích giọng nói.'
                },
                vocabulary: {
                    title: 'Từ vựng',
                    description: 'Học từ mỗi ngày, giải thích bằng AI và phiên ôn tập thông minh thích ứng với bạn.'
                }
            }
        },
        gamification: {
            title: 'Học tập khiến bạn muốn quay lại mỗi ngày',
            description: 'XP, streak, bảng xếp hạng và phần thưởng biến việc luyện tập đều đặn thành thói quen.',
            items: {
                xp: 'XP & cấp độ',
                streak: 'Chuỗi ngày học liên tiếp',
                leaderboard: 'Bảng xếp hạng',
                rewards: 'Phần thưởng & điểm danh',
                weeklyReport: 'Báo cáo tuần'
            }
        },
        howItWorks: {
            title: 'Bắt đầu cải thiện chỉ với 3 bước',
            steps: {
                signup: {
                    title: 'Tạo tài khoản',
                    description: 'Đăng ký trong vài giây và đặt mục tiêu IELTS của bạn.'
                },
                practice: {
                    title: 'Học một chút mỗi ngày',
                    description: 'Làm bài kiểm tra từ vựng nhanh, bài nghe ngắn, hoặc trò chuyện với AI chỉ trong vài phút.'
                },
                grow: {
                    title: 'Nhìn thấy tiến bộ thật',
                    description: 'Theo dõi band điểm, streak, XP và báo cáo tuần khi AI liên tục tinh chỉnh gợi ý cho bạn.'
                }
            }
        },
        faq: {
            title: 'Có câu hỏi? Chúng tôi có câu trả lời',
            items: [
                {
                    q: 'EN Practice có miễn phí không?',
                    a: 'Có — trải nghiệm học cốt lõi hoàn toàn miễn phí để bắt đầu. Bạn có thể đăng ký và luyện tập ngay.'
                },
                {
                    q: 'Tôi có cần đăng nhập để dùng thử AI không?',
                    a: 'Không. Bạn có thể dùng thử AI chat và giải thích từ vựng khi chưa đăng nhập; tiến độ được lưu trên thiết bị. Đăng nhập để đồng bộ toàn bộ giữa các thiết bị.'
                },
                {
                    q: 'AI chấm điểm hoạt động như thế nào?',
                    a: 'AI đánh giá bài Writing và Speaking của bạn theo tiêu chí chuẩn IELTS và trả về band điểm kèm phản hồi chi tiết ngay sau khi bạn nộp bài.'
                },
                {
                    q: 'Tôi có thể luyện những kỹ năng IELTS nào?',
                    a: 'Listening, Reading, Writing và Speaking, kèm luyện từ vựng mỗi ngày để hỗ trợ cả bốn kỹ năng.'
                },
                {
                    q: 'Tôi có thể luyện nói với AI không?',
                    a: 'Có. Bạn có thể trả lời chủ đề IELTS hoặc trò chuyện tự do nhiều lượt với AI, sau đó xem lại phân tích độ lưu loát của mình.'
                }
            ]
        },
        cta: {
            title: 'Sẵn sàng học cùng trợ lý AI bên cạnh?',
            description: 'Tham gia EN Practice hôm nay — bắt đầu miễn phí và AI coach luôn sẵn sàng bất cứ khi nào bạn cần.',
            primaryCta: 'Bắt đầu học miễn phí',
            secondaryCta: 'Dùng thử AI coach'
        },
        footer: {
            tagline: 'Người đồng hành học tiếng Anh & IELTS được hỗ trợ bởi AI.',
            product: 'Sản phẩm',
            resources: 'Tài nguyên',
            account: 'Tài khoản',
            productLinks: [
                'Tính năng',
                'Kỹ năng',
                'AI Coach',
                'Gamification'
            ],
            resourceLinks: [
                'AI Chat',
                'Kiểm tra từ vựng',
                'Đề thi IELTS',
                'Từ điển'
            ],
            accountLinks: [
                'Đăng nhập',
                'Tạo tài khoản'
            ],
            copyright: '© {{year}} EN Practice. Bảo lưu mọi quyền.'
        },
        navLabel: 'Điều hướng trang giới thiệu',
        navHow: 'Cách hoạt động',
        navFree: 'Miễn phí',
        navFaq: 'Câu hỏi thường gặp',
        goToApp: 'Vào học',
        startFree: 'Bắt đầu học',
        eyebrow: 'Luyện IELTS cho học sinh, sinh viên',
        headline: 'Luyện IELTS theo cách bạn thật sự hiểu mình đang yếu ở đâu',
        subtext: 'Làm đề, viết, nói và ôn từ vựng — mỗi phần đều chỉ ra cụ thể cần sửa gì.',
        guestCaveat: 'Học thử không cần tài khoản, có giới hạn lượt mỗi ngày.',
        noCard: 'Không cần thẻ, không tự động trừ tiền.',
        mockCaption: 'Minh hoạ sản phẩm, không phải bài làm của người dùng thật.',
        skillsTitle: 'Bốn kỹ năng, một chỗ',
        skillsBody: 'Mỗi kỹ năng có cách luyện riêng, nhưng đều dựa trên cùng một nguyên tắc: phải nói rõ bạn sai ở đâu.',
        skillReadingTitle: 'Đọc & Nghe',
        skillReadingBody: 'Làm đề theo cấu trúc thi thật, có đồng hồ và xem lại từng câu sau khi nộp.',
        skillSpeakingTitle: 'Nói',
        skillSpeakingBody: 'Ghi âm theo đề, nhận điểm bốn tiêu chí và các số đo như tốc độ nói, số từ đệm.',
        skillWritingTitle: 'Viết',
        skillWritingBody: 'Nộp bài và nhận nhận xét theo bốn tiêu chí, kèm gợi ý viết lại chính đề đó.',
        skillVocabTitle: 'Từ vựng',
        skillVocabBody: 'Sổ tay sắp theo mức ghi nhớ, ôn đúng lúc sắp quên, và test tạo từ vốn từ của bạn.',
        vocabTitle: 'Gặp một từ lạ? Tra và hiểu ngay trong câu của bạn',
        vocabBody: 'Dán câu bạn gặp từ đó vào, phần giải thích sẽ bám theo ngữ cảnh của bạn thay vì in một định nghĩa chung.',
        tryLookup: 'Thử tra một từ',
        howTitle: 'Cách hoạt động',
        step1Title: 'Chọn việc bạn cần luyện',
        step1Body: 'Làm một đề, viết một bài, nói một lượt, hay ôn vài từ đang sắp quên.',
        step2Title: 'Làm và nộp',
        step2Body: 'Đồng hồ và cấu trúc giống thi thật, để bạn quen với áp lực thời gian.',
        step3Title: 'Đọc kỹ phần sửa',
        step3Body: 'Mỗi bài đều chỉ ra chỗ cụ thể cần sửa. Đây là phần bạn học được nhiều nhất.',
        freeTitle: 'Phần nào miễn phí, phần nào không',
        freeBody: 'Chúng tôi nói rõ ngay ở đây thay vì để bạn tự phát hiện. Phần học cốt lõi thì miễn phí; chỉ những việc gọi tới AI mới tốn credit.',
        freeColumnTitle: 'Miễn phí',
        freeItem1: 'Làm đề IELTS và xem lại từng câu',
        freeItem2: 'Sổ tay từ vựng và ôn theo lịch',
        freeItem3: 'Báo cáo tiến độ hằng tuần',
        freeItem4: 'Học thử không cần tài khoản',
        paidColumnTitle: 'Tốn credit',
        paidItem1: 'AI giải thích từ vựng theo ngữ cảnh',
        paidItem2: 'Chấm bài Writing theo bốn tiêu chí',
        paidItem3: 'Chấm bài Speaking và phân tích bản ghi',
        seeCosts: 'Xem bảng chi phí',
        faqTitle: 'Câu hỏi thường gặp',
        faqFreeQ: 'Phần học cốt lõi có thật sự miễn phí không?',
        faqFreeA: 'Có. Làm đề, sổ tay từ vựng, ôn theo lịch và báo cáo tiến độ đều miễn phí. Chỉ những việc phải gọi tới AI — giải thích từ, chấm Writing, chấm Speaking — mới tốn credit, và bạn thấy số credit ngay trên nút trước khi bấm.',
        faqPaidQ: 'Credit là gì và tôi tiêu vào đâu?',
        faqPaidA: 'Credit là đơn vị dùng cho các phần AI. Bảng chi phí đầy đủ nằm trong mục Credit, và mỗi nút tốn credit đều ghi rõ số lượng trước khi bạn bấm.',
        faqBandQ: 'Điểm trên nền tảng có phải điểm thi thật không?',
        faqBandA: 'Không. Điểm bạn thấy là band ước tính từ dữ liệu luyện tập trên nền tảng, không phải kết quả thi chính thức. Chúng tôi không hứa hẹn band sẽ tăng bao nhiêu.',
        faqStreakQ: 'Nếu tôi bỏ một ngày thì sao?',
        faqStreakA: 'Không sao. Mỗi tháng bạn có 2 ngày nghỉ được áp dụng tự động và không thể mua thêm. Chuỗi ngày học là để bạn theo dõi thói quen, không phải một khoản nợ.',
        ctaTitle: 'Bắt đầu bằng một bài ngắn hôm nay',
        ctaBody: 'Không cần thẻ. Bạn có thể học thử trước, rồi tạo tài khoản khi thấy hợp.'
    },
    nav: {
        primary: 'Điều hướng chính',
        more: 'Khác',
        home: 'Trang chủ',
        learn: 'Học',
        practice: 'Luyện tập',
        progress: 'Tiến độ',
        account: 'Cá nhân',
        path: 'Lộ trình học',
        dictionary: 'Sổ tay từ vựng',
        vocabCheck: 'Tra từ & hỏi AI',
        vocabTest: 'Test từ vựng',
        writing: 'Luyện Writing',
        speaking: 'Luyện Speaking',
        customSpeaking: 'Hội thoại tự chọn',
        aiChat: 'AI Coach',
        challenges: 'Thử thách tuần',
        leaderboard: 'Bảng xếp hạng',
        rewards: 'Phần thưởng',
        credits: 'Ví credit',
        notifications: 'Thông báo',
        settings: 'Cài đặt'
    },
    login: {
        modeLabel: 'Chế độ đăng nhập',
        register: 'Đăng ký',
        subtitle: 'Tiếp tục lộ trình học của bạn.',
        displayName: 'Tên hiển thị',
        email: 'Email',
        password: 'Mật khẩu',
        passwordHint: 'Ít nhất 8 ký tự.',
        errorCredentials: 'Email hoặc mật khẩu không đúng',
        or: 'hoặc',
        guestTrial: 'Học thử không cần tài khoản',
        guestNote: 'Chế độ học thử dùng AI trong hạn mức mỗi ngày và không lưu tiến độ.',
        heroTitle: 'Chào bạn, mình là Lexi.',
        heroBody: 'Mình sẽ giữ nhịp học cho bạn và chỉ ra lỗi trên chính bài bạn làm.',
        lexiGreeting: 'Lexi chào bạn',
        benefit1: 'Phản hồi theo tiêu chí chấm IELTS',
        benefit2: 'Sổ tay từ vựng biết bạn quên từ nào',
        benefit3: 'Kế hoạch ngày gọn trong 10 phút',
        illustrationNote: 'Đây là minh hoạ giao diện. Không có số liệu người dùng thật.'
    },
    vocabTest: {
        title: 'Test từ vựng',
        subtitle: 'Bài test do AI tạo từ vốn từ của chính bạn',
        generateTitle: 'Tạo bài test mới',
        generateBody: 'Bài test được tạo từ vốn từ bạn đã lưu, đã tra hoặc đã học.',
        generateCount: '{{count}} câu',
        generatingNow: 'Đang tạo bài test…',
        generateFailedBody: 'Không tạo được bài test lúc này. Thử lại sau một chút.',
        notEnoughDataTitle: 'Chưa đủ dữ liệu để tạo bài test',
        notEnoughDataBody: 'Bài test được tạo từ vốn từ của bạn, nên cần ít nhất một vài từ trước. Lưu vài từ vào sổ tay rồi quay lại nhé.',
        openDictionary: 'Mở sổ tay từ vựng',
        sourcesNote: 'Nguồn từ: {{sources}}',
        source: {
            VOCABULARY_RECORD: 'Từ đã học',
            USER_DICTIONARY: 'Sổ tay',
            USER_WORD_LOOKUP_EVENT: 'Từ đã tra',
            ALL: 'Tất cả nguồn'
        },
        sourceOther: 'Nguồn khác',
        statusGenerating: 'Đang tạo',
        statusFailed: 'Tạo lỗi',
        statusReady: 'Sẵn sàng',
        waitForReady: 'Đang tạo, chờ chút…',
        viewFailed: 'Xem chi tiết',
        untitled: 'Bài test chưa có tên',
        questionCount: '{{count}} câu',
        questionCountLabel: 'Số câu',
        attemptCount: 'Đã làm {{count}} lần',
        start: 'Bắt đầu',
        historyLink: 'Lịch sử làm bài',
        emptyTitle: 'Chưa có bài test nào',
        emptyBody: 'Tạo bài test đầu tiên từ vốn từ của bạn.',
        takingTitle: 'Làm bài test từ vựng',
        progress: 'Đã trả lời {{done}} / {{total}}',
        questionOf: 'Câu {{number}} / {{total}}',
        check: 'Kiểm tra',
        submit: 'Nộp bài',
        choiceRecorded: 'Đã ghi nhận lựa chọn',
        choiceRecordedBody: 'Bạn chọn {{option}}. Đáp án đúng sẽ hiện sau khi nộp bài.',
        emptyPaperTitle: 'Bài test này chưa có câu hỏi',
        emptyPaperBody: 'Bài có thể chưa tạo xong. Quay lại danh sách và thử lại.',
        resultNoAttemptTitle: 'Chưa chọn bài làm nào',
        resultNoAttemptBody: 'Mở kết quả từ lịch sử để xem lại bài đã làm.',
        resultEmptyTitle: 'Không có dữ liệu bài làm',
        resultEmptyBody: 'Bài làm này có thể đã bị xoá hoặc chưa chấm xong.',
        lexiResult: 'Lexi nhận xét kết quả',
        wrongSummary: 'Có {{count}} từ cần ôn lại. Xem bên dưới.',
        answerReview: 'Chi tiết từng câu',
        anotherTest: 'Làm bài khác',
        historyEmptyTitle: 'Chưa có lần làm bài nào',
        historyEmptyBody: 'Kết quả sẽ xuất hiện ở đây sau khi bạn nộp bài.',
        attemptsStat: 'Lần làm bài',
        averageStat: 'Trung bình',
        bestStat: 'Cao nhất',
        correctOf: 'Đúng {{correct}}/{{total}}'
    },
    vocabCheck: {
        subtitle: 'Tra từ và để AI giải thích theo đúng câu bạn đang gặp',
        wordLabel: 'Từ cần tra',
        wordPlaceholder: 'Nhập một từ tiếng Anh…',
        contextLabel: 'Câu hoặc ngữ cảnh (không bắt buộc)',
        contextPlaceholder: 'Dán câu bạn gặp từ này vào đây…',
        contextHint: 'Có ngữ cảnh thì phần giải thích sẽ bám vào câu của bạn thay vì in định nghĩa chung.',
        explain: 'Giải thích',
        explainWithCost: 'Giải thích · {{amount}} credit',
        freeNote: 'Các phần học cốt lõi không tốn credit; chỉ phần AI giải thích mới tính.',
        insufficient: 'Cần {{need}} credit, bạn đang có {{have}}.',
        wordRequired: 'Nhập một từ trước đã.',
        wordTooLong: 'Từ chỉ dài tối đa 100 ký tự.',
        quotaReached: 'Bạn đã dùng hết lượt thử miễn phí hôm nay. Đăng nhập để tiếp tục.',
        connecting: 'Đang kết nối tới máy chủ AI…',
        statusStreaming: 'Đang viết',
        statusComplete: 'Xong',
        statusError: 'Lỗi',
        streamError: 'Không lấy được phần giải thích',
        saveToNotebook: 'Lưu vào sổ tay',
        saved: 'Đã lưu vào sổ tay',
        savedFromExplain: 'Lưu từ phần AI giải thích',
        recent: 'Tra gần đây',
        reopen: 'Xem lại',
        intro: 'Nhập một từ để xem nghĩa, cách dùng và những chỗ dễ nhầm. Có thêm câu ngữ cảnh thì phần giải thích sẽ sát với câu của bạn hơn.',
        goToNotebook: 'Mở sổ tay từ vựng'
    },
    weekly: {
        subtitle: 'Báo cáo tuần được tổng hợp từ dữ liệu luyện tập thật của bạn',
        thisWeek: 'Tuần này',
        period: '{{from}} – {{to}}',
        headline: 'Bạn đã học {{count}} phút tuần này',
        measuredNote: 'Mọi con số ở đây là đo được từ dữ liệu luyện tập, không phải dự đoán.',
        studyMinutes: 'Phút học',
        activeDays: 'Ngày có học',
        sessions: 'Lượt học',
        xp: 'XP',
        dailyTitle: 'Từng ngày trong tuần',
        dailyNote: 'Chiều cao cột là thời gian học. Ngày nghỉ vẫn hiện rõ, không bị coi là thiếu dữ liệu.',
        day_ACTIVE: '{{date}}: học {{count}} phút',
        day_PARTIAL: '{{date}}: học ít, {{count}} phút',
        day_REST: '{{date}}: ngày nghỉ',
        day_NONE: '{{date}}: không có hoạt động',
        highlightsTitle: 'Điểm đáng chú ý',
        thisWeekValue: 'Tuần này: {{value}} {{unit}}',
        delta: '{{value}} so với tuần trước',
        highlight: {
            TOTAL_STUDY: 'Tổng thời gian học',
            ACTIVE_DAYS: 'Số ngày có học',
            XP_EARNED: 'XP kiếm được',
            IELTS_ACCURACY: 'Độ chính xác IELTS',
            VOCAB_REVIEW_ACCURACY: 'Độ chính xác ôn từ vựng',
            WORDS_LEARNED: 'Từ mới học được',
            WRITING_BAND: 'Band Writing ước tính',
            SPEAKING_BAND: 'Band Speaking ước tính'
        },
        modulesTitle: 'Theo kỹ năng',
        moduleIelts: 'IELTS',
        moduleSpeaking: 'Speaking',
        moduleWriting: 'Writing',
        moduleVocabulary: 'Từ vựng',
        moduleMinutes: '{{count}} phút',
        moduleNoActivity: 'Tuần này chưa có hoạt động',
        moduleStatus: {
            ACTIVE: 'Có học',
            NO_DATA: 'Chưa có dữ liệu',
            INACTIVE: 'Không học'
        },
        open: 'Mở',
        notReadyTitle: 'Báo cáo tuần chưa sẵn sàng',
        notReadyBody: 'Báo cáo được tổng hợp sau khi tuần kết thúc. Cứ học tiếp, báo cáo sẽ xuất hiện ở đây.'
    },
    profile: {
        unnamed: 'Người học',
        emptyTitle: 'Chưa tải được hồ sơ',
        emptyBody: 'Thử tải lại trang. Nếu vẫn không được, kiểm tra kết nối mạng.',
        levelChip: 'Cấp {{level}}',
        bandChip: 'Band {{value}}',
        studyMinutes: 'Phút đã học',
        wordsLearned: 'Từ đã học',
        lessons: 'Hoạt động',
        weeklyXp: 'XP tuần này',
        goalsTitle: 'Mục tiêu học tập',
        targetBand: 'Band mục tiêu',
        currentBand: 'Hiện tại {{value}}',
        examDate: 'Ngày thi dự kiến',
        daysLeft: 'Còn {{count}} ngày',
        datePassed: 'Đã qua ngày này',
        noGoalBody: 'Bạn chưa đặt band mục tiêu hay ngày thi. Đặt mục tiêu giúp phần tiến độ có cái để so, thay vì một thanh trống.',
        setGoal: 'Đặt mục tiêu',
        dailyGoal: '{{count}} phút mỗi ngày',
        weeklyWords: '{{count}} từ mỗi tuần',
        levelTitle: 'Cấp của Lexi',
        levelOf: 'Cấp {{level}} → {{next}}',
        levelAria: 'Tiến độ lên cấp: {{into}} trên {{needed}} XP',
        xpToNext: 'Còn {{needed}} XP nữa để lên cấp (đã có {{into}})',
        xpExplainer: 'XP đến từ việc học thật: hoàn thành bài test, nộp bài Writing hoặc Speaking, và ôn từ vựng đúng hạn.',
        levelCosmetic: 'Cấp chỉ để đổi diện mạo Lexi. Không có tính năng nào bị khoá sau cấp, nên bạn không cần cày XP.',
        activityTitle: 'Hoạt động gần đây',
        activityEmpty: 'Chưa có hoạt động nào. Làm một bài ngắn để bắt đầu.',
        xpEarned: '+{{count}} XP',
        streakCalm: 'Chuỗi hiện tại {{current}} ngày, dài nhất {{longest}} ngày. Nghỉ một ngày cũng không sao — chuỗi không phải một khoản nợ.',
        graceDays: '2 ngày nghỉ mỗi tháng',
        rankNote: 'Bạn đang ở hạng {{rank}} trên bảng tuần này.',
        rankUnranked: 'Tuần này bạn chưa có điểm xếp hạng. Học một bài là có mặt trên bảng.'
    },
    settings: {
        subtitle: 'Tuỳ chỉnh nhắc học, giao diện và dữ liệu của bạn',
        sectionsLabel: 'Các mục cài đặt',
        sectionReminders: 'Nhắc học & chuỗi',
        sectionLearning: 'Việc học',
        sectionAppearance: 'Giao diện',
        sectionData: 'Dữ liệu',
        pauseAll: 'Tạm dừng tất cả nhắc học',
        pauseAllHelp: 'Tắt toàn bộ thông báo và nhắc học. Bật lại sẽ khôi phục đúng những mục bạn đã bật trước đó.',
        pausedChip: 'Đang tạm dừng',
        streakTracking: 'Tắt theo dõi chuỗi ngày',
        streakTrackingHelp: 'Khi tắt, số ngày học liên tiếp sẽ hiện như một tính năng đã tắt, không phải một khoản nợ đang chờ bạn trả.',
        graceDaysTitle: 'Ngày nghỉ tự động',
        graceDaysBody: 'Mỗi tháng bạn có 2 ngày nghỉ được áp dụng tự động, không cần báo trước. Số ngày này không thể mua thêm và không ảnh hưởng gì tới tiến độ.',
        individualReminders: 'Từng loại nhắc học',
        syncedNote: 'Những mục này được lưu vào tài khoản của bạn.',
        notify: {
            allowVocabularyReminder: 'Nhắc ôn từ vựng',
            allowGradingResult: 'Báo khi chấm xong bài',
            allowProgressReminder: 'Nhắc tiến độ học',
            allowWeeklySummary: 'Báo cáo tuần',
            allowXpRewardNotification: 'Thông báo XP',
            allowLeaderboardNotification: 'Thông báo bảng xếp hạng',
            allowPersonalizedRecommendation: 'Gợi ý cá nhân hoá',
            allowNewContentNotification: 'Nội dung mới',
            allowReengagementNotification: 'Nhắc quay lại học',
            allowBandImprovementNotification: 'Thay đổi band ước tính',
            allowAdminBroadcast: 'Thông báo từ hệ thống'
        },
        textSize: 'Cỡ chữ',
        textSizeHelp: 'Cỡ chữ áp dụng cho cả bài đọc, không chỉ phần giao diện.',
        textSizeOption: {
            medium: 'Vừa',
            large: 'Lớn',
            xlarge: 'Rất lớn'
        },
        localOnlyNote: 'Cỡ chữ được lưu trên thiết bị này. Hệ thống chưa có API lưu cỡ chữ theo tài khoản, nên thiết bị khác sẽ dùng cỡ mặc định.',
        theme: 'Chủ đề',
        themeOption: {
            light: 'Sáng',
            dark: 'Tối',
            system: 'Theo hệ thống'
        },
        themeNote: 'Bản v2 chỉ có ba lựa chọn này. Chín giao diện riêng của v1 đã được gộp lại thành một giao diện thống nhất — nếu bạn thích bộ mono cũ, đây là lý do nó không còn.',
        dataNote: 'Dữ liệu học của bạn thuộc về bạn. Các mục dưới đây cần API chưa có.',
        exportData: 'Tải dữ liệu của tôi',
        deleteChatHistory: 'Xoá lịch sử trò chuyện AI',
        dataUnavailable: 'Hai mục này đang tắt vì hệ thống chưa có API tương ứng. Chúng tôi không đặt nút hoạt động cho việc chưa làm được.',
        deleteAccount: 'Xoá tài khoản',
        deleteAccountHelp: 'Xoá tài khoản là hành động không thể hoàn tác: toàn bộ bài làm, sổ tay từ vựng và lịch sử học sẽ mất.',
        deleteAccountUnavailable: 'Chức năng xoá tài khoản chưa có API, nên hiện chưa dùng được.'
    },
    notifications: {
        unreadSummary: '{{count}} thông báo chưa đọc',
        allRead: 'Bạn đã đọc hết thông báo.',
        markAllRead: 'Đánh dấu đã đọc tất cả',
        markRead: 'Đánh dấu đã đọc',
        deleteOne: 'Xoá thông báo',
        preferences: 'Tuỳ chỉnh nhắc học',
        unread: 'chưa đọc',
        statusFilterLabel: 'Lọc theo trạng thái đọc',
        typeFilterLabel: 'Lọc theo loại thông báo',
        statusAll: 'Tất cả',
        typeAll: 'Mọi loại',
        typeOther: 'Khác',
        status: {
            UNREAD: 'Chưa đọc',
            READ: 'Đã đọc'
        },
        type: {
            VOCABULARY_REMINDER: 'Nhắc ôn từ vựng',
            VOCABULARY_TEST_READY: 'Bài test từ vựng đã xong',
            VOCABULARY_TEST_FAILED: 'Bài test từ vựng tạo lỗi',
            WRITING_RESULT_READY: 'Bài Writing đã chấm xong',
            SPEAKING_RESULT_READY: 'Bài Speaking đã chấm xong',
            SPEAKING_CONVERSATION_RESULT_READY: 'Hội thoại Speaking đã chấm xong',
            CUSTOM_CONVERSATION_RESULT_READY: 'Hội thoại tự chọn đã chấm xong',
            ADMIN_BROADCAST: 'Thông báo hệ thống'
        },
        emptyTitle: 'Chưa có thông báo nào',
        emptyBody: 'Thông báo về bài đã chấm và nhắc ôn tập sẽ hiện ở đây.',
        noMatchTitle: 'Không có thông báo nào khớp',
        noMatchBody: 'Thử bỏ bộ lọc để xem tất cả.',
        streakGrace: 'Nghỉ một ngày cũng không sao — mỗi tháng bạn có 2 ngày nghỉ được áp dụng tự động, và không thể mua thêm.'
    },
    aiChat: {
        title: 'Hỏi Lexi',
        subtitle: 'Hỏi về cách học, cách làm bài, hoặc chỗ bạn đang yếu',
        logLabel: 'Nội dung trò chuyện',
        you: 'Bạn',
        lexi: 'Lexi',
        connecting: 'Đang kết nối…',
        thinking: 'Lexi đang trả lời',
        balance: 'Còn {{count}} credit',
        send: 'Gửi',
        sendWithCost: 'Gửi · {{amount}} credit',
        costNote: 'Mỗi lượt hỏi tốn credit như hiển thị trên nút.',
        insufficient: 'Bạn không đủ credit cho lượt hỏi này.',
        composerLabel: 'Câu hỏi của bạn',
        composerPlaceholder: 'Hỏi Lexi bất cứ điều gì về việc học IELTS…',
        messageRequired: 'Nhập câu hỏi trước đã.',
        sendFailed: 'Không gửi được tin này.',
        openingWithWeakness: 'Chào bạn. Nhìn dữ liệu luyện tập gần đây, bạn đang yếu ở {{skills}}. Bạn muốn bắt đầu từ đó, hay hỏi việc khác?',
        openingNoWeakness: 'Chào bạn. Bạn đã có một ít dữ liệu luyện tập nhưng chưa đủ để mình chỉ ra chỗ yếu cụ thể. Bạn muốn luyện gì hôm nay?',
        openingNewAccount: 'Chào bạn. Mình chưa có dữ liệu luyện tập nào của bạn, nên chưa thể nói bạn yếu ở đâu — mình sẽ không đoán bừa. Bạn muốn bắt đầu với việc gì?',
        suggestion1: 'Làm sao để cải thiện Matching Headings?',
        suggestion2: 'Cho mình dàn ý cho Task 2 về giáo dục',
        suggestion3: 'Vì sao bài Writing của mình bị điểm thấp?',
        suggestion4: 'Nên luyện gì nếu chỉ có 20 phút mỗi ngày?'
    },
    challenges: {
        title: 'Thử thách tuần',
        subtitle: 'Mục tiêu ngắn trong tuần, kèm XP — không phải điều kiện bắt buộc',
        thisWeek: 'Tuần này',
        weekOf: '{{from}} – {{to}}',
        progressHeadline: 'Hoàn thành {{done}}/{{total}} thử thách tuần này',
        xpAvailable: 'Tổng {{count}} XP cho các thử thách tuần này',
        activeChip: 'Đang làm',
        inProgress: 'Đang làm',
        completed: 'Đã xong',
        granted: 'Đã trao thưởng',
        valueOf: '{{current}}/{{target}}',
        progressAria: '{{title}}: {{current}} trên {{target}}',
        remaining: 'Còn {{count}} nữa là xong.',
        completedStat: 'Đã hoàn thành',
        emptyTitle: 'Tuần này chưa có thử thách nào',
        emptyBody: 'Thử thách tuần được công bố vào đầu tuần. Cứ học bình thường, danh sách sẽ hiện ở đây.',
        optOutNote: 'Nếu bạn không muốn nhận thử thách và thông báo về chúng, có thể tắt trong phần Nhắc học & chuỗi.',
        optOutAction: 'Tắt trong cài đặt'
    },
    evaluation: {
        subtitle: 'Đánh giá năng lực dựa trên dữ liệu luyện tập thật của bạn',
        estimatedBandLabel: 'Band ước tính từ dữ liệu luyện tập',
        measuredSkills: 'Đã đo {{count}}/4 kỹ năng',
        estimateNote: 'Đây là band ước tính từ bài luyện trên nền tảng, không phải kết quả thi chính thức. Chúng tôi không hứa band sẽ tăng bao nhiêu.',
        toleranceNote: 'Sai lệch khoảng ±0.5 giữa các lần đo là bình thường.',
        noDataNote: 'Bạn chưa làm bài nào được chấm, nên chưa có band để hiển thị. Chúng tôi để dấu — thay vì ghi 0.0, vì 0.0 là một điểm số còn đây là chưa đo được.',
        skillsTitle: 'Bốn kỹ năng',
        measured: 'Đã đo',
        notMeasured: 'Chưa đo được',
        weakTitle: 'Kỹ năng cần chú ý',
        weakNote: 'Đây là các nhóm kỹ năng nền tảng đang theo dõi cho bạn, không phải danh sách lỗi bạn đã mắc.',
        noWeakSkills: 'Chưa có kỹ năng nào cần chú ý. Làm vài bài để hệ thống nhận ra điểm yếu.',
        addToPath: 'Đưa vào lộ trình',
        practiceTitle: 'Gợi ý luyện tập',
        startPractice: 'Bắt đầu',
        noPractice: 'Chưa có gợi ý nào. Làm một bài để hệ thống có dữ liệu đề xuất.',
        wordsTotal: 'Từ trong sổ tay',
        wordsReviewing: 'Đang ôn',
        wordsMastered: 'Đã nhớ'
    },
    review: {
        title: 'Ôn tập từ vựng',
        stepOf: 'Bước {{step}} / {{total}}',
        stepperLabel: 'Các bước cấu hình ôn tập',
        stepN: 'Bước {{step}}',
        headline: '{{count}} từ đến hạn · khoảng {{minutes}} phút',
        headlineBody: 'Đây là những từ sắp bị quên theo lịch ôn của bạn. Ôn đúng lúc giúp nhớ lâu hơn nhiều so với ôn lại nhiều lần.',
        nothingDueTitle: 'Hôm nay không có từ nào đến hạn',
        nothingDueBody: 'Chu kỳ ôn dựa trên mức ghi nhớ của từng từ. Bạn vẫn có thể chọn luyện nhanh bên dưới nếu muốn học thêm.',
        contentTitle: 'Ôn những từ nào',
        mode: {
            DUE: 'Từ đến hạn hôm nay',
            QUICK: 'Luyện nhanh',
            FAVORITES: 'Từ đã đánh dấu',
            WEAK: 'Từ còn yếu'
        },
        modeDueHint: 'Theo đúng lịch ôn tập.',
        modeQuickHint: 'Ôn nhẹ, không theo lịch.',
        modeFavoritesHint: 'Chỉ những từ bạn đã đánh dấu yêu thích.',
        modeWeakHint: 'Những từ đang ở mức ghi nhớ thấp.',
        wordCount: '{{count}} từ',
        aboutMinutes: '~{{count}} phút',
        directionTitle: 'Chiều ôn',
        direction: {
            EN_TO_VI: 'Anh → Việt',
            VI_TO_EN: 'Việt → Anh',
            MIXED: 'Trộn'
        },
        directionNote: 'Chiều ôn được lưu trên thiết bị này. Hệ thống chấm điểm luôn hiển thị từ tiếng Anh làm câu hỏi, nên lựa chọn này là để bạn biết trước mình sẽ gặp gì.',
        startWithDuration: 'Bắt đầu · {{count}} từ · {{minutes}} phút',
        nothingToReview: 'Không có từ nào để ôn',
        later: 'Để sau',
        scheduleNote: 'Chu kỳ ôn: 4 giờ, 1 ngày, 3 ngày, 1 tuần, 2 tuần — tuỳ theo mức ghi nhớ của từng từ. Bạn chọn "Quên" thì từ đó sẽ quay lại sớm hơn.',
        level0: 'ôn lại trong 4 giờ',
        level1: 'ôn lại sau 1 ngày',
        level2: 'ôn lại sau 3 ngày',
        level3: 'ôn lại sau 1 tuần',
        level4: 'ôn lại sau 2 tuần'
    },
    customSpeaking: {
        title: 'Hội thoại tự chọn',
        setupTitle: 'Tự chọn người bạn sẽ nói cùng',
        setupBody: 'Chọn chủ đề, phong cách và người đối thoại. Lexi sẽ nhập vai theo đúng những lựa chọn này, và sửa lại câu của bạn trong lúc trò chuyện.',
        topicLabel: 'Chủ đề',
        topicHint: 'Viết tự do — càng cụ thể thì hội thoại càng sát ý bạn.',
        topicPlaceholder: 'Ví dụ: du lịch bụi ở Đông Nam Á',
        styleLabel: 'Phong cách nói',
        personalityLabel: 'Tính cách người đối thoại',
        expertiseLabel: 'Lĩnh vực am hiểu',
        voiceLabel: 'Giọng đọc',
        gradingLabel: 'Chấm điểm hội thoại này',
        gradingHint: 'Bật để nhận điểm và nhận xét sau khi kết thúc. Tắt thì đây là buổi luyện nói không chấm — không tốn thêm gì.',
        costPerTurn: 'Mỗi lượt · {{amount}} credit',
        freeTurn: 'Miễn phí',
        sttNote: 'Trình duyệt này không nhận dạng giọng nói tự động, nên bạn sẽ gõ lại điều mình nói. Phần chấm vẫn hoạt động bình thường.',
        start: 'Bắt đầu hội thoại',
        record: 'Nói',
        stopRecording: 'Dừng và lấy nội dung',
        replyLabel: 'Lời của bạn',
        replyPlaceholder: 'Trả lời Lexi…',
        speakingNow: 'Lexi đang nói…',
        send: 'Gửi',
        sendWithCost: 'Gửi · {{amount}} credit',
        costLine: 'Mỗi lượt AI tốn {{amount}} credit · còn {{balance}} credit',
        freeLine: 'Lượt này không tốn credit.',
        insufficient: 'Bạn không đủ credit cho lượt tiếp theo.',
        gradingOn: 'Hội thoại này sẽ được chấm điểm khi bạn kết thúc.',
        gradingOff: 'Hội thoại này không chấm điểm — chỉ để luyện nói.',
        finish: 'Kết thúc',
        newConversation: 'Hội thoại mới',
        yourTurns: 'Lượt của bạn',
        turnsLeft: 'còn {{count}} lượt',
        turnsTaken: '{{count}} lượt của bạn',
        totalTurns: 'Tổng số lượt',
        turnN: 'Lượt {{number}}',
        conversationTitle: 'Hội thoại',
        noConversationTitle: 'Chưa chọn hội thoại nào',
        noConversationBody: 'Bắt đầu một hội thoại mới để xem kết quả ở đây.',
        goneTitle: 'Không có dữ liệu hội thoại',
        goneBody: 'Hội thoại này có thể đã bị xoá.',
        gradingTitle: 'Đang chấm hội thoại',
        gradingBody: 'Hệ thống đang đọc lại nội dung và cho điểm theo từng tiêu chí.',
        gradingLexi: 'Lexi đang chờ chấm hội thoại',
        notGradedNote: 'Bạn đã tắt chấm điểm cho hội thoại này, nên không có điểm và không có nhận xét. Đó là lựa chọn của bạn, không phải lỗi.',
        overall: 'Điểm tổng',
        coherence: 'Mạch lạc',
        finishedAt: 'Kết thúc lúc',
        transcriptTitle: 'Nội dung hội thoại',
        option: {
            style: {
                CASUAL: 'Thân mật',
                PROFESSIONAL: 'Chuyên nghiệp',
                ENCOURAGING: 'Khích lệ',
                CHALLENGING: 'Thử thách',
                PLAYFUL: 'Vui vẻ',
                FLIRTY: 'Tán tỉnh',
                DEEP: 'Sâu sắc',
                DEBATE: 'Tranh luận',
                STREET: 'Đường phố',
                UNFILTERED: 'Thẳng thắn'
            },
            personality: {
                FRIENDLY: 'Thân thiện',
                HUMOROUS: 'Hài hước',
                PATIENT: 'Kiên nhẫn',
                STRAIGHTFORWARD: 'Thẳng thắn',
                CONFIDENT: 'Tự tin',
                CURIOUS: 'Tò mò',
                EMPATHETIC: 'Đồng cảm',
                BOLD: 'Mạnh dạn',
                FLIRTY: 'Tán tỉnh',
                EDGY: 'Gai góc',
                REBELLIOUS: 'Nổi loạn'
            },
            expertise: {
                GENERAL: 'Chung',
                BUSINESS: 'Kinh doanh',
                TECHNOLOGY: 'Công nghệ',
                EDUCATION: 'Giáo dục',
                TRAVEL: 'Du lịch',
                RELATIONSHIPS: 'Các mối quan hệ',
                ENTERTAINMENT: 'Giải trí',
                GAMING: 'Trò chơi',
                FITNESS: 'Thể hình',
                PSYCHOLOGY: 'Tâm lý',
                SOCIAL_MEDIA: 'Mạng xã hội'
            }
        },
        voice: {
            US_NEURAL_J: 'Nam trầm',
            US_NEURAL_I: 'Nam trẻ',
            US_NEURAL_F: 'Nữ trẻ',
            US_NEURAL_C: 'Nữ trung',
            US_NEURAL_H: 'Nữ trung 2',
            US_STUDIO_O: 'Nữ tự nhiên',
            US_CHIRP_F: 'Nữ siêu tự nhiên'
        }
    },
    onboarding: {
        stepCount: 'Bước {{current}} / {{total}}',
        skip: 'Bỏ qua',
        back: 'Quay lại',
        next: 'Tiếp tục',
        start: 'Bắt đầu học',
        later: 'Để sau',
        saving: 'Đang lưu…',
        saveError: 'Chưa lưu được lựa chọn của bạn. Bạn thử lại giúp mình nhé.',
        unsupported: 'Máy chủ chưa hỗ trợ lưu phần thiết lập này. Bạn thử lại sau khi hệ thống cập nhật nhé.',
        unset: 'Chưa xác định',
        reopen: 'Làm lại hướng dẫn ban đầu',
        reopenHelp: 'Bốn câu hỏi thiết lập mục tiêu. Câu trả lời đang có được giữ nguyên, bạn chỉ đổi thứ mình muốn.',
        lexi: {
            goal: 'Mục tiêu band của bạn là bao nhiêu? Mình sẽ chọn bài vừa sức.',
            skill: 'Kỹ năng nào khó nhất với bạn? Mình sẽ dành cho nó nhiều thời gian hơn.',
            time: 'Mỗi ngày bạn học được bao lâu? Ít mà đều vẫn hơn nhiều mà dồn.',
            confirm: 'Xong rồi! Bạn xem lại lựa chọn nhé.'
        },
        goal: {
            title: 'Bạn đang nhắm band nào?',
            body: 'Chọn một mục tiêu. Bạn đổi được bất cứ lúc nào trong phần Cá nhân.',
            foundation: 'Nền tảng · xây thói quen học',
            common: 'Mục tiêu phổ biến nhất',
            precision: 'Cần độ chính xác cao',
            unknownWhy: 'Để Lexi gợi ý sau bài đầu tiên'
        },
        skill: {
            title: 'Kỹ năng nào khó nhất với bạn?',
            body: 'Chọn một kỹ năng để Lexi ưu tiên. Chưa chắc thì để trống, mình sẽ dựa vào bài làm đầu tiên.',
            whyListening: 'Nghe hiểu · điền từ · chép chính tả',
            whyReading: 'Đọc hiểu · True/False/Not Given · nối tiêu đề',
            whyWriting: 'Task 1 · Task 2 · chấm theo 4 tiêu chí',
            whySpeaking: 'Part 1–3 · chấm độ trôi chảy và phát âm',
            unknown: 'Chưa rõ',
            unknownWhy: 'Không chọn kỹ năng ưu tiên — để bài làm đầu tiên quyết định'
        },
        time: {
            title: 'Mỗi ngày bạn học được bao lâu?',
            body: 'Mục tiêu này đếm thời gian học thật, và bạn thấy nó trên trang chủ mỗi ngày.',
            opt10: '10 phút',
            opt20: '20 phút',
            opt30: '30 phút',
            opt45: '45 phút',
            opt60: '60 phút',
            why10: 'Vừa đủ để giữ thói quen',
            why20: 'Một bài ngắn mỗi ngày',
            why30: 'Mức mặc định của hệ thống',
            why45: 'Một bài đầy đủ và phần từ vựng',
            why60: 'Học nghiêm túc mỗi ngày'
        },
        confirm: {
            title: 'Xong rồi!',
            body: 'Đây là những gì mình dùng để chọn bài cho bạn. Sai chỗ nào thì sửa ngay bên dưới.',
            bandLabel: 'Mục tiêu band',
            skillLabel: 'Kỹ năng ưu tiên',
            timeLabel: 'Mỗi ngày',
            edit: 'Sửa',
            note: 'Không có gì bị khoá sau bước này.',
            settingsLink: 'Đổi trong phần Cá nhân'
        }
    },
    learningPath: {
        goalLine: 'Mục tiêu band {{band}}',
        noGoal: 'Chưa đặt mục tiêu band',
        currentLine: 'Band hiện tại {{band}}',
        notMeasured: 'Chưa đo được band — cần ít nhất một bài đã chấm.',
        xp: '{{value, number}} XP',
        unitLabel: 'Unit {{index}}',
        unitMeta: '{{nodes}} bài · 1 bài kiểm tra cuối unit',
        unitProgress: 'Tiến độ unit',
        costLine: 'Tốn {{amount}} credit',
        unitProgressLabel: 'Tiến độ unit: {{done}} trên {{total}} bài',
        progressRatio: '{{done}}/{{total}}',
        drillProgress: 'câu {{answered}}/{{target}}',
        practiceProgress: 'Xong · {{done}}/{{total}}',
        stateDone: 'Xong',
        stateCurrent: 'Đang học',
        stateLocked: 'Khoá',
        stateMilestone: 'Kiểm tra cuối unit',
        starterTitle: 'Bắt đầu — bài chẩn đoán',
        starterReason: 'Chưa đủ dữ liệu để xếp lộ trình. Làm {{nodes}} bài này trước, mình sẽ xếp lại sau bài đầu tiên.',
        vocabUnit: 'Từ vựng — ôn theo lịch',
        nextUnitTitle: 'Unit tiếp theo: {{unit}}',
        nextUnitHint: 'Mở sau khi hoàn thành bài kiểm tra Unit {{index}}',
        setGoal: 'Đặt mục tiêu band',
        emptyTitle: 'Chưa có lộ trình để hiển thị',
        emptyBody: 'Làm một bài bất kỳ rồi quay lại, mình sẽ xếp lộ trình theo đúng chỗ bạn còn yếu.',
        skill: {
            vocabulary: 'Từ vựng',
            other: 'Kỹ năng khác'
        },
        writingTask1: 'Writing Task 1',
        writingTask2: 'Writing Task 2',
        speakingPart1: 'Speaking Part 1',
        speakingPart2: 'Speaking Part 2',
        speakingPart3: 'Speaking Part 3',
        type: {
            formCompletion: 'Điền form',
            singleChoice: 'Chọn một đáp án',
            multipleChoice: 'Chọn nhiều đáp án',
            mapLabeling: 'Dán nhãn bản đồ',
            sentenceCompletion: 'Hoàn thành câu',
            matching: 'Nối cặp',
            trueFalseNotGiven: 'True / False / Not Given',
            matchingHeadings: 'Nối tiêu đề',
            summaryCompletion: 'Hoàn thành tóm tắt',
            yesNoNotGiven: 'Yes / No / Not Given',
            passageCompletion: 'Hoàn thành đoạn'
        },
        reason: {
            drillTargetMet: 'Bạn đã đạt mục tiêu ở dạng câu hỏi này',
            drillInProgress: 'Dạng câu hỏi bạn đang yếu nhất',
            drillNotStarted: 'Dạng câu hỏi bạn chưa luyện lần nào',
            practiceCompleted: 'Bạn đã hoàn thành bài này',
            practiceNotStarted: 'Bài luyện vừa sức tiếp theo',
            submissionGraded: 'Bài viết đã được chấm',
            submissionNotGraded: 'Bài viết chưa có kết quả chấm',
            attemptGraded: 'Bài nói đã được chấm',
            attemptNotGraded: 'Bài nói chưa có kết quả chấm',
            vocabDue: 'Số từ đến hạn ôn hôm nay',
            vocabClear: 'Hôm nay không còn từ đến hạn',
            needsPreviousNode: 'Mở sau bài trước',
            needsAllUnitNodes: 'Mở sau khi xong các bài trong unit',
            weakestMeasuredType: 'Dạng bạn sai nhiều nhất',
            nextInUnit: 'Bài tiếp theo trong unit',
            unitCheck: 'Bài kiểm tra cuối unit',
            diagnosticBaseline: 'Bài chẩn đoán để lấy mốc ban đầu'
        }
    },
    a11y: {
        notification: 'Thông báo',
        profile: 'Trang cá nhân',
        askLexi: 'Hỏi Lexi'
    }
};
