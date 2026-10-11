import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

/**
 * Keep the document and dayjs in step with the resolved language.
 *
 * `document.documentElement.lang` is not cosmetic: it is what tells a screen
 * reader which voice to use, and this product switches language mid-session. It
 * must also be correct for the English reading passages inside an otherwise
 * Vietnamese UI — v1 set the attribute globally and never switched it per
 * passage, so an English passage was announced with Vietnamese phonetics.
 */
export default function AppProviders({ children }) {
    const { i18n } = useTranslation();
    const language = i18n.resolvedLanguage || i18n.language || 'vi';

    useEffect(() => {
        dayjs.locale(language === 'vi' ? 'vi' : 'en');
        document.documentElement.lang = language === 'vi' ? 'vi' : 'en';
    }, [language]);

    return children;
}
