import io
import torch
import subprocess
import os
import errno, shutil, stat

from torchvision import models
import torchvision.transforms as transforms
from PIL import Image
from flask import Flask, request, send_file, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_url_path='')
CORS(app)

def get_prediction(fileName, reg):
    # img = open('./images/{}'.format(fileName), 'r')
    script = 'python ./yolov5/detect.py --img 1280 --weights ./yolov5/truck_model.pt --line-thickness 1 --save-txt --conf-thres 0.6 --source "./images/{}" --name "./images" --reg {}'.format(fileName, reg)
    result_success = subprocess.run(script, shell=True)
    # analysedImage = open('./yolov5/runs/detect/images/{}'.format(fileName))
    return

@app.route('/')
def serve():
    return app.send_static_file('index.html')
    # return send_from_directory('./static/build','index.htm  l')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        if os.path.exists('./yolov5/runs/detect'):
            shutil.rmtree('./yolov5/runs/detect', ignore_errors=False, onerror= 'error removing detect folder')
        print(request.form)
        file = request.files['image']
        reg = request.form['registration']
        fileName = file.filename
        file.save('./images/{}'.format(fileName))
        get_prediction(fileName, reg)
        os.remove('./images/{}'.format(file.filename))
        return send_file(
            './yolov5/runs/detect/images/{}'.format(fileName), 
            as_attachment=True, 
            attachment_filename=fileName, 
            mimetype='image/gif'
            )


if __name__ == '__main__':
    app.run()