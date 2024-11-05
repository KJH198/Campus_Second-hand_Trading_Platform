from flask import Flask

APP = Flask(__name__)

@APP.route("/")
def root():
    return "Hello World!"

if __name__ == "__main__":
    APP.run()