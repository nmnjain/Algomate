import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Trophy, MapPin, Globe, Link as LinkIcon, Info, Code, Linkedin, ArrowLeft } from 'lucide-react';
import { Hackathon } from '../utils/useHackathonData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

// Define Teammate structure locally
interface TeammateProfile {
    id: string;
    name: string;
    avatar_url: string;
    linkedin_url: string | null;
    top_skills: string[];
}

interface Props {
    hackathon: Hackathon | null;
    onClose: () => void;
    user: User | null; // Pass the user object for API calls
}

export function HackathonDetailModal({ hackathon, onClose, user }: Props) {
    // Internal state to manage the view (details vs. teammates)
    const [view, setView] = useState<'details' | 'teammates'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [teammates, setTeammates] = useState<TeammateProfile[]>([]);

    // Reset view to 'details' whenever the modal opens with a new hackathon
    useEffect(() => {
        if (hackathon) {
            setView('details');
            setTeammates([]);
        }
    }, [hackathon]);

    const handleFindTeammates = async () => {
        if (!user || !hackathon) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/find-teammates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hackathon_id: hackathon.id, user_id: user.id })
            });
            if (!response.ok) throw new Error('Failed to fetch teammates.');
            const data = await response.json();
            setTeammates(data.teammates || []);
            setView('teammates'); // Switch to the teammates view on success
        } catch (error) {
            toast.error("Could not find teammates at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {hackathon && (
                <motion.div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        layout // This animates the size change!
                        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                        className="glassmorphism w-full max-w-2xl max-h-[90vh] rounded-2xl p-8 overflow-y-auto"
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    {view === 'details' ? hackathon.name : 'Find Teammates'}
                                </h2>
                                <p className="text-muted-foreground">{view === 'details' ? hackathon.portal_name : `Potential teammates for "${hackathon.name}"`}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X /></Button>
                        </div>
                        <div className="border-b border-border my-6"></div>

                        {/* CONDITIONAL CONTENT */}
                        {view === 'details' && <HackathonDetails hackathon={hackathon} onFindTeammates={handleFindTeammates} isLoading={isLoading} />}
                        {view === 'teammates' && <TeammateResults teammates={teammates} onBack={() => setView('details')} />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Sub-component for Hackathon Details View
const HackathonDetails = ({ hackathon, onFindTeammates, isLoading }: { hackathon: Hackathon, onFindTeammates: () => void, isLoading: boolean }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <InfoItem icon={<Calendar size={18} />} label="Registration Deadline" value={new Date(hackathon.registration_deadline).toLocaleString()} />
            <InfoItem icon={<Calendar size={18} />} label="Event Dates" value={`${new Date(hackathon.start_date).toLocaleDateString()} - ${new Date(hackathon.end_date).toLocaleDateString()}`} />
            <InfoItem icon={<Users size={18} />} label="Team Size" value={`${hackathon.team_size_min} - ${hackathon.team_size_max}`} />
            <InfoItem icon={<Trophy size={18} />} label="Prize Money" value={hackathon.prize_money} />
            <InfoItem icon={hackathon.format === 'Online' ? <Globe size={18} /> : <MapPin size={18} />} label="Format" value={hackathon.format} />
            {hackathon.location && <InfoItem icon={<MapPin size={18} />} label="Location" value={hackathon.location} />}
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Info size={18} /> Problem Statement</h3>
            <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">{hackathon.problem_statement}</p>
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">{hackathon.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={onFindTeammates} disabled={isLoading}>
                {isLoading ? 'Searching...' : <><Users size={16} className="mr-2" /> Find Teammates</>}
            </Button>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.open(hackathon.portal_url, '_blank')}>
                <LinkIcon size={16} className="mr-2" /> Visit Hackathon Page
            </Button>
        </div>
    </>
);

// Sub-component for Teammate Results View
const TeammateResults = ({ teammates, onBack }: { teammates: TeammateProfile[], onBack: () => void }) => (
    <div>
        <Button variant="outline" size="sm" onClick={onBack} className="mb-6"><ArrowLeft size={16} className="mr-2" /> Back to Details</Button>
        {teammates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teammates.map(mate => (
                    <motion.div key={mate.id} className="border border-border p-4 rounded-lg flex flex-col justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <img src={mate.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${mate.name}`} alt={mate.name} className="w-12 h-12 rounded-full" />
                                <span className="font-bold text-foreground">{mate.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {mate.top_skills.map(skill => <Badge key={skill} variant="secondary"><Code size={12} className="mr-1" />{skill}</Badge>)}
                            </div>
                        </div>
                        {mate.linkedin_url ? (
                            <Button className="w-full" onClick={() => window.open(mate.linkedin_url!, '_blank')}><Linkedin size={16} className="mr-2" /> Connect on LinkedIn</Button>
                        ) : (
                            <Button className="w-full" variant="outline" disabled>LinkedIn Not Provided</Button>
                        )}
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <p>No other teammates found for this hackathon yet.</p>
                <p className="text-sm">Be the first to show interest!</p>
            </div>
        )}
    </div>
);

// Helper component
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    </div>
);