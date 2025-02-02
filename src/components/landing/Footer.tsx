import { Link } from 'react-router-dom';
import { InView } from '@/components/ui/in-view';


const footerLinks = {
  'Company': ['About', 'Careers', 'Press'],
  'Support': ['Help Center', 'Contact', 'Terms'],
  'Social': ['Twitter', 'Instagram', 'Facebook'],
  'Legal': ['Privacy', 'Terms of Service', 'Cookie Preferences']
};

export function Footer() {
  return (
    <InView
          variants={{
            hidden: { opacity: 0, y: 100, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          viewOptions={{ margin: '0px 0px -200px 0px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}>
    <footer className="bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-gray-400 font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link 
                      to="#" 
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-netflix-gray">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Watchly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </InView>
  );
}