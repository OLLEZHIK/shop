import Link from 'next/link';
import { getBusinessCount } from '@/lib/data';

export default function HomePage() {
  const counts = getBusinessCount();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Find Pet Services in Bratislava
        </h1>
        <p className="text-lg text-foreground/80 mb-12">
          Discover trusted groomers, vets, hotels and training for your pets
        </p>

        {/* 3-Step Search Flow - Mobile Vertical Cards */}
        <div className="space-y-6 md:hidden">
          {/* Step 1: Choose Pet */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-brand-blue/20">
            <h2 className="text-xl font-semibold mb-4">1. Choose your pet</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/search?animal=dog"
                className="bg-brand-orange text-white rounded-lg py-8 px-4 text-center font-medium hover:bg-brand-orange/90 transition"
              >
                🐕 Dog
              </Link>
              <Link
                href="/search?animal=cat"
                className="bg-brand-orange text-white rounded-lg py-8 px-4 text-center font-medium hover:bg-brand-orange/90 transition"
              >
                🐈 Cat
              </Link>
            </div>
          </div>

          {/* Step 2: Service Type */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-brand-blue/20">
            <h2 className="text-xl font-semibold mb-4">2. What do you need?</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/search?service=salon" className="bg-gray-100 rounded-lg py-4 px-3 text-center font-medium hover:bg-gray-200 transition">
                Grooming
              </Link>
              <Link href="/search?service=vet" className="bg-gray-100 rounded-lg py-4 px-3 text-center font-medium hover:bg-gray-200 transition">
                Veterinary
              </Link>
              <Link href="/search?service=hotel" className="bg-gray-100 rounded-lg py-4 px-3 text-center font-medium hover:bg-gray-200 transition">
                Hotel
              </Link>
              <Link href="/search?service=training" className="bg-gray-100 rounded-lg py-4 px-3 text-center font-medium hover:bg-gray-200 transition">
                Training
              </Link>
            </div>
          </div>

          {/* Step 3: Location */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-brand-blue/20">
            <h2 className="text-xl font-semibold mb-4">3. Where?</h2>
            <Link
              href="/search"
              className="block bg-brand-blue text-white rounded-lg py-4 px-6 text-center font-medium hover:bg-brand-blue/90 transition"
            >
              All Bratislava →
            </Link>
          </div>
        </div>

        {/* Desktop: Unified Search Bar (Zocdoc style) */}
        <div className="hidden md:block bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-4">
            <select className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none">
              <option>Choose pet</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
            <select className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none">
              <option>Service needed</option>
              <option value="salon">Grooming Salon</option>
              <option value="vet">Veterinary Clinic</option>
              <option value="hotel">Pet Hotel</option>
              <option value="training">Training</option>
            </select>
            <select className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-blue focus:outline-none">
              <option>Location</option>
              <option value="all">All Bratislava</option>
            </select>
            <Link
              href="/search"
              className="bg-brand-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-orange/90 transition"
            >
              Search
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.salon || 0}</div>
            <div className="text-sm text-foreground/60">Salons</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.vet || 0}</div>
            <div className="text-sm text-foreground/60">Vet Clinics</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.byCategory.hotel || 0}</div>
            <div className="text-sm text-foreground/60">Hotels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-blue">{counts.total}</div>
            <div className="text-sm text-foreground/60">Total Services</div>
          </div>
        </div>
      </div>
    </main>
  );
}
