import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Mic,
  Globe,
  Headphones,
  Zap,
  Languages,
  Volume2,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Powerful Translation Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience YouTube like never before with our advanced real-time
              translation and dubbing technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: "Live Audio Capture",
                description:
                  "Seamlessly syncs with YouTube's video player for real-time processing",
              },
              {
                icon: <Languages className="w-6 h-6" />,
                title: "250+ Languages",
                description:
                  "Support for virtually every language with automatic detection",
              },
              {
                icon: <Volume2 className="w-6 h-6" />,
                title: "Natural Voice Dubbing",
                description:
                  "High-quality TTS that maintains natural speech patterns",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Real-time Processing",
                description:
                  "Instant transcription and translation with minimal delay",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-red-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-red-100 max-w-2xl mx-auto">
              Transform any YouTube video into your preferred language in just a
              few simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Install & Activate</h3>
              <div className="text-red-100">
                Install our browser extension and navigate to any YouTube video
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Language</h3>
              <div className="text-red-100">
                Select your preferred language from 250+ available options
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Enjoy Dubbed Content
              </h3>
              <div className="text-red-100">
                Watch with real-time translation and natural voice dubbing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Choose Your Dubbing Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock the power of multilingual content with flexible pricing
              options designed for every user.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Break Language Barriers?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying YouTube content in
            their preferred language with natural, high-quality dubbing.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <Volume2 className="mr-2 w-4 h-4" />
            Start Dubbing Today
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
