import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import generalService from '../../api/generalService';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaTelegram } from 'react-icons/fa';

export default function Footer() {
  const navigation = [
    { name: 'Home', to: '/' },
    { name: 'Products', to: '/products' },
    { name: 'About', to: '#about' },
    { name: 'Contact', to: '/contact' }
  ];

  const [common, setCommon] = useState(null);

  useEffect(() => {
    generalService.getCommonContent().then(res => {
      if (res.code === 200 && res.data) {
        setCommon(res.data);
        // Inject live chat widget if present
        if (res.data.livechatwidget && res.data.livechatwidget.trim() !== '.') {
          const script = document.createElement('div');
          script.innerHTML = res.data.livechatwidget;
          script.id = 'livechat-widget';
          if (!document.getElementById('livechat-widget')) {
            document.body.appendChild(script);
          }
        }
      }
    });
  }, []);

  return (
    <footer className="bg-primary border-t border-secondary/10 py-8 text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src="/images/spicy-logo.png"
              alt="D&Sspice Logo"
              className="h-8 w-auto"
            />
            <p className="text-sm">
              Bringing authentic African flavors to your kitchen
            </p>
            {/* Social Media Icons */}
            {common?.social_media && (
              <div className="flex gap-3 mt-4">
                {common.social_media.facebook_link && (
                  <a href={common.social_media.facebook_link} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook className="w-6 h-6 hover:text-accent" /></a>
                )}
                {common.social_media.instagram_link && (
                  <a href={common.social_media.instagram_link} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram className="w-6 h-6 hover:text-accent" /></a>
                )}
                {common.social_media.twitter_link && (
                  <a href={common.social_media.twitter_link} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter className="w-6 h-6 hover:text-accent" /></a>
                )}
                {common.social_media.tiktok_link && (
                  <a href={common.social_media.tiktok_link} target="_blank" rel="noopener noreferrer" aria-label="Tiktok"><FaTiktok className="w-6 h-6 hover:text-accent" /></a>
                )}
                {common.social_media.telegram && (
                  <a href={common.social_media.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegram className="w-6 h-6 hover:text-accent" /></a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.to}
                    className="text-sm text-secondary hover:text-accent"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>Email: {common?.contact_email || 'info@dsspice.com'}</li>
              <li>Phone: {common?.phone_number || '+44 123 456 7890'}</li>
              <li>Location: {common?.company_address || 'United Kingdom'}</li>
            </ul>
          </div>

          {/* SEO/Other Info */}
          <div>
            <h3 className="font-semibold mb-4">Info</h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>Currency: {common?.default_currency || 'GBP'}</li>
              <li><Link to="/terms" className="hover:text-accent">Terms & Conditions</Link></li>
              <li><Link to="/policy" className="hover:text-accent">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-secondary/10 text-center text-sm text-secondary">
          <p>&copy; {new Date().getFullYear()} D&Sspice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

