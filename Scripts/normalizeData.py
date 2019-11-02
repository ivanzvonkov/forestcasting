import numpy as np
import pyproj
from functools import partial
from shapely.geometry import box
from shapely.ops import transform
from shapely.geometry import Point
import fiona
import csv

# import shape file
shape = fiona.open("./AVICrownIndex.shp")

# convert shape file into a Polygon of lat/long coordinates
p_in = pyproj.Proj(shape.crs)
bound_box = box(*shape.bounds)
p_out = pyproj.Proj({'init': 'EPSG:4326'})  # aka WGS84
project = partial(pyproj.transform, p_in, p_out)
bound_box_wgs84 = transform(project, bound_box)
# print('WGS84 box: ' + str(bound_box_wgs84))

# create updated list to add the rows inside the Polygon
updatedList = [['KEY', 'LATITUDE', 'LONGITUDE']]

# read csv
with open('alberta_grid_system.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    inside = 0
    outside = 0
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            # turn every coordinate into a shapely Point
            # create a point from lat long
            lat = row[1]
            lon = row[2]
            point = Point(float(lon), float(lat))

            # check whether it falls in a polygon
            # check if the polygon contains the point
            if bound_box_wgs84.contains(point):
                inside += 1
                updatedList.append(row)
            else:
                outside += 1
            line_count += 1

with open('AL_location_grid_usefulness.csv', 'w') as writeFile:
    writer = csv.writer(writeFile)
    writer.writerows(updatedList)

print(inside, outside)
print(updatedList)


