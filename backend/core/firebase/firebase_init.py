from firebase_admin import auth, initialize_app, firestore, credentials

# Initialize Firebase app
# initialize_app(credentials.Certificate("./firebase_auth_local.json"))
initialize_app(credentials.Certificate("./heliorcm-46d2b-firebase-adminsdk-fbsvc-c417bac768.json"))


# Initialize Firestore client
db = firestore.client()