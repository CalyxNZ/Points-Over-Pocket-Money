from flask import Blueprint, render_template, session, url_for, flash, redirect, request
from flask_login import login_user, current_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, bcrypt
from app.models import User, Points
from flask import jsonify

main = Blueprint('main', __name__)

@main.route("/register", methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('main.login'))
    return render_template('register.html')

@main.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user, remember=request.form.get('remember'))
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html')

@main.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@main.route("/")
@login_required
def home():
    points_history = Points.query.filter_by(user_id=current_user.id).order_by(Points.timestamp.desc())
    total_points = sum(entry.points for entry in points_history)
    return render_template('main.html', points_history=points_history, total_points=total_points)


@main.route("/history")
@login_required
def history():
    user_id = current_user.id
    points_history = Points.query.filter_by(user_id=user_id).order_by(Points.timestamp.desc()).all()
    history_data = [{
        'timestamp': entry.timestamp.strftime('%Y-%m-%d'),
        'description': entry.description,
        'points': entry.points
    } for entry in points_history]
    total_points = sum(entry['points'] for entry in history_data)
    return jsonify({'success': True, 'pointsHistory': history_data, 'totalPoints': total_points})


@main.route("/update", methods=['POST'])
@login_required
def update():
    points_change = int(request.form['points_change'])
    description = request.form['description']
    new_entry = Points(child_name=current_user.email, points=points_change, description=description, user_id=current_user.id)
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'success': True})
