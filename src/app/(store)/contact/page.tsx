"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const inputClass =
    "w-full px-4 py-3.5 bg-[#ffffff] border border-[#d4e8c2] rounded-xl text-sm focus:outline-none focus:border-[#66a80f] transition-colors placeholder:text-[#a1a1aa]";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-[#d4e8c2]/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="font-accent text-[#66a80f] text-base mb-2">
              get in touch
            </p>
            <h1 className="font-display text-3xl lg:text-5xl font-semibold text-[#111111] mb-4">
              Contact Us
            </h1>
            <p className="text-[#a1a1aa] max-w-lg mx-auto text-sm">
              We&apos;d love to hear from you. Send us a message and we&apos;ll
              respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-14">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-[#111111] mb-7">
                Contact Information
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    value: "House 12, Road 5\nGulshan, Dhaka 1212",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "hello@urbannest.com",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+880 1712-345678",
                  },
                  {
                    icon: Clock,
                    label: "Hours",
                    value: "Sat-Thu: 10AM - 8PM\nFri: 2PM - 8PM",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f8f6f3] flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-[#66a80f]" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-medium text-[#111111] mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm text-[#a1a1aa] whitespace-pre-line">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-8">
              <h2 className="font-display text-lg font-semibold text-[#111111] mb-7">
                Send a Message
              </h2>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      First Name
                    </label>
                    <input type="text" className={inputClass} placeholder="John" />
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Last Name
                    </label>
                    <input type="text" className={inputClass} placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] transition-colors duration-300"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}