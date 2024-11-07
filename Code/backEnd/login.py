from backEnd.DB_Initiator import app

@app.route('/')
def login():
    return "login"

def run():
    app.run()