import { Link, useLocation } from 'react-router-dom';
import psycheMark from '../assets/sad_face.png';

const navItems = [
    { to: '/terms', label: 'Terms of Service' },
    { to: '/privacy', label: 'Privacy Policy' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <div className="page">
            <header className="shell header">
                <div className="brand">
                    <img src={psycheMark} alt="Psyche" />
                    <div>
                        <p className="brand-subtitle">Psyche</p>
                        <p className="brand-title">Legal Center</p>
                    </div>
                </div>
                <nav className="nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <main className="shell main">{children}</main>

            <footer className="footer">
                <div className="shell footer-inner">
                    <p className="text-sm text-slate-600">
                        © {new Date().getFullYear()} Psyche. All rights reserved.
                    </p>
                    <div className="footer-links">
                        {navItems.map((item) => (
                            <Link key={item.to} to={item.to}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
