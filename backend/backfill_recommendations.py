import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Import the recommender function from our existing module
from hackathon_recommender import generate_and_store_recommendations

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration ---
# Load environment variables from .env file
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
# --------------------


async def get_eligible_users() -> list[str]:
    """
    Fetches all distinct user IDs who have a 'completed' resume analysis.
    This ensures we only run recommendations for users with available skill data.
    """
    try:
        logger.info("Fetching eligible users from the 'resume_analysis' table...")
        response = await asyncio.to_thread(
            supabase.table("resume_analysis")
            .select("user_id")
            .eq("processing_status", "completed")
            .execute
        )
        
        if response.data:
            # Use a set to get unique user IDs, then convert to a list
            user_ids = list(set(item['user_id'] for item in response.data))
            logger.info(f"Found {len(user_ids)} eligible users to process.")
            return user_ids
        else:
            logger.warning("No users with completed resume analyses found.")
            return []
            
    except Exception as e:
        logger.error(f"Failed to fetch eligible users: {e}")
        return []


async def main():
    """
    Main function to orchestrate the backfill process.
    """
    logger.info("--- Starting Hackathon Recommendation Backfill Script ---")
    
    user_ids = await get_eligible_users()
    
    if not user_ids:
        logger.info("No users to process. Exiting.")
        return

    # Create a list of tasks to run concurrently
    tasks = [generate_and_store_recommendations(user_id, supabase) for user_id in user_ids]
    
    # Run all recommendation tasks in parallel
    logger.info(f"Processing recommendations for {len(tasks)} users concurrently...")
    await asyncio.gather(*tasks)
    
    logger.info("--- Backfill Script Completed Successfully ---")


if __name__ == "__main__":
    # Ensure you have the necessary libraries installed:
    # pip install supabase python-dotenv asyncio
    asyncio.run(main())