from string import ascii_uppercase
import datetime
    

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
            if not(td.days == 0 and td.seconds <= 300) :
                groupID += 1
                groupedData[groupID] = []

        #print(groupID)
        groupedData[groupID].append(thisData)
    return groupedData

target = 'data2.txt'
data = parseData(target)
#print(data)
groupedData = groupData(data)
for key in groupedData.keys() :
    print(len(groupedData[key]))
