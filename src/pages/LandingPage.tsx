import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { FeatureSection } from '../components/landing/FeatureSection';
import { Footer } from '../components/landing/Footer';
import { InView } from '@/components/ui/in-view';
import { TextEffect } from '@/components/ui/text-effect';


export function LandingPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <div
        className="relative h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80/api/placeholder/1920/1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <InView
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Watch Together, Anywhere
            </h1>
            <TextEffect preset='fade-in-blur' speedReveal={1.1} speedSegment={0.3} className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
              Join millions of people watching their favorite content together. Share moments, react in real-time.
            </TextEffect>
      
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-netflix-red hover:bg-netflix-red/90" asChild>
                <Link to="/signup">
                  <Play className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </InView>

        
      </div>

      {/* Features Section */}
      <FeatureSection />

      {/* Call to Action Section */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Ready to Start Watching Together?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Create your account now and join the community of viewers who are sharing their favorite moments together.
            </p>
            <Button size="lg" className="bg-netflix-red hover:bg-netflix-red/90" asChild>
              <Link to="/signup">
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </InView>

      {/* Testimonials Section */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "It's like having a movie theater experience at home with friends!",
                  author: "Sarah K.",
                  role: "Movie Enthusiast"
                },
                {
                  quote: "The synchronization is perfect, and the chat features make it so interactive.",
                  author: "Michael R.",
                  role: "TV Show Fan"
                },
                {
                  quote: "I can finally watch shows with my family even when we're miles apart.",
                  author: "David L.",
                  role: "Long-distance Family"
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800"
                >
                  <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InView>

      {/* FAQ Section */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="py-24 ">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "How does Watch Together work?",
                  answer: "Our platform synchronizes video playback across all participants in a viewing session. One person controls the playback, and everyone stays perfectly in sync."
                },
                {
                  question: "Is there a limit to how many people can join?",
                  answer: "No! Our rooms can accommodate as many viewers as you'd like to invite. Perfect for small gatherings or large watch parties."
                },
                {
                  question: "What devices are supported?",
                  answer: "Watchly works on any device with a modern web browser - computers, tablets, phones, and smart TVs."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="bg-zinc-800/50 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InView>

      <Footer />
    </div>
  );
}