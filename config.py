import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key'
    #SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///site.db'
    SQLALCHEMY_DATABASE_URI = 'mysql://root:pnXcwHvscCfVXkwhyINtmbhFARazQbCV@monorail.proxy.rlwy.net:55608/railway'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
