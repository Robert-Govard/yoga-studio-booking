import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { FadeInSection } from '../components/FadeInSection';
import { Gallery, type GalleryImage } from '../components/Gallery';

const GALLERY_IMAGES: GalleryImage[] = [
  { src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format', alt: 'Yoga pose in a sunlit studio' },
  { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80&auto=format', alt: 'Student practicing on a mat' },
  { src: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80&auto=format', alt: 'Quiet meditation corner' },
  { src: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80&auto=format', alt: 'Group stretch during class' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format', alt: 'Group yoga session' },
  { src: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80&auto=format', alt: 'Studio interior with mats laid out' },
];

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-8 w-8 text-emerald-700"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('home.feature1Title'),
      body: t('home.feature1Body'),
      icon: 'M12 4.5v15m0-15 3.5 3.5M12 4.5 8.5 8',
    },
    {
      title: t('home.feature2Title'),
      body: t('home.feature2Body'),
      icon: 'M17 20h5v-1a4 4 0 0 0-3-3.87M9 20H4v-1a4 4 0 0 1 3-3.87m9-5.13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 5.13a4 4 0 0 1 3-3.87m6 0a4 4 0 0 1 3 3.87',
    },
    {
      title: t('home.feature3Title'),
      body: t('home.feature3Body'),
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z',
    },
  ];

  const testimonials = [
    { quote: t('home.testimonial1Quote'), author: t('home.testimonial1Author') },
    { quote: t('home.testimonial2Quote'), author: t('home.testimonial2Author') },
    { quote: t('home.testimonial3Quote'), author: t('home.testimonial3Author') },
  ];

  return (
    <main>
      {/* Hero */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-cover bg-center text-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6, 40, 32, 0.55), rgba(6, 40, 32, 0.55)), url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=75&auto=format')",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-24 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            {t('home.heroEyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t('home.heroTitle')}</h1>
          <p className="mt-4 text-lg text-emerald-50">{t('home.heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/booking"
              className="rounded-md bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-500"
            >
              {t('home.heroCta')}
            </Link>
            <Link
              to="/services"
              className="rounded-md border border-white/60 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              {t('home.heroSecondaryCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <FadeInSection className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-emerald-900">{t('home.featuresTitle')}</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <FeatureIcon path={feature.icon} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-emerald-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </FadeInSection>

      {/* Gallery */}
      <FadeInSection className="bg-emerald-50/60 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-emerald-900">{t('home.galleryTitle')}</h2>
          <p className="mt-2 text-center text-gray-600">{t('home.gallerySubtitle')}</p>
          <div className="mt-10">
            <Gallery images={GALLERY_IMAGES} />
          </div>
        </div>
      </FadeInSection>

      {/* Testimonials */}
      <FadeInSection className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-emerald-900">{t('home.testimonialsTitle')}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author} className="rounded-lg border border-gray-200 p-6">
              <blockquote className="text-gray-700">{testimonial.quote}</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-emerald-800">{testimonial.author}</figcaption>
            </figure>
          ))}
        </div>
      </FadeInSection>

      {/* Final CTA */}
      <FadeInSection className="bg-emerald-800 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">{t('home.ctaTitle')}</h2>
          <p className="mt-3 text-emerald-100">{t('home.ctaBody')}</p>
          <Link
            to="/booking"
            className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
          >
            {t('home.ctaButton')}
          </Link>
        </div>
      </FadeInSection>
    </main>
  );
}
