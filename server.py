from flask import Flask, redirect, url_for, request, send_file, jsonify
import json
import kakaoparser
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/get_query', methods=['POST'])
def get_query():
    req_data = json.loads(request.data, strict=False)
    start_time = req_data['startTime']
    end_time = req_data['endTime']
    # do what you want
    print(start_time)
    print(end_time)
    result = kakaoparser.analysis(start_time, end_time)
    #print(jsonify(result))
    return jsonify(result)
    
if __name__ == '__main__':
    app.run(debug = True)
