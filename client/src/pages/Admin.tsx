import { useState } from 'react';
import { getAdminBookings } from '../api/client';
import type { Booking } from '../types';

export function Admin() {
  const [token, setToken] = useState('');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await getAdminBookings(token);
      setBookings(result);
    } catch {
      setError('Invalid token or the bookings could not be loaded.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">Admin: Bookings</h1>

      <form className="mt-6 flex gap-2" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label htmlFor="admin-token" className="sr-only">Admin token</label>
          <input
            id="admin-token"
            type="password"
            placeholder="Admin token"
            className="w-full rounded-md border border-gray-300 p-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <button type="submit" className="rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
          View bookings
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {bookings && (
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">Date</th>
              <th className="py-2">Time</th>
              <th className="py-2">Service</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2">{b.date}</td>
                <td className="py-2">{b.timeSlot}</td>
                <td className="py-2">{b.service.name}</td>
                <td className="py-2">{b.customerName}</td>
                <td className="py-2">{b.customerEmail} / {b.customerPhone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
