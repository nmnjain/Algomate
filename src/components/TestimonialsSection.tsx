import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ayush Kakkar",
    role: "Full Stack Developer",
    company: "Meta",
    testimonial: "Algomate helped me showcase my projects in a way that finally got me noticed by top tech companies.",
    avatar: "SC",
    rating: 5,
    color: "text-primary"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    company: "Google",
    testimonial: "The AI recommendations are spot-on. Found hackathons that perfectly matched my skills and interests.",
    avatar: "MR",
    rating: 5,
    color: "text-secondary"
  },
  {
    id: 3,
    name: "Emily Zhang",
    role: "DevOps Engineer",
    company: "Netflix",
    testimonial: "The portfolio automation saved me hours. My GitHub projects look professional and organized now.",
    avatar: "EZ",
    rating: 5,
    color: "text-accent"
  },
  {
    id: 4,
    name: "Alex Johnson",
    role: "Frontend Developer",
    company: "Stripe",
    testimonial: "Won my first hackathon using insights from Algomate's coding analytics. Game changer!",
    avatar: "AJ",
    rating: 5,
    color: "text-green-400"
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Data Scientist",
    company: "Uber",
    testimonial: "The skill tracking feature helped me identify gaps and level up faster than ever before.",
    avatar: "PP",
    rating: 5,
    color: "text-yellow-400"
  },
  {
    id: 6,
    name: "David Kim",
    role: "Backend Engineer",
    company: "Airbnb",
    testimonial: "Clean interface, powerful features. Algomate is essential for any serious developer.",
    avatar: "DK",
    rating: 5,
    color: "text-pink-400"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent mb-6">
            Loved by Developers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of developers who've accelerated their careers with Algomate.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Speech Bubble */}
              <motion.div
                className="glassmorphism p-6 rounded-2xl relative group-hover:scale-105 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                {/* Quote Icon */}
                <div className="absolute -top-3 -left-3 p-2 glassmorphism rounded-full">
                  <Quote size={16} className={testimonial.color} />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star size={16} className="text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.testimonial}"
                </p>

                {/* Speech Bubble Arrow */}
                <div className="absolute -bottom-2 left-8 w-4 h-4 glassmorphism rotate-45 border-t border-l border-border"></div>
              </motion.div>

              {/* Author */}
              <motion.div
                className="flex items-center gap-4 mt-6 pl-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {/* Avatar */}
                <motion.div
                  className={`w-12 h-12 rounded-full glassmorphism flex items-center justify-center font-semibold ${testimonial.color} group-hover:scale-110 transition-all duration-300`}
                  whileHover={{ 
                    boxShadow: `0 0 20px ${testimonial.color.replace('text-', 'rgb(')}` 
                  }}
                >
                  {testimonial.avatar}
                </motion.div>

                {/* Info */}
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at <span className={testimonial.color}>{testimonial.company}</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { number: "10,000+", label: "Developers", color: "text-primary" },
            { number: "500+", label: "Hackathons", color: "text-secondary" },
            { number: "50,000+", label: "Projects", color: "text-accent" },
            { number: "$2M+", label: "Prizes Won", color: "text-green-400" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center group"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-all duration-300`}
                whileHover={{ y: -2 }}
              >
                {stat.number}
              </motion.div>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}