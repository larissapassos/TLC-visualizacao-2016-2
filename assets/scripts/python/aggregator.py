import csv
import json
import math
import sys

from datetime import datetime

"""
{
    "region": {"lat_min": float, "lat_max": float, "lng_min": float, "lng_max": float},
    "pickups": int,
    "dropoffs": int,
    "pickups_hour": {},
    "pickups_day_week": {},
    "pickups_day_month": {},
    "average_price": float,
    "average_tip": float,
    "passenger_count":{},
}
"""

MAX_NYC_LAT = 40.9746818542
MIN_NYC_LAT = 40.477222222222224
MAX_NYC_LNG = -73.1048431396
MIN_NYC_LNG = -74.25888888888889
NUM_BOXES_SIDE = 100
LAT_INTERVAL = (MAX_NYC_LAT - MIN_NYC_LAT) / NUM_BOXES_SIDE
LNG_INTERVAL = (MAX_NYC_LNG - MIN_NYC_LNG) / NUM_BOXES_SIDE

aggregated_data = {}
regions = {}

def generate_regions():
    for i in range(NUM_BOXES_SIDE):
        regions[i] = {}
        for j in range(NUM_BOXES_SIDE):
            regions[i][j] = {
                "lat_min": MIN_NYC_LAT + (i * LAT_INTERVAL), 
                "lat_max": MIN_NYC_LAT + ((i + 1) * LAT_INTERVAL), 
                "lng_min": MIN_NYC_LNG + (j * LNG_INTERVAL), 
                "lng_max": MIN_NYC_LNG + ((j + 1) * LNG_INTERVAL)
                }

def find_bounding_box(lat, lng):
    print ">>>>>> " + str(lat) + " " + str(lng)
    i = int(math.floor((lat - MIN_NYC_LAT) / LAT_INTERVAL)) - 1
    j = int(math.floor((lng - MIN_NYC_LNG) / LNG_INTERVAL)) - 1
    return i, j

def populate_pickup_data(i, j, row):
    if i < 0 or i >= NUM_BOXES_SIDE:
        # invalid row
        return
    
    if j < 0 or j >= NUM_BOXES_SIDE:
        # invalid row
        return

    if i not in aggregated_data:
        aggregated_data[i] = {}
    
    if j not in aggregated_data[i]:
        aggregated_data[i][j] = {'region': regions[i][j]}

    # pickup count
    try:
        aggregated_data[i][j]['pickups'] += 1
    except KeyError:
        aggregated_data[i][j]['pickups'] = 1
            
    date = datetime.strptime(row['lpep_pickup_datetime'], '%Y-%m-%d %H:%M:%S')
            
    # pickups_hour
    hour = date.hour
    if 'pickups_hour' not in aggregated_data[i][j]:
        aggregated_data[i][j]['pickups_hour'] = {}

    try:
        aggregated_data[i][j]['pickups_hour'][hour] += 1
    except KeyError:
        aggregated_data[i][j]['pickups_hour'][hour] = 1
    
    # pickups_day_week
    week_day = datetime.weekday(date)
    if 'pickups_day_week' not in aggregated_data[i][j]:
        aggregated_data[i][j]['pickups_day_week'] = {}

    try:
        aggregated_data[i][j]['pickups_day_week'][week_day] += 1
    except KeyError:
        aggregated_data[i][j]['pickups_day_week'][week_day] = 1
    
    # pickups_day_month
    day = date.day
    if 'pickups_day_month' not in aggregated_data[i][j]:
        aggregated_data[i][j]['pickups_day_month'] = {}

    try:
        aggregated_data[i][j]['pickups_day_month'][day] += 1
    except KeyError:
        aggregated_data[i][j]['pickups_day_month'][day] = 1


def populate_dropoff_data(i, j, row):
    if i < 0 or i >= NUM_BOXES_SIDE:
        # invalid row
        return
    
    if j < 0 or j >= NUM_BOXES_SIDE:
        # invalid row
        return
        
    if i not in aggregated_data:
        aggregated_data[i] = {}
    
    if j not in aggregated_data[i]:
        aggregated_data[i][j] = {'regions': regions[i][j]}
    
    # dropoff count
    try:
        aggregated_data[i][j]['dropoffs'] += 1
    except KeyError:
        aggregated_data[i][j]['dropoffs'] = 1
    
    # average_price
    try:
        aggregated_data[i][j]['average_price'] += float(row['Fare_amount'])
    except KeyError:
        aggregated_data[i][j]['average_price'] = float(row['Fare_amount'])
    
    # average_tip
    try:
        aggregated_data[i][j]['average_tip'] += float(row['Tip_amount'])
    except KeyError:
        aggregated_data[i][j]['average_tip'] = float(row['Tip_amount'])
    
    # passenger_count:
    if 'passenger_count' not in aggregated_data[i][j]:
        aggregated_data[i][j]['passenger_count'] = {}
    
    passenger_count = int(row['Passenger_count'])
    try:
        aggregated_data[i][j]['passenger_count'][passenger_count] += 1
    except KeyError:
        aggregated_data[i][j]['passenger_count'][passenger_count] = 1

def parse_row(row):
    """
        We find the bounding boxes corresponding to the pickup and dropoff points,
        and store the data accordingly
    """
    i_pickup, j_pickup = find_bounding_box(float(row['Pickup_latitude']), float(row['Pickup_longitude']))
    i_dropoff, j_dropoff = find_bounding_box(float(row['Dropoff_latitude']), float(row['Dropoff_longitude']))
    populate_pickup_data(i_pickup, j_pickup, row)
    populate_dropoff_data(i_dropoff, j_dropoff, row)

def calculate_averages():
    for i in aggregated_data:
        for j in aggregated_data[i]:
            if 'average_price' in aggregated_data[i][j]:
                aggregated_data[i][j]['average_price'] = float(aggregated_data[i][j]['average_price']) / aggregated_data[i][j]['dropoffs']
            if 'average_tip' in aggregated_data[i][j]:
                aggregated_data[i][j]['average_tip'] = float(aggregated_data[i][j]['average_tip']) / aggregated_data[i][j]['dropoffs']

def write_data(cab_type):
    data = []
    for i in aggregated_data:
        for j in aggregated_data[i]:
            data.append(aggregated_data[i][j])
    
    with open(cab_type + '.json', 'w') as json_file:
        json.dump(data, json_file)
    print "Aggregated data writen to file"
    print "---------------------------------------------------"


def main(argv):
    """"
        Each tlc file will be parsed and aggregated here
    """
    generate_regions()
    print "Regions generated"
    for tlc_file in argv:
        print "Reading " + tlc_file
        print "---------------------------------------------------"
        aggregated_data.clear()
        with open(tlc_file) as csvfile:
            cab_type = "yellow" if "yellow" in tlc_file else "green"
            reader = csv.DictReader(csvfile)
            print "Parsing rows"
            for row in reader:
                parse_row(row)
        calculate_averages()
        write_data(cab_type)


if __name__ == "__main__":
    main(sys.argv[1:])