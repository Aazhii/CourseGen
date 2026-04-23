import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.2]" />
      <div className="container mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-muted-foreground text-sm max-w-sm leading-relaxed">
              The AI-first platform for generating, editing, and deploying
              world-class learning experiences in minutes, not months.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI CourseGen Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-primary transition-colors">GitHub</Link>
            <Link to="#" className="hover:text-primary transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
