export default function About() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16 bg-hemp-mist overflow-hidden animate-fadeInUp">
      {/* 🌿 Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/85 via-hemp-mist to-hemp-green/10"></div>

      {/* 🪶 About Card */}
      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/80 backdrop-blur-md border border-hemp-sage rounded-md shadow-lg p-8 sm:p-10 mb-10 leading-relaxed">
        <h1 className="text-4xl sm:text-5xl font-bold text-hemp-forest text-center mb-3">
          About Us
        </h1>

        <p className="text-center text-hemp-forest font-semibold text-lg mb-8">
          🚫 Must Be 21+ to Enter 🚫
        </p>

        <div className="space-y-6 text-hemp-ink/80 text-base sm:text-lg">
          <p>
            Welcome to{" "}
            <span className="font-semibold text-hemp-forest">
              Hippies Heaven Gift Shop
            </span>
            — Centralia’s grooviest destination for good vibes, unique gifts, and colorful living!
            ✌
          </p>

          <p>
            Nestled at{" "}
            <span className="font-medium text-hemp-forest">
              433 S Locust Street, Centralia, Illinois 62801
            </span>
            , we’re a{" "}
            <span className="font-medium">21+ lifestyle and gift shop</span> packed with treasures:
            from tie-dye apparel, jewelry, incense, and novelty gifts to hemp-derived wellness
            products, Kratom, and nicotine vapes.
          </p>

          <p>
            Our mission is simple — to spread{" "}
            <span className="font-medium text-hemp-forest">peace, love, and positivity</span>. We’ve
            built a chill, welcoming space where adults can relax, explore, and enjoy everything
            from groovy décor and apparel to premium hemp and vape selections.
          </p>
        </div>

        {/* 🏪 Info Panel */}
        <div className="mt-8 bg-white/70 border border-hemp-sage p-5 text-hemp-forest text-sm sm:text-base space-y-2 shadow-sm rounded-none">
          <p>
            📍 <span className="font-medium">Address:</span> 433 S Locust Street, Centralia, IL 62801
          </p>
          <p>
            ☎️ <span className="font-medium">Contact:</span>{" "}
            <a
              href="tel:+16188191327"
              className="text-hemp-green hover:underline"
            >
              +1 (618) 819-1327
            </a>
          </p>
          <p>
            🕒 <span className="font-medium">Hours:</span> Open Daily — 10 AM to 7 PM
          </p>
          <p>
            🌐 <span className="font-medium">Website:</span>{" "}
            <a
              href="https://www.hippiesheavencbd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hemp-green hover:underline break-all"
            >
              www.hippiesheavencbd.com
            </a>
          </p>
        </div>

        <p className="text-hemp-forest text-center font-semibold text-base sm:text-lg mt-10">
          ✨ Come in, kick back, and catch the vibe —{" "}
          <span className="text-hemp-green">adults 21+ only</span> ✨
        </p>

        <p className="text-center text-hemp-ink/80 text-base sm:text-lg mt-2">
          Peace, love, and groovy gifts await at Hippies Heaven 🌼
        </p>
      </div>

      {/* 📍 Store Locator */}
      <div className="relative z-10 w-full max-w-3xl bg-white/70 border border-hemp-sage rounded-md shadow-md p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-hemp-forest text-center mb-4">
          Find Us on the Map
        </h2>
        <p className="text-center text-hemp-ink/80 mb-6">
          Visit our shop in Centralia, Illinois — tap below for directions.
        </p>

        <div className="w-full h-[350px] border border-hemp-sage shadow-sm">
          <iframe
            title="Hippies Heaven Gift Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3091.9359780898314!2d-89.1441629!3d38.5207277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x887636e9f35f1ef3%3A0x70c4a1e949828f61!2s433%20S%20Locust%20St%2C%20Centralia%2C%20IL%2062801!5e0!3m2!1sen!2sus!4v1698792358004!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
