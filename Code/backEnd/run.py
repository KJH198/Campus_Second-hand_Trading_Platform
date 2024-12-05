import backEnd.DB_Initiator as DB_Initiator
from backEnd.DB_Initiator import app
import backEnd.DB_Tools as dbTools
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
            return jsonify(dbTools.loginJudge(data.get('phone_number'),data.get('password')))    
    elif type == 'register':
        return jsonify({"success":dbTools.register(data.get('user_name'),data.get('phone_number'),data.get('password'))})    


@app.route('/home', methods=['GET','POST'])
def home():
    if request.method == 'GET':
        return jsonify({"goods":dbTools.getUnselledGoods(80)})
    
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'user_picture':
        picture_url = dbTools.getUserPictureURL(data.get("user_id"))
        fileType = dbTools.getFileType(picture_url)
        return send_file(picture_url, fileType)
    elif type == 'search':
        return jsonify({"goods":dbTools.searchGoods(data.get("query"))})
    elif type == 'category_search':
        return jsonify({"goods":dbTools.searchGoodsCategory(data.get("category_name"))})
    elif type == 'announcement':
        return jsonify({"announcements":dbTools.getAnnouncement()})
    elif type == 'user_info':
        return jsonify({"user_info":dbTools.getUserInfo(data.get("user_id"))})

@app.route('/goods_detail', methods=['POST'])
def goods_detail():
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'detail':
        return jsonify(dbTools.getGoodsInfo(data.get("goods_id"),data.get("user_id")))
    elif type == 'comments':
        return jsonify(dbTools.getConsultation(data.get("goods_id")))
    elif type == 'commit_comment':
        return jsonify({"success":dbTools.addConsultation(data.get("goods_id"),data.get("deliver_id"),data.get("comment"))})
    elif type == 'commit_reply':
        return jsonify({'success':dbTools.addConsultationReply(data.get('goods_comment_id'),data.get('deliver_id'),data.get('second_goods_comment'))})
    elif type == 'like':
        return jsonify({'success':dbTools.like(data.get("like"),data.get("level"),data.get("cancel"),data.get("id"))})
    elif type == 'update_goods':
        return jsonify({'success':dbTools.reDefineGoods(data.get("info"))})
    elif type == 'request_goods_id':
        return jsonify({'success':True, 'goods_id':dbTools.addGoods(data.get("user_id"))})
    
    elif type == 'createorder':
        return jsonify({"success":dbTools.buyGoods(data.get("goods_id"),data.get("buyer_id"))})
    elif type == 'collect':
        if data.get('collect'):
            return jsonify({"success":dbTools.addcollection(data.get("goods_id"),data.get("user_id"))})
        else:
            return jsonify({"success":dbTools.cancelCollection(data.get("goods_id"),data.get("user_id"))})
    elif type == 'accuse':
        return jsonify({"success":dbTools.sendAccusation(data)})
    elif type == 'getaddress':
        return jsonify(dbTools.getAddress(data.get('buyer_id')))

@app.route('/user_profile', methods=['POST'])
def user_profile():
    type = request.headers.get('type')
    data = request.get_json()
    if type == 'get_profile':
        return jsonify(dbTools.getUserInfo(data.get('user_id')))
    elif type == 'get_user_goods':
        return jsonify({"success":True, "goods":dbTools.getUserGoods(data.get('user_id'))})
    elif type == 'update_profile':
        info = {'user_id':data.get('user_id'), 'user_name':data.get('user_name'), 
                'password':data.get('password'), 'phone_number':data.get('phone_number'),
                'other_information':data.get('other_information')}
        return jsonify({"success":dbTools.reDefineUser(info)})
    elif type == 'update_avatar':
        pass
    
@app.route('/goods_picture_show', methods=['POST'])
def goods_picture_show():
    return jsonify({'success': True,'message': '上传成功','url':dbTools.transb264(request.files.get('file'))})

def allowed_file(filename):
    # 检查文件扩展名是否允许
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def begin():
    DB_Initiator.init()
    with app.app_context():
        app.run()