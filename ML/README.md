# Machine Learning API
Used for accessing the current most accurate forest fire prediction model. Code runs on AWS Lambda with the model uploaded on AWS S3.


### Usage
API is available through Swagger UI

### Steps to setup locally
1. Create virtual environment (specifically need Python 3.6)
```bash
$ virtualenv -p python3.6 MLenv
```
2. Activate virtual environment
```bash
$ source MLenv/bin/activate
```
3. Install requirements
```bash
$ pip install -r requirements.txt
```
4. Ensure your machine is connected to an AWS account with access to bucket: `forestcasting-bucket`. Alternatively, comment out S3 code and use model located in ../model directory directly.

5. Start as local server
```bash
$ python api/app.py
```

6. Should be running on [localhost:5000](localhost:5000)

### Steps to update deployment
To deploy fresh instance.
```bash
$ zappa deploy
```
To update current deployment
```bash
$ zappa update
```