import sys, time
sys.dont_write_bytecode = True
import datetime
import requests
from pprint import pprint
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin

# Flask configuration
app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/interest', methods=['POST'])
def interest():
    if request.method == 'POST': 
        print request.json
    
        if not request.json['toAirport']:
            rsp = "City can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
    
        f = open('cities.txt','r')
        for city in f.readlines():
            if city[:-1] == str(request.json['toAirport']):
                break
        
        if city[:-1] == str(request.json['toAirport']):
            baseurl = 'https://api.sandbox.amadeus.com/v1.2/points-of-interest/yapq-search-text?apikey='
            r = requests.get(baseurl+secret+'&city_name='+city[:-1])
            
            return jsonify(filteredInfoInterestingPlaces(r.json()))
        else:
            #rsp = "City not in the database. Please try again."
            return {"locations":[]}
            #return render_template('index.html',rsp=rsp)

@app.route('/nearestAirport', methods=['POST'])
def nearestAirport():
    if request.method == 'POST': 
        print request.json
    
        if not request.json['source']:
            rsp = "Source City can't be blank. Please try again."
            return jsonify({'error':rsp})
            
        if not request.json['destination']:
            rsp = "Destination City can't be blank. Please try again."
            return jsonify({'error':rsp})
    
        # Get longitude and latitude of source/destination cities 
        baseurl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
        r = requests.get(baseurl+request.json['source'].replace(" ","\%20"))
        
        lat1 = r.json()['results'][0]['geometry']['bounds']['northeast']['lat']
        lng1 = r.json()['results'][0]['geometry']['bounds']['northeast']['lng']
        print "Got (lang, lat) from source, "+str(lat1), str(lng1)
        
        # Get longitude and latitude of source/destination cities 
        baseurl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
        r = requests.get(baseurl+request.json['destination'].replace(" ","\%20"))
        
        lat2 = r.json()['results'][0]['geometry']['bounds']['northeast']['lat']
        lng2 = r.json()['results'][0]['geometry']['bounds']['northeast']['lng']
        print "Got (lang, lat) from source, "+str(lat2), str(lng2)
        
        data = findNearestAirportAmongTwo(lat1, lng1, lat2, lng2)
        
        home = {}
        home['name'] = request.json['source']
        home['categories'] = []
        home['image'] = ""
        home['longitude'] = lng1
        home['latitude'] = lat1
        home['description'] = ""
        
        destination = {}
        destination['name'] = request.json['destination']
        destination['categories'] = []
        destination['image'] = ""
        destination['longitude'] = lng2
        destination['latitude'] = lat2
        destination['description'] = ""
        
        if len(data) < 1:
            return jsonify({'fromAirport':[],'toAirport':[],'stops':[],'price':0,"home":home, "destination": destination})
        else:
            return jsonify({'fromAirport':data['stops'][0],'toAirport':data['stops'][-1],'stops':data['stops'][1:-1],'price':data['price'],"home":home, "destination": destination})

def filteredInfoInterestingPlaces(data):
    #results = {'title':__, "categories": [], "image": url, "longitude": __, "latitude":__, "description":__}
    results = []
    
    for place in data['points_of_interest']:
        result = {}
        result['name'] = place['title']
        result['categories'] = place['categories']
        result['image'] = place['main_image']
        result['longitude'] = place['location']['longitude']
        result['latitude'] = place['location']['latitude']
        result['description'] = place['details']['description']
        
        results.append(result)
    
    if len(results) < 5:
        return {"locations":results}
    else:
        return {"locations":results[:5]}

def findNearestAirportAmongTwo(lat1, lng1, lat2, lng2):

    baseurl = 'https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey='
    r = requests.get(baseurl+secret+'&latitude='+str(lat1)+'&longitude='+str(lng1))
    
    o_airport = r.json()
    #o_airport = sorted(r.json(), key=lambda x: x['distance'])
    #o_airport = o_airport[0]['airport']   # Take the nearest airport
    
    baseurl = 'https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey='
    r = requests.get(baseurl+secret+'&latitude='+str(lat2)+'&longitude='+str(lng2))
    d_airport = r.json()
    #d_airport = sorted(r.json(), key=lambda x: x['distance'])
    #d_airport = d_airport[0]['airport'] # Take the nearest airport

    # Run till found direct or indirect flight
    d_air = d_airport[0]

    # Run loop for direct path 
    count = 3
    for o_air in o_airport:
        
        count -= 1
        
        if count < 0:
            break
        
        date = datetime.datetime.now() + datetime.timedelta(days=7)
        date = date.strftime("%Y-%m-%d") # yyyy-mm-dd
        
        # Find cheapest direct flight
        baseurl = 'https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey='
        req = baseurl+secret+'&origin='+o_air['airport']+'&destination='+d_air['airport']+'&departure_date='+str(date)+'&nonstop=true&currency=USD'
        print req
        r = requests.get(req)
    
        # Move to next of airports
        if 'results' not in r.json():
            continue
        else:
            # Extract all stop over information from itinerary
            flights = r.json()['results'][0]
            results = []
            
            # Gather information about all stops 
            l = len(flights['itineraries'][0]['outbound']['flights'])
            for i in range(0,l):
                result = {}
                
                flight = flights['itineraries'][0]['outbound']['flights'][i]
                
                airport = flight['origin']['airport']
                baseurl = 'https://api.sandbox.amadeus.com/v1.2/location/'+airport+'?apikey='
                r = requests.get(baseurl+secret)
                
                result['name'] = r.json()['airports'][0]['name']
                result['categories'] = []
                result['image'] = ""
                result['longitude'] = r.json()['airports'][0]['location']['longitude']
                result['latitude'] = r.json()['airports'][0]['location']['latitude']
                result['description'] = ""
                
                results.append(result)
                
                if i == l - 1:
                    result = {}
                
                    flight = flights['itineraries'][0]['outbound']['flights'][i]
                
                    airport = flight['destination']['airport']
                    baseurl = 'https://api.sandbox.amadeus.com/v1.2/location/'+airport+'?apikey='
                    r = requests.get(baseurl+secret)
                    
                    result['name'] = r.json()['airports'][0]['name']
                    result['categories'] = []
                    result['image'] = ""
                    result['longitude'] = r.json()['airports'][0]['location']['longitude']
                    result['latitude'] = r.json()['airports'][0]['location']['latitude']
                    result['description'] = ""
                    
                    results.append(result)

            return {"stops": results, "price" : flights['fare']['total_price']}
            
    # Run loop for in-direct paths
    for o_air in o_airport:
        
        # Get tomorrow's date
        date = datetime.datetime.now() + datetime.timedelta(days=1)
        date = date.strftime("%Y-%m-%d") # yyyy-mm-dd
        
        # Find cheapest direct flight
        baseurl = 'https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey='
        req = baseurl+secret+'&origin='+o_air['airport']+'&destination='+d_air['airport']+'&departure_date='+str(date)+'&nonstop=false&currency=USD'
        print req
        r = requests.get(req)
    
        # Move to next pair of airports
        if 'results' not in r.json():
            continue
        else:
            # Extract all stop over information from itinerary
            flights = r.json()['results'][0]
            results = []
            
            # Gather information about all stops 
            l = len(flights['itineraries'][0]['outbound']['flights'])
            for i in range(0,l):
                result = {}
                
                flight = flights['itineraries'][0]['outbound']['flights'][i]
                
                airport = flight['origin']['airport']
                baseurl = 'https://api.sandbox.amadeus.com/v1.2/location/'+airport+'?apikey='
                r = requests.get(baseurl+secret)
                
                result['name'] = r.json()['airports'][0]['name']
                result['categories'] = []
                result['image'] = ""
                result['longitude'] = r.json()['airports'][0]['location']['longitude']
                result['latitude'] = r.json()['airports'][0]['location']['latitude']
                result['description'] = ""
                
                results.append(result)
                
                if i == l-1:
                    result = {}
                
                    flight = flights['itineraries'][0]['outbound']['flights'][i]
                    
                    airport = flight['destination']['airport']
                    baseurl = 'https://api.sandbox.amadeus.com/v1.2/location/'+airport+'?apikey='
                    r = requests.get(baseurl+secret)
                    
                    result['name'] = r.json()['airports'][0]['name']
                    result['categories'] = []
                    result['image'] = ""
                    result['longitude'] = r.json()['airports'][0]['location']['longitude']
                    result['latitude'] = r.json()['airports'][0]['location']['latitude']
                    result['description'] = ""
                    
                    results.append(result)
                    

            return {"stops": results, "price" : flights['fare']['total_price']}
    
    return {"stops": [], "price" : 0}
    
# Run
f = open("config",'r')
secret = f.read()
#print secret
f.close()
app.run(host='0.0.0.0',threaded=True,debug=True)