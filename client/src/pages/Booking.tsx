import { useEffect, useState } from 'react';
import { getServices, getAvailability, createBooking } from '../api/client';
import type { Service } from '../types';

export function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getServices().then((list) => {
      setServices(list);
      if (list.length > 0) setServiceId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }
    getAvailability(date, serviceId).then((res) => setSlots(res.openSlots));
    setTimeSlot('');
  }, [date, serviceId]);

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-emerald-900">You&apos;re booked!</h1>
        <p className="mt-4 text-gray-600">
          We&apos;ve reserved your {timeSlot} slot on {date}. See you on the mat.
        </p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!serviceId || !date || !timeSlot) {
      setFormError('Please choose a service, date, and time slot.');
      return;
    }
    if (!name || !email || !phone) {
      setFormError('Please fill in your name, email, and phone number.');
      return;
    }

    try {
      await createBooking({ serviceId, date, timeSlot, customerName: name, customerEmail: email, customerPhone: phone });
      setConfirmed(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'SLOT_TAKEN') {
        setFormError('That slot was just taken. Please pick another time.');
        const res = await getAvailability(date, serviceId);
        setSlots(res.openSlots);
        setTimeSlot('');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Book a Class</h1>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
          <select
            id="service"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {slots.length > 0 && (
          <div>
            <span className="block text-sm font-medium text-gray-700">Available times</span>
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            id="phone"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {formError && <p className="text-red-600">{formError}</p>}

        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
        >
          Confirm Booking
        </button>
      </form>
    </main>
  );
}
