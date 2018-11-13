def similarDate(date1, date2) :
    '''
    two cases: 1- in same hour
    2- in different hour
    '''
    if not((date2['minute'] - date1['minute'])%60 < 7) :
        return False
    if not((date2['hour'] - date1['hour'])%24 <= 1) :
        return False
    if not((date2['day'] - date1['day'])%30 <= 1) :
        return False
    if(date1['month'] != date2['month']) :
        return False
    if(date1['day'] != date2['day']) :
        return False
    if(date1['hour'] != date2['hour']) :
        return False
    

def parseData(target):
    f = open(target, encoding="utf-8")
    data = []
    date = {'year': 0, 'month': 0, 'day': 0, 'hour': 0, 'minute': 0}
    while(True):
        line = f.readline()
        if not line:
            break
        #Parse
        if(line[0] == '-') :
            splitLine=line.split(" ")
            #print(splitLine)
            date['year'] = int(splitLine[1][:len(splitLine[1])-1])
            date['month'] = int(splitLine[2][:len(splitLine[2])-1])
            date['day'] = int(splitLine[3][:len(splitLine[3])-1])
            
        elif(line[0] == '[') :    
            splitLine = line.split(']')
            speech = line[len(splitLine[0]) + len(splitLine[1]) +2:].strip()
            name = splitLine[0].strip()[1:]
            #corner case
            if(name[0] == '[') :
                name = name[1:]
            time = splitLine[1].strip()[1:]
            [am, clock] = time.split(" ")
            [hour, minute] = map(int, clock.split(":"))
            if am =='오후' and hour != 12 :
                hour += 12
            elif am == '오전' and hour == 12 :
                hour -= 12
            #print(name + " " + time + ": " + words)
            date['hour'] = hour
            date['minute'] = minute
            newDate = {'year': date['year'], 'month' : date['month'], 'day': date['day'], 'hour' : hour, 'minute': minute}
            newData = {'name': name, 'date': newDate, 'speech': speech}
            #print(date)
            #print(newData)
            data.append(newData)
            
        #print(date)
    f.close()
    return data

def groupData(data) :
    group = 'A'
    currDate = {'year': 0, 'month': 0, 'day': 0, 'hour': 0, 'minute': 0}
    for thisData in data :
        thisData['date']


target = 'data2.txt'
data = parseData(target)
print(data)
groupData(data)
