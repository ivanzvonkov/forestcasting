# BACKEND

## Database Setup
Previously you had to white-list your IP address but that is no-longer the case. 

## Starting the Server
Install all required packages  
```bash
npm install
```

Start local server  
```bash
npm start
```

Start local server with auto refresh on code change
```bash
npm run dev
```

## API
Local swagger: http://localhost:3100/api-docs
Example local call: http://localhost:3100/api/analysis?lat=50.8&lng=-114.6&date=2020-02-29&range=3

Lambda swagger: https://oad807epu2.execute-api.us-east-1.amazonaws.com/latest/api-docs
Example lambda call: https://oad807epu2.execute-api.us-east-1.amazonaws.com/latest/api/analysis?lat=54.751932&lng=-116.353276&date=2020-02-29&range=2

_currently can only predict 7 days into the future_

## Deployment
Setup AWS `forestcasting-user` in ~/.aws/config. Contact [Ivan](izvonkov@uwo.ca) for access key id and secret key. 

Set to current profile:
```bash
export AWS_PROFILE=forestcasting-user
```

Update lambda function
```bash
npm run update
```
