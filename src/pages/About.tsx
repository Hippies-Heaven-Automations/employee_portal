export default function Contact() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16 bg-hemp-mist overflow-hidden animate-fadeInUp">
      {/* 🌿 Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      {/* 💬 Contact Card */}
      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 sm:p-10 mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-hemp-forest text-center mb-6">
          Contact Us 🌿
        </h1>
        <p className="max-w-xl mx-auto text-center text-hemp-ink/80 text-lg sm:text-xl mb-10">
          Got a question, feedback, or a bright idea? <br />
          We’d love to hear from you — send us a message below.
        </p>

        <form
          action="https://formspree.io/f/mnqypxyz" // ← replace with your actual Formspree ID
          method="POST"
          className="w-full space-y-5"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-hemp-forest font-medium mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage bg-white/80 focus:ring-2 focus:ring-hemp-green focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-hemp-forest font-medium mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              name="_replyto"
              id="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage bg-white/80 focus:ring-2 focus:ring-hemp-green focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-hemp-forest font-medium mb-2"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              required
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage bg-white/80 focus:ring-2 focus:ring-hemp-green focus:outline-none resize-none"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-hemp-green hover:bg-hemp-forest text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* 🏢 Contact Info */}
      <div className="relative z-10 w-full max-w-xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 text-hemp-forest">
        <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">
          Contact & Location
        </h2>
        <p className="mb-2 text-center sm:text-left">
          📍 <span className="font-medium">Hippies Heaven Gift Shop LLC</span>
        </p>
        <p className="mb-2 text-center sm:text-left">
          433 S Locust Street, Centralia, IL 62801
        </p>
        <p className="mb-4 text-center sm:text-left">
          Serving hemp lovers nationwide 🌎
        </p>
        <p className="mb-1 text-center sm:text-left">📞 +1 (618) 819-1327</p>
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
