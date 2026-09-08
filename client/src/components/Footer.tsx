import { useLanguage } from '../i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Willow Yoga Studio. {t('footer.rights')}
    </footer>
  );
}
