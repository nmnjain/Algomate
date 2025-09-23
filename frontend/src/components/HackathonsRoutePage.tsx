import { motion } from "framer-motion";
import { HackathonsPage } from "./HackathonsPage"; // This is the content component we already built

export function HackathonsRoutePage() {
  return (
    // The main App.tsx provides the overall layout, header, and footer.
    // This component just provides the content for the page.
    <div className="gradient-mesh">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section for the Hackathons Page */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Discover Hackathons
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find recommended events based on your skills or browse all upcoming opportunities.
          </p>
        </motion.div>

        {/* This component contains the "Recommended for You" and "All Hackathons" sections */}
        <HackathonsPage />
      </main>
    </div>
  );
}