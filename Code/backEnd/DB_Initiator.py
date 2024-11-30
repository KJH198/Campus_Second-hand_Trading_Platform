from flask_sqlalchemy import SQLAlchemy
from flask import Flask

################################### Flask项目初始化 ###################################

# 创建Flask项目app,定义前端依赖文件路径
app = Flask(__name__,template_folder='../dist',static_folder='../dist',static_url_path='')
# 标记使用的MySQL数据库和pymysql接口(自己改本地的数据库密码，默认所有人有一个schema名为buaa)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:BUAA2024Python@localhost/buaa'
# 关闭对模型修改的跟踪，以提高性能
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化SQLAlchemy实例
db = SQLAlchemy(app)

#################################### 定义数据表 ########################################

# 用户表
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    phone_number = db.Column(db.String(80), nullable=False, unique=True)
    user_name = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(120), nullable=False)
    picture = db.Column(db.String(80), default = 'default_address')
    other_information = db.Column(db.Text, nullable=True)

# 管理员表
class Manager(db.Model):  # 注意这里继承了 db.Model
    manager_name = db.Column(db.String(80), primary_key=True)
    password = db.Column(db.String(120), nullable=False)  # 移除了 unique=True，因为密码通常不会要求唯一性

# 登录日志表
class Log(db.Model):
    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable = False)
    log_time = db.Column(db.DateTime, nullable = False)
    log_state = db.Column(db.Boolean, nullable = False)

##################################### 调用接口 ########################################

# 创建所有表 
def init():
    with app.app_context():
        db.create_all()            


