function doPost(e) {
  identificar(JSON.parse(e.postData.contents));
}

function identificar(e) {
  if (e === undefined || e.triggerUid !== undefined) {
    console.log(e);
    let lastRunTime = databaseOperation('getLastRunTime');
    console.log(lastRunTime);
    let currentTime = Date.parse(new Date());
    let timeDelta = currentTime - lastRunTime;
    console.log(timeDelta);
    if (timeDelta >= 900000) { // 15 minutes
      let message = {
        method: 'sendMessage',
        chat_id: 'xxx', // production
      };
      let messageToSend = getData('inflist');

      if (messageToSend.responses.length !== 0) {
        for (let thing of messageToSend.responses)
          sendMessage(message, thing.toString());
        Logger.log(e.minute, messageToSend.responses);
        if (e !== undefined) databaseOperation('setLastRunTime', currentTime);
      } else {
        return;
        sendMessage(message, 'none');
      }
    }
  } else {
    let message = {
      method: 'sendMessage',
      chat_id: e.message.chat.id.toString(),
    };
    let messageToSend = [];
    if (e.message.text.indexOf('/getserverlist') === 0) {
      messageToSend = getData('serverlist');
    } else if (e.message.text.indexOf('/getonlineplayers') === 0) {
      messageToSend = getData('playerlist');
    } else if (e.message.text.indexOf('/getnumberofplayers') === 0) {
      messageToSend = getData('playernumber');
    }
    if (messageToSend.responses.length !== 0) {
      for (let thing of messageToSend.responses) sendMessage(message, thing);
    }
    sendMessage(
      message,
      messageToSend.totalNumOfPlayers + ' players in total.'
    );
  }
}

function sendMessage(e, s) {
  e.text = s;
  let data = {
    method: 'post',
    payload: e,
  };
  UrlFetchApp.fetch(
    'https://api.telegram.org/botxxx/',
    data
  );
}

function databaseOperation(s, t) {
  let firebaseUrl = 'https://xxx.firebaseio.com/';
  let secret = 'xxx';
  let base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);

  if (s === 'setLastRunTime') setLastRunTime(base, t);
  else if (s === 'getLastRunTime') return getLastRunTime(base);
}

function setLastRunTime(base, t) {
  base.setData('lastRunTime', t);
}

function getLastRunTime(base) {
  return base.getData('lastRunTime');
}

function getData(kind) {
  let serverlist = JSON.parse(
    UrlFetchApp.fetch('https://api.status.tw/2.0/server/list/')
  ).servers;

  let responses = [];
  let totalNumOfPlayers = 0;
  for (let server of serverlist) {
    if (server.num_players > 0 && JSON.stringify(server.players) !== '{}') {
      if (
        server.country === 'China'
      ) {
        let playerlist = server.players;
        totalNumOfPlayers += server.num_players;
        let tmp = '|';
        for (let player of playerlist) {
          tmp += player.name + '|';
        }
        let response = '';
        if (kind === 'serverlist') {
          response = [
            server.name,
            server.map,
            server.server_ip + ':' + server.server_port,
            tmp,
          ].join('\n');
        } else if (kind === 'playerlist') {
          response = tmp;
        } else if (kind === 'inflist') {
          if (
            server.num_players >= 3 &&
            (server.gamemode.indexOf('inf') >= 0 ||
              server.gamemode.indexOf('INF') >= 0 ||
              server.gamemode.indexOf('fng') >= 0 ||
              server.gamemode.indexOf('FNG') >= 0)
          ) {
            response =
              server.num_players +
              ' player(s) at ' +
              server.server_ip +
              ':' +
              server.server_port +
              ' playing ' +
              server.gamemode +
              ' .';
            if (server.num_players < 2)
              console.log(
                server.server_ip,
                server.server_port,
                server.num_players,
                server.players
              );
          }
        }
        if (response !== '') responses.push(response);
      }
    }
  }
  console.log('responses:', responses);
  if (kind === 'playerlist') responses = [responses.join('\n')];
  if (kind === 'playernumber') responses = [];
  let messageToSend = {
    responses: responses,
    totalNumOfPlayers: totalNumOfPlayers,
  };
  return messageToSend;
}
