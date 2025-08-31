import { motion } from "motion/react";
import { Activity, Star, Calendar, Trophy, GitBranch, Code2 } from "lucide-react";

export function DashboardPreview() {
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
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent mb-6">
            Your Developer Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get insights into your coding journey with beautiful visualizations and actionable metrics.
          </p>
        </motion.div>

        <motion.div
          className="glassmorphism rounded-3xl p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Welcome back, Naman</h3>
              <p className="text-muted-foreground">Here's your coding activity for this week</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <motion.div 
                className="glassmorphism px-4 py-2 rounded-lg text-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 255, 255, 0.1)" }}
              >
                <span className="text-primary">Day</span>
              </motion.div>
              <motion.div 
                className="glassmorphism px-4 py-2 rounded-lg text-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
              >
                <span className="text-secondary">Week</span>
              </motion.div>
              <motion.div 
                className="glassmorphism px-4 py-2 rounded-lg text-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              >
                <span className="text-accent">Month</span>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Activity, label: "Coding Streak", value: "42 days", color: "text-primary" },
              { icon: Star, label: "Total Points", value: "2,847", color: "text-secondary" },
              { icon: GitBranch, label: "Projects", value: "18", color: "text-accent" },
              { icon: Trophy, label: "Hackathons", value: "5 won", color: "text-yellow-400" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glassmorphism p-6 rounded-xl text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className={`${stat.color} mb-3 mx-auto`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon size={32} />
                </motion.div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity Graph Mock */}
          <div className="glassmorphism p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-foreground">Coding Activity</h4>
              <Code2 className="text-primary" size={20} />
            </div>
            <div className="flex items-end justify-between h-32 gap-2">
              {[40, 65, 45, 80, 35, 90, 75].map((height, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-t from-primary/20 to-primary flex-1 rounded-t-lg"
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ backgroundColor: "rgba(0, 255, 255, 0.3)" }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>

          {/* Skills and Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="glassmorphism p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-foreground mb-4">Top Skills</h4>
              <div className="space-y-3">
                {[
                  { skill: "React", level: 90, color: "bg-primary" },
                  { skill: "TypeScript", level: 85, color: "bg-secondary" },
                  { skill: "Node.js", level: 75, color: "bg-accent" }
                ].map((item, index) => (
                  <div key={item.skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">{item.skill}</span>
                      <span className="text-sm text-muted-foreground">{item.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.level}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="glassmorphism p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-foreground mb-4">Upcoming Hackathons</h4>
              <div className="space-y-3">
                {[
                  { name: "AI Innovation Challenge", date: "Mar 15", prize: "$50K" },
                  { name: "Web3 Builders Hackathon", date: "Mar 22", prize: "$25K" },
                  { name: "Climate Tech Summit", date: "Apr 5", prize: "$30K" }
                ].map((event, index) => (
                  <motion.div
                    key={event.name}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {event.date}
                      </p>
                    </div>
                    <span className="text-xs text-green-400 font-medium">{event.prize}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}