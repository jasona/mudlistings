import { Link } from 'react-router-dom';
import { Gamepad2, Github, Twitter } from 'lucide-react';

const footerLinks = {
  discover: [
    { name: 'Browse MUDs', href: '/browse' },
    { name: 'Featured', href: '/browse?featured=true' },
    { name: 'Trending', href: '/browse?sort=trending' },
    { name: 'Newest', href: '/browse?sort=newest' },
  ],
  genres: [
    { name: 'Fantasy', href: '/genres/fantasy' },
    { name: 'Sci-Fi', href: '/genres/scifi' },
    { name: 'Roleplay', href: '/genres/roleplay' },
    { name: 'PvP', href: '/genres/pvp' },
  ],
  resources: [
    { name: 'What is a MUD?', href: '/what-is-mud' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About Us', href: '/about' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold text-foreground">
                MUD<span className="text-primary">Listings</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Discover and explore the best MUDs from around the world. Find your next
              text-based adventure today.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Discover</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Genres</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.genres.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} MUDListings. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
