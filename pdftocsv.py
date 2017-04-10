#Edgar Ruiz
#PDF to CSV 
#Reads in a PDF in plain text format and creates a CSV file with proper formatting

import csv

weekdays = ['Monday,', 'Tuesday,', 'Wednesday,', 'Thursday,', 'Friday,', 'Saturday,', 'Sunday,']
months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

filename = raw_input('Read from this file (.txt): ')
readfile = filename + '.txt'
csvname = filename + '.csv'
f = open(readfile, 'r')
with open(csvname, 'wb') as csvfile:
	ticketimporter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	seatL = ''
	secR = ''
	secS = ''
	eventDate = ''
	for line in f:
		splitLine = line.split()
		for i, word in enumerate(splitLine):
			if word == 'section' or word == 'section:':
				secL = 'Section ' + splitLine[i+1]
			elif word == 'row' or word == 'row:':
				secR = 'Row ' + splitLine[i+1]
			elif word == 'seat' or word == 'seat:':
				secS = 'Seat ' + splitLine[i+1]
			elif word in weekdays:
				month = str(months.index(splitLine[i+1]) + 1)
				day = splitLine[i+2][:2]
				year = splitLine[i+3][2:]
				eventDate = month + '/' + day + '/' + year

	ticketimporter.writerow([eventDate, secL, secR, secS])
csvfile.close()
f.close()
print(filename + '.csv has been created')
