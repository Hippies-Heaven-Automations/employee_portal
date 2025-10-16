import Hero from "../components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="about" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4">About Us</h2>
        <p className="text-gray-700">
          Hippies Heaven is a creative community brand that believes in people-first culture,
          growth, and a little bit of magic.
        </p>
      </section>
    </>
  );
}
