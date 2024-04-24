import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:pnXcwHvscCfVXkwhyINtmbhFARazQbCV@monorail.proxy.rlwy.net:55608/railway'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
