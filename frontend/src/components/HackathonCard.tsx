import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Trophy, Users } from 'lucide-react';
import { Hackathon } from '../utils/useHackathonData';

interface Props {
    hackathon: Hackathon;
    onKnowMore: (hackathon: Hackathon) => void;
    isRecommended?: boolean;
}

export function HackathonCard({ hackathon, onKnowMore, isRecommended = false }: Props) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="h-full"
        >
            <Card className={`h-full flex flex-col justify-between glassmorphism group ${isRecommended ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-6">
                    {isRecommended && <Badge className="mb-2 bg-primary">Recommended for you</Badge>}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{hackathon.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{hackathon.portal_name}</p>

                    <div className="space-y-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground"><Trophy size={16} className="text-yellow-400" /> <span>{hackathon.prize_money}</span></div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar size={16} className="text-secondary" /> <span>Apply by {new Date(hackathon.registration_deadline).toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Users size={16} className="text-accent" /> <span>{hackathon.team_size_min}-{hackathon.team_size_max} members</span></div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {hackathon.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        {hackathon.tags.length > 3 && <Badge variant="outline">+{hackathon.tags.length - 3}</Badge>}
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button className="w-full" onClick={() => onKnowMore(hackathon)}>Know More</Button>
                </div>
            </Card>
        </motion.div>
    );
}