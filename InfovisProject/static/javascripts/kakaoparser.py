from string import ascii_uppercase
import datetime
import dateutil.parser
import json
from krwordrank.hangle import normalize
from krwordrank.word import KRWordRank



target = 'thirteen.txt'

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
                if len(splitLine[1].split(':')) == 1: continue
                if name != '' and name != '삭제된 메시지입니다.':
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
        #print(thisData)
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





'''
def getWordRanks(group) :
    texts = []
    for data in group :
        texts.append(data.get('speech'))
    texts = [normalize(text) for text in texts]
    wordrank_extractor = KRWordRank(
        min_count = 3, # 단어의 최소 출현 빈도수 (그래프 생성 시)
        max_length = 10, # 단어의 최대 길이
        verbose = True
    )
    beta = 0.85    # PageRank의 decaying factor beta
    max_iter = 10
    keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)
    return keywords
'''
def getParticipants(group) :

    items = {}
    for data in group :
        name = data['name']
        if name not in items.keys() :
            items[name] =  1
        else :
            items[name] += 1
    participants = list(items.items())
    participants.sort(reverse = True,  key = lambda x: x[1])
    participants = list(map(lambda x: x[0], participants))
    if len(participants) > 7 :
        participants = participants[: 7]
        participants.append('기타')
    return participants


def getSpeechCounts(participants, group) :
    time = group[0]['time']
    endTime = group[len(group)-1]['time']
    speechCounts = []
    i = 0
    while endTime >= time :
        etcCount = 0
        speechCounts.append({'time': str(time)[:-3]})
        for data in group :
            name =  data['name']
            if time == data['time'] :
                if name in participants : 
                    if name in speechCounts[i].keys() : 
                        speechCounts[i][name] += 1
                    else : 
                        speechCounts[i][name] = 1
                else: etcCount += 1
        speechCounts[i]['기타'] = etcCount
        time += datetime.timedelta(minutes=1)
        i += 1
    return speechCounts

    

filterKeys = {
  "ㅋㅋ": 99.69220528971809,
  "근데": 54.60450514378591,
  "그냥": 32.65633437448566,
  "아니": 25.28238892408634,
  "저거": 17.80109909080065,
  "나도": 17.263457950094143,
  "그거": 16.036627217060996,
  "내가": 15.58882776887043,
  "ㅎㅎ": 15.3819995403844,
  "지금": 14.139232852087664,
  "그럼": 13.339683438551862,
  "나는": 12.41898697510642,
  "이거": 12.381467760697259,
  "사람": 12.28719633267103,
  "ㅇㅇ": 11.737095186784384,
  "아님": 11.47326280625355,
  "많이": 11.439905764899766,
  "우리": 11.211279899589123,
  "선기": 10.90052814255637,
  "같은": 10.32046530773739,
  "너무": 10.0187396346243,
  "하는": 9.808201145189901,
  "이제": 9.80573278447956,
  "진짜": 9.506630528149154,
  "일단": 9.427593837023133,
  "삭제된": 9.360406887574811,
}.keys()





def init() :
    parsedData = parseData(target)
    #print(data)
    parseResult = []
    texts = []
    groupedData = groupData(parsedData)
    for key in groupedData.keys() :
        if(len(groupedData[key]) >= 100) :
            # TODO: Have to add start time/ end time info to each data
            '''
            wordRanks = getWordRanks(groupedData[key])
            for filkey in filterKeys :
                if filkey in wordRanks.keys() :
                    del wordRanks[filkey]
            '''
            participants = getParticipants(groupedData[key])
            speechCounts = getSpeechCounts(participants, groupedData[key])
            parseResult.append({'participants': participants, 'speechCounts': speechCounts})
            for data in groupedData[key] :
                texts.append(data.get('speech'))
    texts = [normalize(text) for text in texts]
    wordrank_extractor = KRWordRank(
        min_count = 3, # 단어의 최소 출현 빈도수 (그래프 생성 시)
        max_length = 10, # 단어의 최대 길이
        verbose = True
    )
    beta = 0.85    # PageRank의 decaying factor beta
    max_iter = 10
    keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)

    for item in parsedData :
        item['time'] = str(item['time'])
    pr = open('whole.json', 'w', encoding = 'utf-8')
    pr.write(json.dumps(keywords, indent=2,  ensure_ascii=False))
    pr.close()
    pr = open('data.json', 'w', encoding = 'utf-8')
    pr.write(json.dumps(parsedData, indent=2,  ensure_ascii=False))
    pr.close()
    pr = open('parseResult.json', 'w', encoding = 'utf-8')
    pr.write(json.dumps([participants, parseResult], indent=2,  ensure_ascii=False)), 
    pr.close()

    return parsedData

parsedData = init()

def getWordRanks(startTimeISO, endTimeISO, parsedData) :
    selectedData = []
    startTimeStr = dateutil.parser.parse(startTimeISO[:-17]).strftime("%Y-%m-%d %H:%M:%S")
    endTimeStr = dateutil.parser.parse(endTimeISO[:-17]).strftime("%Y-%m-%d %H:%M:%S")
    startTime = datetime.datetime.strptime(startTimeStr, '%Y-%m-%d %H:%M:%S')
    endTime = datetime.datetime.strptime(endTimeStr, '%Y-%m-%d %H:%M:%S')
   
    for data in parsedData :
        time = datetime.datetime.strptime(data['time'], '%Y-%m-%d %H:%M:%S')    
        if time >= startTime and time <= endTime :
            selectedData.append(data)
    print(selectedData)

    texts = []
    for data in selectedData :
        texts.append(data.get('speech'))
    texts = [normalize(text) for text in texts]
    wordrank_extractor = KRWordRank(
        min_count = 3, # 단어의 최소 출현 빈도수 (그래프 생성 시)
        max_length = 10, # 단어의 최대 길이
        verbose = True
    )
    beta = 0.85    # PageRank의 decaying factor beta
    max_iter = 10
    keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)
    return keywords

keywords = getWordRanks( 'Thu Aug 02 2018 11:43:00 GMT+0900 (한국 표준시)', 'Thu Aug 02 2018 13:03:00 GMT+0900 (한국 표준시)', parsedData)
print(keywords)

