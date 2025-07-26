from pymongo import MongoClient

MONGO_URI = "mongodb+srv://admindb:bachat123@mindmentorcluster.fxbnm.mongodb.net/?retryWrites=true&w=majority&appName=MindMentorCluster"

try:
    client = MongoClient(MONGO_URI)
    db_names = client.list_database_names()
    print("✅ Successfully connected to MongoDB!")
    print("📌 Databases:", db_names)
except Exception as e:
    print("❌ Connection failed:", e)
