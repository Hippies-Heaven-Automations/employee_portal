"use client";
import { Link } from "react-router-dom";
import { Button } from "./Button";

export default function Hero() {
  return (
    <section
      className="relative isolate flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] overflow-hidden bg-hemp-mist text-center"
    >
      {/* 🌿 Subtle tie-dye background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#A7E3A7_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#C8EBC8_0%,transparent_50%)] opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/60 via-transparent to-hemp-green/10 backdrop-blur-sm"></div>

      {/* 🌿 Main content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 animate-fadeInUp">
        <h1 className="text-5xl sm:text-6xl font-bold text-hemp-forest mb-6 leading-tight drop-shadow-sm">
          Join Our Team at <br className="sm:hidden" /> Hippies Heaven 🌿
        </h1>

        <p className="text-lg sm:text-xl text-hemp-ink/80 mb-10">
          Where creativity, community, and good vibes grow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/hiring">
            <Button className="bg-hemp-green hover:bg-hemp-forest text-white px-8 py-3 rounded-lg transition-all duration-300 shadow-card">
              Join Us
            </Button>
          </Link>

          <Link to="/login">
            <Button className="border border-hemp-green bg-white hover:text-white hover:bg-hemp-green text-hemp-green px-8 py-3 rounded-lg transition-all duration-300 shadow-card">
              Employee Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
