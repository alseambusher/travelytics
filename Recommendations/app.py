from flask import Flask, request
from flask.ext.cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#counts the total number of common locations between our user and his friend/a stranger. It also maintains a list of all the locations seen so far, which is used later for nn_matrix
def count_common(user_locs, other_locs, all_locs):
	total_common = 0
	for i in other_locs:
		if i in user_locs:
			total_common += 1
		else:
			all_locs.append(i)
	return total_common, all_locs

#creates a row in our nearest neighbor matrix
def create_rows(visited_places, all_locations):
	nn_mat_row = [] #places visited by a particular user
	for loc in all_locations:
		if loc in visited_places:
			nn_mat_row.append(1)
		else:
			nn_mat_row.append(0)
	return nn_mat_row

# takes a matrix with each row suggesting if a user has visited that place or not
def collab_filtering(mat, all_locs):
	suggestions = []
	for c in range(len(mat[0])):
		count = 0 # maintains a count of how many nearest neighbors have visited the place our user hasnt
		if mat[0][c] == 0:
			for r in range(len(mat)):
				if mat[r][c] == 1:
					count += 1
		suggestions.append((count, all_locs[c]))
	suggestions.sort()
	return suggestions

#final step i.e. to sort the places based on the sentiment from news and remove the places with negative sentiment
def sort_by_sentiment(suggestions, sentiments):
	pos_scores = []
	neutral_scores = []
	recommendations = []
	for suggestion in suggestions:
		count = suggestion[0]
		loc_name = suggestion[1]
		if sentiment[loc_name] == 0:
			neutral_scores.append(loc_name) #suggestions are already sorted so no need of storing the count for neutral cases
		elif sentiment[loc_name] > 0:
			pos_scores.append((count * sentiment[loc_name], loc_name))
		else:
			continue
	pos_scores.sort()
	sorted_suggestions = pos_scores + neutral_scores
	for suggestion in sorted_suggestions:
		recommendations.append(suggestion[1])
	return recommendations


def recommend(visited_places, friends, strangers, sentiments, k):
	users_scores = [] #all friends and strangers scores go in this
	usr_visited_len = len(visited_places)
	all_locations = visited_places[:]
	for i in strangers:
		stranger_visited = strangers[i] #places visited by the stranger
		common, all_locations = count_common(visited_places, stranger_visited, all_locations) #to count the total common places visited by user and stranger
		total_places = len(stranger_visited) + usr_visited_len - common
		#score = (total common places visited by strangers and our user) / (sum of all the places visited by each of them)
		users_scores.append((float(common) / total_places, i))
	for i in friends:
		total_mutal_frnds = friends[i][0]
		total_friends = friends[i][1]
		friend_visited = friends[i][2]
		common, all_locations = count_common(visited_places, friend_visited, all_locations)
		total_places = len(friend_visited) + usr_visited_len - common
		#score = (total common places visited by strangers and our user) / (sum of all the places visited by each of them) + (#mutal_friends / #friends)
		#the second term can be thought of giving a positive weight to close friends
		current_score = (float(common) / total_places) + (float(total_mutal_frnds) / total_friends)
		users_scores.append((current_score, i))
	#sort all the users based on the score
	users_scores.sort(reverse=True)
	nearest_neighbors = users_scores[:k]
	nn_mat = [] #contains the matrix containing 0/1 for the places visited by a particular user

	#first row is our user and the rest rows are the k nearest neighbors
	nn_mat.append(create_row(visited_places, all_locations))
	#add all the other users i.e. friends and strangers to the matrix
	for usr in nearest_neighbors:
		if usr in friends:
			usr_places = friends[usr][2]
		else:
			usr_places = strangers[usr]
		nn_mat.append(create_row(usr_places, all_locations))
	#retrieve suggestions of the form (total number of users recommending to visit a place, name of the location)
	suggestions = collab_filtering(nn_mat, all_locations)
	return sort_by_sentiment(suggestions, sentiments)
"""
# Takes 3 arguments:
# 1) visted_places: a list containing the places our user has visited
# 2) friends: a dictionary where is the key is the name of the friend and value is a tuple of the form (#mutal_friends, total_friends, places visited by friend)
# 3) strangers: a dictionary where the key is the name of the stranger and the value as a list of places he has visited
# 4) sentiments: a dictionary where the key is the name of the location and the value is the sentiment score of the location, with zero score for neutral sentiment,
				 positive value for positive sentiment and negative score for negative sentiment
# 5) k: how many neighbors to consider for collaborative filtering
"""
@app.route('/', methods=['POST'])
@cross_origin()
def main():
	k = 3
	visited_places = request.json('visited_places')
	friends = request.args.json('friends')
	strangers = request.args.json('strangers')
	sentiments = request.args.json('sentiments')
	recommendations = {'ans': recommend(visited_places, friends, strangers, sentiments, k)}
	return flask.jsonify(**recommendations)


@app.route('/', methods=['GET'])
@cross_origin()
def test():
	return flask.jsonify({"status": "working"})


app.run(host='localhost')
