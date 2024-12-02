from backEnd.DB_Initiator import db,User,Manager,Log,Address,Goods,Order,Message,OrderComment,SecondaryOrderComment,GoodsConsultation,GoodsConsultationReply,Collection,Accusation,Announcement,Picture
from datetime import datetime
import base64
import random

# 自己修改为本地存储图片文件夹的绝对路径 + \\
picturePath = 'E:\\Junior_Autumn\\Database\\Final_Project\\Campus_Second-hand_Trading_Platform\\Code\\backEnd\\uploads\\'
urlCnt = 0

# 添加管理员
def addManagers(mangers):  
    for manger in mangers:
        newManager = Manager(
            manager_name = manger[0],
            password = manger[1])
        db.session.add(newManager)
        db.session.commit()
    return True

# 管理员身份校验
def mangerLoginJudge(manager_name,password):
    manager = Manager.query.filter_by(manager_name = manager_name).first()
    if manager and manager.password == password: return True    
    return False

# 用户注册
def register(user_name,phone_number,password):
    newUser = User(
            user_name = user_name,
            phone_number = phone_number,
            password = password)
    db.session.add(newUser)
    db.session.commit()
    return True

# 用户信息修改
def reDefineUser(info): # user_id, user_name, password, picture, pictureName, other_information
    if (info.get("user_id")): user = User.query.filter_by(user_id = info.get("user_id")).first()
    else: return False
    if (info.get("user_name")): user.user_name = info.get("user_name")
    if (info.get("password")): user.password = info.get("password")
    if (info.get("picture")): 
        x = urlGenerator(info.get("picture"),info.get("pictureName"))
        user.picture_url = x
    if (info.get("other_information")): user.other_information = info.get("other_information")
    return True

# 生成图片URL
def urlGenerator(binaryPicture,pictureName):
    global urlCnt
    global picturePath
    local_picture_name = str(urlCnt) + get_type(pictureName)
    with open(picturePath+local_picture_name, 'wb') as file:     # 二进制写入
        file.write(binaryPicture)
    urlCnt += 1
    return local_picture_name

def get_type(pictureName):
    # 根据文件扩展名返回对应的 MIME 类型
    if pictureName.lower().endswith(('.png')):
        return '.png'
    elif pictureName.lower().endswith(('.jpg', '.jpeg')):
        return '.jpeg'
    elif pictureName.lower().endswith(('.gif')):
        return '.gif'

# 用户信息校验
def loginJudge(phone_number,password):
    user = User.query.filter_by(phone_number = phone_number).first()
    if user:
        if user.password == password:
            addLog(user,True)
            return {"success":True,"user_id":user.user_id}
        addLog(user,False)  # 记录登录失败日志
    return {"success":False}

# 记录日志
def addLog(user,log_state):
    newLog = Log(
        user_id = user.user_id,
        log_time = datetime.now(),
        log_state = log_state)
    db.session.add(newLog)
    db.session.commit()
    return True

# 获得用户头像
def getUserPicture(user_id):
    print(user_id)
    user = User.query.filter_by(user_id = user_id).first()
    return picturePath + user.picture_url

#获得用户信息
def getUserInfo(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    phone_number = user.phone_number
    user_name = user.user_name
    password = user.password
    picture_url = user.picture_url
    with open(picturePath + picture_url,'rb') as file:
        picture_byte_stream = file.read()
    base64_str = base64.b64encode(picture_byte_stream).decode("ascii")
    other_information = user.other_information
    return {"success":True, "phone_number":phone_number,"user_name":user_name,"password":password,"picture_url":base64_str,"other_information":other_information}

#在profile页面中修改用户信息（用户名，手机号，简介）
def updateProfile(info):
    print(info)
    if (info.get("user_id")): user = User.query.filter_by(user_id = info.get("user_id")).first()
    else: return False
    if (info.get("user_name")): user.user_name = info.get("user_name")
    if (info.get("phone_number")): user.phone_number = info.get("phone_number")
    if (info.get("other_information")): user.other_information = info.get("other_information")
    if (info.get("password")): user.password = info.get("password")
    db.session.commit()
    return True

#获取用户发布的商品
def getUserGoods(user_id):
    goods = Goods.query.filter_by(seller_id = user_id).all()
    size = len(goods)
    data = []
    for i in range(0,size):
        userGoods = goods[i]
        goods_id = userGoods.goods_id
        goods_name = userGoods.goods_name
        goods_price = userGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        pictures_list = [picturePath + first_picture.picture_url]
        pictures_byte_stream_list = []
        for picture_url in pictures_list:
            with open(picture_url,'rb') as file:
                picture_byte_stream = file.read()
            base64_str = base64.b64encode(picture_byte_stream).decode("ascii")
            pictures_byte_stream_list.append(base64_str)
        if (len(pictures_byte_stream_list) != 0):
            data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_byte_stream_list[0]})
    return data

################################################################################################################
# 添加商品
def addGoods(seller_id,pictures,goods_name,category_name,goods_price,goods_description):
    newGoods = Goods(
        seller_id = seller_id,
        begin_time = datetime.now(),
        goods_name = goods_name,
        category_name = category_name,
        goods_price = goods_price,
        goods_description = goods_description,
        goods_state = "在售",
        heat = 0
    )
    db.session.add(newGoods)
    db.session.commit()
    for picture in pictures:
        addPicture(newGoods,picture)
        return True

# 为商品添加图片
def addPicture(goods,picture,pictureName):
    url = urlGenerator(picture,pictureName)
    newPicture = Picture(
        picture_url = url, 
        goods_id = goods.goods_id
    )
    db.session.add(newPicture)
    db.session.commit()

# 修改商品信息
def reDefineGoods(info):  # goods_id,seller_id,pictures,goods_name,category_name,goods_price,goods_description
    if (info.get("goods_id")): goods = Goods.query.filter_by(goods_id = info.get("goods_id")).first()
    else: return False
    if (info.get("seller_id")): goods.seller_id = info.get("seller_id")
    if (info.get("goods_name")): goods.goods_name = info.get("goods_name")
    if (info.get("category_name")): goods.category_name = info.get("category_name")
    if (info.get("goods_price")): goods.goods_price = info.get("goods_price")
    if (info.get("goods_description")): goods.goods_description = info.get("goods_description")
    if (info.get("pictures")):
        old_pictures = Picture.query.filter_by(goods_id = info.get("goods_id")).all()
        db.session.delete(old_pictures)
        for picture in info.get("pictures"): addPicture(goods,picture)
    return True

# 随机获取在售商品预览页
def getUnselledGoods(num):
    goods = Goods.query.filter_by(goods_state = "在售").all()
    size = len(goods)
    data = []
    num = min(size,num)
    while num:
        randGoods = goods[random.randint(0, size - 1)]
        goods_id = randGoods.goods_id
        goods_name = randGoods.goods_name
        goods_price = randGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        pictures_list = [picturePath + first_picture.picture_url]
        pictures_byte_stream_list = []
        for picture_url in pictures_list:
            with open(picture_url,'rb') as file:
                picture_byte_stream = file.read()
            base64_str = base64.b64encode(picture_byte_stream).decode("ascii")
            pictures_byte_stream_list.append(base64_str)
        if (len(pictures_byte_stream_list) != 0):
            data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_byte_stream_list[0]})
        num -= 1
    return data
    
# 获取商品详情页
def getGoodsInfo(goods_id):
    goods = Goods.query.filter_by(goods_id = goods_id).first()
    goods_name = goods.goods_name
    goods_price = goods.goods_price
    goods_pictures_url = Picture.query.filter_by(goods_id = goods_id).all()
    pictures_list = [goods_picture_url.picture_url for goods_picture_url in goods_pictures_url]
    seller_id = goods.seller_id
    begin_time = goods.begin_time
    category_name = goods.category_name 
    goods_description = goods.goods_description
    goods_state = goods.goods_state
    heat = goods.heat
    return {"goods_name":goods_name,"goods_price":goods_price,"pictures_url":pictures_list,"seller_id":seller_id,
            "begin_time":begin_time, "category_name":category_name,"goods_description":goods_description,
            "goods_state":goods_state,"heat":heat}
    
# 按关键字搜索商品
def searchGoods(info):
    goods = None
    if len(info) != 0 and info is not None:
        goods = Goods.query.filter_by(goods_state="在售").filter(
            (Goods.goods_name.contains(info)) | (Goods.goods_description.contains(info))).all()
    size = len(goods)
    data = []
    for i in range(0,size):
        searchedGoods = s[i]
        goods_id = searchedGoods.goods_id
        goods_name = searchedGoods.goods_name
        goods_price = searchedGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        pictures_list = [first_picture.picture_url]
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_list})
    return data

# 按类别搜索商品
def searchGoodsCategory(category):
    goods = Goods.query.filter_by(category_name=category).all()    
    size = len(goods)
    data = []
    for i in range(0,size):
        searchedGoods = s[i]
        goods_id = searchedGoods.goods_id
        goods_name = searchedGoods.goods_name
        goods_price = searchedGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        pictures_list = [first_picture.picture_url]
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_list})
    return data

########################################################################################################################
def getAnnouncement():
    announcements = Announcement.query.order_by(Announcement.deliver_time).all()
    size = len(announcements)
    data = []
    for i in range(0,size):
        announcement = announcements[i]
        manger_name = announcement.manger_name
        deliver_time = announcement.deliver_time
        title = announcement.title
        content = announcement.content
        data.append({"manger_name":manger_name,"deliver_time":deliver_time,"title":title,"content":content})
    return data