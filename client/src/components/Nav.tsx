import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-700'
  }`;

export function Nav() {
  const { language, setLanguage, t } = useLanguage();

  function languageButtonClass(target: Language) {
    return `px-2 py-1 text-xs font-semibold transition-colors ${
      language === target ? 'bg-emerald-700 text-white' : 'text-gray-500 hover:bg-gray-100'
    }`;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" end className="text-lg font-semibold text-emerald-800">
          {t('nav.brand')}
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/services" className={linkClass}>
            {t('nav.services')}
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/booking" className={linkClass}>
            {t('nav.booking')}
          </NavLink>
          <div className="ml-3 flex overflow-hidden rounded-md border border-gray-300">
            <button
              type="button"
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
              className={languageButtonClass('en')}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={language === 'ru'}
              onClick={() => setLanguage('ru')}
              className={languageButtonClass('ru')}
            >
              RU
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
