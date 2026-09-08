import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../api/client';
import type { Service } from '../types';

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setError('Could not load services right now.'));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Our Classes</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.id} className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p className="mt-1 text-gray-600">{service.durationMinutes} minutes</p>
            <p className="mt-2 text-lg font-medium text-emerald-800">
              ${(service.priceCents / 100).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
      <Link
        to="/booking"
        className="mt-8 inline-block rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
      >
        Book a class
      </Link>
    </main>
  );
}
