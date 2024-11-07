from backEnd.DB_Initiator import app
from flask import request,render_template,Request
import subprocess

@app.route('/')
def login():
    return render_template('index.html')
# subprocess.run(['C:\\Users\\kjh15\\AppData\\Roaming\\npm\\npm.cmd', 'run', 'dev'], check=True,cwd ="Code\\frontEnd\\login")

# from flask import Flask, send_from_directory 

# @app.route('/') 
# def serve_vue_app(): 
#     return send_from_directory(app.static_folder, 'index.html') 

def run():
    app.run(debug=True)