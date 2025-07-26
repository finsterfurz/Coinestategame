// ===================================
// 🦶 FOOTER COMPONENT
// ===================================

import React from 'react';
import { Github, Twitter, Discord, Heart, ExternalLink } from 'lucide-react';

// ===================================
// 🦶 MAIN FOOTER
// ===================================

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/finsterfurz/Coinestategame',
      icon: Github
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/virtualbuilding',
      icon: Twitter
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/virtualbuilding',
      icon: Discord
    }
  ];
  
  const footerLinks = [
    {
      title: 'Spiel',
      links: [
        { name: 'Spielanleitung', url: '#guide' },
        { name: 'Roadmap', url: '#roadmap' },
        { name: 'Achievements', url: '#achievements' },
        { name: 'Leaderboard', url: '#leaderboard' }
      ]
    },
    {
      title: 'Entwicklung',
      links: [
        { name: 'Whitepaper', url: '#whitepaper' },
        { name: 'Smart Contracts', url: '#contracts' },
        { name: 'API Docs', url: '#api' },
        { name: 'Open Source', url: 'https://github.com/finsterfurz/Coinestategame' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord Server', url: 'https://discord.gg/virtualbuilding' },
        { name: 'Bug Reports', url: 'https://github.com/finsterfurz/Coinestategame/issues' },
        { name: 'Feature Requests', url: 'https://github.com/finsterfurz/Coinestategame/discussions' },
        { name: 'Contributing', url: '#contributing' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Impressum', url: '#impressum' },
        { name: 'Datenschutz', url: '#privacy' },
        { name: 'AGB', url: '#terms' },
        { name: 'Disclaimer', url: '#disclaimer' }
      ]
    }
  ];
  
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VBE</span>
              </div>
              <span className="text-white font-bold text-lg">
                Virtual Building Empire
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Das professionelle Web3-Gaming-Erlebnis. Sammle NFT-Charaktere, baue dein Imperium und verdiene LUNC-Belohnungen.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    title={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : '_self'}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-1"
                    >
                      <span>{link.name}</span>
                      {link.url.startsWith('http') && (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} Virtual Building Empire. Alle Rechte vorbehalten.
            </div>
            
            {/* Version & Build Info */}
            <div className="flex items-center space-x-4 text-gray-500 text-xs">
              <span>v3.0.0</span>
              <span>•</span>
              <span>Build #{process.env.REACT_APP_BUILD_NUMBER || 'dev'}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-red-500" />
                <span>by the Community</span>
              </div>
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-xs">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs leading-relaxed">
              🎮 <strong>Gaming Platform</strong> • Keine Anlageberatung • LUNC-Belohnungen sind Gaming-Rewards • 
              Spiele verantwortungsvoll • Web3-Gaming-Erlebnis • Entertainment Only • 
              Nicht als Investition gedacht • Community-driven Development
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;