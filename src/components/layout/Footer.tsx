import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';

const footerLinks = {
  produtos: [
    { name: 'Catálogo Geral', href: '/produtos' },
    { name: 'Protótipos', href: '/produtos?categoria=prototipos' },
    { name: 'Peças Funcionais', href: '/produtos?categoria=pecas-funcionais' },
    { name: 'Miniaturas', href: '/produtos?categoria=miniaturas' },
  ],
  servicos: [
    { name: 'Impressão 3D', href: '/servicos' },
    { name: 'Modelagem 3D', href: '/servicos' },
    { name: 'Pintura Premium', href: '/servicos' },
    { name: 'Manutenção', href: '/servicos' },
  ],
  empresa: [
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Portfólio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contato', href: '/contato' },
  ],
  suporte: [
    { name: 'Central de Ajuda', href: '/ajuda' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Política de Devolução', href: '/devolucao' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/3dk.print/' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61552286589701' },
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@3DKPrint' },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3DK</span>
                <span className="text-2xl font-bold text-accent">PRINT</span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Impressão 3D profissional com qualidade premium. Do arquivo ao produto final, 
              com entrega rápida para todo o Brasil.
            </p>
            <div className="space-y-3">
              <a href="mailto:3dk.print.br@gmail.com" className="flex items-center text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-5 w-5 mr-3" />
                3dk.print.br@gmail.com
              </a>
              <a href="tel:+5543991741518" className="flex items-center text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="h-5 w-5 mr-3" />
                (43) 9-9174-1518
              </a>
              <div className="flex items-start text-primary-foreground/70">
                <MapPin className="h-5 w-5 mr-3 mt-0.5" />
                <span>Ourinhos - SP, Brasil</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Produtos</h3>
            <ul className="space-y-3">
              {footerLinks.produtos.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Serviços</h3>
            <ul className="space-y-3">
              {footerLinks.servicos.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Suporte</h3>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} 3DKPRINT. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/60 hover:text-accent transition-colors"
              >
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
