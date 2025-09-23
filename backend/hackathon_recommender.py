import asyncio
import re
from typing import Set, Dict
from supabase import Client
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# A simple set of common English "stop words" to filter out noise from problem statements.
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 
    'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 
    'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 
    'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 
    'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 
    'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 
    'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 
    'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 
    'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves', 'build', 'using'
}

# The Skill Expansion Dictionary remains crucial for broad matches.
SKILL_CATEGORIES: Dict[str, Set[str]] = {
    "frontend": {"react", "angular", "vue", "svelte", "javascript", "typescript", "html", "css", "next.js"},
    "backend": {"node.js", "python", "java", "ruby", "php", "go", "fastapi", "django", "flask", "express.js"},
    "mobile": {"swift", "kotlin", "react native", "flutter", "dart", "xcode", "android studio"},
    "database": {"sql", "mysql", "postgresql", "mongodb", "firebase", "redis", "mariadb"},
    "cloud": {"aws", "azure", "gcp", "docker", "kubernetes", "serverless", "terraform", "heroku"},
    "ai": {"python", "tensorflow", "pytorch", "scikit-learn", "keras", "opencv", "nlp", "machine learning", "deep learning", "gemini"},
    "data science": {"python", "r", "pandas", "numpy", "matplotlib", "seaborn", "jupyter", "sql", "data analysis"},
    "blockchain": {"solidity", "ethereum", "web3", "rust", "smart contracts", "bitcoin", "cryptocurrency"},
    "gaming": {"unity", "unreal engine", "c#", "c++", "blender"},
    "cybersecurity": {"cybersecurity", "kali linux", "wireshark", "metasploit", "penetration testing"},
    "iot": {"iot", "raspberry pi", "arduino", "c++", "python"},
    "open source": {"open source", "git", "github", "collaboration"},
    "fintech": {"fintech", "finance", "blockchain", "api"},
    "healthcare": {"healthcare", "health tech", "ai", "data science"},
    "edtech": {"edtech", "education", "api"}
}

def extract_keywords_from_text(text: str) -> Set[str]:
    """
    A lightweight NLP function to extract meaningful keywords from a problem statement.
    """
    if not text:
        return set()
    
    # 1. Normalize text: lowercase and remove punctuation
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    
    # 2. Tokenize and filter out stop words
    words = text.split()
    keywords = {word for word in words if word not in STOP_WORDS and not word.isdigit()}
    
    return keywords

async def get_user_skills(user_id: str, supabase: Client) -> Set[str]:
    # This function is already correct and does not need changes.
    logger.info(f"🚀 [Recommender] Starting skill fetch for user_id: {user_id}")
    user_skills = set()
    # ... (rest of the function is unchanged)
    try:
        resume_res = await asyncio.to_thread(supabase.table("user_platform_data").select("data").eq("user_id", user_id).eq("platform", "resume").single().execute)
        if resume_res.data and resume_res.data.get('data'):
            resume_data = resume_res.data['data']
            skills = resume_data.get('skills', {})
            if skills and 'technical' in skills:
                tech_skills = skills.get('technical', {})
                for key in ['programming_languages', 'frameworks_libraries', 'databases', 'cloud_platforms', 'devops_tools', 'other_technical']:
                    if key in tech_skills and isinstance(tech_skills[key], list):
                        user_skills.update([skill.lower().strip() for skill in tech_skills[key]])
            logger.info(f"✅ [Recommender] Found {len(user_skills)} skills from resume cache.")
        else:
            logger.warning(f"⚠️ [Recommender] No cached resume data found for user {user_id}.")

        github_res = await asyncio.to_thread(supabase.table("user_platform_data").select("data").eq("user_id", user_id).eq("platform", "github").single().execute)
        if github_res.data and github_res.data.get('data'):
            github_data = github_res.data['data']
            languages = github_data.get('languages', {})
            if languages:
                top_languages = sorted(languages.keys(), key=lambda x: languages[x], reverse=True)[:5]
                user_skills.update([lang.lower().strip() for lang in top_languages])
                logger.info(f"✅ [Recommender] Added {len(top_languages)} languages from GitHub cache.")
        else:
            logger.warning(f"⚠️ [Recommender] No cached GitHub data found for user {user_id}.")
    except Exception as e:
        logger.error(f"❌ [Recommender] Error fetching user skills for {user_id}: {str(e)}", exc_info=True)
    return user_skills


async def generate_and_store_recommendations(user_id: str, supabase: Client):
    """
    Generates recommendations using the new HYBRID model:
    Tags, Problem Statement Keywords, and Category Expansion.
    """
    if not supabase: return
    user_skills = await get_user_skills(user_id, supabase)
    if not user_skills: return

    try:
        # We now need the problem_statement column as well
        hackathons_res = await asyncio.to_thread(
            supabase.table("hackathons").select("id, tags, problem_statement").eq("is_active", True).execute
        )
        if not hackathons_res.data: return
            
        all_hackathons = hackathons_res.data
        logger.info(f"✅ [Recommender] Fetched {len(all_hackathons)} active hackathons to score against {len(user_skills)} user skills.")

        scored_hackathons = []
        for hackathon in all_hackathons:
            score = 0
            
            # Get the hackathon's tags and extract keywords from its problem statement
            hackathon_tags = {tag.lower().strip() for tag in hackathon.get('tags', [])}
            hackathon_keywords = extract_keywords_from_text(hackathon.get('problem_statement', ''))
            
            # --- NEW HYBRID SCORING LOGIC ---
            matched_skills = set() # To avoid double-counting a skill

            # 1. Direct Tag Match (Score: +3)
            for tag in hackathon_tags:
                if tag in user_skills:
                    score += 3
                    matched_skills.add(tag)

            # 2. Problem Statement Keyword Match (Score: +2)
            for keyword in hackathon_keywords:
                if keyword in user_skills and keyword not in matched_skills:
                    score += 2
                    matched_skills.add(keyword)
            
            # 3. Expanded Category Match (Score: +1)
            all_hackathon_terms = hackathon_tags.union(hackathon_keywords)
            for term in all_hackathon_terms:
                if term in SKILL_CATEGORIES:
                    for skill in user_skills:
                        if skill in SKILL_CATEGORIES[term] and skill not in matched_skills:
                            score += 1
                            matched_skills.add(skill) # Add the specific user skill that matched

            if score > 0:
                scored_hackathons.append({"id": hackathon['id'], "score": score})

        scored_hackathons.sort(key=lambda x: x['score'], reverse=True)
        top_recommendations = scored_hackathons[:10]
        
        if top_recommendations:
             logger.info(f"Top scored hackathons for {user_id}: {[(rec['id'], rec['score']) for rec in top_recommendations]}")
        
        recommended_ids = [rec['id'] for rec in top_recommendations]
        
        cache_data = {
            "recommended_ids": recommended_ids,
            "last_updated": datetime.now().isoformat(),
            "based_on_skills_count": len(user_skills),
            "top_match_score": scored_hackathons[0]['score'] if scored_hackathons else 0
        }
        
        await asyncio.to_thread(supabase.table("user_platform_data").upsert({
            "user_id": user_id,
            "platform": "hackathon_recommendations",
            "data": cache_data,
            "last_updated": datetime.now().isoformat()
        }).execute)
        
        logger.info(f"✅ [Recommender] Successfully stored {len(recommended_ids)} recommendations for user {user_id}.")

    except Exception as e:
        logger.error(f"❌ [Recommender] Failed to generate recommendations for {user_id}: {str(e)}", exc_info=True)


