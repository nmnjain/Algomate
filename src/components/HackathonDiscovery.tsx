import { motion } from "motion/react";
import { Calendar, MapPin, DollarSign, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const hackathons = [
  {
    id: 1,
    name: "AI Innovation Challenge",
    date: "Mar 15-17, 2024",
    location: "San Francisco, CA",
    type: "Offline",
    prize: "$50,000",
    participants: "500+",
    tags: ["AI", "Machine Learning", "Python"],
    status: "Registration Open",
    gradient: "from-primary/20 to-primary/5"
  },
  {
    id: 2,
    name: "Web3 Builders Hackathon",
    date: "Mar 22-24, 2024",
    location: "Online",
    type: "Online",
    prize: "$25,000",
    participants: "1000+",
    tags: ["Blockchain", "Solidity", "DeFi"],
    status: "Registration Open",
    gradient: "from-secondary/20 to-secondary/5"
  },
  {
    id: 3,
    name: "Climate Tech Summit",
    date: "Apr 5-7, 2024",
    location: "Austin, TX",
    type: "Hybrid",
    prize: "$30,000",
    participants: "300+",
    tags: ["Climate", "IoT", "React"],
    status: "Coming Soon",
    gradient: "from-accent/20 to-accent/5"
  },
  {
    id: 4,
    name: "Fintech Revolution",
    date: "Apr 12-14, 2024",
    location: "New York, NY",
    type: "Offline",
    prize: "$40,000",
    participants: "400+",
    tags: ["Fintech", "APIs", "JavaScript"],
    status: "Registration Open",
    gradient: "from-green-500/20 to-green-500/5"
  },
  {
    id: 5,
    name: "Healthcare Innovation",
    date: "Apr 20-22, 2024",
    location: "Online",
    type: "Online",
    prize: "$35,000",
    participants: "600+",
    tags: ["Healthcare", "AI", "Data Science"],
    status: "Registration Open",
    gradient: "from-purple-500/20 to-purple-500/5"
  }
];

const filters = [
  { label: "All", value: "all" },
  { label: "AI/ML", value: "ai" },
  { label: "Web3", value: "web3" },
  { label: "Climate", value: "climate" },
  { label: "Fintech", value: "fintech" }
];

export function HackathonDiscovery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % hackathons.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + hackathons.length) % hackathons.length);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-6">
            Discover Hackathons
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Find hackathons that match your interests, skills, and schedule. From AI challenges to climate tech innovations.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filters.map((filter) => (
              <motion.button
                key={filter.value}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground glow-cyan"
                    : "glassmorphism text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveFilter(filter.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <motion.button
              onClick={prevSlide}
              className="glassmorphism p-3 rounded-full hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={24} className="text-primary" />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              className="glassmorphism p-3 rounded-full hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={24} className="text-primary" />
            </motion.button>
          </div>

          {/* Hackathon Cards Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: `${-currentIndex * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ width: `${hackathons.length * 100}%` }}
            >
              {hackathons.map((hackathon, index) => (
                <motion.div
                  key={hackathon.id}
                  className="flex-shrink-0"
                  style={{ width: `${100 / hackathons.length}%` }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mx-3">
                    <motion.div
                      className={`glassmorphism p-8 rounded-2xl bg-gradient-to-br ${hackathon.gradient} group hover:scale-105 transition-all duration-300 cursor-pointer`}
                      whileHover={{ y: -10 }}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {hackathon.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            {hackathon.date}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          hackathon.status === "Registration Open" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {hackathon.status}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={16} />
                          <span className="text-sm">{hackathon.location}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            hackathon.type === "Online" 
                              ? "bg-blue-500/20 text-blue-400"
                              : hackathon.type === "Offline"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}>
                            {hackathon.type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign size={16} />
                            <span className="text-sm">Prize: </span>
                            <span className="text-green-400 font-semibold">{hackathon.prize}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users size={16} />
                            <span className="text-sm">{hackathon.participants}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {hackathon.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-muted/20 text-muted-foreground rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          size="sm"
                        >
                          {hackathon.status === "Registration Open" ? "Register Now" : "Get Notified"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {hackathons.map((_, index) => (
              <motion.button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}