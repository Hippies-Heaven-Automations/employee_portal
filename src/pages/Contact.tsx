export default function Contact() {
  return (
    <section className="bg-hemp-mist min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center animate-fadeInUp">
      <h1 className="text-4xl sm:text-5xl font-bold text-hemp-forest mb-6">
        Contact Us 🌿
      </h1>

      <p className="max-w-2xl text-hemp-ink/80 text-lg sm:text-xl mb-10">
        Got a question, feedback, or a bright idea?  
        We’d love to hear from you — send us a message below.
      </p>

      <form
        action="https://formspree.io/f/mnqypxyz"  // ← replace with your actual Formspree ID
        method="POST"
        className="w-full max-w-lg bg-hemp-cream/60 p-8 rounded-2xl shadow-card text-left"
      >
        {/* Name */}
        <div className="mb-5">
          <label htmlFor="name" className="block text-hemp-forest font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label htmlFor="email" className="block text-hemp-forest font-medium mb-2">
            Your Email
          </label>
          <input
            type="email"
            name="_replyto"
            id="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        {/* Message */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-hemp-forest font-medium mb-2">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={5}
            required
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green focus:outline-none"
            placeholder="Write your message here..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-hemp-green hover:bg-hemp-forest text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
        >
          Send Message
        </button>
      </form>

      {/* 🏢 Contact Info */}
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
    </section>
  );
}
