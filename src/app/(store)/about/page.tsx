"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Leaf, Heart, Users } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Sustainable",
    description:
      "We partner with eco-conscious manufacturers and use sustainable materials wherever possible.",
  },
  {
    icon: Award,
    title: "Quality First",
    description:
      "Every product is handpicked and tested to meet our high standards of craftsmanship.",
  },
  {
    icon: Heart,
    title: "Timeless Design",
    description:
      "We believe in beauty that transcends trends and remains elegant for years to come.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Supporting local artisans and building a community of beauty-conscious individuals.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[55vh] md:h-[60vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=80"
          alt="About UrbanNest"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-5"
          >
            <p className="font-accent text-[#66a80f] text-lg md:text-xl mb-3">
              our story
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white">
              About UrbanNest
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-accent text-[#66a80f] text-base mb-4">Est. 2020</p>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold text-[#111111] leading-relaxed mb-6">
              We started UrbanNest with a simple belief: everyone deserves access to
              premium beauty &mdash; products that make you feel confident, radiant,
              and authentically you.
            </h2>
            <p className="text-[#111111]/60 leading-relaxed text-sm">
              What began as a small curated collection has grown into a destination
              for modern beauty essentials. We work directly with trusted brands and
              artisans to bring you products that tell a story &mdash; pieces that are
              made to last, designed to inspire, and priced to be accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-accent text-[#66a80f] text-base mb-2">
              what we believe
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#111111]">
              Our Values
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f8f6f3] flex items-center justify-center mx-auto mb-5">
                  <value.icon size={24} className="text-[#66a80f]" />
                </div>
                <h3 className="font-display text-sm font-semibold text-[#111111] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
              "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80",
              "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <Image src={img} alt="UrbanNest" fill className="object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}