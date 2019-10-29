# input: Alberta ATS seq file
# output: Two files: (1) a csv file with all the ATS fields
#                    (2) a csv file with only the first 8 fields (see summHeader variable for field names)
#         Both output files write to the location that the script is run from
# command: python seqToCsvScript.py <ATS_SEQ_FILE>
import sys
import csv

def main(fileName):
    header = "MERIDIAN,RANGE,TOWNSHIP,SECTION,QUARTER SECTION,LATITIUDE,LONGITUDE,YEAR COMPUTED,MONTH COMPUTED,DAY COMPUTED,STATION CODE,STATUS CODE,HORIZONTAL CLASSIFICATION,COMMENT FIELD,HORIZONTAL ORIGIN,HORIZONTAL METHOD,HORIZONTAL DATUM,ROAD ALLOWANCE CODE,ELEVATION,ELEVATION DATE,ELEVATION METHOD,ELEVATION ACCURACY,VERTICAL DATUM,PARCEL YEAR COMPUTED,PARCEL MONTH COMPUTED,PARCEL DAY COMPUTED,1:20 000 YEAR COMPUTED,1:20 000 MONTH COMPUTED, 1:20 000 DAT COMPUTED,UPDATE DATE\n"
    summHeader = "MERIDIAN,RANGE,TOWNSHIP,SECTION,QUARTER SECTION,LATITIUDE,LONGITUDE\n"

    #create the two files that will be written to
    with open("./full_AL_location_grid.csv", "w+") as newFile:
        with open("./AL_location_grid.csv", "w+") as summFile:
            newFile.write(header)
            summFile.write(summHeader)
            with open(fileName) as file:
                for line in file:
                    lineList = list(line)
                    # add commas at all character locations that are requires
                    for i, j in enumerate([1,3,6,8,10,21,33,37,39,41,42,43,44,56,57,58,59,60,66,74,75,76,77,78,82,84,86,90,92,94]):
                        lineList.insert(i + j, ',')

                    # create csv string for the line
                    newLine = ''.join(lineList)
                    summarisedLine = ''.join(lineList[0:39])

                    # write csv line to the new file
                    summFile.write(summarisedLine)
                    newFile.write(newLine)

if __name__ == "__main__":
    fileName = sys.argv[1]
    main(fileName)
    quit()
