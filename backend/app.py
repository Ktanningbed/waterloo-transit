import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import csv

CREATE_ROUTES="""CREATE TABLE IF NOT EXISTS route 
(route_id TEXT, route_short_name TEXT,
route_long_name TEXT, route_type TEXT, route_color TEXT,
 route_text_color TEXT, route_url TEXT);"""

CREATE_TRIPS="""CREATE TABLE IF NOT EXISTS trip
(route_id TEXT, service_id TEXT, trip_id TEXT,
trip_headsign TEXT, direction_id TEXT, block_id TEXT, shape_id TEXT,
wheelchair_accessible TEXT, bikes_allowed TEXT)"""

CREATE_SHAPES="""CREATE TABLE IF NOT EXISTS shape
(shape_id TEXT, shape_pt_lat DECIMAL,
shape_pt_lon DECIMAL, shape_pt_sequence TEXT)"""

CREATE_STOPS="""CREATE TABLE IF NOT EXISTS stop
(stop_id TEXT, stop_code TEXT,
stop_name TEXT, stop_desc TEXT, stop_lat DECIMAL,
stop_lon DECIMAL, zone_id TEXT, stop_url text,
location_type TEXT, parent_station TEXT, 
wheelchair_boarding TEXT, platform_code TEXT)"""

CREATE_STOP_TIMES="""CREATE TABLE IF NOT EXISTS stop_times
(trip_id TEXT, arrival_time TEXT, departure_time TEXT,
stop_id TEXT, stop_sequence TEXT, pickup_type TEXT,
drop_off_type TEXT)"""


load_dotenv()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(url)

with connection:
    with connection.cursor() as cursor:
        cursor.execute(CREATE_ROUTES)
        cursor.execute(CREATE_SHAPES)
        cursor.execute(CREATE_STOP_TIMES)
        cursor.execute(CREATE_STOPS)
        cursor.execute(CREATE_TRIPS)

# def add_gtfs():
#     with open('./gtfs/trips.csv', 'r') as file:
#         csvreader = csv.reader(file)
#         next(csvreader)
#         # for row in csvreader:
#         #     print(row[0])

#         with connection:
#             with connection.cursor() as cursor:
#                 # for row in csvreader:
                    
#                 for row in csvreader:
#                     # cursor.execute("INSERT INTO route (route_id, route_short_name, route_long_name, route_type, route_color, route_text_color, route_url) VALUES (%s, %s, %s, %s, %s, %s, %s)", (row[0], row[1],row[2], row[3], row[4],row[5],row[6]))
#                     # print(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8])
#                     # cursor.execute("INSERT INTO stop_times (trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type) VALUES (%s, %s, %s, %s, %s, %s, %s)", (row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
#                     cursor.execute("INSERT INTO trip (route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (row[0], row[1],row[2], row[3], row[4],row[5],row[6], row[7], row[8]))
#                     # cursor.execute("INSERT INTO stop (stop_id, stop_code, stop_name, stop_desc, stop_lat, stop_lon, zone_id,stop_url,location_type, parent_station, wheelchair_boarding, platform_code) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s,%s)", (row[0],row[1], row[2],row[3],row[4],row[5],row[6],row[7],row[8],row[9],row[10],row[11]))
#                     # cursor.execute("INSERT INTO shape (shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence) VALUES (%s, %s, %s, %s)", (row[0], row[1], row[2], row[3]))

# add_gtfs()


@app.get("/api/routes")
def get_routes():
    with connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM route LIMIT 100")
            table = cursor.fetchall()
    return table, 200


@app.post("/api/shape")
def get_shape():
    data = request.get_json(force=True)
    route_long_name = data["name"]
    with connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT shape_pt_lon, shape_pt_lat FROM shape JOIN trip ON shape.shape_id = trip.shape_id JOIN route ON trip.route_id = route.route_id WHERE route.route_long_name = %s;", (route_long_name, )) 
            table = cursor.fetchall()
            cursor.execute("SELECT * FROM route JOIN trip ON trip.route_id = route.route_id JOIN stop_times ON stop_times.trip_id = trip.trip_id JOIN stop ON stop.stop_id = stop_times.stop_id WHERE route.route_long_name = 'Queen-River';") #(route_long_name, )
            table2 = cursor.fetchall()
            # print([table])
            # cursor.execute("SELECT ")

    return [table, table2], 200