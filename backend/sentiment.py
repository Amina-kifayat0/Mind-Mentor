# routes/sentiment.py
import time
import tweepy
import nltk
import re
from nltk.sentiment import SentimentIntensityAnalyzer
import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import traceback
from config import BEARER_TOKEN

# Load Twitter credentials
load_dotenv()

USE_MOCK_TWEETS = False

# Init Twitter client
client = tweepy.Client(bearer_token=BEARER_TOKEN)

# Download VADER lexicon only once
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

# Setup Flask Blueprint
sentiment_bp = Blueprint('sentiment', __name__)

def extract_username(profile_url):
    match = re.search(r"(?:https?:\/\/)?x\.com\/([a-zA-Z0-9_]+)", profile_url)
    return match.group(1) if match else None

def fetch_user_tweets(profile_url, count=10):
    if USE_MOCK_TWEETS:
        return [
            "I love working on my final year project!",
            "Feeling a bit tired, but excited for the demo.",
            "Debugging code is frustrating but rewarding.",
            "Had a great discussion with my supervisor today.",
            "Struggling with some Flask bugs right now."
        ]
    
    try:
        username = extract_username(profile_url)
        if not username:
            raise Exception("Invalid X (Twitter) profile URL format.")

        user = client.get_user(username=username, user_fields=["id"])
        if not user.data:
            raise Exception("User not found on X (Twitter).")

        user_id = user.data.id
        count = max(10, min(count, 100))
        tweets = client.get_users_tweets(id=user_id, max_results=count, tweet_fields=["text"])

        if not tweets.data:
            raise Exception("No public tweets found for this user.")

        return [tweet.text for tweet in tweets.data]

    except tweepy.TooManyRequests as e:
        print("Rate limit hit:", e)
        raise Exception("X API rate limit exceeded. Please try again later.")
    
    except Exception as e:
        print(f"Error: {e}")
        raise

def analyze_sentiment(tweets):
    if not tweets:
        return {"summary": "No tweets found.", "examples": []}

    results = []
    compound_scores = []

    for tweet in tweets:
        score = sia.polarity_scores(tweet)
        compound_scores.append(score['compound'])
        results.append({
            "text": tweet,
            "score": score['compound']
        })

    avg = sum(compound_scores) / len(compound_scores)

    if avg >= 0.05:
        sentiment = "Positive 😊"
    elif avg <= -0.05:
        sentiment = "Negative 😡"
    else:
        sentiment = "Neutral 😐"

    # Choose top 2 most influential tweets (strongest polarity)
    sorted_results = sorted(results, key=lambda x: abs(x['score']), reverse=True)
    top_examples = sorted_results[:2]

    explanation = f"The sentiment is **{sentiment}** because your recent tweets contained language that reflects "
    if sentiment == "Positive 😊":
        explanation += "happiness, enthusiasm, or positivity."
    elif sentiment == "Negative 😡":
        explanation += "anger, sadness, or frustration."
    else:
        explanation += "a mix of emotions or neutral tones."

    examples = [{"text": ex["text"], "score": ex["score"]} for ex in top_examples]

    return {
        "summary": f"Overall Sentiment: {sentiment}",
        "explanation": explanation,
        "examples": examples
    }

@sentiment_bp.route('/analyze-sentiment', methods=['POST'])
def analyze():
    try:
        data = request.json
        profile_url = data.get("profile_url")

        if not profile_url:
            return jsonify({"error": "Profile URL is required"}), 400

        tweets = fetch_user_tweets(profile_url, count=10)
        result = analyze_sentiment(tweets)

        return jsonify(result)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@sentiment_bp.route('/api/sentiment', methods=['POST'])
def get_sentiment():
    try:
        data = request.get_json()
        profile_url = data.get('url')

        if not profile_url:
            return jsonify({'error': 'Profile URL is required'}), 400

        tweets = fetch_user_tweets(profile_url, count=10)
        result = analyze_sentiment(tweets)
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
