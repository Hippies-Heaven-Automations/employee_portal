export default function About() {
  return (
    <section className="bg-hemp-mist min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center animate-fadeInUp">
      {/* 🌿 Heading */}
      <h1 className="text-4xl sm:text-5xl font-bold text-hemp-forest mb-6">
        About Hippies Heaven 🌿
      </h1>

      {/* ✨ Description */}
      <p className="max-w-3xl text-hemp-ink/90 text-lg sm:text-xl leading-relaxed mb-10">
        At <span className="font-semibold text-hemp-forest">Hippies Heaven Gift Shop LLC</span>, 
        we believe in spreading positivity, creativity, and wellness through 
        hemp-derived products that make life a little more vibrant.  
        Founded with a mission to bring good vibes to every community, 
        we’ve built a team that values balance, respect, and authenticity.
      </p>

      {/* 🧠 Culture / Mission */}
      <div className="max-w-3xl text-hemp-ink/80 text-base sm:text-lg leading-relaxed mb-12">
        <p className="mb-4">
          Our employee portal was designed to empower every team member — from our 
          retail crew to our automation developers — to connect, collaborate, 
          and grow together. We embrace innovation, teamwork, and transparency, 
          making sure every voice is heard and every contribution matters.
        </p>
        <p>
          Whether you’re managing schedules, completing training, or sharing 
          announcements, this portal keeps our entire tribe aligned with the 
          same purpose: <span className="font-medium text-hemp-forest">
          to create a stress-free, high-vibe experience for our customers and staff alike.
          </span>
        </p>
      </div>

      {/* 🏢 Contact & Location */}
      <div className="w-full max-w-xl bg-hemp-cream/60 rounded-2xl shadow-card p-8 text-hemp-forest">
        <h2 className="text-2xl font-semibold mb-4">Contact & Location</h2>
        <p className="mb-2">
          📍 <span className="font-medium">Hippies Heaven Gift Shop LLC</span>
        </p>
        <p className="mb-2">433 S Locust Street, Centralia, IL 62801</p>
        <p className="mb-4">Serving hemp lovers nationwide 🌎</p>
        <p className="mb-1">📞 +1(618) 819 1327</p>
        <p className="mb-1">
          📧 <a href="mailto:hippiesheaven@gmail.com" className="text-hemp-green hover:underline">
            hippiesheaven@gmail.com
          </a>
        </p>
        <p>
          🌐 <a href="https://www.hippiesheavencbd.com/" target="_blank" rel="noopener noreferrer" className="text-hemp-green hover:underline">
            https://www.hippiesheavencbd.com/
          </a>
        </p>
      </div>

      {/* 🌈 Footer Note */}
      <p className="mt-10 text-sm text-hemp-ink/60">
        Together, we grow — one hemp leaf at a time 🌱
      </p>
    </section>
  );
}
