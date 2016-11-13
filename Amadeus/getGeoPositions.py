import json, requests
from pprint import pprint
from unidecode import unidecode 
import time

#from geopy.geocoders import Nominatim
#geolocator = Nominatim()


f = open("cities.txt",'r')
f_out = open("city-coordinates.txt",'w')

out = {}

for city in f.readlines():
    time.sleep(1)
    city = city[:-1]
    out[city] = {}
    baseurl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
    r = requests.get(baseurl+city)
    
    #location = geolocator.geocode(c)
    #print (city)
    #print((location.latitude, location.longitude))
    
    lat = r.json()['results'][0]['geometry']['bounds']['northeast']['lat']
    lng = r.json()['results'][0]['geometry']['bounds']['northeast']['lng']
    
    out[city] = {"lat":lat,"lng":lng}
    
    #print (out[city])
    
f_out.write(json.dumps(out,indent=4))