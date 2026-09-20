import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/algorithms/fcfs', label: 'FCFS' },
  { to: '/algorithms/sjf', label: 'SJF' },
  { to: '/algorithms/srtf', label: 'SRTF' },
  { to: '/algorithms/round-robin', label: 'Round Robin' },
];

export default function Navbar() {
  return (
    <header className="top">
      <div className="top-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">Run<span className="accent-word">Q</span></span>
          <span className="brand-tag">watch the CPU think</span>
        </NavLink>
        <nav className="top-nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
