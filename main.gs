let boturl =
let firebaseUrl =
let secret =
let apiurl = 'https://api.status.tw/2.0/server/list/';
let test_chat_id =
let chat_id =

function doPost(e) {
  identificarTG(JSON.parse(e.postData.contents));
}

function identificarTG(e) {
  if (e === undefined || e.triggerUid !== undefined) {
    // console.log(e);
    // let lastRunTime = databaseOperation('getLastRunTime');
    // console.log(lastRunTime);
    // let currentTime = Date.parse(new Date());
    // let timeDelta = currentTime - lastRunTime;
    // console.log(timeDelta);
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
  } else {
    let message = {
      method: 'sendMessage',
      chat_id: e.message.chat.id.toString(),
    };
    let messageToSend = [];
    if (e.message.text.indexOf('/help') === 0) {
      messageToSend = {
        responses: [
          `help - Get help
getserverlist - Get current servers with online players
getonlineplayers - Get current online players
getnumberofplayers - Get the number of online players
whereis - Query which server is someone in

in the get commands, you can use arguments:
1.name= ,2.mode= ,3.-a (show empty servers) ,4.-i (ignore specific players)`,
        ],
      };
    } else if (e.message.text.indexOf('/getserverlist') === 0) {
      messageToSend = getData('serverlist', e.message.text.substring(15));
    } else if (e.message.text.indexOf('/getonlineplayers') === 0) {
      messageToSend = getData('playerlist', e.message.text.substring(18));
    } else if (e.message.text.indexOf('/getnumberofplayers') === 0) {
      messageToSend = getData('playernumber', e.message.text.substring(20));
    } else if (e.message.text.indexOf('/whereis') === 0) {
      messageToSend = getData('whereis', e.message.text.substring(9));
    }
    if (messageToSend.responses.length !== 0) {
      for (let thing of messageToSend.responses) sendMessage(message, thing);
    }

    if (
      e.message.text.indexOf('/help') !== 0 &&
      e.message.text.indexOf('/whereis') !== 0
    )
      sendMessage(
        message,
        messageToSend.totalNumOfPlayers +
          ' players in ' +
          messageToSend.totalNumOfServers +
          ' servers.'
      );
  }
}

function sendMessage(e, s) {
  e.text = s;
  let data = {
    method: 'post',
    payload: e,
  };
  UrlFetchApp.fetch(boturl, data);
}

function databaseOperation(s, t) {
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

function getData(kind, commands) {
  let serverlist = JSON.parse(UrlFetchApp.fetch(apiurl)).servers;
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
    if (
      (server.num_players > 0 && JSON.stringify(server.players.length) > 0) ||
      showallserver
    ) {
      if (server.country === 'China') {
        if (
          server.name.toLowerCase().indexOf(namefilter.toLowerCase()) >= 0 &&
          server.gamemode.toLowerCase().indexOf(modefilter.toLowerCase()) >= 0
        ) {
          totalNumOfPlayers += server.players.length;
          totalNumOfServers += 1;
        }
        let response = '';
        if (kind === 'serverlist') {
          if (showplayers) {
            let tmp = '|';
            for (let player of server.players) {
              tmp += player.name + '|';
            }
            response = [
              server.name,
              server.map + '    ' + server.server_ip + ':' + server.server_port,
              tmp,
            ].join('\n');
          } else
            response = [
              server.name,
              server.map +
                '    ' +
                server.server_ip +
                ':' +
                server.server_port +
                '    ' +
                server.players.length +
                ' players',
            ].join('\n');
        } else if (kind === 'playerlist') {
          response = tmp;
        } else if (kind === 'pvplist') {
          if (
            server.num_players >= 5 &&
            (server.gamemode.toLowerCase().indexOf('inf') >= 0 ||
              server.gamemode.toLowerCase().indexOf('fng') >= 0)
          ) {
            response =
              server.num_players +
              ' players at ' +
              server.server_ip +
              ':' +
              server.server_port +
              ' playing ' +
              server.gamemode +
              ' .';
          }
        }
        if (response !== '')
          if (
            server.name.toLowerCase().indexOf(namefilter.toLowerCase()) >= 0 &&
            server.gamemode.toLowerCase().indexOf(modefilter.toLowerCase()) >= 0
          )
            responses.push(response);
      }
    }
  }
  console.log('responses:', responses);
  if (kind === 'playerlist') responses = [responses.join('\n')];
  if (kind === 'playernumber') responses = [];
  let messageToSend = {
    responses: responses,
    totalNumOfPlayers: totalNumOfPlayers,
    totalNumOfServers: totalNumOfServers,
  };
  return messageToSend;
}
