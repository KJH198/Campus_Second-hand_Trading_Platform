import os
import backEnd.DB_Initiator as DB_Initiator
from backEnd.DB_Initiator import app
import backEnd.DB_Tools as dbTools
from backEnd.DB_Tools import getUserPicture
from flask import request,render_template,jsonify, send_file


@app.route('/', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('index.html')
    
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'login':
        if (data.get("isManager")) :
            return jsonify({"success":dbTools.mangerLoginJudge(data.get('manager_name'),data.get('password'))})    
        else:
            # with open('1.jpg','rb') as file:  # 在第一次登录后再注释掉
            #     a = file.read()
            # reDefineUser({"user_id":1,"picture":a})
            # with open('0.jpg','rb') as file:
            #     b = file.read()
            # addGoods(1,[b],"goods_name","category_name","goods_price","goods_description")
            return jsonify({"success":dbTools.loginJudge(data.get('phone_number'),data.get('password'))})    
    elif type == 'register':
        return jsonify({"success":dbTools.register(data.get('user_name'),data.get('phone_number'),data.get('password'))})    
    else:       # JSON头异常
        print('JSON header type error!')            
        return jsonify({"success":False})

@app.route('/home', methods=['GET','POST'])
def home():
    if request.method == 'GET':
        goods = dbTools.getUnselledGoods(160)
        json = jsonify({"goods":goods})
        print(json)
        return json
    
    data = request.get_json()
    if (data.get("phone_number") != None):
        return jsonify({"picture_url":getUserPicture(data.get("phone_number"))})

@app.route('/picture/<image_name>', methods=['GET'])
def get_image(image_name):
    image_path = os.path.join("C:\\Users\\kjh15\\Desktop\\Project\\Campus_Second-hand_Trading_Platform\\Code\\picture",image_name)
    if not os.path.exists(image_path):
        return jsonify({'error':'Image nor found'})
    type = get_type(image_name)
    return send_file(image_path,type)
    
# 这是自定义的函数，不是内置函数
def get_type(filename):
    # 根据文件扩展名返回对应的 MIME 类型
    if filename.lower().endswith(('.png')):
        return 'image/png'
    elif filename.lower().endswith(('.jpg', '.jpeg')):
        return 'image/jpeg'
    elif filename.lower().endswith(('.gif')):
        return 'image/gif'
    return 'application/octet-stream'  # 默认二进制流类型


def begin():
    DB_Initiator.init()
    with app.app_context():
        app.run(debug=True)