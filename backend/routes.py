from flask import Flask, request, jsonify
from datetime import datetime
import random
import string
from app import app, db
from models import Category, Product, User, Order, OrderItem, Admin

def generate_order_number():
    date_part = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = ''.join(random.choices(string.digits, k=4))
    return f'CM{date_part}{random_part}'

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Community Market API is running'})

@app.route('/api/categories', methods=['GET', 'POST'])
def manage_categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([cat.to_dict() for cat in categories])
    elif request.method == 'POST':
        data = request.json
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({'error': '分类名称已存在'}), 400
        category = Category(
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(category)
        db.session.commit()
        return jsonify(category.to_dict()), 201

@app.route('/api/categories/<int:category_id>', methods=['PUT', 'DELETE'])
def update_delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    if request.method == 'PUT':
        data = request.json
        if 'name' in data:
            existing = Category.query.filter_by(name=data['name']).first()
            if existing and existing.id != category_id:
                return jsonify({'error': '分类名称已存在'}), 400
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        db.session.commit()
        return jsonify(category.to_dict())
    elif request.method == 'DELETE':
        if Product.query.filter_by(category_id=category_id).first():
            return jsonify({'error': '该分类下还有商品，无法删除'}), 400
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': '删除成功'})

@app.route('/api/products', methods=['GET', 'POST'])
def manage_products():
    if request.method == 'GET':
        category_id = request.args.get('category_id')
        query = Product.query.filter_by(is_active=True)
        if category_id:
            query = query.filter_by(category_id=int(category_id))
        products = query.order_by(Product.created_at.desc()).all()
        return jsonify([p.to_dict() for p in products])
    elif request.method == 'POST':
        data = request.json
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': '分类不存在'}), 400
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            stock=int(data.get('stock', 0)),
            category_id=data['category_id'],
            image_url=data.get('image_url', '')
        )
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201

@app.route('/api/products/all', methods=['GET'])
def get_all_products_admin():
    query = Product.query.order_by(Product.created_at.desc())
    products = query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def update_delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        return jsonify(product.to_dict())
    elif request.method == 'PUT':
        data = request.json
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = float(data['price'])
        if 'stock' in data:
            product.stock = int(data['stock'])
        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'error': '分类不存在'}), 400
            product.category_id = data['category_id']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'is_active' in data:
            product.is_active = data['is_active']
        db.session.commit()
        return jsonify(product.to_dict())
    elif request.method == 'DELETE':
        product.is_active = False
        db.session.commit()
        return jsonify({'message': '商品已下架'})

@app.route('/api/products/<int:product_id>/toggle', methods=['POST'])
def toggle_product_status(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = not product.is_active
    db.session.commit()
    return jsonify(product.to_dict())

@app.route('/api/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])
    elif request.method == 'POST':
        data = request.json
        existing = User.query.filter_by(username=data['username']).first()
        if existing:
            return jsonify(existing.to_dict())
        user = User(
            username=data['username'],
            phone=data.get('phone', '')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201

@app.route('/api/orders', methods=['GET', 'POST'])
def manage_orders():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Order.query
        
        if user_id:
            query = query.filter_by(user_id=int(user_id))
        if status:
            query = query.filter_by(status=status)
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(Order.created_at >= start)
            except:
                pass
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d')
                end = end.replace(hour=23, minute=59, second=59)
                query = query.filter(Order.created_at <= end)
            except:
                pass
        
        orders = query.order_by(Order.created_at.desc()).all()
        return jsonify([o.to_dict() for o in orders])
    
    elif request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': '请先登录'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 400
        
        cart_items = data.get('items', [])
        if not cart_items:
            return jsonify({'error': '购物车为空'}), 400
        
        total_amount = 0.0
        order_items = []
        
        for item in cart_items:
            product = Product.query.get(item['product_id'])
            if not product or not product.is_active:
                return jsonify({'error': f'商品 {item.get("product_name")} 已下架'}), 400
            if product.stock < item['quantity']:
                return jsonify({'error': f'商品 {product.name} 库存不足'}), 400
            
            total_amount += product.price * item['quantity']
            order_items.append({
                'product_id': product.id,
                'quantity': item['quantity'],
                'price': product.price
            })
        
        order_number = generate_order_number()
        order = Order(
            order_number=order_number,
            user_id=user_id,
            total_amount=total_amount,
            status='pending',
            building=data.get('building', ''),
            room_number=data.get('room_number', ''),
            delivery_note=data.get('delivery_note', '')
        )
        db.session.add(order)
        db.session.flush()
        
        for item in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.session.add(order_item)
            
            product = Product.query.get(item['product_id'])
            product.stock -= item['quantity']
        
        db.session.commit()
        return jsonify(order.to_dict()), 201

@app.route('/api/orders/<int:order_id>', methods=['GET', 'PUT'])
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    if request.method == 'GET':
        return jsonify(order.to_dict())
    elif request.method == 'PUT':
        data = request.json
        if 'status' in data:
            order.status = data['status']
        if 'building' in data:
            order.building = data['building']
        if 'room_number' in data:
            order.room_number = data['room_number']
        if 'delivery_note' in data:
            order.delivery_note = data['delivery_note']
        db.session.commit()
        return jsonify(order.to_dict())

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.json
    order.status = data.get('status', order.status)
    db.session.commit()
    return jsonify(order.to_dict())

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username, password=password).first()
    if admin:
        return jsonify({'success': True, 'admin': admin.to_dict()})
    return jsonify({'success': False, 'error': '用户名或密码错误'}), 401

@app.route('/api/admin/init', methods=['POST'])
def init_admin():
    if Admin.query.first():
        return jsonify({'message': '管理员已初始化'})
    
    admin = Admin(
        username='admin',
        password='admin123'
    )
    db.session.add(admin)
    
    snacks = Category(name='零食', description='各类休闲零食')
    drinks = Category(name='饮品', description='各类饮料饮品')
    instant = Category(name='速食', description='方便面、火腿肠等速食')
    db.session.add_all([snacks, drinks, instant])
    db.session.flush()
    
    sample_products = [
        {
            'name': '乐事薯片 原味',
            'description': '经典原味薯片，香脆可口',
            'price': 12.5,
            'stock': 50,
            'category_id': snacks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20potato%20chips%20original%20flavor%20snack%20package&image_size=square'
        },
        {
            'name': '乐事薯片 番茄味',
            'description': '酸甜番茄味薯片',
            'price': 12.5,
            'stock': 45,
            'category_id': snacks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tomato%20flavor%20potato%20chips%20snack%20red%20package&image_size=square'
        },
        {
            'name': '旺旺雪饼',
            'description': '经典雪饼，米香浓郁',
            'price': 8.5,
            'stock': 60,
            'category_id': snacks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rice%20cracker%20snack%20white%20package&image_size=square'
        },
        {
            'name': '康师傅红烧牛肉面',
            'description': '经典红烧牛肉面，美味方便',
            'price': 5.5,
            'stock': 100,
            'category_id': instant.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=instant%20noodles%20red%20package%20beef%20flavor&image_size=square'
        },
        {
            'name': '康师傅老坛酸菜面',
            'description': '酸爽可口老坛酸菜面',
            'price': 5.5,
            'stock': 80,
            'category_id': instant.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=instant%20noodles%20pickle%20flavor%20purple%20package&image_size=square'
        },
        {
            'name': '双汇火腿肠',
            'description': '美味火腿肠，即食方便',
            'price': 3.0,
            'stock': 200,
            'category_id': instant.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ham%20sausage%20food%20package&image_size=square'
        },
        {
            'name': '可口可乐 330ml',
            'description': '经典可口可乐，畅爽解渴',
            'price': 3.5,
            'stock': 120,
            'category_id': drinks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coca%20cola%20can%20red%20soda%20drink&image_size=square'
        },
        {
            'name': '雪碧 330ml',
            'description': '清爽柠檬味汽水',
            'price': 3.5,
            'stock': 100,
            'category_id': drinks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sprite%20can%20green%20lemon%20soda%20drink&image_size=square'
        },
        {
            'name': '农夫山泉 550ml',
            'description': '天然矿泉水，健康之选',
            'price': 2.0,
            'stock': 200,
            'category_id': drinks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mineral%20water%20bottle%20clear%20drink&image_size=square'
        },
        {
            'name': '统一冰红茶 500ml',
            'description': '冰爽红茶，夏日必备',
            'price': 4.0,
            'stock': 80,
            'category_id': drinks.id,
            'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ice%20tea%20bottle%20yellow%20lemon%20drink&image_size=square'
        }
    ]
    
    for p in sample_products:
        product = Product(**p)
        db.session.add(product)
    
    db.session.commit()
    return jsonify({'message': '初始化成功', 'admin': {'username': 'admin', 'password': 'admin123'}})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status='pending').count()
    delivering_orders = Order.query.filter_by(status='delivering').count()
    completed_orders = Order.query.filter_by(status='completed').count()
    total_products = Product.query.filter_by(is_active=True).count()
    total_categories = Category.query.count()
    
    return jsonify({
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'delivering_orders': delivering_orders,
        'completed_orders': completed_orders,
        'total_products': total_products,
        'total_categories': total_categories
    })
