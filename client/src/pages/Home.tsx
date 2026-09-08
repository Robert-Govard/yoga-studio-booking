import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-emerald-900">Find your breath. Find your flow.</h1>
      <p className="mt-4 text-lg text-gray-600">
        Willow Yoga Studio offers Vinyasa, Restorative, and private sessions in a calm,
        welcoming space.
      </p>
      <Link
        to="/booking"
        className="mt-8 inline-block rounded-md bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
      >
        Book a class
      </Link>
    </main>
  );
}
