from flask import Flask, url_for
import requests
from flask import Flask, render_template, request, url_for, jsonify, redirect, flash, jsonify, Response, send_from_directory
import regex as re
import urllib
from flask_cors import CORS, cross_origin

translate_key = 'fa297b5fed0d4166bd7811ae886e937b'

def get_translate_access_token():
	url = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken'
	headers = {'Ocp-Apim-Subscription-Key': translate_key}
	return requests.post(url,headers = headers).text

def translate_string(access_token,string,to_lang):
	baseurl = 'https://api.microsofttranslator.com/v2/http.svc/Translate'
	r = requests.get(baseurl+'?appid=Bearer%20'+access_token+'&text='+string+'&to='+to_lang)
	return r

app = Flask(__name__)
CORS(app)

#POST Request : 
# curl -H "Content-Type: application/json" -X POST -d '{"string":"hello from california","to_lang":"es"}' http://localhost:5000/translate



@app.route('/')
def index():
	return 'index page'

@app.route('/translate',methods=['GET','POST'])
def translate():
	if(request.method == 'POST'):
		print(request.json)
		print('in translate')
		access_token = get_translate_access_token()
		to_lang = request.json['to_lang']
		string = request.json['string']
		print(to_lang,string)
		translated_string = translate_string(access_token,string,to_lang)
		print(translated_string.text)
		result = re.search('<.*>(.*)<.*>',translated_string.text)
		print(result)
		return result.group(1)



@app.route('/search/<query>/<num_links>',methods=['GET'])
def search(query,num_links):
	if(request.method == 'GET'):
		url = 'https://api.cognitive.microsoft.com/bing/v5.0/search?q='+query+'&count='+str(num_links)+'&offset=0&mkt=en-us&safesearch=Moderate'
		search_key = '4995912d72ba4e8791c0c8028f30224e'
		headers = {'Ocp-Apim-Subscription-Key': search_key}

		result = []
		query_result = requests.get(url,headers = headers).json()
		for i in query_result['webPages']['value']:
			r =  re.search('(.*)(&r=)(.*),.*',i['url'])
			result.append(urllib.unquote(r.groups(1)[2]))
			print('appended')
		print(result)	
		return str(result)



if __name__ == '__main__':
    app.run(host='0.0.0.0')
