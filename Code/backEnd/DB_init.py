import pymysql
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# 标记使用MySQL数据库和pymysql接口
# 这里填入你们本地的MySQL用户名(root)、密码(kjh030607)和schema名(buaa)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:kjh030607@localhost/buaa'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭对模型修改的跟踪，以提高性能

# 初始化SQLAlchemy实例
db = SQLAlchemy(app)

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

with app.app_context():
    db.create_all()             # 创建所有表

    # #添加数据测试
    # new_user = User(user_name='KJH', phone_number='15071687155', password = '12345')
    # db.session.add(new_user)
    # db.session.commit()

    # #查询数据测试
    # users = User.query.all()
    # for user in users:
    #     print(user.user_id, user.user_name, user.phone_number, user.password, user.picture, user.other_information)
