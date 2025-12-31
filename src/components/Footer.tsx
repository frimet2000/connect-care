import { Heart, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TherapyConnect</span>
            </div>
            <p className="text-background/70 text-sm">
              הפלטפורמה המובילה בישראל לחיבור הורים עם מטפלים פרה-רפואיים מובילים.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">קישורים מהירים</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  חיפוש מטפלים
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  הרשמה למטפלים
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  אודות
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  שאלות נפוצות
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">משפטי</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  תנאי שימוש
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  מדיניות פרטיות
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  נגישות
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">צרו קשר</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@therapyconnect.co.il" className="hover:text-background transition-colors">
                  support@therapyconnect.co.il
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:*5678" className="hover:text-background transition-colors">
                  *5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} TherapyConnect. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
