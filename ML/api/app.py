from flask import Flask, request
from flask_restplus import Api, Resource, fields, abort
import boto3
import joblib
import numpy as np
from math import exp
import os

BUCKET_NAME = 'forestcasting-bucket'
MODEL_FILE_NAME = 'model.joblib.z'
app = Flask(__name__)
api = Api(app)
S3 = boto3.client('s3', region_name='eu-central-1')

name_space = api.namespace('predict', description='Prediction API')

predict_obj = api.model('Prediction Arguments', {
    'MAX_TEMP': fields.Float(required=True, description='Maximum temperature'),
    'MIN_TEMP': fields.Float(required=True, description='Minimum temperature'),
    'MEAN_TEMP': fields.Float(required=True, description='Mean temperature'),
    'TOTAL_RAIN': fields.Float(required=True, description='Total rain'),
    'TOTAL_SNOW': fields.Float(required=True, description='Total snow'),
    'TOTAL_PRECIP': fields.Float(required=True, description='Total precipitation'),
    'SNOW_ON_GRND': fields.Float(required=True, description='Snow on ground'),
    'DIR_OF_MAX_GUST': fields.Float(required=True, description='Direction of maximum gust of wind'),
    'SPD_OF_MAX_GUST': fields.Float(required=True, description='Speed of maximum gust of wind'),
    'TEMP_12_4': fields.Float(required=True, description='Temperature from 12-4pm'),
    'DEW_POINT_TEMP_12_4': fields.Float(required=True, description='Dew point temperature from 12-4pm'),
    'REL_HUM_12_4': fields.Float(required=True, description='Relative Humidity from 12-4pm'),
    'LATITUDE': fields.Float(required=True, description='Latitude of location grid'),
    'LONGITUDE': fields.Float(required=True, description='Longitud of location grid'),
    'TOTAL_SIZE_HA_OLD': fields.Float(required=True, description='Total size of past fires (hectares)'),
    'AVERAGE_SIZE_HA_OLD': fields.Float(required=True, description='Average size of past fires (hectares)'),
    'TOTAL_DURATION_OLD': fields.Float(required=True, description='Total duration of past fires (hectares)'),
    'AVERAGE_DURATION_OLD': fields.Float(required=True, description='Average duration of past fires (hectares)'),
    'ECOZONE': fields.Float(required=True, description='Ecozone'),
    'ECOREGION': fields.Float(required=True, description='Ecoregion'),
    'ECODISTRICT': fields.Float(required=True, description='Ecodistrict')
})

col_order = ['MAX_TEMP', 'MIN_TEMP', 'MEAN_TEMP', 'TOTAL_RAIN', 'TOTAL_SNOW',
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

one_hot_encodings = {
    'ECOZONE': [2,3,9],
    'ECOREGION': [28, 46, 78, 79, 95, 145, 149, 156],
    'ECODISTRICT': [184, 294, 364, 372, 386, 393, 428, 433, 446, 1024]
}

# Memoize used to keep model in memory
def memoize(f):
    memo = {}
    def helper(x):
        if x not in memo:
            memo[x] = f(x)
        return memo[x]
    return helper

@name_space.route('/')
class Predict(Resource):
    @api.expect([predict_obj], validate=True)
    def post(self):    
        # Parse request body for model input 
        req_data = request.get_json(silent=True)
        req_data = parse_one_hots(req_data)
        req_data = create_features(req_data)
        vectorized_data =  vectorize_data(req_data)

        # Make prediction
        full_predictions = predict(vectorized_data)
        predictions = full_predictions[:,1].tolist()

        # Respond with prediction result
        print(predictions)
        result = {'predictions': predictions}    
        return result

@memoize
def load_model(key):
    local_file = '/tmp/model.joblib.z'
    if not os.path.exists(local_file):
        print('Downloading model from S3...')
        S3.download_file(BUCKET_NAME, key, local_file)
    model = joblib.load(local_file)
    return model

def predict(data):
    model = load_model(MODEL_FILE_NAME)
    print('Predicting...')
    return model.predict_proba(data)

def parse_one_hots(req_data_points):
    print('Parsing one hots...')
    #Go through each data object
    for req_data in req_data_points:
        # Go through keys that need to be converted to one hot encoded vals
        for key in one_hot_encodings:
            # Go through each of the one hot encoded vals and check them
            for ohe_val in one_hot_encodings[key]:
                ohe_key = f'{key}_{ohe_val}'
                if key in req_data and req_data[key] == ohe_val:
                    req_data[ohe_key] = 1
                    del req_data[key]
                else:
                    req_data[ohe_key] = 0
            if key in req_data:
                error_msg = f'Got invalid value {req_data[key]} for {key}. Valid values for {key} are: {one_hot_encodings[key]}.'
                print(error_msg)
                abort(400, error_msg)

    return req_data_points

def create_features(req_data_points):
    print('Creating features...')
    for req_data in req_data_points:
        req_data['IS_SNOW_ON_GROUND'] = req_data['SNOW_ON_GRND'] > 0
        req_data['IS_SNOW_FALLING'] = req_data['TOTAL_SNOW'] > 0

        # Calculate absolute humidity
        t = req_data['TEMP_12_4']
        rh = req_data['REL_HUM_12_4']
        abs_hum = (6.112 * exp((17.67 * t) / (t + 243.5)) * rh * 2.1674) / (273.15 + t)
        req_data['ABS_HUM_12_4'] = abs_hum

    return req_data_points

def vectorize_data(data):
    print('Vectorizing data...')
    feature_list = []
    for feature in data:
        processed_feature = []
        for col in col_order:
            processed_feature.append(feature[col])
        feature_list.append(processed_feature)
    size = len(feature_list)
    return np.asarray(feature_list, dtype=np.float32).reshape(size,-size)

if __name__ == '__main__':    
    # listen on all IPs 
    app.run(host='0.0.0.0')
