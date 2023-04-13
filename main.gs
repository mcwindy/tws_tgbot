let botname = 'mcwindytest1bot';
let boturl =
  'https://api.telegram.org/botxxx:xxx/';
let firebaseUrl = 'https://xxx.firebaseio.com/';
let secret = 'xxx';
let apiurl = 'https://api.status.tw/server/list/';
let weburl = 'https://ddnet.tw/players/';
let test_chat_id = 'xxx';
let chat_id = 'xxx';
let test_chat_id_1 = 'xxx';

let getServerListFailed = false;
let serverlist = [];
try {
  // var serverlist = JSON.parse(UrlFetchApp.fetch(apiurl)).servers;
  serverlist = JSON.parse(UrlFetchApp.fetch(apiurl));
} catch {
  getServerListFailed = true;
}

function doGet() {
  doPost(e);
}

function doPost(e) {
  identificarTG(JSON.parse(e.postData.contents));
  //identificarTG(json1);
}

function identificarTG(e) {
  if (e === undefined || e.triggerUid !== undefined) {
    //// pvplist
    // let lastRunTime = databaseOperation('getLastRunTime');
    // let currentTime = Date.parse(new Date());
    // let timeDelta = currentTime - lastRunTime;
    // if (timeDelta >= 900000) {
    //   let message = {
    //     method: 'sendMessage',
    //     // chat_id: test_chat_id,
    //     chat_id: chat_id,
    //   };
    //   let messageToSend = getData('pvplist','');
    //
    //   if (messageToSend.responses.length !== 0) {
    //     for (let thing of messageToSend.responses)
    //       sendMessage(message, thing.toString());
    //     Logger.log(e.minute, messageToSend.responses);
    //     if (e !== undefined) databaseOperation('setLastRunTime', currentTime);
    //   } else {
    //     return;
    //   }
    // }
    ///////////////////////////////////////////
    //// player count
    // let playercount = playerCount((isforrecord = true));
    // databaseOperation('setPlayerCount', playercount);
  } else {
    e.message.text = e.message.text.replace('@' + botname, '');
    let messageToSend = [];
    let splitkind = false;
    let needDelete = false;
    let chat_id = e.message.chat.id.toString();
    let sentMessageIds = [];

    if (getServerListFailed) {
      sendMessage(chat_id, 'Server status.tw down.');
      return;
    }

    if (e.message.text.indexOf('/help') === 0) {
      messageToSend = {
        responses: [
          `help - Get help
getserverlist - Use carefully! Get current servers with online players
getonlineplayers - Get current online players
getnumberofplayers - Get the number of online players
find - Query which server is someone in
in the getserverlist command, you can use arguments:
1.name= ,2.mode= ,3.-a (show empty servers) ,4.-i (ignore specific players)
example:/getserverlist name=chn2 mode=ddr -a -i
in the getnumberofplayers command, you can use argument:
1.-s to get the number of players in different modes.`,
        ],
      };
    } else if (e.message.text.indexOf('/getserverlist') === 0) {
      needDelete = true;
      messageToSend = getData('serverlist', e.message.text.substring(15));
    } else if (e.message.text.indexOf('/getonlineplayers') === 0) {
      needDelete = true;
      messageToSend = getData('playerlist', e.message.text.substring(18));
      messageToSend.responses = [messageToSend.responses.join('\n')];
    } else if (e.message.text.indexOf('/getnumberofplayers') === 0) {
      let commands = e.message.text.substring(20);
      for (let command of commands.split(' '))
        if (command.indexOf('-s') === 0) splitkind = true;
      messageToSend = getData('playernumber', e.message.text.substring(20));
      if (splitkind) messageToSend.responses = playerCount();
      else messageToSend.responses = [];
    } else if (e.message.text.indexOf('/find') === 0) {
      messageToSend = queryPlayer(e.message.text.substring(6));
    } else if (e.message.text.indexOf('/iwannaplay') === 0) {
      // powerfulplayers_v1 = [
      //   'Eki', 'SiuFu', '18m/s', 'Dan_cao', 'Night_L', 'Alice30',
      //   'mid', 'KuNao', 'rhino', 'Clover', 'bit', 'umbrella',
      //   'yyq', 'Toffee', 'lx07:3', 'chenguo',
      // ];
      // powerfulplayers_v2 = [
      //   'Eki', 'KuNao', 'SiuFu', 'Night_L', '顾慌', 'wink', 'rhino', '歪比巴卜', '幻想', '满月',
      //   'Nurxil', 'mememe', '18m/s', 'maoni', 'umbrella', 'lock', 'zff', '_XIAOXIAO_', '123dd', 'zattttt',
      //   'KuNao', 'Nurxil', '被强煎的蛋', '黑化窜天猴', 'Broniya', '猫猫', '我就蹭蹭', 'wink', '_XIAOXIAO_', 'resas',
      //   '暖阳', '青迎月', '清欢渡', 'Fěng', '满月', '阿静.', '小涵', '轻音乐', 'mememe', '歪比巴卜',
      // ];
      // powerfulplayers = [
      //   'KuNao', 'Night_L', '顾慌', '歪比巴卜', '猫猫', '美味', 'Nurxil', 'wink', '水银灯', '幻想',
      //   '绝对白给', 'mememe', 'rhino', 'zattttt', '黑化窜天猴', 'Eki', '被强煎的蛋', 'lock', 'zff', 'maoni',
      //   '玉子', '青迎月', '我就蹭蹭', '杨帆', '躺好鸭', 'SiuFu', '若非她', '救援-萌新', '天然二', '元帅',
      //   '暖阳', 'peachyx', '_XIAOXIAO_', 'XX', '白墨', '乌鸦坐飞机', '可鲁克吖', '娃哈哈', 'By', '踢',
      // ];
      let responses = [];
      for (let playername of powerfulplayers)
        if (queryPlayer(playername).online) responses.push(playername);
      responses = [...new Set(responses)];
      messageToSend = {
        responses: ['Go and play with: ' + responses.join(',')],
      };
    } else if (e.message.text.indexOf('/searchmap') === 0) {
      if (e.message.text.split(' ').length < 3) {
        messageToSend = {
          responses: [
            'Usage: /searchmap <Mode> <Players>, for example: /searchmap moderate mcwindy With',
          ],
        };
      } else {
        gameType = e.message.text.split(' ')[1];
        players = e.message.text.split(' ').slice(2);
        messageToSend = searchMap(gameType, players);
      }
    }

    if (messageToSend.responses.length !== 0) {
      for (let thing of messageToSend.responses.slice(-10))
        sendMessage(chat_id, thing); // TODO delete slice(-10)
    }

    if (
      e.message.text.indexOf('/help') !== 0 &&
      e.message.text.indexOf('/find') !== 0 &&
      // && splitkind === false
      e.message.text.indexOf('/iwannaplay') !== 0 &&
      e.message.text.indexOf('/searchmap') !== 0
    )
      sendMessage(
        chat_id,
        messageToSend.totalNumOfPlayers +
          ' players in ' +
          messageToSend.totalNumOfServers +
          ' servers.'
      );

    // TODO delete message if needed, but not work
    if (needDelete && sentMessageIds.length !== 0) {
      let trigger = ScriptApp.newTrigger('handleTriggerArguments')
        .timeBased()
        .after(45 * 1000)
        .create();
      setupTriggerArguments(trigger, chat_id, sentMessageIds, false);
    }
  }
}

function setupTriggerArguments(trigger, chat_id, sentMessageIds, recurring) {
  // let RECURRING_KEY = 'recurring';
  let ARGUMENTS_KEY_1 = 'chat_id';
  let ARGUMENTS_KEY_2 = 'sentMessageIds';
  let triggerUid = trigger.getUniqueId();
  let triggerData = {};
  // triggerData[RECURRING_KEY] = recurring;
  triggerData[ARGUMENTS_KEY_1] = chat_id;
  triggerData[ARGUMENTS_KEY_2] = sentMessageIds;

  PropertiesService.getScriptProperties().setProperty(
    triggerUid,
    JSON.stringify(triggerData)
  );
}

function handleTriggered(triggerUid) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let triggerData = JSON.parse(scriptProperties.getProperty(triggerUid));

  // if (!triggerData[RECURRING_KEY]) {
  //   // deleteTriggerByUid(triggerUid);
  // }

  let ARGUMENTS_KEY_1 = 'chat_id';
  let ARGUMENTS_KEY_2 = 'sentMessageIds';
  return {
    ARGUMENTS_KEY_1: triggerData[ARGUMENTS_KEY_1],
    ARGUMENTS_KEY_2: triggerData[ARGUMENTS_KEY_2],
  };
}

function handleTriggerArguments(event) {
  let functionArguments = handleTriggered(event.triggerUid);
  sendMessage(test_chat_id_1, '!');

  let chat_id = functionArguments.chat_id;
  let sentMessageIds = functionArguments.sentMessageIds;

  sendMessage(chat_id, sentMessageIds.stringify()); //TODO
  sendMessage(chat_id, chat_id.stringify()); //TODO
  console.log(sentMessageIds);
  for (let messageId of sentMessageIds) deleteMessage(chat_id, messageId);
}

function sendMessage(chat_id, text) {
  UrlFetchApp.fetch(boturl, {
    method: 'post',
    payload: { method: 'sendMessage', chat_id: chat_id, text: text },
  });
}

function deleteMessage(chat_id, message_id) {
  UrlFetchApp.fetch(boturl, {
    method: 'post',
    payload: {
      method: 'deleteMessage',
      chat_id: chat_id,
      message_id: message_id,
    },
  });
}

function databaseOperation(s, t) {
  let base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);

  if (s === 'setLastRunTime') setLastRunTime(base, t);
  else if (s === 'getLastRunTime') return getLastRunTime(base);
  else if (s === 'setPlayerCount') setPlayerCount(base, t);
}

function setLastRunTime(base, t) {
  base.setData('lastRunTime', t);
}

function getLastRunTime(base) {
  return base.getData('lastRunTime');
}

// TODO
function setPlayerCount(base, t) {
  for (let mode in t) base.setData(mode, t[mode]); // not setData TODO
}

function getData(kind, commands) {
  let namefilter = '';
  let modefilter = '';
  let showallserver = 0;
  let showplayers = 1;
  for (let command of commands.split(' ')) {
    if (command.indexOf('name=') === 0) namefilter = command.substring(5);
    if (command.indexOf('mode=') === 0) modefilter = command.substring(5);
    if (command.indexOf('-a') === 0) showallserver = 1;
    if (command.indexOf('-i') === 0) showplayers = 0;
  }

  let responses = [];
  let totalNumOfPlayers = 0;
  let totalNumOfServers = 0;
  for (let server of serverlist) {
    if (JSON.stringify(server.clients.length) > 0 || showallserver) {
      if (server.name.includes('CHN') || server.name.includes('中国') || server.name.includes('社区')) {
        if (
          server.name.toLowerCase().indexOf(namefilter.toLowerCase()) >= 0 &&
          server.gametype.toLowerCase().indexOf(modefilter.toLowerCase()) >= 0
        ) {
          totalNumOfPlayers += server.clients.length;
          totalNumOfServers += 1;
        }
        let response = '';
        let tmp = '';
        for (let player of server.clients) {
          tmp += player.name + ',';
        }
        tmp = tmp.slice(0, -1);
        if (kind === 'serverlist') {
          if (showplayers) {
            response = [
              server.name,
              server.map + '    ' + server.ip + ':' + server.port,
              tmp,
            ].join('\n');
          } else
            response = [
              server.name,
              server.map +
                '    ' +
                server.ip +
                ':' +
                server.port +
                '    ' +
                server.clients.length +
                ' players',
            ].join('\n');
        } else if (kind === 'playerlist') {
          response = tmp;
        } else if (kind === 'playernumber') {
        } else if (kind === 'pvplist') {
          if (
            server.num_players >= 5 &&
            (server.gametype.toLowerCase().indexOf('inf') >= 0 ||
              server.gametype.toLowerCase().indexOf('fng') >= 0)
          ) {
            response =
              server.num_clients +
              ' players at ' +
              server.ip +
              ':' +
              server.port +
              ' playing ' +
              server.gametype +
              ' .';
          }
        }
        if (response !== '')
          if (
            server.name.toLowerCase().indexOf(namefilter.toLowerCase()) >= 0 &&
            server.gametype.toLowerCase().indexOf(modefilter.toLowerCase()) >= 0
          )
            responses.push(response);
      }
    }
  }
  return {
    responses: responses,
    totalNumOfPlayers: totalNumOfPlayers,
    totalNumOfServers: totalNumOfServers,
  };
}

function queryPlayer(playername) {
  let responses = [];
  let isonline = true;
  for (let server of serverlist) {
    for (let player of server.clients)
      if (player.name === playername) {
        let tmp = '';
        for (let player of server.clients) {
          if (player.name !== playername) tmp += player.name + ',';
        }
        tmp = tmp.slice(0, -1);
        if (tmp === '') tmp = 'alone';
        else tmp = 'others:' + tmp;
        let response = [
          server.name,
          server.ip + ':' + server.port,
          server.gametype + ':' + server.map,
          tmp,
        ].join('\n');
        responses.push(response);
        break;
      }
  }
  if (responses.length === 0) {
    isonline = false;
    responses = ['Not noline.'];
  }
  if (playername === '') {
    isonline = false;
    responses = ['Who are you going to query?'];
  }
  return { online: isonline, responses: responses };
}

function searchMap(gameType, players) {
  let responses = [];
  for (player of players) {
    let playerMapInfo = JSON.parse(UrlFetchApp.fetch(weburl + player))
      .getElementById(gameType)
      .getElementsByClassName('unfinishedmaps');
    if (playerMapInfo.length === 0) {
      responses.push('No unfinished maps for ' + player + '.');
      return { responses: responses };
    } else {
      playerMapInfo[0].querySelector('#unfinTable1-Moderate > tbody');
      playerMapInfo[0].querySelector('#unfinTable2-Moderate > tbody');
      playerMapInfo[0].querySelector('#unfinTable3-Moderate > tbody'); // TODO
    }
  }
}

function playerCount(isforrecord = false) {
  modes = [
    'ball',
    'bomb',
    'ctf',
    'ddr',
    'dm',
    'fng',
    'hunter',
    'inf',
    'others',
  ];
  playercount = {};
  for (let mode of modes) playercount[mode] = 0;
  for (let server of serverlist)
    if (server.name.includes('CHN') || server.name.includes('中国') || server.name.includes('社区')) {
      let counted = false;
      for (let mode in playercount)
        if (server.gametype.toLowerCase().indexOf(mode) >= 0) {
          counted = true;
          playercount[mode] += server.clients.length;
          break;
        }
      if (!counted) playercount.others += server.clients.length;
    }
  if (isforrecord) {
    return playercount;
  } else {
    let responses = [];
    for (let mode in playercount)
      if (playercount[mode] !== 0)
        responses.push(mode + ' : ' + playercount[mode] + ' players.');
    return [responses.join('\n')];
  }
}
