import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Waves,
  FlaskConical,
  Shield,
  LocateFixed,
  Droplets,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/', name: 'Overview', icon: LayoutDashboard },
  { path: '/climate', name: 'Water Proximity', icon: Waves },
  { path: '/water-quality', name: 'Water Quality', icon: FlaskConical },
  { path: '/Drastic', name: 'Drastic Vulnerability', icon: Shield },
  { path: '/observatory', name: 'Hotspot Identification', icon: LocateFixed },
  { path: '/drought-monitoring', name: 'Drought Monitoring', icon: Droplets },
  { path: '/impact-stimulator', name: 'Impact Stimulator', icon: Sparkles }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`bg-slate-900/50 backdrop-blur-md border-r border-white/10 p-4 transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
      <button onClick={() => setCollapsed(!collapsed)} className="mb-8 p-2 rounded-full hover:bg-white/10">
        {collapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5'}`
            }
          >
            <item.icon size={24} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
