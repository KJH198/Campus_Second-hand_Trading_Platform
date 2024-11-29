from flask_sqlalchemy import SQLAlchemy
from flask import Flask

################################### Flask项目初始化 ###################################

# 创建Flask项目app,定义前端依赖文件路径
app = Flask(__name__,template_folder='../dist',static_folder='../dist',static_url_path='')
# 标记使用的MySQL数据库和pymysql接口(自己改本地的数据库密码，默认所有人有一个schema名为buaa)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:kjh030607@localhost/buaa'
# 关闭对模型修改的跟踪，以提高性能
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化SQLAlchemy实例
db = SQLAlchemy(app)

#################################### 定义数据表 ########################################

# 用户表
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(80), nullable=False, unique=True)
    user_name = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(120), nullable=False)
    picture_url = db.Column(db.String(80), nullable=True)  # 可空
    other_information = db.Column(db.Text, nullable=True)  # 可空

# 管理员表
class Manager(db.Model):  # 注意这里继承了 db.Model
    manager_name = db.Column(db.String(80), primary_key=True)
    password = db.Column(db.String(120), nullable=False)  # 移除了 unique=True，因为密码通常不会要求唯一性

# 登录日志表
class Log(db.Model):
    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    log_time = db.Column(db.DateTime, nullable = False)
    log_state = db.Column(db.Boolean, nullable = False)
    
# 地址表
class Address(db.Model):
    address_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
    receiver_name = db.Column(db.String(80), nullable = False)
    phone_number = db.Column(db.String(80), nullable = False)
    address = db.Column(db.Text, nullable = False)

# 商品表
class Goods(db.Model):
    goods_id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    begin_time = db.Column(db.DateTime, nullable = False)
    goods_name = db.Column(db.String(80), nullable = False)
    category_name = db.Column(db.String(80), nullable = False)  
    goods_price = db.Column(db.String(80), nullable = False)
    goods_description = db.Column(db.Text, nullable = True)
    goods_state = db.Column(db.String(80), nullable = False)    # 在售,已售
    heat = db.Column(db.Integer, nullable = False)
    
# 订单表
class Order(db.Model):
    goods_id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    order_state = db.Column(db.String(80), nullable = False)
    deal_time = db.Column(db.DateTime, nullable = False)

# 消息表
class Message(db.Model):
    message_id = db.Column(db.Integer, primary_key=True)
    deliver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    deliver_time = db.Column(db.DateTime, nullable = False)
    content = db.Column(db.Text, nullable = False)

# 订单评价表
class OrderComment(db.Model):
    order_comment_id = db.Column(db.Integer, primary_key=True)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.goods_id'), nullable = False) # 外键
    order_grade = db.Column(db.Integer, nullable = False)
    comment = db.Column(db.Text, nullable = False)
    comment_time = db.Column(db.DateTime, nullable = False)
    helpful = db.Column(db.Integer, nullable = False)
    unhelpful = db.Column(db.Integer, nullable = False)
    
# 订单评价评论表
class SecondaryOrderComment(db.Model):
    secondary_order_comment_id = db.Column(db.Integer, primary_key=True)
    deliver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    order_comment_id = db.Column(db.Integer, db.ForeignKey('order_comment.order_comment_id'), nullable = False) # 外键
    comment = db.Column(db.Text, nullable = False)
    comment_time = db.Column(db.DateTime, nullable = False)
    helpful = db.Column(db.Integer, nullable = False)
    unhelpful = db.Column(db.Integer, nullable = False)

# 商品询问表
class GoodsConsultation(db.Model):
    goods_consultation_id = db.Column(db.Integer, primary_key=True)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.goods_id'), nullable = False) # 外键
    deliver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    comment = db.Column(db.Text, nullable = False)
    comment_time = db.Column(db.DateTime, nullable = False)
    helpful = db.Column(db.Integer, nullable = False)
    unhelpful = db.Column(db.Integer, nullable = False)
    
# 商品询问回复表
class GoodsConsultationReply(db.Model):
    goods_consultation_reply_id = db.Column(db.Integer, primary_key=True)
    goods_consultation_id = db.Column(db.Integer, db.ForeignKey('goods_consultation.goods_consultation_id'), nullable = False) # 外键
    deliver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False) # 外键
    comment = db.Column(db.Text, nullable = False)
    comment_time = db.Column(db.DateTime, nullable = False)
    helpful = db.Column(db.Integer, nullable = False)
    unhelpful = db.Column(db.Integer, nullable = False)
    
# 收藏表
class Collection(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), primary_key=True) # 外键
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.goods_id'), primary_key=True) # 外键

# 举报表
class Accusation(db.Model):
    accusation_id = db.Column(db.Integer, primary_key=True)
    accuser_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = True) # 外键
    accused_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = True) # 外键
    accused_goods_id = db.Column(db.Integer, db.ForeignKey('goods.goods_id'), nullable = True) # 外键
    order_comment_id = db.Column(db.Integer, db.ForeignKey('order_comment.order_comment_id'), nullable = True) # 外键
    secondary_order_comment_id = db.Column(db.Integer, db.ForeignKey('secondary_order_comment.secondary_order_comment_id'), nullable = True) # 外键
    goods_consultation_id = db.Column(db.Integer, db.ForeignKey('goods_consultation.goods_consultation_id'), nullable = True) # 外键
    goods_consultation_reply_id = db.Column(db.Integer, db.ForeignKey('goods_consultation_reply.goods_consultation_reply_id'), nullable = True) # 外键
    content = db.Column(db.Text, nullable = False)
    
# 公告
class Announcement(db.Model):
    announcement_id = db.Column(db.Integer, primary_key=True)
    manger_name = db.Column(db.String(80), db.ForeignKey('manager.manager_name'), nullable = True) # 外键
    deliver_time = db.Column(db.DateTime, nullable = False)
    title = db.Column(db.String(80), nullable = False)
    content = db.Column(db.Text, nullable = False)
    
class Picture(db.Model):
    picture_url = db.Column(db.String(80), primary_key=True)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.goods_id'))
    
##################################### 调用接口 ########################################

# 创建所有表 
def init():
    with app.app_context():
        db.create_all()
    