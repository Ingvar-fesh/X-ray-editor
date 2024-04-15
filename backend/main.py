import base64
import cv2
from flask import Flask, request, send_file, jsonify
from PIL import Image
import io
from ultralytics import YOLO
from ultralytics.utils.plotting import Annotator
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()
    print(image_bytes)
    print('--------------------------------------------')

    image = Image.open(io.BytesIO(image_bytes))
    image.save('photo.png')

    # Process the image with the YOLO model
    process_image_with_model()

    return send_file('new_photo.png', mimetype='image/png')


def image_to_base64(image: Image) -> str:
    imgByteArr = io.BytesIO()
    image.save(imgByteArr, format='PNG')
    imgByteArr = imgByteArr.getvalue()
    return base64.b64encode(imgByteArr).decode('utf-8')


def process_image_with_model():
    model = YOLO('best.pt')
    result = model.predict('photo.png')[0]
    output = []
    for box in result.boxes:
        x1, y1, x2, y2 = [
            round(x) for x in box.xyxy[0].tolist()
        ]
        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        output.append([
            x1, y1, x2, y2, result.names[class_id], prob
        ])

    img = cv2.imread("photo.png")
    i = 0
    annotator = Annotator(img)
    for _ in result.boxes.data:
        annotator.box_label(
            output[i][0:4],
            f"{output[i][4]} {output[i][5]}",
            color=(4, 4, 241), txt_color=(255, 255, 255))
        i += 1
    cv2.imwrite("new_photo.png", annotator.im)


if __name__ == '__main__':
    app.run(debug=True)
