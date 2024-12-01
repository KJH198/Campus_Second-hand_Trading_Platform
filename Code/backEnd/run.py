import os

import backEnd.DB_Initiator as DB_Initiator
from backEnd.DB_Initiator import app
import backEnd.DB_Tools as dbTools
from backEnd.DB_Tools import getUserPicture
from flask import request,render_template,jsonify, send_file, send_from_directory


@app.route('/', methods=['GET','POST'])
def login():
    #print('login')
    #print(os.getcwd())
    if request.method == 'GET':
        return render_template('index.html')
    
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'login':
        if (data.get("isManager")) :
            return jsonify({"success":dbTools.mangerLoginJudge(data.get('manager_name'),data.get('password'))})    
        else:
            # with open('backEnd\\uploads\\1.jpg','rb') as file:  # 在第一次登录后再注释掉
            #     a = file.read()
            # dbTools.reDefineUser({"user_id":1,"picture":a})
            # with open('Code\\backEnd\\uploads\\0.jpg','rb') as file:
            #     b = file.read()
            # dbTools.addGoods(1,[b],"goods_name","category_name","goods_price","goods_description")
            return jsonify({"success":dbTools.loginJudge(data.get('phone_number'),data.get('password'))})    
    elif type == 'register':
        print(data)
        return jsonify({"success":dbTools.register(data.get('user_name'),data.get('phone_number'),data.get('password'))})    
    else:       # JSON头异常
        print('JSON header type error!')            
        return jsonify({"success":False})

@app.route('/home', methods=['GET','POST'])
def home():
    #print(os.getcwd())
    if request.method == 'GET':
        goods = dbTools.getUnselledGoods(160)
        json = jsonify({"goods":goods})
        print(json)
        return json
    
    data = request.get_json()
    if (data.get("phone_number") != None):
        picture_url = getUserPicture(data.get("phone_number"))      #本地图像路径
        type = get_type(picture_url)
        return send_file(picture_url, type)
    else:
        return jsonify({"error":"Unexpected error in /home"})

##unused yet
@app.route('/picture/<image_name>', methods=['GET'])
def get_image(image_name):
    image_path = os.path.join("E:\\Junior_Autumn\\Database\\Final_Project\\Campus_Second-hand_Trading_Platform\\Code\\picture",image_name)
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