let boturl =
  'https://api.telegram.org/botxxx/';
let firebaseUrl = 'https://xxx.firebaseio.com/';
let secret = 'xxx';
let apiurl = 'https://api.status.tw/2.0/server/list/';
let test_chat_id = 'xxx';
let chat_id = 'xxx';

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

in the getserverlist commands, you can use arguments:
1.name= ,2.mode= ,3.-a (show empty servers) ,4.-i (ignore specific players)
example:/getserverlist name=chn2 mode=ddr -a -i`,
        ],
      };
    } else if (e.message.text.indexOf('/getserverlist') === 0) {
      messageToSend = getData('serverlist', e.message.text.substring(15));
    } else if (e.message.text.indexOf('/getonlineplayers') === 0) {
      messageToSend = getData('playerlist', e.message.text.substring(18));
    } else if (e.message.text.indexOf('/getnumberofplayers') === 0) {
      messageToSend = getData('playernumber', e.message.text.substring(20));
    } else if (e.message.text.indexOf('/whereis') === 0) {
      messageToSend = querPlayer(e.message.text.substring(9));
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

function getAllServer() {
  return JSON.parse(UrlFetchApp.fetch(apiurl)).servers;
}

function getData(kind, commands) {
  let serverlist = getAllServer();
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
    if (JSON.stringify(server.players.length) > 0 || showallserver) {
      if (server.country === 'China') {
        if (
          server.name.toLowerCase().indexOf(namefilter.toLowerCase()) >= 0 &&
          server.gamemode.toLowerCase().indexOf(modefilter.toLowerCase()) >= 0
        ) {
          totalNumOfPlayers += server.players.length;
          totalNumOfServers += 1;
        }
        let response = '';
        let tmp = '|';
        for (let player of server.players) {
          tmp += player.name + '|';
        }
        if (kind === 'serverlist') {
          if (showplayers) {
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

function querPlayer(playername) {
  let serverlist = getAllServer();
  let responses = [];
  for (let server of serverlist) {
    for (let player of server.players)
      if (player.name === playername) {
        let tmp = '|';
        for (let player of server.players) {
          if (player.name !== playername) tmp += player.name + '|';
        }
        let response = [
          server.name,
          server.server_ip + ':' + server.server_port,
          server.gamemode,
          'with ' + tmp,
        ].join('\n');
        responses.push(response);
        break;
      }
  }
  if (responses.length === 0) responses = ['Not noline.'];
  if (playername === '') responses = ['Who are you going to query?'];
  return { responses: responses };
}
