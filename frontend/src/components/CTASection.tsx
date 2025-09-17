import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          className="glassmorphism p-12 md:p-16 rounded-3xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          
          {/* Floating Elements */}
          <motion.div
            className="absolute top-8 left-8 text-primary/30"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles size={24} />
          </motion.div>
          
          <motion.div
            className="absolute top-8 right-8 text-secondary/30"
            animate={{ 
              rotate: [360, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles size={32} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-8 left-1/4 text-accent/30"
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles size={28} />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
                Your developer journey deserves a stage.
              </h2>
            </motion.div>
            
            <motion.p
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join Algomate and supercharge your career with AI-powered insights, 
              beautiful portfolios, and access to the best hackathons worldwide.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan px-12 py-6 text-lg font-semibold group"
                  onClick={() => navigate('/signup')}
                >
                  Get Started Free
                  <motion.div
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </Button>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles size={16} className="text-primary" />
                <span>No credit card required • Free forever</span>
              </motion.div>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-border"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">10,000+</p>
                <p className="text-sm text-muted-foreground">Active Developers</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">4.9/5</p>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">500+</p>
                <p className="text-sm text-muted-foreground">Hackathons Listed</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}