from firebase_admin import auth, initialize_app, firestore, credentials

# Initialize Firebase app
# initialize_app(credentials.Certificate("./firebase_auth_local.json"))
initialize_app(credentials.Certificate("./gabeo-poc-ca4ac93f6fd1.json"))


# Initialize Firestore client
db = firestore.client()