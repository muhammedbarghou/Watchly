import Logo from '@/assets/logo.png'
import { Link } from 'react-router-dom';

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </nav>
  );
}