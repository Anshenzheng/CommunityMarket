from app import app, db
from models import Category, Product, Admin

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        if not Admin.query.first():
            admin = Admin(username='admin', password='admin123')
            db.session.add(admin)
            db.session.commit()
            print("管理员已创建: admin / admin123")
        
        if not Category.query.first():
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
            print("示例数据已创建")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
