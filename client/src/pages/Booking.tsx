import { useEffect, useState } from 'react';
import { getServices, getAvailability, createBooking } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import type { Service } from '../types';

const today = new Date().toISOString().slice(0, 10);

export function Booking() {
  const { t, tService } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getServices()
      .then((list) => {
        if (cancelled) return;
        setServices(list);
        if (list.length > 0) setServiceId(list[0].id);
      })
      .catch(() => {
        if (!cancelled) setServicesError(t('services.errorLoad'));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      setSlotsLoaded(false);
      setAvailabilityError(null);
      return;
    }

    let cancelled = false;
    setSlotsLoaded(false);
    setAvailabilityError(null);
    setTimeSlot('');

    getAvailability(date, serviceId)
      .then((res) => {
        if (cancelled) return;
        setSlots(res.openSlots);
        setSlotsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setAvailabilityError(t('booking.errorLoadAvailability'));
        setSlotsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, serviceId]);

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-emerald-900">{t('booking.confirmedTitle')}</h1>
        <p className="mt-4 text-gray-600">{t('booking.confirmedBody', { slot: timeSlot, date })}</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!serviceId || !date || !timeSlot) {
      setFormError(t('booking.errorMissingSlot'));
      return;
    }
    if (!name || !email || !phone) {
      setFormError(t('booking.errorMissingContact'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        serviceId,
        date,
        timeSlot,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      });
      setConfirmed(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'SLOT_TAKEN') {
        setFormError(t('booking.errorSlotTaken'));
        setTimeSlot('');
        try {
          const res = await getAvailability(date, serviceId);
          setSlots(res.openSlots);
        } catch {
          setSlots([]);
        }
      } else {
        setFormError(t('booking.errorGeneric'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">{t('booking.title')}</h1>
      {servicesError && <p className="mt-4 text-red-600">{servicesError}</p>}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">
            {t('booking.service')}
          </label>
          <select
            id="service"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {tService(s.name)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            {t('booking.date')}
          </label>
          <input
            id="date"
            type="date"
            min={today}
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {availabilityError && <p className="text-sm text-red-600">{availabilityError}</p>}

        {slotsLoaded && !availabilityError && slots.length === 0 && (
          <p className="text-sm text-gray-600">{t('booking.noSlots')}</p>
        )}

        {slots.length > 0 && (
          <div>
            <span className="block text-sm font-medium text-gray-700">{t('booking.availableTimes')}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    timeSlot === slot
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-emerald-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('booking.name')}
          </label>
          <input
            id="name"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('booking.email')}
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t('booking.phone')}
          </label>
          <input
            id="phone"
            type="tel"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {formError && <p className="text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('booking.submitting') : t('booking.confirmBooking')}
        </button>
      </form>
    </main>
  );
}
