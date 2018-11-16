from string import ascii_uppercase
import datetime
import json
    
def isTime(input) :
    splitInput = input.split(' ')
    if len(splitInput) != 5 :
        return False
    if not(len(splitInput[0]) == 5 and splitInput[0][4] == '년') :
        return False
    if not(len(splitInput[1]) == 2 and splitInput [1][1] == '월') :
        if not(len(splitInput[1]) == 3 and splitInput [1][2] == '월') :
            return False
    if not(len(splitInput[2]) == 2 and splitInput [2][1] == '일') :
        if not(len(splitInput[2]) == 3 and splitInput [2][2] == '일'):
            return False
    if not(splitInput[3] == '오전' or splitInput[3] == '오후') :
        return False
    if splitInput[4].find(':') == -1 :
        return False
    return True  

def parseTime(strTime) :
    splitTime = strTime.split(' ')
    year = splitTime[0][:len(splitTime[0])-1]
    month = splitTime[1][:len(splitTime[1])-1]
    day = splitTime[2][:len(splitTime[2])-1]
    hour, minute = splitTime[4].split(':')
    if splitTime[3] == '오후' and hour != '12' :
        hour = str(int(hour) + 12)
    elif splitTime[3] == '오전' and hour == '12' :
        hour = str(int(hour) - 12)
    newTime = datetime.datetime.strptime('%s-%s-%s %s:%s' %(year, month, day, hour, minute), '%Y-%m-%d %H:%M')
    return newTime

def parseData(target):
    f = open(target, encoding="utf-8")
    data = []
    name = ""
    time = ""
    speech = ""
    while(True):
        line = f.readline()
        if not line:
            #update and break
            if name != '' :
                #print('speech')
                data.append({'name': name, 'time': time, 'speech': speech})
            break
        #Parse
        splitLine = line.split(',')
    
        if len(splitLine) > 1 :
            #print('speech')
            if isTime(splitLine[0]) :
                if name != '' :
                    data.append({'name': name, 'time': time, 'speech': speech})             
                #new data
                time = parseTime(splitLine[0].strip())
                main = line[line.find(',')+1:].strip()
                name = main.split(':')[0].strip()
                speech = main[splitLine[1].find(':')+1:]
            else :
                if line.endswith('\n') :
                        speech += line
                else :
                        speech += (line + '\n')
        elif len(splitLine) == 1 :
            if splitLine[0] == '\n' :
                pass
            elif isTime(splitLine[0]) :
                if name != '' :
                    data.append({'name': name, 'time': time, 'speech': speech})
                    name = ''
                    speech = ''
                else :
                    pass          
            else :
                if name != '' :
                    if line.endswith('\n') :
                        speech += line
                    else :
                        speech += (line + '\n')
        else :
            pass
    return data

#groupData {ID: conversations: timeStarted: timeEnded: size:}
def groupData(data) :
    groupedData = {}
    groupID = 0
    currTime = None
    for thisData in data :
        print(thisData)
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
    #startTime = group[0]['time']
    #endTime = group[len(group)-1]['time']
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





target = 'phonedata.txt'
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