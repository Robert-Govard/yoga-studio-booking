import { useLanguage } from '../i18n/LanguageContext';

export function About() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">{t('about.title')}</h1>
      <p className="mt-4 text-gray-700">{t('about.body')}</p>
    </main>
  );
}
