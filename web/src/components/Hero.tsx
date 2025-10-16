"use client";
import { Link } from "react-router-dom";
import { Button } from "./Button";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-soft-gradient py-28 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 backdrop-blur-sm"></div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 animate-fadeInUp">
        <h1 className="text-5xl sm:text-6xl font-bold text-purple-800 mb-6 leading-tight drop-shadow">
          Join Our Team at <br className="sm:hidden" /> Hippies Heaven 🌈
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 mb-10">
          Where creativity, community, and good vibes grow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/hiring">
            <Button className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg transition-all duration-300">
              Join Us
            </Button>
          </Link>
          <Link to="/login">
            <Button className="border border-purple-700 bg-white hover:text-white hover:bg-purple-700 text-purple-700 px-8 py-3 rounded-lg transition-all duration-300">
              Employee Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
