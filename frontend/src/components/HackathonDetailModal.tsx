import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Trophy, MapPin, Globe, Link as LinkIcon, Info } from 'lucide-react';
import { Hackathon } from '../utils/useHackathonData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Props {
    hackathon: Hackathon | null;
    onClose: () => void;
}

export function HackathonDetailModal({ hackathon, onClose }: Props) {
    return (
        <AnimatePresence>
            {hackathon && (
                <motion.div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="glassmorphism w-full max-w-2xl max-h-[90vh] rounded-2xl p-8 overflow-y-auto"
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    {hackathon.name}
                                </h2>
                                <p className="text-muted-foreground">{hackathon.portal_name}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X />
                            </Button>
                        </div>

                        <div className="border-b border-border my-6"></div>

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
                            <div className="flex flex-wrap gap-2">
                                {hackathon.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => window.open(hackathon.portal_url, '_blank')}
                            >
                                <LinkIcon size={16} className="mr-2" />
                                Visit Hackathon Page
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    </div>
);