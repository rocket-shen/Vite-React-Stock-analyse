from flask import Flask
from flask_cors import CORS
from src.api.financial import register_routes

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# 注册API路由
register_routes(app)

if __name__ == "__main__":
    app.run(port=3000, debug=True)