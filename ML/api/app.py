import os
from math import exp

import boto3
import joblib
import numpy as np
from flask import Flask, request
from flask_restplus import Api, Resource, fields, abort

BUCKET_NAME = 'forestcasting-bucket'
MODEL_FILE_NAME = 'RandomForest.joblib.z'
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
    'DEW_TEMP_12_4': fields.Float(required=True, description='Dew point temperature from 12-4pm'),
    'REL_HUM_12_4': fields.Float(required=True, description='Relative Humidity from 12-4pm'),
    'LATITUDE': fields.Float(required=True, description='Latitude of location grid'),
    'LONGITUDE': fields.Float(required=True, description='Longitud of location grid'),
    'TOTAL_SIZE_HA': fields.Float(required=True, description='Total size of past fires (hectares)'),
    'AVERAGE_SIZE_HA': fields.Float(required=True, description='Average size of past fires (hectares)'),
    'TOTAL_DURATION': fields.Float(required=True, description='Total duration of past fires (hectares)'),
    'AVERAGE_DURATION': fields.Float(required=True, description='Average duration of past fires (hectares)'),
    'ECOZONE': fields.Float(required=True, description='Ecozone'),
    'ECOREGION': fields.Float(required=True, description='Ecoregion'),
    'ECODISTRICT': fields.Float(required=True, description='Ecodistrict'),
    'MONTH': fields.Integer(required=True, description='Month'),
    'DAY': fields.Integer(required=True, description='Day')
})

col_order = ['MAX_TEMP', 'MIN_TEMP', 'MEAN_TEMP', 'TOTAL_RAIN', 'TOTAL_SNOW', 'TOTAL_PRECIP', 'SNOW_ON_GRND', 
'DIR_OF_MAX_GUST', 'SPD_OF_MAX_GUST', 'TEMP_12_4', 'DEW_TEMP_12_4', 'REL_HUM_12_4', 'LATITUDE', 'LONGITUDE',
'TOTAL_SIZE_HA', 'AVERAGE_SIZE_HA', 'TOTAL_DURATION', 'AVERAGE_DURATION', 'IS_SNOW_ON_GROUND', 'IS_SNOW_FALLING', 
'ABS_HUM_12_4', 'MONTH_SIN', 'MONTH_COS', 'DAY_SIN', 'DAY_COS', 'ECOZONE_2', 'ECOZONE_3', 'ECOZONE_5', 'ECOZONE_6', 
'ECOZONE_8', 'ECOZONE_9', 'ECOZONE_13', 'ECOREGION_46', 'ECOREGION_47', 'ECOREGION_64', 'ECOREGION_65', 'ECOREGION_66', 
'ECOREGION_69', 'ECOREGION_70', 'ECOREGION_71', 'ECOREGION_72', 'ECOREGION_73', 'ECOREGION_74', 'ECOREGION_75', 
'ECOREGION_78', 'ECOREGION_79', 'ECOREGION_87', 'ECOREGION_88', 'ECOREGION_89', 'ECOREGION_90', 'ECOREGION_91', 
'ECOREGION_92', 'ECOREGION_93', 'ECOREGION_94', 'ECOREGION_95', 'ECOREGION_96', 'ECOREGION_97', 'ECOREGION_98', 
'ECOREGION_99', 'ECOREGION_100', 'ECOREGION_101', 'ECOREGION_102', 'ECOREGION_103', 'ECOREGION_117', 'ECOREGION_131', 
'ECOREGION_132', 'ECOREGION_134', 'ECOREGION_135', 'ECOREGION_136', 'ECOREGION_137', 'ECOREGION_138', 'ECOREGION_139', 
'ECOREGION_142', 'ECOREGION_145', 'ECOREGION_148', 'ECOREGION_149', 'ECOREGION_155', 'ECOREGION_156', 'ECOREGION_173', 
'ECOREGION_177', 'ECOREGION_178', 'ECOREGION_179', 'ECOREGION_180', 'ECOREGION_181', 'ECOREGION_182', 'ECOREGION_183', 
'ECOREGION_185', 'ECOREGION_188', 'ECOREGION_190', 'ECOREGION_191', 'ECOREGION_192', 'ECOREGION_193', 'ECOREGION_194', 
'ECOREGION_198', 'ECOREGION_199', 'ECOREGION_200', 'ECOREGION_202', 'ECOREGION_203', 'ECOREGION_204', 'ECOREGION_205', 
'ECOREGION_206', 'ECOREGION_207', 'ECOREGION_213', 'ECOREGION_214', 'ECOREGION_216', 'ECOREGION_217', 'ECODISTRICT_184', 
'ECODISTRICT_188', 'ECODISTRICT_190', 'ECODISTRICT_242', 'ECODISTRICT_243', 'ECODISTRICT_244', 'ECODISTRICT_247', 
'ECODISTRICT_248', 'ECODISTRICT_250', 'ECODISTRICT_252', 'ECODISTRICT_262', 'ECODISTRICT_263', 'ECODISTRICT_270', 
'ECODISTRICT_271', 'ECODISTRICT_272', 'ECODISTRICT_273', 'ECODISTRICT_274', 'ECODISTRICT_275', 'ECODISTRICT_276', 
'ECODISTRICT_279', 'ECODISTRICT_282', 'ECODISTRICT_283', 'ECODISTRICT_284', 'ECODISTRICT_285', 'ECODISTRICT_287', 
'ECODISTRICT_289', 'ECODISTRICT_291', 'ECODISTRICT_293', 'ECODISTRICT_294', 'ECODISTRICT_295', 'ECODISTRICT_297', 
'ECODISTRICT_299', 'ECODISTRICT_300', 'ECODISTRICT_312', 'ECODISTRICT_315', 'ECODISTRICT_316', 'ECODISTRICT_327', 
'ECODISTRICT_331', 'ECODISTRICT_334', 'ECODISTRICT_335', 'ECODISTRICT_336', 'ECODISTRICT_337', 'ECODISTRICT_338', 
'ECODISTRICT_339', 'ECODISTRICT_340', 'ECODISTRICT_341', 'ECODISTRICT_342', 'ECODISTRICT_343', 'ECODISTRICT_344', 
'ECODISTRICT_345', 'ECODISTRICT_346', 'ECODISTRICT_347', 'ECODISTRICT_348', 'ECODISTRICT_349', 'ECODISTRICT_350', 
'ECODISTRICT_351', 'ECODISTRICT_353', 'ECODISTRICT_354', 'ECODISTRICT_356', 'ECODISTRICT_357', 'ECODISTRICT_358', 
'ECODISTRICT_359', 'ECODISTRICT_363', 'ECODISTRICT_364', 'ECODISTRICT_366', 'ECODISTRICT_368', 'ECODISTRICT_369', 
'ECODISTRICT_370', 'ECODISTRICT_371', 'ECODISTRICT_372', 'ECODISTRICT_373', 'ECODISTRICT_375', 'ECODISTRICT_376', 
'ECODISTRICT_377', 'ECODISTRICT_378', 'ECODISTRICT_381', 'ECODISTRICT_382', 'ECODISTRICT_385', 'ECODISTRICT_386', 
'ECODISTRICT_387', 'ECODISTRICT_388', 'ECODISTRICT_391', 'ECODISTRICT_393', 'ECODISTRICT_397', 'ECODISTRICT_398', 
'ECODISTRICT_399', 'ECODISTRICT_400', 'ECODISTRICT_401', 'ECODISTRICT_403', 'ECODISTRICT_404', 'ECODISTRICT_406', 
'ECODISTRICT_407', 'ECODISTRICT_408', 'ECODISTRICT_409', 'ECODISTRICT_410', 'ECODISTRICT_411', 'ECODISTRICT_413', 
'ECODISTRICT_414', 'ECODISTRICT_415', 'ECODISTRICT_416', 'ECODISTRICT_418', 'ECODISTRICT_419', 'ECODISTRICT_420', 
'ECODISTRICT_421', 'ECODISTRICT_422', 'ECODISTRICT_423', 'ECODISTRICT_424', 'ECODISTRICT_425', 'ECODISTRICT_426', 
'ECODISTRICT_427', 'ECODISTRICT_428', 'ECODISTRICT_430', 'ECODISTRICT_432', 'ECODISTRICT_433', 'ECODISTRICT_434', 
'ECODISTRICT_435', 'ECODISTRICT_436', 'ECODISTRICT_437', 'ECODISTRICT_438', 'ECODISTRICT_439', 'ECODISTRICT_440', 
'ECODISTRICT_441', 'ECODISTRICT_442', 'ECODISTRICT_444', 'ECODISTRICT_445', 'ECODISTRICT_446', 'ECODISTRICT_447', 
'ECODISTRICT_478', 'ECODISTRICT_479', 'ECODISTRICT_539', 'ECODISTRICT_540', 'ECODISTRICT_541', 'ECODISTRICT_544', 
'ECODISTRICT_547', 'ECODISTRICT_550', 'ECODISTRICT_551', 'ECODISTRICT_552', 'ECODISTRICT_555', 'ECODISTRICT_568', 
'ECODISTRICT_570', 'ECODISTRICT_574', 'ECODISTRICT_576', 'ECODISTRICT_577', 'ECODISTRICT_579', 'ECODISTRICT_580', 
'ECODISTRICT_581', 'ECODISTRICT_583', 'ECODISTRICT_585', 'ECODISTRICT_586', 'ECODISTRICT_588', 'ECODISTRICT_590', 
'ECODISTRICT_591', 'ECODISTRICT_592', 'ECODISTRICT_593', 'ECODISTRICT_601', 'ECODISTRICT_607', 'ECODISTRICT_608', 
'ECODISTRICT_609', 'ECODISTRICT_616', 'ECODISTRICT_618', 'ECODISTRICT_619', 'ECODISTRICT_621', 'ECODISTRICT_622', 
'ECODISTRICT_623', 'ECODISTRICT_625', 'ECODISTRICT_627', 'ECODISTRICT_628', 'ECODISTRICT_629', 'ECODISTRICT_631', 
'ECODISTRICT_632', 'ECODISTRICT_633', 'ECODISTRICT_635', 'ECODISTRICT_636', 'ECODISTRICT_637', 'ECODISTRICT_640', 
'ECODISTRICT_641', 'ECODISTRICT_642', 'ECODISTRICT_643', 'ECODISTRICT_644', 'ECODISTRICT_645', 'ECODISTRICT_646', 
'ECODISTRICT_647', 'ECODISTRICT_649', 'ECODISTRICT_650', 'ECODISTRICT_651', 'ECODISTRICT_653', 'ECODISTRICT_654', 
'ECODISTRICT_655', 'ECODISTRICT_656', 'ECODISTRICT_657', 'ECODISTRICT_658', 'ECODISTRICT_659', 'ECODISTRICT_660', 
'ECODISTRICT_661', 'ECODISTRICT_662', 'ECODISTRICT_663', 'ECODISTRICT_664', 'ECODISTRICT_665', 'ECODISTRICT_666', 
'ECODISTRICT_667', 'ECODISTRICT_668', 'ECODISTRICT_669', 'ECODISTRICT_671', 'ECODISTRICT_672', 'ECODISTRICT_674', 
'ECODISTRICT_675', 'ECODISTRICT_676', 'ECODISTRICT_680', 'ECODISTRICT_682', 'ECODISTRICT_684', 'ECODISTRICT_686', 
'ECODISTRICT_687', 'ECODISTRICT_689', 'ECODISTRICT_690', 'ECODISTRICT_691', 'ECODISTRICT_693', 'ECODISTRICT_694', 
'ECODISTRICT_696', 'ECODISTRICT_697', 'ECODISTRICT_698', 'ECODISTRICT_700', 'ECODISTRICT_701', 'ECODISTRICT_702', 
'ECODISTRICT_703', 'ECODISTRICT_704', 'ECODISTRICT_707', 'ECODISTRICT_709', 'ECODISTRICT_710', 'ECODISTRICT_712', 
'ECODISTRICT_714', 'ECODISTRICT_717', 'ECODISTRICT_718', 'ECODISTRICT_723', 'ECODISTRICT_724', 'ECODISTRICT_729', 
'ECODISTRICT_733', 'ECODISTRICT_736', 'ECODISTRICT_745', 'ECODISTRICT_747', 'ECODISTRICT_748', 'ECODISTRICT_750', 
'ECODISTRICT_752', 'ECODISTRICT_753', 'ECODISTRICT_754', 'ECODISTRICT_755', 'ECODISTRICT_757', 'ECODISTRICT_758', 
'ECODISTRICT_760', 'ECODISTRICT_764', 'ECODISTRICT_767', 'ECODISTRICT_770', 'ECODISTRICT_771', 'ECODISTRICT_772', 
'ECODISTRICT_773', 'ECODISTRICT_780', 'ECODISTRICT_782', 'ECODISTRICT_792', 'ECODISTRICT_794', 'ECODISTRICT_798', 
'ECODISTRICT_799', 'ECODISTRICT_803', 'ECODISTRICT_808', 'ECODISTRICT_815', 'ECODISTRICT_816', 'ECODISTRICT_820', 
'ECODISTRICT_821', 'ECODISTRICT_824', 'ECODISTRICT_825', 'ECODISTRICT_826', 'ECODISTRICT_832', 'ECODISTRICT_833', 
'ECODISTRICT_838', 'ECODISTRICT_841', 'ECODISTRICT_847', 'ECODISTRICT_849', 'ECODISTRICT_850', 'ECODISTRICT_854', 
'ECODISTRICT_889', 'ECODISTRICT_905', 'ECODISTRICT_914', 'ECODISTRICT_918', 'ECODISTRICT_919', 'ECODISTRICT_920', 
'ECODISTRICT_925', 'ECODISTRICT_931', 'ECODISTRICT_933', 'ECODISTRICT_934', 'ECODISTRICT_938', 'ECODISTRICT_939', 
'ECODISTRICT_940', 'ECODISTRICT_941', 'ECODISTRICT_944', 'ECODISTRICT_945', 'ECODISTRICT_946', 'ECODISTRICT_947', 
'ECODISTRICT_948', 'ECODISTRICT_949', 'ECODISTRICT_950', 'ECODISTRICT_952', 'ECODISTRICT_953', 'ECODISTRICT_954', 
'ECODISTRICT_955', 'ECODISTRICT_957', 'ECODISTRICT_961', 'ECODISTRICT_962', 'ECODISTRICT_963', 'ECODISTRICT_964', 
'ECODISTRICT_965', 'ECODISTRICT_966', 'ECODISTRICT_967', 'ECODISTRICT_968', 'ECODISTRICT_969', 'ECODISTRICT_970', 
'ECODISTRICT_972', 'ECODISTRICT_973', 'ECODISTRICT_974', 'ECODISTRICT_975', 'ECODISTRICT_976', 'ECODISTRICT_977', 
'ECODISTRICT_978', 'ECODISTRICT_979', 'ECODISTRICT_980', 'ECODISTRICT_982', 'ECODISTRICT_983', 'ECODISTRICT_984', 
'ECODISTRICT_985', 'ECODISTRICT_987', 'ECODISTRICT_989', 'ECODISTRICT_990', 'ECODISTRICT_993', 'ECODISTRICT_995', 
'ECODISTRICT_996', 'ECODISTRICT_997', 'ECODISTRICT_999', 'ECODISTRICT_1001', 'ECODISTRICT_1002', 'ECODISTRICT_1003', 
'ECODISTRICT_1006', 'ECODISTRICT_1007', 'ECODISTRICT_1008', 'ECODISTRICT_1012', 'ECODISTRICT_1013', 'ECODISTRICT_1015', 
'ECODISTRICT_1016', 'ECODISTRICT_1017', 'ECODISTRICT_1018', 'ECODISTRICT_1024', 'ECODISTRICT_1027', 'ECODISTRICT_1028', 
'ECODISTRICT_1029', 'ECODISTRICT_1030']

one_hot_encodings = {'ECODISTRICT': [ 954,  955,  957,  950, 1006, 1008, 1012, 1015, 1017, 1003,  990,
         995, 1007,  953,  949,  948, 1001,  985,  989, 1002,  984,  999,
         947,  952,  978,  979,  976,  941,  946,  977,  983,  975,  974,
         982,  993,  945,  973,  987, 1013,  997,  972,  980,  970,  969,
         996,  618,  944,  966,  964,  965,  967,  939,  940,  968,  591,
         585,  920,  934,  933,  252,  938,  962,  961,  963,  583,  581,
         244,  918,  919,  905,  925,  248,  931,  247,  242,  914,  889,
        1018,  799,  750,  798,  631, 1016,  628,  627,  629,  623,  703,
         625,  621,  622,  684,  619,  616,  592,  609,  607,  588,  586,
         644,  641,  637,  608,  635,  633,  632,  593,  590,  601,  579,
         580,  338,  577,  331,  576,  263,  243,  574,  250,  262,  838,
         833,  832,  825,  794,  792,  755,  826,  816,  820,  752,  815,
         821,  824,  754,  782,  709,  808,  770,  748,  780,  747,  717,
         745,  707,  714,  773,  771,  729,  803,  767,  772,  736,  701,
         700,  702,  696,  698,  704,  672,  712,  697,  694,  693,  691,
         658,  669,  659,  662,  687,  710,  686,  733,  690,  660,  689,
         657,  661,  655,  656,  654,  653,  646,  682,  680,  647,  651,
         649,  664,  650,  358,  353,  347,  643,  354,  645,  642,  640,
         636,  351,  345,  348,  342,  344,  339,  343,  341,  336,  335,
         334,  279,  276,  274,  340,  337,  273,  275,  854,  760,  764,
         849,  375,  377,  376,  724,  753,  758,  850,  757,  847,  841,
         373,  371,  723,  718,  671,  370,  676,  368,  364, 1024,  184,
         366,  363,  674,  675,  666,  668,  663,  665,  356,  667,  359,
         357,  350,  349,  346,  283,  282,  272,  270,  271,  570,  568,
         551,  552,  413,  550,  555,  411,  423,  544,  409,  407,  547,
         425,  410,  404,  406,  400,  403,  401,  399, 1028,  382,  388,
         378,  391,  385,  372,  386,  387,  393,  381, 1030, 1029, 1027,
         369,  541,  540,  426,  420,  422,  424,  408,  419,  418,  416,
         415,  479,  421,  539,  478,  414,  440,  439,  438,  441,  430,
         433,  428,  434,  442,  398,  397,  287,  437,  436,  447,  435,
         432,  316,  446,  445,  444,  315,  327,  427,  294,  295,  285,
         293,  284,  300,  289,  291,  312,  190,  299,  297,  188],
 'ECOREGION': [193, 194, 192, 213, 214, 205, 156, 207, 191, 204, 202, 206, 149,
        188, 145, 203, 200, 190, 199, 185, 198, 138, 137, 180, 183,  66,
         64, 179, 177, 181, 178,  65, 182, 173, 139, 142, 136,  87,  69,
         88,  71,  70, 155,  91,  90, 148,  89, 216,  46, 135, 134,  98,
        132,  99,  97,  96,  94, 217,  93,  95,  92, 117, 101, 131, 100,
        102,  72, 103,  78,  74,  79,  75,  73,  47],
 'ECOZONE': [13,  9,  3,  2,  6,  8,  5]}

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
    local_file = '/tmp/' + MODEL_FILE_NAME
    if not os.path.exists(local_file):
        print('Downloading model from S3...')
        S3.download_file(BUCKET_NAME, key, local_file)
        print('Model downloaded at:' + local_file)
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
        
        # Convert month and day features
        req_data['MONTH_SIN'] = np.sin((req_data['MONTH'] - 1) * (2. * np.pi / 12))
        req_data['MONTH_COS'] = np.cos((req_data['MONTH'] - 1) * (2. * np.pi / 12))
        req_data['DAY_SIN'] = np.sin((req_data['DAY'] - 1) * (2. * np.pi / 31))
        req_data['DAY_COS'] = np.cos((req_data['DAY'] - 1) * (2. * np.pi / 31))
        

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
