import Link from "next/link";
import { TreePine } from "lucide-react";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "All Retreats", href: "/retreats" },
      { label: "Categories", href: "/retreats" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <TreePine className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">My Retreat Nest</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Discover and book the perfect retreat, resort, or hotel for your next getaway.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-sm mb-3">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} My Retreat Nest. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by <a href="https://axominds.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary transition-colors">Axominds Pvt Ltd</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
