import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';

export function renderWithProviders(ui: ReactElement) {
  return render(<MemoryRouter><LanguageProvider>{ui}</LanguageProvider></MemoryRouter>);
}
