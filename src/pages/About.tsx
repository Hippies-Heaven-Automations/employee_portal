export default function About() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16 bg-hemp-mist overflow-hidden animate-fadeInUp">
      {/* 🌿 Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      {/* 🧘 About Card */}
      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 sm:p-10 mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-hemp-forest text-center mb-4">
          About Us 🌼
        </h1>

        <p className="text-center text-hemp-forest font-semibold text-lg sm:text-xl mb-6">
          🚫 Must Be 21+ to Enter 🚫
        </p>

        <p className="text-hemp-ink/80 text-base sm:text-lg leading-relaxed mb-4">
          Welcome to Hippies Heaven Gift Shop, Centralia’s grooviest stop for
          good vibes, unique gifts, and colorful living! ✌
        </p>

        <p className="text-hemp-ink/80 text-base sm:text-lg leading-relaxed mb-4">
          Located at{" "}
          <span className="font-medium text-hemp-forest">
            433 S Locust Street, Centralia, Illinois 62801
          </span>
          , Hippies Heaven is a <span className="font-medium">21+ lifestyle and
          gift shop</span> packed with fun finds and laid-back treasures — from
          tie-dye apparel, jewelry, incense, and novelty gifts to
          hemp-derived wellness products, Kratom, and nicotine vapes.
        </p>

        <p className="text-hemp-ink/80 text-base sm:text-lg leading-relaxed mb-4">
          Our shop is all about spreading peace, love, and positivity — offering
          a chill atmosphere where adults can relax, explore, and enjoy
          everything from groovy décor and apparel to quality hemp and vape
          selections.
        </p>

        <div className="bg-white/60 rounded-xl border border-hemp-sage p-4 text-hemp-forest text-sm sm:text-base leading-relaxed space-y-2 shadow-card">
          <p>
            📍 <span className="font-medium">Address:</span> 433 S Locust
            Street, Centralia, IL 62801
          </p>
          <p>
            🕒 <span className="font-medium">Store Hours:</span> Open Daily,
            10 AM – 7 PM
          </p>
          <p>
            🌐 <span className="font-medium">Website:</span>{" "}
            <a
              href="https://www.hippiesheavencbd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hemp-green hover:underline"
            >
              www.hippiesheavencbd.com
            </a>
          </p>
        </div>

        <p className="text-hemp-forest text-center font-semibold text-base sm:text-lg leading-relaxed mt-8">
          ✨ Come on in, kick back, and catch the vibe —{" "}
          <span className="text-hemp-green">
            🚫 Hippies Heaven Gift Shop is for adults 21+ only 🚫
          </span>{" "}
          ✨
        </p>

        <p className="text-center text-hemp-ink/80 text-base sm:text-lg leading-relaxed mt-2">
          Peace, love, and groovy gifts await! 🌼
        </p>
      </div>

      {/* 📞 Contact / Footer card (optional keep) */}
      <div className="relative z-10 w-full max-w-xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 text-hemp-forest">
        <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">
          Contact & Location
        </h2>
        <p className="mb-2 text-center sm:text-left">
          📍{" "}
          <span className="font-medium">Hippies Heaven Gift Shop LLC</span>
        </p>
        <p className="mb-2 text-center sm:text-left">
          433 S Locust Street, Centralia, IL 62801
        </p>
        <p className="mb-4 text-center sm:text-left">
          Serving hemp lovers nationwide 🌎
        </p>
        <p className="mb-1 text-center sm:text-left">
          📞 +1 (618) 819-1327
        </p>
        <p className="mb-1 text-center sm:text-left">
          📧{" "}
          <a
            href="mailto:hippiesheaven@gmail.com"
            className="text-hemp-green hover:underline"
          >
            hippiesheaven@gmail.com
          </a>
        </p>
        <p className="text-center sm:text-left">
          🌐{" "}
          <a
            href="https://www.hippiesheavencbd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-hemp-green hover:underline"
          >
            www.hippiesheavencbd.com
          </a>
        </p>
      </div>
    </section>
  );
}
