from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/Login', methods=['POST'])
def Login():
    data = request.get_json()
    flag = "log"
    if(data.get('phone')):
        flag = 'register'
        username = data.get('username')
        password = data.get('password')
    if(flag != "log"):
        phone = data.get('phone')
        print(f'Received registration data: username={username}, password={password},phone = {phone}')
    else:
        username = data.get('username')
        password = data.get('password')
        print(f'Received registration data: username={username}, password={password}')

    # 返回一个成功的响应
    return jsonify({"message": "log successful!"}), 200

if __name__ == '__main__':
    app.run(debug=True)