import { motion } from "motion/react";
import { Brain, User, GitBranch, Trophy, ArrowRight } from "lucide-react";

export function AIRecommendations() {
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
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent mb-6">
            AI-Powered Intelligence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized suggestions for projects and hackathons based on your coding journey and career goals.
          </p>
        </motion.div>

        <div className="relative">
          {/* Neural Network Visualization */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 mb-16">
            {/* Developer Node */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="glassmorphism w-32 h-32 rounded-full flex items-center justify-center glow-cyan"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 255, 255, 0.3)",
                    "0 0 40px rgba(0, 255, 255, 0.5)",
                    "0 0 20px rgba(0, 255, 255, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <User size={48} className="text-primary" />
              </motion.div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <p className="text-sm font-medium text-primary">You</p>
              </div>
            </motion.div>

            {/* AI Brain Node */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="glassmorphism w-40 h-40 rounded-full flex items-center justify-center glow-violet"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(139, 92, 246, 0.3)",
                    "0 0 60px rgba(139, 92, 246, 0.5)",
                    "0 0 30px rgba(139, 92, 246, 0.3)"
                  ],
                  rotate: [0, 360]
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
              >
                <Brain size={64} className="text-secondary" />
              </motion.div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <p className="text-sm font-medium text-secondary">AI Engine</p>
              </div>
            </motion.div>

            {/* Recommendations Nodes */}
            <div className="flex flex-col gap-8">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="glassmorphism w-24 h-24 rounded-full flex items-center justify-center glow-blue"
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(59, 130, 246, 0.3)",
                      "0 0 30px rgba(59, 130, 246, 0.5)",
                      "0 0 15px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <GitBranch size={32} className="text-accent" />
                </motion.div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <p className="text-xs font-medium text-accent">Projects</p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="glassmorphism w-24 h-24 rounded-full flex items-center justify-center glow-cyan"
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(0, 255, 255, 0.3)",
                      "0 0 30px rgba(0, 255, 255, 0.5)",
                      "0 0 15px rgba(0, 255, 255, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Trophy size={32} className="text-primary" />
                </motion.div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <p className="text-xs font-medium text-primary">Hackathons</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            <defs>
              <motion.linearGradient
                id="connectionGradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="100"
                y2="0"
                animate={{
                  x1: [0, 100, 0],
                  x2: [100, 0, 100]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <stop offset="0%" stopColor="rgba(0, 255, 255, 0.5)" />
                <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
              </motion.linearGradient>
            </defs>
            
            {/* Connection lines would be drawn here with animated paths */}
            <motion.path
              d="M 150 150 Q 300 100 450 150"
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
              viewport={{ once: true }}
            />
          </svg>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Project Matching",
              description: "AI analyzes your skills and suggests projects that will enhance your portfolio and learning.",
              icon: GitBranch,
              color: "text-accent"
            },
            {
              title: "Hackathon Recommendations",
              description: "Get notified about hackathons matching your interests, skill level, and career goals.",
              icon: Trophy,
              color: "text-primary"
            },
            {
              title: "Skill Gap Analysis",
              description: "Identify areas for improvement and get personalized learning paths to level up.",
              icon: Brain,
              color: "text-secondary"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glassmorphism p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className={`${feature.color} mb-6 group-hover:scale-110 transition-all duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon size={40} />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <motion.div
                className="flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform duration-300"
                style={{ color: feature.color.replace('text-', '') }}
              >
                Learn more <ArrowRight size={16} className="ml-2" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}