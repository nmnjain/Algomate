import { motion } from "motion/react";
import { FileText, Github, TrendingUp, Sparkles } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Parser + GitHub Sync",
    description: "Automatically sync your GitHub projects and parse your resume to create a comprehensive developer profile.",
    color: "text-primary",
    glow: "glow-cyan"
  },
  {
    icon: Github,
    title: "Automated Project Portfolio",
    description: "Transform your repositories into beautiful showcase pieces with automated documentation and live demos.",
    color: "text-secondary",
    glow: "glow-violet"
  },
  {
    icon: TrendingUp,
    title: "Coding Insights",
    description: "Track your progress across LeetCode, Codeforces, CodeChef, and GeeksforGeeks with detailed analytics.",
    color: "text-accent",
    glow: "glow-blue"
  },
  {
    icon: Sparkles,
    title: "AI-Powered Recommendations",
    description: "Get personalized suggestions for hackathons and projects based on your skills and interests.",
    color: "text-primary",
    glow: "glow-cyan"
  }
];

export function FeaturesSection() {
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
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Supercharge Your Dev Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to showcase your skills, track your growth, and discover new opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glassmorphism rounded-2xl p-8 group hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className={`${feature.color} ${feature.glow} mb-6 group-hover:scale-110 transition-all duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon size={48} />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}