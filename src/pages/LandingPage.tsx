import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { FeatureSection } from '../components/landing/FeatureSection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <LandingNavbar />
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Watch Together, Anywhere
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Join millions of people watching their favorite content together. Share moments, react in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                <Play className="w-5 h-5 mr-2" />
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
      <FeatureSection />
      <Footer />
    </div>
  );
}