from backEnd.DB_Initiator import app,User,db,Log
from flask import request,render_template,jsonify
from datetime import datetime

@app.route('/', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('index.html')
    
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'login':
        user = User.query.filter_by(phone_number = data.get('phone_number')).first()
        if user:
            if user.password == data.get('password'):
                newLog = Log(
                    user_id = user.user_id,
                    log_time = datetime.now(),
                    log_state = True
                )
                db.session.add(newLog)
                db.session.commit()
                return jsonify({"success":True})    # 登录成功
            else:
                newLog = Log(
                    user_id = user.user_id,
                    log_time = datetime.now(),
                    log_state = False
                )
                db.session.add(newLog)
                db.session.commit()
        return jsonify({"success":False})           # 登录失败
    elif type == 'register':
        user = User.query.filter_by(phone_number = data.get('phone_number')).first()
        if user:
            return jsonify({"success":False})       # 用户已存在
        newUser = User(
            user_name = data.get('user_name'),
            phone_number = data.get('phone_number'),
            password = data.get('password'))
        db.session.add(newUser)
        db.session.commit()
        return jsonify({"success":True})
    else:
        print('JSON header type error!')            # 前后端数据通讯异常
        return jsonify({"success":False})

@app.route('/home', methods=['GET','POST'])
def home():
    # if request.method == 'GET':
        # return render_template('index.html')
    return jsonify({"success":True})
    
def run():
    app.run(debug=True)