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
            # with open('backEnd\\uploads\\1.jpg','rb') as file:  # 在第一次登录后再注释掉
            #     a = file.read()
            # dbTools.reDefineUser({"user_id":1,"picture":a})
            # with open('Code\\backEnd\\uploads\\0.jpg','rb') as file:
            #     b = file.read()
            # addGoods(1,[b],"goods_name","category_name","goods_price","goods_description")
            return jsonify(dbTools.loginJudge(data.get('phone_number'),data.get('password')))    
    elif type == 'register':
        return jsonify({"success":dbTools.register(data.get('user_name'),data.get('phone_number'),data.get('password'))})    


@app.route('/home', methods=['GET','POST'])
def home():
    if request.method == 'GET':
        return jsonify({"goods":dbTools.getUnselledGoods(160)})
    
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'user_picture':
        picture_url = getUserPicture(data.get("user_id"))      #本地图像路径
        print(picture_url)
        type = get_type(picture_url)
        return send_file(picture_url, type)
    elif type == 'search':
        return jsonify({"goods":dbTools.searchGoods(data.get("query"))})
    elif type == 'category_search':
        return jsonify({"goods":dbTools.searchGoodsCategory(data.get("category_name"))})
    elif type == 'announcement':
        return jsonify({"announcements":dbTools.getAnnouncement()})
    else:
        return jsonify({"error":"Unexpected error in /home"})
    
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