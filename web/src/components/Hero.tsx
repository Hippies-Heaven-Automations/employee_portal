import { Link } from "react-router-dom";
import { Button } from "./Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100 py-28 text-center">
        <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-5xl font-bold text-purple-800 mb-4">
            Join Our Team at Hippies Heaven 🌈
            </h1>
            <p className="text-lg text-gray-700 mb-8">
            Where creativity, community, and good vibes grow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/hiring">
                <Button>Join Us</Button>
            </Link>
            <Link to="/login">
                <Button variant="ghost">Employee Login</Button>
            </Link>
            </div>
        </div>
    </section>

  );
}
