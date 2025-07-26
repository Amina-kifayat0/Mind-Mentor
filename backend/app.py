from flask import Flask, request, jsonify, session, send_from_directory, url_for, make_response
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import config
from flask_session import Session
from bson import ObjectId
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash 
from bson.binary import Binary
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
import os
from werkzeug.utils import secure_filename
from config import MAIL_USERNAME, MAIL_PASSWORD  # ✅ Import credentials from config.py
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta
import threading
import time
from flask import Flask, request, jsonify
import time
import tweepy
import nltk
import re
from nltk.sentiment import SentimentIntensityAnalyzer
import os
from dotenv import load_dotenv
from sentiment import sentiment_bp
from bson.errors import InvalidId
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone, timedelta 
import pytz
from dateutil import parser
from itsdangerous import URLSafeTimedSerializer
from pymongo import MongoClient
from pytz import timezone, utc






app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:4200"])



app.register_blueprint(sentiment_bp)

# Set the Upload Folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SECRET_KEY'] = config.SECRET_KEY  # ✅ Ensure SECRET_KEY is set
app.config['SESSION_COOKIE_HTTPONLY'] = True  # ✅ Allow cookies for Angular
app.config['SESSION_TYPE'] = 'filesystem'  # or 'mongodb', 'redis', etc.
app.config['SESSION_PERMANENT'] = False  # Optional, but helps avoid session persistence issues
app.config['SESSION_USE_SIGNER'] = True 
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
 # Adds extra security to sessions
app.config['SESSION_COOKIE_SECURE'] = False  # Ensure this is False for local development (non-HTTPS)

Session(app)
CORS(app, supports_credentials=True)  # ✅ Important for handling sessions

# ✅ 1. Create Flask app object (Only Once)

#app.config['SECRET_KEY'] = 'your_secret_key'
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# ✅ 4. MongoDB Atlas connection (Only Once)
client = MongoClient(config.MONGO_URI)
db = client["mindmentorDB"]
users_collection = db["users"]  # User collection
admin_collection = db["admin"]  # Admin collection
therapist_requests = db["therapistrequests"]
appointment_requests = db["AppointmentRequests"]  # Temp requests before approval
appointments = db["Appointments"]  # Confirmed appointments
therapists = db["Therapists"]
users = db["Users"]
blocked_therapists = db["blocked_therapists"]
unblocked_therapists = db["unblocked_therapists"]
users_testresult = db["users_testresult"]

print("Therapist count:", therapists.count_documents({}))
print("Therapists data:", list(therapists.find({}, {"email": 1, "_id": 0})))

def send_email_reminder(email, appointment):
    msg = Message("Upcoming Appointment Reminder",
                  sender="your_email@gmail.com",
                  recipients=[email])
    msg.body = f"You have an appointment with {appointment['user_name']} at {appointment['date']}."
    mail.send(msg)

app.config['UPLOAD_FOLDER'] = 'uploads/'  # Directory to store uploaded documents


# MongoDB Configuration
app.config["MONGO_URI"] = config.MONGO_URI
mongo = PyMongo(app)
therapist_requests = mongo.db.therapist_requests
therapists = mongo.db.therapists


# Flask-Mail Configuration
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465  # Use 465 if using SSL
app.config["MAIL_USE_TLS"] = False  # Use False if using SSL (port 465)
app.config["MAIL_USE_SSL"] = True
app.config["MAIL_USERNAME"] = MAIL_USERNAME  # ✅ Use imported credentials
app.config["MAIL_PASSWORD"] = MAIL_PASSWORD  # ✅ Use imported credentials
app.config["MAIL_DEFAULT_SENDER"] = MAIL_USERNAME  # ✅ Use same email as sender
mail = Mail(app)


#for admin forget password
# Serializer for generating tokens


#USER PATIENT CURUDDDDDDDDDDD
@app.route('/get_users', methods=['GET'])
def get_users():
    users = users_collection.find()  # ✅ Use `users_collection` instead of `mongo.db.users`

    user_list = []
    for user in users:
        user_data = {key: user.get(key, "N/A") for key in user.keys()}
        user_data["_id"] = str(user["_id"])  # Convert ObjectId to string
        user_list.append(user_data)

    return jsonify(user_list), 200

@app.route("/delete_user/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        result = users_collection.delete_one({"_id": ObjectId(user_id)})  # ✅ Use `users_collection`
        if result.deleted_count > 0:
            return jsonify({"message": "User deleted successfully"}), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400









# ----------------------------- 🔹 User Routes -----------------------------

# ✅ User Signup Route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    age = data.get("age")
    gender = data.get("gender")
    email = data.get("email")

    if not username or not password or not age or not gender or not email:
        return jsonify({"error": "All fields are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_id = users_collection.insert_one({
        "username": username,
        "password": hashed_password,
        "age": age,
        "gender": gender,
        "email": email
    }).inserted_id  

    session['user_id'] = str(user_id)

    return jsonify({"message": "User registered successfully", "user": {
        "_id": str(user_id),
        "username": username,
        "age": age,
        "gender": gender,
        "email": email
    }}), 201


# ✅ User Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"status": "error", "message": "Both fields are required"}), 400

    user = users_collection.find_one({"username": username})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"status": "error", "message": "Invalid username or password"}), 401

    # Store user ID in session (optional, for server-side sessions)
    session['user_id'] = str(user["_id"])

    # Safely get user data using .get() to avoid KeyError
    user_data = {
        "id": str(user["_id"]),
        "username": user.get("username", ""),  # Default to empty string if 'name' is missing
        "email": user.get("email", ""),  # Default to empty string if 'email' is missing
        "age": user.get("age", ""),  # Default to empty string if 'age' is missing
        "gender": user.get("gender", "")  # Default to empty string if 'gender' is missing
    }

    return jsonify({"status": "success", "message": "Login successful", "data": user_data})








@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clears all keys from the session
    return jsonify({"status": "success", "message": "Logged out successfully"}), 200







# ----------------------------- 🔹 Admin Routes -----------------------------

# ✅ Admin Login Route
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    admin = admin_collection.find_one({"username": username})

    if not admin:
        print("❌ Admin not found in DB")
        return jsonify({"error": "Invalid credentials"}), 401

    print(f"✅ Admin Found: {admin['username']}, Stored Hash: {admin['password']}")

    # Ensure bcrypt is used to check password
    if bcrypt.checkpw(password.encode("utf-8"), admin["password"].encode("utf-8")):
        session['admin_id'] = str(admin['_id'])  # ✅ Store session
        print("✅ Login successful, session set:", session)
        return jsonify({"message": "Login successful"}), 200

    print("❌ Password mismatch")
    return jsonify({"error": "Invalid credentials"}), 401


# ✅ Admin Logout Route
@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_id', None)
    return jsonify({"message": "Admin logged out successfully"}), 200

@app.route('/admin/edit_profile', methods=['POST'])
def edit_admin_profile():
    admin_id = session.get('admin_id')

    if not admin_id:
        return jsonify({"error": "Unauthorized: No admin logged in"}), 401

@app.route('/admin/profile', methods=['GET'])
def get_admin_profile():
    return jsonify({"username": "admin", "password": "your_password"})


#Therapist functions
# Ensure upload folder exists
# Debug: Ensure upload folder exists
@app.route("/therapist_signup", methods=['POST'])
def therapist_signup():
    try:
        print("📌 Route Hit: /therapist_signup")  # Debug: Confirm route is accessed

        # Ensure upload directory exists **before** handling files
        upload_folder = "uploads"
        app.config["UPLOAD_FOLDER"] = upload_folder  # ✅ Explicitly define UPLOAD_FOLDER
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            print(f"📁 Created upload folder: {upload_folder}")

        # 🔍 Debug: Check all received files
        print(f"📂 All received files: {request.files}")  

        # Initialize file path as None
        file_path = None

        # Check if file is received
        if 'cv_document' in request.files:
            cv_document = request.files['cv_document']
            print(f"📂 File field found: {cv_document}")  # Debugging file object

            if cv_document.filename == '':
                print("❌ Error: File field exists but no file was selected!")  # Debug
                return jsonify({"error": "No file selected"}), 400

            if cv_document:
                filename = secure_filename(cv_document.filename)
                file_path = f"{upload_folder}/{str(ObjectId())}_{filename}"  # ✅ Forces forward slashes
 # Ensure forward slashes before storin
                # 🔍 Debug: Check generated file path
                print(f"📝 Corrected file path: {file_path}")  

                cv_document.save(file_path)
                print(f"✅ File successfully saved at: {os.path.abspath(file_path)}")  # Debug: File saved

        else:
            print("❌ Error: 'cv_document' key not found in request.files")  # Debug

        # 🔍 Debug: Check received form data
        data = request.form  # Use form-data for compatibility with file uploads
        print("📩 Received Form Data:", data.to_dict())  # Debug: Print received form data

        # Validate required fields
        required_fields = ["username", "age", "gender", "email", "password", "qualification", "experience", "contact_number"]
        for field in required_fields:
            if not data.get(field):
                print(f"❌ Error: Missing field - {field}")  # Debug: Identify missing field
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Prevent duplicate email signups
        if therapist_requests.find_one({"email": data["email"]}):
            print("❌ Error: Duplicate email found in therapist_requests collection")  # Debug: Email already exists
            return jsonify({"error": "A therapist request with this email already exists"}), 400

        # Debug: Confirm file_path before inserting into DB
        # Ensure file_path uses forward slashes before storing in DB
        if file_path:
          file_path = file_path.replace("\\", "/")  # Convert to forward slashes
          print(f"📄 Corrected file path stored in DB: {file_path}")  # Debugging
        else:
         print("⚠️ Warning: No file uploaded, skipping file storage in DB")
  # ✅ Debugging        # Store therapist request
        therapist_request = {
            "username": data["username"],
            "age": data["age"],
            "gender": data["gender"],
            "email": data["email"],
            "password": bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "qualification": data["qualification"],
            "experience": data["experience"],
            "contact_number": data["contact_number"],
            "cv_document": file_path,  # Store file path if uploaded
            "status": "pending"
        }

        result = therapist_requests.insert_one(therapist_request)
        print(f"✅ Therapist request inserted with ID: {result.inserted_id}")  # Debug: Inserted into DB

        return jsonify({"message": "Therapist request sent for approval"}), 201

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

    



@app.route('/admin/get_therapist_requests', methods=['GET'])
def get_therapist_requests():
    try:
        requests = therapist_requests.find({"status": "pending"})
        response = []
        
        for req in requests:
            response.append({
                "id": str(req["_id"]),
                "username": req["username"],
                "age": req["age"],
                "gender": req["gender"],
                "email": req["email"],
                "qualification": req["qualification"],
                "experience": req["experience"],
                "contact_number": req["contact_number"],
                "cv_document": req.get("cv_document", None),  # Provide file path if available
                "status": req["status"]
            })
        
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




    

@app.route('/admin/update_therapist_status', methods=['POST'])
def update_therapist_status():
    try:
        data = request.json
        therapist_id = data.get("id")
        new_status = data.get("status")  # "approved" or "rejected"

        if new_status not in ["approved", "rejected"]:
            return jsonify({"error": "Invalid status"}), 400

        result = therapist_requests.update_one(
            {"_id": ObjectId(therapist_id)},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Therapist request not found"}), 404

        return jsonify({"message": f"Therapist request {new_status}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#for sending files from therapist signup to admin portal 
@app.route("/download_file/<filename>", methods=["GET"])
def download_file(filename):
    try:
        print(f"✅ Received filename: {filename}")  # Debugging log

        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        if not os.path.exists(file_path):  
            print(f"❌ File not found: {file_path}")  # More debugging info
            return jsonify({"error": "File not found"}), 404
        
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Reject therapist route @app.route('/admin/reject_therapist', methods=['POST'])
@app.route('/admin/reject_therapist', methods=['POST'])
def reject_therapist():
    try:
        data = request.json
        print("Received data:", data)  # Debugging - Log incoming request

        if not data:
            return jsonify({"error": "No data received"}), 400

        therapist_id = data.get('id')
        email = data.get('email')

        if not therapist_id or not email:
            return jsonify({"error": "Missing therapist ID or email"}), 400

        # Connect to MongoDB
        therapist_requests = mongo.db.therapist_requests  # Ensure correct collection name
        result = therapist_requests.delete_one({"_id": ObjectId(therapist_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Therapist not found"}), 404

        # Send rejection email
        try:
            msg = Message(
                "Therapist Request Declined",
                sender=config.MAIL_USERNAME,  # Admin email
                recipients=[email]  # Therapist's email
            )
            msg.body = (
                f"Dear Therapist,\n\n"
                f"We regret to inform you that your request to join our platform has been declined.\n\n"
                f"If you have any questions, please contact support.\n\n"
                f"Best Regards,\n"
                f"Admin Team"
            )
            mail.send(msg)
            print("Rejection email sent successfully to", email)  # Debugging print

        except Exception as e:
            print("Failed to send email:", str(e))  # Log email error
            return jsonify({"error": "Failed to send email", "details": str(e)}), 500

        return jsonify({"message": "Therapist request rejected successfully"}), 200

    except Exception as e:
        print("Unexpected error:", str(e))  # Log unexpected errors
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

#approve therapist
# Approve Therapist
# Approve Therapist
@app.route('/admin/approve_therapist', methods=['POST'])
def approve_therapist():
    try:
        data = request.json
        print("Received data:", data)  # Debugging

        if not data:
            return jsonify({"error": "No data received"}), 400

        therapist_id = data.get('id')
        if not therapist_id:
            return jsonify({"error": "Missing therapist ID"}), 400

        # Connect to MongoDB collections
        therapist_requests = mongo.db.therapist_requests
        therapists = mongo.db.Therapists  # Approved therapists collection

        # Fetch therapist details
        therapist = therapist_requests.find_one({"_id": ObjectId(therapist_id)})
        if not therapist:
            return jsonify({"error": "Therapist not found"}), 404
        
        # Extract CV path (Fixed Issue Here)
        cv_filename = therapist.get("cv_document", "")

        # Fix the duplicated 'uploads/uploads/' issue
        if cv_filename.startswith("uploads/uploads"):
            cv_filename = cv_filename.replace("uploads/uploads", "uploads")

            print("CV Filename Before Insertion:", cv_filename)


        # Extract required details
        therapist_data = {
            "username": therapist["username"],
            "age": therapist["age"],
            "gender": therapist["gender"],
            "email": therapist["email"],
            "qualification": therapist["qualification"],
            "experience": therapist["experience"],
            "contact_number": therapist["contact_number"],
            "cv_document": cv_filename,  # Corrected
            "password": therapist["password"],
        }

        # Move therapist to approved collection
        therapists.insert_one(therapist_data)
        therapist_requests.delete_one({"_id": ObjectId(therapist_id)})

        # Send approval email
        try:
            msg = Message(
                "Therapist Application Approved",
                sender=config.MAIL_USERNAME,
                recipients=[therapist["email"]]
            )
            msg.body = (
                f"Dear {therapist['username']},\n\n"
                f"Congratulations! Your application has been approved.\n"
                f"You can now log in to the system using your registered email.\n\n"
                f"Best Regards,\n"
                f"Admin Team"
            )
            mail.send(msg)
            print("Approval email sent successfully to", therapist["email"])

        except Exception as e:
            print("Failed to send email:", str(e))
            return jsonify({"error": "Failed to send email", "details": str(e)}), 500

        return jsonify({"message": "Therapist approved successfully"}), 200

    except Exception as e:  # Corrected indentation
        print("Unexpected error:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory("uploads", filename)


# Fetch Approved Therapists
@app.route('/admin/get_approved_therapists', methods=['GET'])
def get_approved_therapists():
    try:
        therapists = list(mongo.db.Therapists.find({}, {"password": 0}))  # Exclude password
        for therapist in therapists:
            therapist["_id"] = str(therapist["_id"])  # Convert ObjectId to string
            print("Therapist Data:", therapist)  # Debug API response

        return jsonify(therapists), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch approved therapists", "details": str(e)}), 500




@app.route('/therapist/login', methods=['POST'])
def therapist_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    print(f"🟢 Checking Login for: {username}")  # Debug Step 1

    therapist = db.Therapists.find_one({"username": username})  # Fetch therapist by username

    if therapist:
        print("✅ Therapist Found:", therapist)  # Debug Step 2
        stored_password = therapist.get("password")

        print(f"✅ Stored Password in DB: {stored_password}")  # Debug Step 3
        print(f"✅ Entered Password: {password}")  # Debug Step 4

        # Check password
        if bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
            print("✅ Password Matched!")

            # Store therapist ID in session
            session['therapist_id'] = str(therapist['_id'])

            # Set a cookie for session (optional)
            resp = make_response(jsonify({
                "message": "Login successful",
                "therapist_id": str(therapist["_id"]),
                "username": therapist["username"]
            }), 200)

            # Set session cookie (you can choose a different name for your cookie if you prefer)
            resp.set_cookie('session', str(therapist["_id"]), httponly=True, secure=False)  # secure=True for HTTPS

            return resp

        else:
            print("❌ Password Mismatch")  # Debug Step 5

    print("❌ Invalid Credentials")  # Debug Step 6
    return jsonify({"error": "Invalid credentials"}), 401


    #therapist logout route
@app.route('/therapist/logout', methods=['POST'])
def therapist_logout():
    session.clear()  # Clears all keys from the session
    return jsonify({"message": "Logout successful"}), 200






#for admin forget password route
@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    admin = admin_collection.find_one({"email": email})

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    # Generate password reset token
    token = s.dumps(email, salt="password-reset-salt")
    reset_link = f"http://localhost:4200/adminlogin?token={token}"  # Frontend URL

    # Debug: Print to Flask console to check if email is found
    print(f"✅ Admin Found: {admin}")
    print(f"📩 Sending reset email to: {email} with link: {reset_link}")

    # Send email with reset link
    msg = Message("Password Reset Request", sender="your_email@gmail.com", recipients=[email])
    msg.body = f"Click the link to reset your password: {reset_link}"
    mail.send(msg)

    return jsonify({"message": "Password reset email sent!"})

#reset password of admin
@app.route("/reset_password/<token>", methods=["POST"])
def reset_password(token):
    try:
        email = s.loads(token, salt="password-reset-salt", max_age=3600)  # Token valid for 1 hour
    except:
        return jsonify({"error": "Invalid or expired token"}), 400

    data = request.json
    new_password = data.get("password")

    if not new_password:
        return jsonify({"error": "New password is required"}), 400

    # Hash the new password correctly using bcrypt
    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Update password in MongoDB
    result = admin_collection.update_one({"email": email}, {"$set": {"password": hashed_password}})

    # Debugging print statements
    print(f"🔄 Resetting password for: {email}")
    print(f"🔍 Modified Count: {result.modified_count}")  # Should be 1 if updated successfully

    if result.modified_count == 0:
        return jsonify({"error": "Password reset failed. Admin not found or same password used."}), 400

    return jsonify({"message": "Password has been reset successfully!"})


########################
# Admin deletes therapist
@app.route('/admin/delete_therapist/<therapist_id>', methods=['DELETE'])
def delete_therapist(therapist_id):
    try:
        # Find therapist by ID
        therapist = db.Therapists.find_one({"_id": ObjectId(therapist_id)})
        
        if not therapist:
            return jsonify({"error": "Therapist not found"}), 404

        # Get therapist email before deleting
        therapist_email = therapist.get("email")

        # Delete therapist from MongoDB
        db.Therapists.delete_one({"_id": ObjectId(therapist_id)})

        # Send email notification
        if therapist_email:
            send_therapist_removal_email(therapist_email)

        return jsonify({"message": "Therapist deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Function to send removal email
def send_therapist_removal_email(therapist_email):
    try:
        msg = Message(
            "Account Termination Notice",
            sender="amnakifayat10gujrat@gmail.com",  # Your admin email
            recipients=[therapist_email]
        )
        msg.body = """\
Dear Therapist,

We regret to inform you that due to policy violations, we can no longer continue our collaboration. Your account has been removed from our system.

For further details, please contact our admin at: amnakifayat10gujrat@gmail.coms.

Best regards,  
MindMentor Team
        """
        mail.send(msg)
        print(f"📧 Email sent to {therapist_email}")  # Debugging log
    except Exception as e:
        print(f"❌ Email sending failed: {e}")  # Debugging log


############
@app.route('/updateTherapist/<therapist_id>', methods=['PUT'])
def update_therapist(therapist_id):
    data = request.json

    updated_fields = {
        "username": data.get("username"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "qualification": data.get("qualification"),
        "experience": data.get("experience"),
        "contact_number": data.get("contact_number")
    }

    db.Therapists.update_one({"_id": ObjectId(therapist_id)}, {"$set": updated_fields})
    
    return jsonify({"message": "Therapist updated successfully"}), 200





from flask import request, jsonify
from datetime import datetime
from pytz import timezone, utc
from bson import ObjectId

@app.route('/book_appointment', methods=['POST'])
def book_appointment():
    data = request.get_json()

    iso_date = data.get('date')
    if iso_date:
        if iso_date.endswith('Z'):
            iso_date = iso_date[:-1]
        try:
            # Parse and convert to Asia/Karachi
            parsed_date = datetime.fromisoformat(iso_date)
            parsed_date = parsed_date.replace(tzinfo=utc).astimezone(timezone('Asia/Karachi'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        return jsonify({'error': 'Date is required'}), 400

    user_email = data.get('user_email')
    therapist_id = data.get('therapist_id')

    if not user_email or not therapist_id:
        return jsonify({'error': 'Missing user_email or therapist_id'}), 400

    # 🔒 Check if user already has 3 pending appointment requests
    existing_requests = db.appointment_requests.count_documents({
        'user_email': user_email,
        'status': 'pending'
    })

    if existing_requests >= 3:
        return jsonify({'error': '❌ You already have 3 pending appointment requests. Please wait before booking more.'}), 403

    # ✅ Proceed with storing the new appointment
    appointment = {
        'user_name': data.get('user_name'),
        'user_email': user_email,
        'user_age': data.get('user_age'),
        'user_gender': data.get('user_gender'),
        'therapist_id': therapist_id,
        'message': data.get('message'),
        'date': parsed_date,
        'gad7_score': data.get('gad7_score'),
        'phq9_score': data.get('phq9_score'),
        'sentiment_analysis_score': data.get('sentiment_analysis_score'),
        'status': 'pending'
    }

    db.appointment_requests.insert_one(appointment)
    return jsonify({'message': '✅ Appointment booked successfully'}), 200


@app.route('/approve_appointment', methods=['POST'])
def approve_appointment():
    appointment_id = request.json.get('appointment_id')
    if not appointment_id:
        return jsonify({"error": "Appointment ID is required"}), 400

    try:
        appointment_id_obj = ObjectId(appointment_id)

        # Step 1: Fetch the appointment request
        appointment = db.appointment_requests.find_one({"_id": appointment_id_obj})
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        # Step 2: Normalize appointment datetime to UTC and ensure tz-aware
        appt_time = appointment.get("date")
        if isinstance(appt_time, datetime):
            if appt_time.tzinfo is None:
                appt_time = appt_time.replace(tzinfo=pytz.utc)
            else:
                appt_time = appt_time.astimezone(pytz.utc)
        else:
            return jsonify({"error": "Invalid or missing appointment time"}), 400

        # Step 3: Update status and preserve datetime
        appointment["status"] = "approved"
        appointment["date"] = appt_time

        # Insert into confirmed appointments collection
        db.Appointments.insert_one(appointment)

        # Remove from appointment requests collection
        db.appointment_requests.delete_one({"_id": appointment_id_obj})

        # Step 4: Send email notification to patient/user
        therapist = db.Therapists.find_one({"_id": appointment["therapist_id"]})
        therapist_name = therapist.get("name", "Unknown Therapist") if therapist else "Unknown Therapist"

        user_email = appointment.get('user_email')
        if user_email:
            readable_time = appt_time.astimezone(pytz.timezone("Asia/Karachi")).strftime('%Y-%m-%d %I:%M %p')

            msg = Message(
                'Your Appointment Has Been Approved',
                recipients=[user_email]
            )
            msg.body = (
                f"Dear {appointment['user_name']},\n\n"
                f"Your appointment with {therapist_name} has been approved and scheduled for {readable_time}.\n\n"
                "Best regards,\nMind Mentor Team"
            )
            mail.send(msg)

        return jsonify({"message": "Appointment approved and email sent successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to approve appointment", "details": str(e)}), 500



@app.route('/decline_appointment', methods=['POST'])
def decline_appointment():
    try:
        data = request.json
        request_id = data.get("request_id")
        reason = data.get("reason", "No reason provided")

        if not request_id:
            return jsonify({"error": "Missing request ID"}), 400

        # Fetch the appointment request
        appointment = mongo.db.appointment_requests.find_one({"_id": ObjectId(request_id)})
        if not appointment:
            return jsonify({"error": "Appointment request not found"}), 404

        # Send decline email
        try:
            msg = Message(
                "Appointment Declined",
                recipients=[appointment["user_email"]]
            )
            msg.body = f"Dear {appointment['user_name']}, your appointment request has been declined. Reason: {reason}. Please try booking another time."
            mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

        # Remove request from pending list
        mongo.db.appointment_requests.delete_one({"_id": ObjectId(request_id)})

        return jsonify({"message": "Appointment declined and patient notified"}), 200

    except Exception as e:
        return jsonify({"error": "Failed to decline appointment", "details": str(e)}), 500



from flask import request, jsonify
from datetime import datetime

@app.route('/api/get-appointments', methods=['GET'])
def get_appointment_requests():
    therapist_id = request.args.get("therapist_id")
    if not therapist_id:
        return jsonify({"error": "Therapist ID is required"}), 400

    try:
        appointment_requests = list(db.appointment_requests.find({
            "therapist_id": therapist_id,
            "status": "pending"
        }))

        karachi_tz = pytz.timezone('Asia/Karachi')

        for appointment in appointment_requests:
            appointment["_id"] = str(appointment["_id"])
            if isinstance(appointment.get("date"), datetime):
                dt = appointment["date"]
                if dt.tzinfo is None:
                    dt = pytz.utc.localize(dt)
                appointment["date"] = dt.astimezone(karachi_tz).isoformat()

        return jsonify(appointment_requests), 200

    except Exception as e:
        return jsonify({
            "error": "An error occurred while fetching appointment requests",
            "details": str(e)
        }), 500






@app.route('/api/get-confirmed-appointments', methods=['GET'])
def get_confirmed_appointments():
    therapist_id = request.args.get("therapist_id")
    if not therapist_id:
        return jsonify({"error": "Therapist ID is required"}), 400

    try:
        confirmed_appointments = list(db.Appointments.find({
            "therapist_id": therapist_id,
            "status": "approved"
        }))

        karachi_tz = pytz.timezone('Asia/Karachi')

        for appointment in confirmed_appointments:
            appointment["_id"] = str(appointment["_id"])
            if isinstance(appointment.get("date"), datetime):
                dt = appointment["date"]
                if dt.tzinfo is None:
                    dt = pytz.utc.localize(dt)
                appointment["date"] = dt.astimezone(karachi_tz).isoformat()

        return jsonify(confirmed_appointments), 200

    except Exception as e:
        return jsonify({
            "error": "An error occurred while fetching confirmed appointments",
            "details": str(e)
        }), 500











@app.route('/therapist/profile', methods=['GET'])
def get_therapist_profile():
    # Get therapist_id from session (if therapist is logged in)
    therapist_id = session.get('therapist_id')  # Using session to store therapist_id
    if not therapist_id:
        return jsonify({"message": "Therapist not logged in"}), 401

    # Debugging: Show the therapist ID from session
    print(f"Therapist ID from session: {therapist_id}")

    try:
        # Ensure therapist_id is converted to ObjectId
        if isinstance(therapist_id, str):
            therapist_id = ObjectId(therapist_id)

        # Debugging: Show the therapist_id being queried
        print(f"Looking for therapist with ObjectId: {therapist_id}")

        # Fetch therapist data from the database using ObjectId for MongoDB
        therapist = db.Therapists.find_one({"_id": therapist_id})

        if therapist:
            # Collect all the therapist data in a dictionary
            therapist_data = {
                "username": therapist.get("username"),
                "age": therapist.get("age"),
                "gender": therapist.get("gender"),
                "email": therapist.get("email"),
                "qualification": therapist.get("qualification"),
                "experience": therapist.get("experience"),
                "contact_number": therapist.get("contact_number"),
                "cv_document": therapist.get("cv_document"),  # Assuming you store file path or filename
                "password": therapist.get("password"),
            }
            return jsonify(therapist_data), 200
        else:
            print(f"Therapist not found in database.")
            return jsonify({"message": "Therapist not found"}), 404

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Error fetching therapist profile", "error": str(e)}), 500

@app.route('/api/therapist-profile', methods=['GET'])
def get_therapist_profile_by_id():
    therapist_id = request.args.get('id')

    if not therapist_id:
        return jsonify({"message": "Therapist ID is required"}), 400

    try:
        therapist = db.Therapists.find_one({"_id": ObjectId(therapist_id)})

        if therapist:
            therapist_data = {
                "username": therapist.get("username"),
                "age": therapist.get("age"),
                "gender": therapist.get("gender"),
                "email": therapist.get("email"),
                "qualification": therapist.get("qualification"),
                "experience": therapist.get("experience"),
                "contact_number": therapist.get("contact_number"),
                "cv_document": therapist.get("cv_document"),
                "password": therapist.get("password"),
            }
            return jsonify(therapist_data), 200
        else:
            return jsonify({"message": "Therapist not found"}), 404

    except Exception as e:
        return jsonify({"message": "Error fetching therapist profile", "error": str(e)}), 500




#feedback
@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    feedback_data = request.json
    user_id = feedback_data.get('user_id')
    username = feedback_data.get('username')
    email = feedback_data.get('email')
    rating = feedback_data.get('rating')
    feelings = feedback_data.get('feelings')
    improvement = feedback_data.get('improvement')
    complaints = feedback_data.get('complaints')
    requirements = feedback_data.get('requirements')

    # Validate data (optional)
    if not user_id or not username or not email:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        # Store the feedback data in the database
        db.Feedback.insert_one({
            "user_id": user_id,
            "username": username,
            "email": email,
            "rating": rating,
            "feelings": feelings,
            "improvement": improvement,
            "complaints": complaints,
            "requirements": requirements,
            "timestamp": datetime.utcnow()
        })

        return jsonify({"message": "Feedback submitted successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Error saving feedback", "error": str(e)}), 500
    

@app.route('/api/get-feedback', methods=['GET'])
def get_feedback():
    try:
        feedbacks = db.Feedback.find()
        feedback_list = [feedback for feedback in feedbacks]
        return jsonify(feedback_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching feedback", "error": str(e)}), 500
   


@app.route('/api/delete-feedback/<feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    try:
        # Convert feedback_id to ObjectId
        object_id = ObjectId(feedback_id)  # Ensure it's a valid ObjectId
        result = db.Feedback.delete_one({"_id": object_id})

        if result.deleted_count:
            return jsonify({"message": "Feedback deleted successfully"}), 200
        return jsonify({"message": "Feedback not found"}), 404
    except Exception as e:
        return jsonify({"message": "Error deleting feedback", "error": str(e)}), 500


@app.route('/api/admin/get-all-appointments', methods=['GET'])
def get_all_appointments():
    try:
        # Fetch all therapists into a dictionary using their ID and username
        therapists = {str(t["_id"]): t["username"] for t in db.Therapists.find({}, {"_id": 1, "username": 1})}

        # Fetch all pending appointment requests
        appointment_requests = list(db.appointment_requests.find({"status": "pending"}))
        for appt in appointment_requests:
            appt["_id"] = str(appt["_id"])
            therapist_id = str(appt.get("therapist_id", ""))
            appt["therapist_name"] = therapists.get(therapist_id, "Unknown")

        # Fetch all confirmed appointments
        confirmed_appointments = list(db.Appointments.find({"status": "approved"}))
        for appt in confirmed_appointments:
            appt["_id"] = str(appt["_id"])
            therapist_id = str(appt.get("therapist_id", ""))
            appt["therapist_name"] = therapists.get(therapist_id, "Unknown")

        return jsonify({
            "appointment_requests": appointment_requests,
            "confirmed_appointments": confirmed_appointments
        }), 200

    except Exception as e:
        print(f"⚠️ Error in get_all_appointments: {e}")
        return jsonify({"error": "Error while fetching appointments"}), 500

@app.route('/block-therapist', methods=['POST'])
def block_therapist():
    try:
        email = request.json.get("email")
        if not email:
            return jsonify({"error": "Therapist email is required"}), 400

        # Add to blocked_therapists collection
        db.blocked_therapists.insert_one({"email": email})

        # Remove from unblocked_therapists collection (if exists)
        db.unblocked_therapists.delete_one({"email": email})

        # Delete from therapist_requests collection
        db.therapist_requests.delete_one({"email": email})

        return jsonify({"message": f"Therapist {email} has been blocked successfully"}), 200
    except Exception as e:
        print(f"⚠️ Error blocking therapist: {e}")
        return jsonify({"error": "Error while blocking therapist"}), 500


@app.route('/unblock-therapist', methods=['POST'])
def unblock_therapist():
    try:
        email = request.json.get("email")
        if not email:
            return jsonify({"error": "Therapist email is required"}), 400

        # Remove from blocked_therapists collection
        db.blocked_therapists.delete_one({"email": email})

        # Optionally, add to unblocked_therapists collection
        db.unblocked_therapists.insert_one({"email": email})

        return jsonify({"message": f"Therapist {email} has been unblocked successfully"}), 200
    except Exception as e:
        print(f"⚠️ Error unblocking therapist: {e}")
        return jsonify({"error": "Error while unblocking therapist"}), 500


@app.route('/get-blocked-therapists', methods=['GET'])
def get_blocked_therapists():
    try:
        blocked_therapists = list(db.blocked_therapists.find({}, {'_id': 0}))  # exclude _id from results
        return jsonify(blocked_therapists), 200
    except Exception as e:
        print(f"⚠️ Error fetching blocked therapists: {e}")
        return jsonify({"error": "Failed to fetch blocked therapists"}), 500



@app.route('/api/analytics/users', methods=['GET'])
def get_user_analytics():
    try:
        # Count total users in the database
        user_count = users_collection.count_documents({})
        return jsonify({"total_users": user_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/analytics/quicktests', methods=['GET'])
def get_quicktest_analytics():
    try:
        # Count total quick tests taken
        quicktest_count = users_testresult.count_documents({})
        return jsonify({"total_quick_tests": quicktest_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/analytics/quicktests/over_time', methods=['GET'])
def get_quicktests_over_time():
    try:
        pipeline = [
            {
                "$addFields": {
                    "user_id_obj": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$user_id"}, "objectId"]},
                            "then": "$user_id",
                            "else": {"$toObjectId": "$user_id"}
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id_obj",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {"$unwind": "$user_info"},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "count": {"$sum": 1},
                    "users": {
                        "$push": {
                            "user_id": "$user_id",
                            "user_name": "$user_info.username"
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = list(users_testresult.aggregate(pipeline))
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500






@app.route('/api/user-profile')
def get_user_profile():
    user_id = request.args.get('id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
    except InvalidId:
        return jsonify({'error': 'Invalid user ID'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user['_id'] = str(user['_id'])  # Convert ObjectId to string
    return jsonify(user)






@app.route("/profile", methods=["PUT"])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    data = request.json
    update_fields = {}

    for field in ['username', 'age', 'gender', 'email']:
        if field in data:
            update_fields[field] = data[field]

    if 'email' in update_fields:
        existing = users_collection.find_one({"email": update_fields['email'], "_id": {"$ne": ObjectId(user_id)}})
        if existing:
            return jsonify({"error": "Email already in use"}), 400

    users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    return jsonify({"message": "Profile updated successfully"}), 200

#for saving quick tests in db 

@app.route('/api/quicktest/savehistory', methods=['POST'])
def save_quicktest_history():
    data = request.json
    user_id = data.get('id')  # changed from 'user_id' to 'id'
    gad7_score = data.get('gad7_score')
    phq9_score = data.get('phq9_score')
    anxiety_level = data.get('anxiety_level')
    depression_level = data.get('depression_level')

    if None in [user_id, gad7_score, phq9_score, anxiety_level, depression_level]:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        gad7_score = int(gad7_score)
        phq9_score = int(phq9_score)
    except ValueError:
        return jsonify({"error": "Scores must be integers"}), 400

    record = {
        "user_id": user_id,
        "gad7_score": gad7_score,
        "phq9_score": phq9_score,
        "anxiety_level": anxiety_level,
        "depression_level": depression_level,
        "timestamp": datetime.utcnow()
    }

    try:
        users_testresult.insert_one(record)
        return jsonify({"message": "Test result saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/quicktest/history/<user_id>', methods=['GET'])
def get_quicktest_history(user_id):
    try:
        results = list(users_testresult.find({"user_id": user_id}).sort("timestamp", -1))
        for result in results:
            result["_id"] = str(result["_id"])
            result["timestamp"] = result["timestamp"].strftime('%Y-%m-%d %H:%M')
        return jsonify({"history": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo  # Use backports.zoneinfo for Python <3.9

@app.route('/send_email_reminder/<appointment_id>', methods=['POST'])
def send_email_reminder(appointment_id):
    try:
        appointment_id_obj = ObjectId(appointment_id)

        # Fetch the appointment
        appointment = db.Appointments.find_one({"_id": appointment_id_obj})
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        appt_time = appointment.get("date")
        if not isinstance(appt_time, datetime):
            return jsonify({"error": "Invalid or missing appointment time"}), 400

        # Ensure the appointment time is timezone-aware in Asia/Karachi
        karachi_tz = pytz.timezone("Asia/Karachi")
        if appt_time.tzinfo is None:
            appt_time = karachi_tz.localize(appt_time)
        else:
            appt_time = appt_time.astimezone(karachi_tz)

        # Current time in Asia/Karachi
        now_karachi = datetime.now(karachi_tz)

     # Normalize both to Asia/Karachi timezone
        karachi_tz = pytz.timezone('Asia/Karachi')
        appt_time_khi = appt_time.astimezone(karachi_tz)
        now_khi = datetime.now(karachi_tz)

# Debug print to verify
        print("NOW KARACHI:", now_khi, "APPT TIME KARACHI:", appt_time_khi)

# Check if the reminder is within 1 hour before the appointment
        if not (now_khi <= appt_time_khi <= now_khi + timedelta(hours=1)):
          return jsonify({"error": "Reminder can only be sent within 1 hour before the appointment"}), 400


        # Get therapist email
        therapist = db.Therapists.find_one({"_id": appointment["therapist_id"]})
        if not therapist or "email" not in therapist:
            return jsonify({"error": "Therapist email not found"}), 404

        therapist_email = therapist["email"]
        therapist_name = therapist.get("name", "Your Therapist")

        # Format time for email
        readable_time = appt_time.strftime('%Y-%m-%d %I:%M %p')

        msg = Message(
            subject="Appointment Reminder - Mind Mentor",
            recipients=[therapist_email]
        )
        msg.body = (
            f"Dear {therapist_name},\n\n"
            f"This is a reminder for your upcoming appointment scheduled at {readable_time}.\n\n"
            f"Patient: {appointment.get('user_name', 'N/A')}\n"
            f"Please be prepared.\n\n"
            "Best regards,\nMind Mentor Team"
        )
        mail.send(msg)

        db.Appointments.update_one({"_id": appointment_id_obj}, {"$set": {"reminder_sent": True}})

        return jsonify({"message": "Reminder email sent successfully."}), 200

    except Exception as e:
        return jsonify({"error": "Failed to send reminder email", "details": str(e)}), 500

from config import MONGO_URI
from pymongo import MongoClient

client = MongoClient(MONGO_URI)
db = client["mindmentorDB"]
# 👇 Directly access collection instead of relying on shared 'therapists' variable
Therapists = db["Therapists"]

@app.route('/therapist_forgot_password', methods=['POST'])
def therapist_forgot_password():
    data = request.get_json()
    raw_email = data.get('email', '')
    email = raw_email.strip().lower()

    print(f"Raw email received: '{raw_email}'")
    print(f"Normalized email: '{email}'")

    # ✅ Use the collection directly here
    therapist = Therapists.find_one({'email': email})
    
    if therapist:
        print(f"✅ Therapist found: {therapist['email']}")
        token = s.dumps(email, salt='password-reset-salt')
        reset_url = f"http://localhost:4200/therapistmainform?token={token}"
        
        try:
            msg = Message("MindMentor Therapist Password Reset",
                          sender='your_email@gmail.com',
                          recipients=[email])
            msg.body = f"Click this link to reset your password: {reset_url}"
            mail.send(msg)
            return jsonify({'message': 'Password reset link sent!'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to send email: {str(e)}'}), 500
    else:
        print("❌ No therapist found with this email")
        return jsonify({'error': 'No therapist found with that email'}), 404



@app.route("/therapist_reset_password/<token>", methods=["POST"])
def therapist_reset_password(token):
    data = request.get_json()
    new_password = data.get("password")

    try:
        email = s.loads(token, salt="email-confirm", max_age=3600)
        print("✅ Decoded email from token:", email)
        print("📥 Received new password:", new_password)

        therapist = therapists.find_one({"email": email})
        if therapist:
            # ✅ Hash the new password before saving
            hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            result = therapists.update_one(
                {"email": email},
                {"$set": {"password": hashed_password}}
            )
            print("🔄 Password update result:", result.modified_count)
            return jsonify({"message": "Password reset successful."}), 200
        else:
            return jsonify({"message": "Therapist not found"}), 404

    except Exception as e:
        print("❌ Error during password reset:", str(e))
        return jsonify({"message": "Invalid or expired token"}), 400



#for testing 
# ✅ Test Route to Send Email
@app.route("/send-email")
def send_email():
    try:
        msg = Message(
            "Test Email from Flask",
            recipients=["recipient@example.com"],  # Change this
            body="This is a test email sent from Flask-Mail."
        )
        mail.send(msg)
        return "✅ Email sent successfully!"
    except Exception as e:
        return f"❌ Error: {e}"

# ✅ Run Flask App
if __name__ == "__main__":
    app.run(debug=True)
    
