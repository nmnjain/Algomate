import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHackathonData } from '../utils/useHackathonData';
import { HackathonCard } from './HackathonCard';
import { HackathonDetailModal } from './HackathonDetailModal';
import { Hackathon } from '../utils/useHackathonData';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Rocket, RefreshCw } from 'lucide-react'; // 1. IMPORT REFRESH ICON
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button'; // 2. IMPORT BUTTON
import { toast } from 'sonner'; // 3. IMPORT TOAST FOR NOTIFICATIONS

export function HackathonsPage() {
    const { user } = useAuth();
    // 4. GET THE REFETCH FUNCTION FROM THE HOOK
    const { loading, error, allHackathons, recommendedHackathons, refetch } = useHackathonData();
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

    // 5. ADD STATE FOR THE REFRESH BUTTON'S LOADING STATUS
    const [isRefreshing, setIsRefreshing] = useState(false);

    const nonRecommendedHackathons = allHackathons.filter(
        h => !recommendedHackathons.some(rec => rec.id === h.id)
    );

    const handleKnowMore = (hackathon: Hackathon) => {
        setSelectedHackathon(hackathon);
    };

    const handleCloseModal = () => {
        setSelectedHackathon(null);
    };

    // 6. ADD THE FUNCTION TO HANDLE THE REFRESH ACTION
    const handleRefreshRecommendations = async () => {
        if (!user) {
            toast.error("Please log in to refresh recommendations.");
            return;
        }

        setIsRefreshing(true);
        toast.info("Updating your recommendations...");

        try {
            // Call the backend endpoint to trigger the update
            const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/recommend-hackathons/${user.id}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error("Failed to start recommendation refresh.");
            }

            // Give the backend a moment to process, then refetch the data to update the UI
            setTimeout(() => {
                refetch();
                toast.success("Your recommendations have been updated!");
                setIsRefreshing(false);
            }, 3000); // 3-second delay for backend processing is a good practice

        } catch (error: any) {
            toast.error(error.message || "Could not refresh recommendations.");
            setIsRefreshing(false);
        }
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
            {recommendedHackathons.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* 7. ADD THE BUTTON AND WRAP THE TITLE IN A FLEX CONTAINER */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Rocket className="text-primary" /> Recommended for You
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshRecommendations}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
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
            
            <HackathonDetailModal
                hackathon={selectedHackathon}
                onClose={handleCloseModal}
                user={user}
            />
        </div>
    );
}