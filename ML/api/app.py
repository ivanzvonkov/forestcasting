from flask import Flask, request, json
import boto3
from sklearn.externals import joblib
import numpy as np

BUCKET_NAME = 'forestcasting-bucket'
MODEL_FILE_NAME = 'model.pkl'
app = Flask(__name__)
S3 = boto3.client('s3', region_name='eu-central-1')

cols = ['MAX_TEMP', 'MIN_TEMP', 'MEAN_TEMP', 'TOTAL_RAIN', 'TOTAL_SNOW',
       'TOTAL_PRECIP', 'SNOW_ON_GRND', 'DIR_OF_MAX_GUST', 'SPD_OF_MAX_GUST',
       'TEMP_12_4', 'DEW_POINT_TEMP_12_4', 'REL_HUM_12_4', 'LATITUDE',
       'LONGITUDE', 'TOTAL_SIZE_HA_OLD', 'AVERAGE_SIZE_HA_OLD',
       'TOTAL_DURATION_OLD', 'AVERAGE_DURATION_OLD', 'IS_SNOW_ON_GROUND',
       'IS_SNOW_FALLING', 'ABS_HUM_12_4', 'ECOZONE_2', 'ECOZONE_3',
       'ECOZONE_9', 'ECOREGION_28', 'ECOREGION_46', 'ECOREGION_78',
       'ECOREGION_79', 'ECOREGION_95', 'ECOREGION_145', 'ECOREGION_149',
       'ECOREGION_156', 'ECODISTRICT_184', 'ECODISTRICT_294',
       'ECODISTRICT_364', 'ECODISTRICT_372', 'ECODISTRICT_386',
       'ECODISTRICT_393', 'ECODISTRICT_428', 'ECODISTRICT_433',
       'ECODISTRICT_446', 'ECODISTRICT_1024']

def memoize(f):
    memo = {}

    def helper(x):
        if x not in memo:
            memo[x] = f(x)
        return memo[x]

    return helper

@app.route('/', methods=['POST'])
def index():    
    # Parse request body for model input 
    body_dict = request.get_json(silent=True)    
    data = prepare_data(body_dict['data'])   
    # Make prediction 
    prediction = predict(data)
    # Respond with prediction result
    result = {'prediction': prediction}    
    return json.dumps(result)

@memoize
def load_model(key):
    # response = S3.get_object(Bucket=BUCKET_NAME, Key=key)
    # model_str = response['Body'].read()
    # model = pickle.loads(model_str)
    # with open("model/model.pkl", 'rb') as f:
    #     model = pickle.load(f)
    model = joblib.load("model/model.joblib.z")
    return model

def predict(data):
    model = load_model(MODEL_FILE_NAME)
    return model.predict_proba(data)[0][1]

def prepare_data(data):
    feature_list = []
    for col in cols:
        feature_list.append(data[col])
    return np.asarray(feature_list, dtype=np.float32).reshape(1,-1)

if __name__ == '__main__':    
    # listen on all IPs 
    app.run(host='0.0.0.0')
