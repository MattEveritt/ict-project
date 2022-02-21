import io
import json
import torch
import subprocess
import os
import errno, shutil, stat

from torchvision import models
import torchvision.transforms as transforms
from PIL import Image
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='./build')
CORS(app)

def get_prediction(fileName):
    # img = open('./images/{}'.format(fileName), 'r')
    script = 'python ./yolov5/detect.py --img 1280 --weights ./yolov5/truck_model.pt --line-thickness 1 --save-txt --conf-thres 0.6 --source "./images/{}" --name "./images"'.format(fileName)
    result_success = subprocess.run(script, shell=True)
    analysedImage = open('./yolov5/runs/detect/images/{}'.format(fileName))
    return analysedImage

@app.route('/')
def serve():
    return render_template("index.html")
    # return send_from_directory('./static/build','index.htm  l')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        if os.path.exists('./yolov5/runs/detect'):
            shutil.rmtree('./yolov5/runs/detect', ignore_errors=False, onerror= 'error removing detect folder')
        file = request.files['image']
        fileName = file.filename
        file.save('./images/{}'.format(fileName))
        image = get_prediction(fileName)
        print(image)
        os.remove('./images/{}'.format(file.filename))
        return send_file(
            './yolov5/runs/detect/images/{}'.format(fileName), 
            as_attachment=True, 
            attachment_filename=fileName, 
            mimetype='image/gif'
            )


if __name__ == '__main__':
    app.run()