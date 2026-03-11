import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Services", path: "/services" },
  { label: "Education", path: "/education" },
  { label: "Membership", path: "/membership" },
  { label: "Booking", path: "/booking" },
];

const Footer = () => {
  return (
    <footer className="relative z-20 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl tracking-[0.3em] text-primary mb-4">RAKAN</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Luxury styling, education, and image consulting for those who demand excellence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-6">Navigate</h4>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-6">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <span>hello@styled.rakan.com</span>
              <span>Dubai, UAE</span>
            </div>
          </div>
        </div>

        <div className="line-gold mt-12 mb-6" />
        <p className="text-center text-xs text-muted-foreground tracking-widest">
          © {new Date().getFullYear()} RAKAN. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
