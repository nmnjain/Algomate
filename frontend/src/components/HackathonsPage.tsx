import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHackathonData } from '../utils/useHackathonData';
import { HackathonCard } from './HackathonCard';
import { HackathonDetailModal } from './HackathonDetailModal';
import { Hackathon } from '../utils/useHackathonData';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Rocket } from 'lucide-react';

export function HackathonsPage() {
    const { loading, error, allHackathons, recommendedHackathons } = useHackathonData();
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

    const nonRecommendedHackathons = allHackathons.filter(
        h => !recommendedHackathons.some(rec => rec.id === h.id)
    );

    const handleKnowMore = (hackathon: Hackathon) => {
        setSelectedHackathon(hackathon);
    };

    const handleCloseModal = () => {
        setSelectedHackathon(null);
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-4">All Upcoming Hackathons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-12">
            {/* Recommended Section */}
            {recommendedHackathons.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Rocket className="text-primary" /> Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedHackathons.map(hackathon => (
                            <HackathonCard
                                key={hackathon.id}
                                hackathon={hackathon}
                                onKnowMore={handleKnowMore}
                                isRecommended
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* All Hackathons Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-bold mb-6">All Upcoming Hackathons</h2>
                {nonRecommendedHackathons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nonRecommendedHackathons.map(hackathon => (
                            <HackathonCard key={hackathon.id} hackathon={hackathon} onKnowMore={handleKnowMore} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No other hackathons found at the moment.</p>
                )}
            </motion.div>

            {/* The Modal for displaying details */}
            <HackathonDetailModal hackathon={selectedHackathon} onClose={handleCloseModal} />
        </div>
    );
}