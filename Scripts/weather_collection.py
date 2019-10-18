import requests
import pandas as pd
from io import StringIO
import time


def get_weather_data(stationIDs, start_year, end_year):
    df = pd.DataFrame({})
    index = 0
    for stationID in stationIDs:
        index += 1
        start = time.time( )
        for year in range(start_year, end_year+1):
            url = "http://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&" +\
                f"stationID={stationID}&Year={year}&Month=1&Day=14" + "&timeframe=2&submit=Download+Data"
            response = requests.get(url)
            string_data = str(response.content, 'utf-8')
            data = StringIO(string_data)
            new_df = pd.read_csv(data)
            if len(df.index) == 0:
                df = new_df
            else:
                df = pd.concat([df, new_df], ignore_index=True)
        end = time.time()
        total_time = end - start
        print('Got data from ' + str(index) + ' of ' + str(len(stationIDs)) + ' weather stations in: ' + str(total_time))
    return df

def get_stationIDs():
    df = pd.read_csv('../Data/Weather/current_station_inventory.csv')
    stationID_list = df['Station ID'].tolist()
    stationID_set = set(stationID_list)
    if len(stationID_list) > len(stationID_set):
        print('Non unique elements found in station ID list returning unique set.')
    return list(stationID_set)



if __name__ == '__main__':
    stationIDs = get_stationIDs()
    start = time.time()
    result = get_weather_data(stationIDs[250:300], 1999, 2019)
    end = time.time()
    total_time = (end - start)/60
    print('Total time: '+str(total_time))
    result.to_csv('../Data/Weather/all_daily_weather_250_300.csv')
