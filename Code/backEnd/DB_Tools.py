import os
from backEnd.DB_Initiator import db,User,Manager,Log,Address,Goods,Order,Message,OrderComment,SecondaryOrderComment,GoodsConsultation,GoodsConsultationReply,Collection,Accusation,Announcement,Picture
from datetime import datetime
import base64
import random

# 自己修改为本地存储图片文件夹的绝对路径 + \\
picturePath = "C:\\Users\\kjh15\\Desktop\\Project\\picture\\"
Default_url = 'default.jpg'

############################################## 用户管理 ################################################################
# 用户注册
def register(user_name,phone_number,password):
    newUser = User(
            user_name = user_name,
            phone_number = phone_number,
            password = password, 
            picture_url = Default_url, 
            isbanned = False)
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
        picture = info.get("picture")
        pictureName = info.get("pictureName")
        x = urlGenerator(picture,pictureName)
        deleteUserPicture(user.user_id)
        user.picture_url = x
    if (info.get("other_information")): user.other_information = info.get("other_information")
    db.session.commit()
    return True

# 生成图片URL
def urlGenerator(binaryPicture,pictureName):
    global picturePath
    with open (picturePath[:-8] + 'urlCnt.txt','r') as file:
        urlCnt = int(file.read())
    local_picture_name = str(urlCnt) + getPicturetype(pictureName)
    with open(picturePath + local_picture_name, 'wb') as file:     # 二进制写入
        file.write(binaryPicture)
    with open (picturePath[:-8] + 'urlCnt.txt','w') as file:
        file.write(str(urlCnt + 1))
    return local_picture_name

# 删除用户图片
def deleteUserPicture(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    full_url = picturePath + user.picture_url
    os.remove(full_url)
    user.picture_url = Default_url
    db.session.commit()
    return True

# 根据文件扩展名返回对应的图片类型
def getPicturetype(pictureName):
    if pictureName.lower().endswith(('.png')):
        return '.png'
    elif pictureName.lower().endswith(('.jpg', '.jpeg')):
        return '.jpeg'
    elif pictureName.lower().endswith(('.gif')):
        return '.gif'
    
def getFileType(filename):
    # 根据文件扩展名返回对应的 MIME 类型
    if filename.lower().endswith(('.png')):
        return 'image/png'
    elif filename.lower().endswith(('.jpg', '.jpeg')):
        return 'image/jpeg'
    elif filename.lower().endswith(('.gif')):
        return 'image/gif'
    return 'application/octet-stream'  # 默认二进制流类型

# 用户信息校验
def loginJudge(phone_number,password):
    user = User.query.filter_by(phone_number = phone_number).first()
    if user:
        if user.password == password:
            if user.isbanned == False:
                addLog(user,True)
                return {"success":True,"user_id":user.user_id}
            else: return {"success":False,"info":"banned"}
        addLog(user,False)  # 记录登录失败日志
    return {"success":False,"info":'wrong'}

# 记录日志
def addLog(user,log_state):
    newLog = Log(
        user_id = user.user_id,
        log_time = datetime.now(),
        log_state = log_state)
    db.session.add(newLog)
    db.session.commit()
    return True

# 获得用户头像本地地址
def getUserPictureURL(user_id):
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
    isbanned = user.isbanned
    return {"success":True, "phone_number":phone_number,"user_name":user_name,
            "password":password,"picture_url":base64_str,"other_information":other_information,
            "isbanned":isbanned}

#获取用户发布的商品
def getUserGoods(user_id):
    goods = Goods.query.filter_by(seller_id = user_id,goods_state = '在售').all()
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

def getBuyerOrders(user_id):
    orders = Order.query.filter_by(buyer_id = user_id)
    data = []
    for order in orders:
        goods_id = order.goods_id
        order_state = order.order_state
        deal_time = order.deal_time
        goods = Goods.query.filter_by(goods_id = goods_id).first()
        goods_name = goods.goods_name
        goods_price = goods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        
        picture_local_url = picturePath + first_picture.picture_url
        with open(picture_local_url,'rb') as file:
            picture_byte_stream = file.read()
        picture = base64.b64encode(picture_byte_stream).decode("ascii")
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,
                     "order_state":order_state,"picture":picture,'deal_time':deal_time})
    return data

def getSellerOrders(user_id):
    goods_list = Goods.query.filter_by(seller_id = user_id,goods_state = '已售出').first()
    data = []
    for goods in goods_list:
        goods_id = goods.goods_id
        order = Order.query.filter_by(goods_id = goods_id).first()
        order_state = order.order_state
        deal_time = order.deal_time
        goods_name = goods.goods_name
        goods_price = goods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        
        picture_local_url = picturePath + first_picture.picture_url
        with open(picture_local_url,'rb') as file:
            picture_byte_stream = file.read()
        picture = base64.b64encode(picture_byte_stream).decode("ascii")
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,
                     "order_state":order_state,"picture":picture,'deal_time':deal_time})
    return data
############################################# 管理员管理 #######################################################################
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
    if manager != None and manager.password == password: return True  
    return False

# 查看用户登录日志
def searchUserLog(user_id):
    logs = Log.query.filter_by(user_id = user_id)
    return [{"log_time":log.log_time,"log_state":log.log_state} for log in logs]

# 封禁用户
def ban(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    user.isbanned = True
    db.session.commit()
    return True

# 解封用户
def unban(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    user.isbanned = False
    db.session.commit()
    return True

def getMangerAnnouncement(manger_name):
    announcements = Announcement.query.filter_by(manger_name = manger_name).all()
    data = [{"announce_id":announcement.announcement_id,"manger_name":announcement.manger_name,
             "deliver_time":announcement.deliver_time,"title":announcement.title,"content":announcement.content} 
            for announcement in announcements]
    return data
############################################# 商品管理 #####################################################################
# 添加商品
def addGoods(seller_id):
    newGoods = Goods(
        seller_id = seller_id,
        begin_time = datetime.now(),
        goods_name = '',
        category_name = '',
        goods_price = '',
        goods_description = '',
        goods_state = "在售",
        heat = 0
    )
    db.session.add(newGoods)
    db.session.commit()
    return newGoods.goods_id

# 强制删除商品
def deleteGoods(goods_id):
    goods = Goods.query.filter_by(goods_id = goods_id).first()
    db.session.delete(goods)
    db.session.commit()
    return True

# 为商品添加图片
def addPictures(goods_id,pictures,pictures_type):
    size = len(pictures_type)
    for i in range(size):
        url = urlGenerator(bytes(base64.b64decode(pictures[i])),pictures_type[i])
        newPicture = Picture(
            picture_url = url, 
            goods_id = goods_id
        )
        db.session.add(newPicture)
    db.session.commit()
    return True    
    
    
# 删除商品图片
def deletePictures(urls):
    for url in urls:
        picture = Picture.query.filter_by(picture_url = url).first()
        db.session.delete(picture)
        full_url = picturePath + url
        os.remove(full_url)
    db.session.commit()
    return True
    
# 修改商品信息
def reDefineGoods(info):  # goods_id,seller_id,pictures,goods_name,category_name,goods_price,goods_description
    if (info.get("goods_id")): goods = Goods.query.filter_by(goods_id = info.get("goods_id")).first()
    else: return False
    if (info.get("seller_id")): goods.seller_id = info.get("seller_id")
    if (info.get("goods_name")): goods.goods_name = info.get("goods_name")
    if (info.get("category_name")): goods.category_name = info.get("category_name")
    if (info.get("goods_price")): goods.goods_price = info.get("goods_price")
    if (info.get("goods_description")): goods.goods_description = info.get("goods_description")
    if (info.get("goods_pictures")):
        goods_id = info.get("goods_id")
        # 删除该goods_id的原有图片
        goods_pictures_url = Picture.query.filter_by(goods_id = goods_id).all()
        deletePictures([goods_picture_url.picture_url for goods_picture_url in goods_pictures_url])
        # 添加该goods_id的新增照片
        addPictures(goods_id,info.get("goods_pictures"),info.get("pictures_type"))
    db.session.commit()
    return True

# 随机获取在售商品预览页
def getUnselledGoods(num):
    goods = Goods.query.filter_by(goods_state = "在售").all()
    data = []
    if (len(goods) == 0): return data
    goodsIdSet = set()
    for i in range(num):
        goodsIdSet.add(random.randint(0, len(goods) - 1))
    for i in goodsIdSet:
        randGoods = goods[i]
        goods_id = randGoods.goods_id
        goods_name = randGoods.goods_name
        goods_price = randGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        
        picture_local_url = picturePath + first_picture.picture_url
        with open(picture_local_url,'rb') as file:
            picture_byte_stream = file.read()
        picture = base64.b64encode(picture_byte_stream).decode("ascii")
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":picture})
    return data

def transb264(pictureFile):
    picture_byte_stream = pictureFile.read()
    return base64.b64encode(picture_byte_stream).decode("ascii")
    
# 获取商品详情页
def getGoodsInfo(goods_id,user_id):
    goods = Goods.query.filter_by(goods_id = goods_id).first()
    goods_name = goods.goods_name
    goods_price = goods.goods_price
    goods_pictures_url = Picture.query.filter_by(goods_id = goods_id).all()
    pictures_list = [picturePath + goods_picture_url.picture_url for goods_picture_url in goods_pictures_url]
    pictures_byte_stream_list = []
    #新加
    pictures_type = [goods_picture_url.picture_url for goods_picture_url in goods_pictures_url]
    for picture_url in pictures_list:
        with open(picture_url,'rb') as file:
            picture_byte_stream = file.read()
        base64_str = base64.b64encode(picture_byte_stream).decode("ascii")
        pictures_byte_stream_list.append(base64_str)
        
    seller_id = goods.seller_id
    seller = User.query.filter_by(user_id = seller_id).first()
    seller_name = seller.user_name
    
    picture_local_url = picturePath + seller.picture_url
    with open(picture_local_url,'rb') as file:
        picture_byte_stream = file.read()
    seller_picture = base64.b64encode(picture_byte_stream).decode("ascii")
    
    begin_time = goods.begin_time
    category_name = goods.category_name 
    goods_description = goods.goods_description
    goods_state = goods.goods_state
    heat = goods.heat
    return {"goods_name":goods_name,"goods_price":goods_price,"goods_pictures":pictures_byte_stream_list,"seller_name":seller_name,
            "seller_picture":seller_picture,"begin_time":begin_time, "category_name":category_name,"seller_id":seller_id,
            "goods_description":goods_description,"goods_state":goods_state,"heat":heat,"collected":checkCollection(goods_id,user_id), "pictures_type":pictures_type}
    
# 按关键字搜索商品
def searchGoods(info):
    goods = None
    if len(info) != 0 and info is not None:
        goods = Goods.query.filter_by(goods_state="在售").filter(
            (Goods.goods_name.contains(info)) | (Goods.goods_description.contains(info))).all()
    size = len(goods)
    data = []
    for i in range(0,size):
        searchedGoods = goods[i]
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
        searchedGoods = goods[i]
        goods_id = searchedGoods.goods_id
        goods_name = searchedGoods.goods_name
        goods_price = searchedGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        pictures_list = [first_picture.picture_url]
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":pictures_list})
    return data

############################################### 商品询问管理 #################################################################
def addConsultation(goods_id,deliver_id,comment):
    newConsultation = GoodsConsultation(
            goods_id = goods_id,
            deliver_id = deliver_id,
            comment = comment,
            comment_time = datetime.now(), 
            helpful = 0,
            unhelpful = 0)
    db.session.add(newConsultation)
    db.session.commit()
    return True

def addConsultationReply(goods_consultation_id,deliver_id,comment):
    newConsultationReply = GoodsConsultationReply(
            goods_consultation_id = goods_consultation_id,
            deliver_id = deliver_id,
            comment = comment,
            comment_time = datetime.now(), 
            helpful = 0,
            unhelpful = 0)
    db.session.add(newConsultationReply)
    db.session.commit()
    return True

def like(like,level,cancel,id):
    if level == 1:
        goodsConsultation = GoodsConsultation.query.filter_by(goods_consultation_id = id).first()
        if like: 
            if cancel: goodsConsultation.helpful = goodsConsultation.helpful - 1
            else: goodsConsultation.helpful = goodsConsultation.helpful + 1
        else: 
            if cancel: goodsConsultation.unhelpful = goodsConsultation.unhelpful - 1
            else: goodsConsultation.unhelpful = goodsConsultation.unhelpful + 1   
    else:
        goodsConsultationReply = GoodsConsultationReply.query.filter_by(goods_consultation_reply_id = id).first()
        if like: 
            if cancel: goodsConsultationReply.helpful = goodsConsultationReply.helpful - 1
            else: goodsConsultationReply.helpful = goodsConsultationReply.helpful + 1
        else: 
            if cancel: goodsConsultationReply.unhelpful = goodsConsultationReply.unhelpful - 1
            else: goodsConsultationReply.unhelpful = goodsConsultationReply.unhelpful + 1 
    db.session.commit()   #提交事务
    return True
    
def getConsultation(goods_id):
    goodsConsultations = GoodsConsultation.query.filter_by(goods_id = goods_id).all()
    data = []
    for goodsConsultation in goodsConsultations:
        goods_consultation_id = goodsConsultation.goods_consultation_id
        
        deliver_id = goodsConsultation.deliver_id
        deliver = User.query.filter_by(user_id = deliver_id).first()
        deliver_name = deliver.user_name
    
        picture_local_url = picturePath + deliver.picture_url
        with open(picture_local_url,'rb') as file:
            picture_byte_stream = file.read()
        deliver_picture = base64.b64encode(picture_byte_stream).decode("ascii")
        
        comment = goodsConsultation.comment
        comment_time = goodsConsultation.comment_time
        helpful = goodsConsultation.helpful
        unhelpful = goodsConsultation.unhelpful
        replies = GoodsConsultationReply.query.filter_by(goods_consultation_id = goods_consultation_id).all()
        data2 = []
        for reply in replies:
            reply_id = reply.goods_consultation_reply_id
            deliver_id2 = reply.deliver_id
            deliver2 = User.query.filter_by(user_id = deliver_id2).first()
            deliver_name2 = deliver2.user_name
        
            picture_local_url2 = picturePath + deliver2.picture_url
            with open(picture_local_url2,'rb') as file:
                picture_byte_stream2 = file.read()
            deliver_picture2 = base64.b64encode(picture_byte_stream2).decode("ascii")
        
            comment2 = reply.comment
            comment_time2 = reply.comment_time
            helpful2 = reply.helpful
            unhelpful2 = reply.unhelpful
            data2.append({"second_goods_comment_id":reply_id,"deliver_name":deliver_name2,
                          "deliver_picture":deliver_picture2,"comment":comment2,"comment_time":comment_time2,
                          "helpful":helpful2,"unhelpful":unhelpful2})
        data.append({"goods_comment_id":goods_consultation_id,"deliver_name":deliver_name,
                     "deliver_picture":deliver_picture,"comment":comment,"comment_time":comment_time,
                     "helpful":helpful,"unhelpful":unhelpful,"reply":data2})
    return data

############################################# 订单评价管理 ########################################################################
def addOrderComment(goods_id,order_grade,comment):
    newOrderComment = OrderComment(
        goods_id = goods_id,
        order_grade = order_grade,
        comment = comment,
        comment_time = datetime.now(),
        helpful = 0,
        unhelpful = 0
    )
    db.session.add(newOrderComment)
    db.session.commit()
    return True

def addSecondaryOrderComment(deliver_id,order_comment_id,comment):
    newSecondaryOrderComment = SecondaryOrderComment(
        deliver_id = deliver_id,
        order_comment_id = order_comment_id,
        comment = comment,
        comment_time = datetime.now(),
        helpful = 0,
        unhelpful = 0
    )
    db.session.add(newSecondaryOrderComment)
    db.session.commit()
    return True
############################################### 消息管理 ###################################################################
def sendMessage(deliver_id,receiver_id,content):
    newMessage = Message(
        deliver_id = deliver_id,
        receiver_id = receiver_id,
        deliver_time = datetime.now(),
        content = content
    )
    db.session.add(newMessage)
    db.session.commit()
    return True

def checkMessage(this_id,other_id):
    data = []
    messages = Message.query.filter_by(deliver_id = this_id,receiver_id = other_id).all()
    data1 = [{"message_id":message.message_id,"side":"this","content":message.content,
              "deliver_time":message.deliver_time} for message in messages]
    messages = Message.query.filter_by(deliver_id = other_id,receiver_id = this_id).all()
    data2 = [{"message_id":message.message_id,"side":"other","content":message.content,
              "deliver_time":message.deliver_time} for message in messages]
    data.append(data1)
    data.append(data2)
    return sorted(data,key = lambda i: i['deliver_time'])

def deleteMessage(user_id,message_id):
    message = Message.query.filter_by(message_id = message_id).first()
    if message.deliver_id == user_id:
        db.session.delete(message)
        db.session.commit()
        return True
    return False
    
############################################## 公告管理 ######################################################################
def sendAnnouncement(manger_name,title,content):
    newAnnouncement = Announcement(
        manger_name = manger_name,
        deliver_time = datetime.now(),
        title = title,
        content = content,
    )
    db.session.add(newAnnouncement)
    db.session.commit()
    return True

def getAllAnnouncement():
    announcements = Announcement.query.all()
    data = [{"announce_id":announcement.announcement_id,"manger_name":announcement.manger_name,"deliver_time":announcement.deliver_time,"title":announcement.title,"content":announcement.content} for announcement in announcements]
    return data

def deleteAnnouncement(announcement_id):
    announcement = Announcement.query.filter_by(announcement_id = announcement_id).first()
    db.session.delete(announcement)
    db.session.commit()
    return True

##################################################### 订单管理 ########################################################
def buyGoods(goods_id,buyer_id):
    newOrder = Order(
        goods_id = goods_id,
        buyer_id = buyer_id,
        order_state = '已下单',
        deal_time = datetime.now()
    )
    db.session.add(newOrder)
    db.session.commit()
    return True

def dealDown(goods_id,getIt):
    order = Order.query.filter_by(goods_id = goods_id).first()
    if getIt:
        goods = Goods.query.filter_by(goods_id = goods_id).first()
        goods.goods_state = '已售出'
        order.order_state = '已送达'
    else:
        goods = Goods.query.filter_by(goods_id = goods_id).first()
        goods.goods_state = '在售'
        order.order_state = '已退款'
    db.session.commit()
    return True
##################################################### 收藏管理 #######################################################
# 用户添加收藏
def addcollection(goods_id,user_id):
    newCollection = Collection(
        user_id = user_id,
        goods_id = goods_id
    )
    db.session.add(newCollection)
    db.session.commit()
    return True

# 用户取消收藏
def cancelCollection(goods_id,user_id):
    collection = Collection.query.filter_by(goods_id = goods_id,user_id = user_id).first()
    db.session.delete(collection)
    db.session.commit()
    return True

# 检查用户是否收藏了某商品
def checkCollection(goods_id,user_id):
    collection = Collection.query.filter_by(goods_id = goods_id,user_id = user_id).first()
    if collection == None:
        return False
    return True

# 获取用户的收藏列表
def getUserCollection(user_id):
    collections = Collection.query.filter_by(user_id = user_id).all()
    data = []
    goods_id_list = []
    for collection in collections:
        goods_id_list.append(collection.goods_id)
    for id in goods_id_list:
        randGoods = Goods.query.filter_by(goods_id = id).first()
        goods_id = randGoods.goods_id
        goods_name = randGoods.goods_name
        goods_price = randGoods.goods_price
        first_picture = Picture.query.filter_by(goods_id = goods_id).first() # 只获取第一个图片
        
        picture_local_url = picturePath + first_picture.picture_url
        with open(picture_local_url,'rb') as file:
            picture_byte_stream = file.read()
        picture = base64.b64encode(picture_byte_stream).decode("ascii")
        data.append({"goods_id":goods_id,"goods_name":goods_name,"goods_price":goods_price,"picture":picture})
    return data

################################################### 举报管理 ##############################################################
# 发起举报
def sendAccusation(info): # content, accuser_id, accused_user_id, accused_goods_id, order_comment_id, secondary_order_comment_id, goods_consultation_id, goods_consultation_reply_id
    content = info.get('content')
    accuser_id = info.get('accuser_id')
    newAccusation = Accusation(
        accuser_id = accuser_id,
        accused_user_id = info.get('accused_user_id'),
        accused_goods_id = info.get('accused_goods_id'),
        order_comment_id = info.get('order_comment_id'),
        secondary_order_comment_id = info.get('secondary_order_comment_id'),
        goods_consultation_id = info.get('goods_comment_id'),
        goods_consultation_reply_id = info.get('second_goods_comment_id'),
        content = content
    )
    db.session.add(newAccusation)
    db.session.commit()
    return True

def getAccusations():
    accusations = Accusation.query.all()
    data = []
    for accusation in accusations:
        accusation_id = accusation.accusation_id
        accuser_id = accusation.accuser_id
        accused_user_id = accusation.accused_user_id
        accused_goods_id = accusation.accused_goods_id
        order_comment_id = accusation.order_comment_id
        secondary_order_comment_id = accusation.secondary_order_comment_id
        goods_consultation_id = accusation.goods_consultation_id
        goods_consultation_reply_id = accusation.goods_consultation_reply_id
        content = accusation.content
        info = {}
        info['accusation_id'] = accusation_id
        info['accuser_id'] = accuser_id
        info['content'] = content
        if (accused_user_id != None): info['accused_user_id'] = accused_user_id
        elif (accused_goods_id != None): info['accused_goods_id'] = accused_goods_id
        elif (order_comment_id != None): info['order_comment_id'] = order_comment_id
        elif (secondary_order_comment_id != None): info['secondary_order_comment_id'] = secondary_order_comment_id
        elif (goods_consultation_id != None): info['goods_comment_id'] = goods_consultation_id
        elif (goods_consultation_reply_id != None): info['second_goods_comment_id'] = goods_consultation_reply_id
        data.append(info)
    return data
    
    
def deleteAccusation(accusation_id):
    accusation = Accusation.query.filter_by(accusation_id = accusation_id).first()
    db.session.delete(accusation)
    db.session.commit()
    return True
################################################### 地址管理 ##############################################################
# 添加地址
def addAddress(user_id,receiver_name,phone_number,address):
    newAddress = Address(
        user_id = user_id,
        receiver_name = receiver_name,
        phone_number = phone_number,
        address = address
    )
    db.session.add(newAddress)
    db.session.commit()
    return True

# 得到用户全部地址
def getAddress(user_id):
    address = Address.query.filter_by(user_id = user_id).all()
    data = []
    for item in address:
        address_id = item.address_id
        receiver_name = item.receiver_name
        phone_number = item.phone_number
        content = item.address
        data.append({"address_id":address_id,"receiver_name":receiver_name,"phone_number":phone_number,"address":content})
    return data

# 删除地址
def deleteAddress(address_id):
    address = Address.query.filter_by(address_id = address_id).first()
    db.session.delete(address)
    db.session.commit()
    return True