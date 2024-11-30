import random
from backEnd.DB_Initiator import db,User,Manager,Log,Address,Goods,Order,Message,OrderComment,SecondaryOrderComment,GoodsConsultation,GoodsConsultationReply,Collection,Accusation,Announcement,Picture
from datetime import datetime

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
def reDefineUser(info): # user_id, user_name, password, picture, other_information
    if (info.get("user_id")): user = User.query.filter_by(user_id = info.get("user_id")).first()
    else: return False
    if (info.get("user_name")): user.user_name = info.get("user_name")
    if (info.get("password")): user.password = info.get("password")
    if (info.get("picture")): 
        x = urlGenerator(info.get("picture"))
        print(x)
        user.picture_url = x
    if (info.get("other_information")): user.other_information = info.get("other_information")
    return True

# 生成图片URL
def urlGenerator(binaryPicture):
    global urlCnt
    file_path = 'C:\\Users\\kjh15\\Desktop\\Project\\Campus_Second-hand_Trading_Platform\\Code\\picture\\' + str(urlCnt) + '.jpg'
    with open(file_path, 'wb') as file:     # 二进制写入
        file.write(binaryPicture)
    urlCnt += 1
    return file_path

# 用户信息校验
def loginJudge(phone_number,password):
    user = User.query.filter_by(phone_number = phone_number).first()
    if user:
        if user.password == password:
            addLog(user,True)
            return True    
        addLog(user,False)  # 记录登录失败日志
    return False

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
def getUserPicture(phone_number):
    user = User.query.filter_by(phone_number = phone_number).first()
    return user.picture_url

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
def addPicture(goods,picture):
    url = urlGenerator(picture)
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

# 随机获取未售卖商品
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
        pictures = Picture.query.filter_by(goods_id = goods_id).all()
        pictures_list = [picture.picture_url for picture in pictures]
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_list})
        num -= 1
    return data
    
