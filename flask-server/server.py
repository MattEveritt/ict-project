from flask import flask

app= Flask(__name__)

model=joblib.load(open("truck_model.pt", "rb"))

@app.route("/")
def home():
    
return render_template("index.html")

cors.init_app(app)

return app

@app.route("/predict", methods=["POST"])
def predict():