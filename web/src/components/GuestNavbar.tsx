import { Link } from "react-router-dom";

export default function GuestNavbar() {

  return (
    <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-purple-700 flex items-center gap-1">
        Hippies Heaven 🌈
        </Link>
        <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
        <li><Link to="/" className="hover:text-purple-700">Home</Link></li>
        <li><Link to="/about" className="hover:text-purple-700">About</Link></li>
        <li><Link to="/contact" className="hover:text-purple-700">Contact</Link></li>
        <li><Link to="/hiring" className="hover:text-purple-700">Hiring</Link></li>
        <li><Link to="/login" className="hover:text-purple-700 font-semibold">Login</Link></li>
        </ul>
    </nav>
  );
}
