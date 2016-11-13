import sys
sys.dont_write_bytecode = True

import requests
from pprint import pprint
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin

# Flask configuration
app = Flask(__name__)
CORS(app)
secret = 'SPYPBzEK27i6j0YYeFY6y0ZRAM3gGAbP'

@app.route('/')
def index():
    return render_template("index.html")    

@app.route('/flight', methods=['POST'])
def flight():
    if request.method == 'POST': 
        
        print request.json
        
        if not request.json['longitude1']:
            rsp = "longitude can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
        
        if not request.json['latitude1']:
            rsp = "latitude can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)

        if not request.json['longitude2']:
            rsp = "longitude can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
        
        if not request.json['latitude2']:
            rsp = "latitude can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
            
        if not request.json['date']:
            rsp = "Date can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
            
        city1 = [request.json['longitude1'], request.json['latitude1']]
        city2 = [request.json['longitude2'], request.json['latitude2']]
        
        print city1, city2
        
        airport1 = findNearestAirport(city1)
        airport2 = findNearestAirport(city2)
        return jsonify(getFlightInfo(airport1, airport2, request.json['date']))
    
    return render_template("index.html")    

def findNearestAirport(city):
    baseurl = 'https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey='
    r = requests.get(baseurl+secret+'&latitude='+city[0]+'&longitude='+city[1])

    return r.json()[0]["airport"]

def getFlightInfo(airport1, airport2, date):

    print airport1, airport2, date

    baseurl = 'https://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?apikey='
    r = requests.get(baseurl+secret+'&origin='+airport1+'&destination='+airport2+'&departure_date='+date)
    
    # Get currency conversion rates
    if r.json()['currency'] != 'USD':
        c = requests.get("http://api.fixer.io/latest?base="+r.json()['currency'])
        forex = c.json()['rates']['USD']
    
    suggestions = {'results':[]}
    for flight in r.json()['results']:
        suggestion = {}
        for key in flight.keys():
            if key == 'price':
                price = int(float(flight['price'])*forex)
                suggestion['price'] = price
            else:
                suggestion[key] = flight[key]
        a = suggestions['results']   
        a.append(suggestion)
        suggestions['results'] = a
    
    #print suggestions
  
    return suggestions

@app.route('/interest', methods=['POST'])
def interest():
    if request.method == 'POST': 
        print request.json
    
        if not request.json['city']:
            rsp = "City can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
    
        f = open('cities.txt','r')
        for city in f.readlines():
            if city[:-1] == str(request.json['city']):
                break
        
        if city[:-1] == str(request.json['city']):
            baseurl = 'https://api.sandbox.amadeus.com/v1.2/points-of-interest/yapq-search-text?apikey='
            r = requests.get(baseurl+secret+'&city_name='+city[:-1])
            
            return jsonify(filteredInfoInterestingPlaces(r.json()))
        else:
            rsp = "City not in the database. Please try again."
            return render_template('index.html',rsp=rsp)

@app.route('/nearestAirport', methods=['POST'])
def nearestAirport():
    if request.method == 'POST': 
        print request.json
    
        if not request.json['source']:
            rsp = "Source City can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
            
        if not request.json['destination']:
            rsp = "Destination City can't be blank. Please try again."
            return render_template('index.html',rsp=rsp)
    
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
        
        data = findNearestAirport(lat1, lng1, lat2, lng2)
        result1 = {}
        result1['name'] = data['origin']['city_name']
        result1['categories'] = []
        result1['image'] = ""
        result1['longitude'] = data['origin']['location']['longitude']
        result1['latitude'] = data['origin']['location']['latitude']
        result1['description'] = ""
        
        result2 = {}
        result2['name'] = data['destination']['city_name']
        result2['categories'] = []
        result2['image'] = ""
        result2['longitude'] = data['destination']['location']['longitude']
        result2['latitude'] = data['destination']['location']['latitude']
        result2['description'] = ""
            
        return jsonify({"origin":result1, "destination": result2})

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
    
    pprint (results)
    if len(results) < 5:
        return {"locations":results}
    else:
        return {"locations":results[:5]}

def findNearestAirport(lat1, lng1, lat2, lng2):
    
    baseurl = 'https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey='
    r = requests.get(baseurl+secret+'&latitude='+str(lat1)+'&longitude='+str(lng1))
    #origin_airports = r.json()
    origin_airports = sorted(r.json(), key=lambda x: x['distance'])
    
    print (origin_airports)
    
    baseurl = 'https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey='
    r = requests.get(baseurl+secret+'&latitude='+str(lat2)+'&longitude='+str(lng2))
    #destination_airports = r.json()
    destination_airports = sorted(r.json(), key=lambda x: x['distance'])
    
    print (destination_airports)
    
    # Start checking for direct flight from origin to destination airport
    for i in range(0, len(origin_airports)):
        for j in range(0, len(destination_airports)):
            baseurl = 'https://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?apikey='
            r = requests.get(baseurl+secret+'&origin='+origin_airports[i]['airport']+'&destination='+destination_airports[j]['airport'])
            if 'results' in r.json() and len(r.json()['results']) > 0:
                print "Found a connecting flight to below two locations"
                pprint(origin_airports[i])
                pprint(destination_airports[j])
                break # Found the connecting flight
        
        if 'results' in r.json() and len(r.json()['results']) > 0:
            break
            
    return {'origin':origin_airports[i], 'destination': destination_airports[j]}
    
# Run
app.run(threaded=True,debug=True)