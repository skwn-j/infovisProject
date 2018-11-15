from string import ascii_uppercase
import datetime
import json
    

def parseData(target):
    f = open(target, encoding="utf-8")
    data = []
    year = ""
    month = ""
    day = ""
    while(True):
        line = f.readline()
        if not line:
            break
        #Parse
        #--------------- Y M D ---------------
        #----- year month day dayOfWeek ---------
        if(line[0] == '-') :
            splitLine=line.split(" ")
            #print(splitLine)
            year = splitLine[1][:len(splitLine[1])-1]
            month = splitLine[2][:len(splitLine[2])-1]
            day = splitLine[3][:len(splitLine[3])-1]
        #[name] [time] speech
        elif(line[0] == '[') :    
            splitLine = line.split(']')
            speech = line[len(splitLine[0]) + len(splitLine[1]) +2:].strip()
            name = splitLine[0].strip()[1:]
            #corner case
            if(name[0] == '[') :
                name = name[1:]
            time = splitLine[1].strip()[1:]
            [am, clock] = time.split(" ")
            [hour, minute] = clock.split(":")
            if am =='오후' and hour != '12' :
                hour = str(int(hour) + 12)
            elif am == '오전' and hour == '12' :
                hour = str(int(hour) - 12)
            newTime = datetime.datetime.strptime('%s-%s-%s %s:%s' %(year, month, day, hour, minute), '%Y-%m-%d %H:%M')
            newData = {'name': name, 'time': newTime, 'speech': speech}
            data.append(newData)
    f.close()
    return data
#groupData {ID: conversations: timeStarted: timeEnded: size:}
def groupData(data) :
    groupedData = {}
    groupID = 0
    currTime = None
    for thisData in data :
        if currTime is None :
            currTime = thisData['time']
            groupedData[groupID] = []
        else :
            td = thisData['time'] - currTime
            currTime = thisData['time']
            #print(td)
            if not(td.days == 0 and td.seconds <= 600) :
                groupID += 1
                groupedData[groupID] = []

        #print(groupID)
        groupedData[groupID].append(thisData)
    return groupedData

def getNames(group) :
    names = {}
    for obj in group :
        if obj['name'] in names :
            names[obj['name']] += 1
        else :
            names[obj['name']] = 1
    return names

def getTimeDifferences(group) :
    startTime = group[0]['time']
    endTime = group[len(group)-1]['time']
    recentTimes = {}
    speechCounts = {}
    timeDifferences = {}
    for data in group :
        name = data['name']
        if not name in timeDifferences :
            timeDifferences[name] = {}
        if not name in speechCounts :
            speechCounts[name] = 1

        time = data['time']
        recentTimes[name] = time
        #To get speech count
        speechCounts[name] += 1
        #to get sum of time difference 
        for other in recentTimes.keys() :
            if other != name :
                if other in  timeDifferences[name] :
                    timeDifferences[name][other] += time - recentTimes[other]
                else :
                     timeDifferences[name][other] = time - recentTimes[other]
            #print(timeDifferences[name])
    for name in speechCounts.keys() :
        for other in timeDifferences[name].keys() :
            timeDifferences[name][other] = str(timeDifferences[name][other]/speechCounts[name])
        #print(timeDifferences[name])
    return speechCounts, timeDifferences





target = 'data.txt'
data = parseData(target)
#print(data)
groupedData = groupData(data)
for key in groupedData.keys() :
    #print(len(groupedData[key]))
    if(len(groupedData[key]) >= 7) :
        print(str(key) + ": ")
        speechCounts, timeDifferences = getTimeDifferences(groupedData[key])
        print(timeDifferences)

sc = open('speechCounts.json', 'w', encoding = 'utf-8')
sc.write(json.dumps(speechCounts, indent=2))
sc.close()
td = open('timeDifferences.json', 'w', encoding = 'utf-8')
td.write(json.dumps(timeDifferences, indent=2))
td.close()
