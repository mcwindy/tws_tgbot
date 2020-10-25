let botname = 'mcwindytest1bot';
let boturl =
  'https://api.telegram.org/botxxx/';
let firebaseUrl = 'https://xxx.firebaseio.com/';
let secret = 'xxx';
let apiurl = 'https://api.status.tw/2.0/server/list/';
let test_chat_id = 'xxx';
let chat_id = 'xxx';

let serverlist = JSON.parse(UrlFetchApp.fetch(apiurl)).servers;

function doPost(e) {
  identificarTG(JSON.parse(e.postData.contents));
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
    let message = {
      method: 'sendMessage',
      chat_id: e.message.chat.id.toString(),
    };
    let messageToSend = [];
    let splitkind = false;
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
      messageToSend = getData('serverlist', e.message.text.substring(15));
    } else if (e.message.text.indexOf('/getonlineplayers') === 0) {
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
    } else if (e.message.text.indexOf('/iwannaplay' === 0)) {
      powerfulplayers = ['Eki', 'Rice', 'Kunao', '18m/s', 'Texas.C', ''];
      let responses = [];
      for (let playername of powerfulplayers)
        if (queryPlayer(playername).online) responses.push(playername);
      messageToSend = {
        responses: ['Go and play with: ' + responses.join(',')],
      };
    }
    if (messageToSend.responses.length !== 0) {
      for (let thing of messageToSend.responses) sendMessage(message, thing);
    }

    if (
      e.message.text.indexOf('/help') !== 0 &&
      e.message.text.indexOf('/find') !== 0 &&
      // && splitkind === false
      e.message.text.indexOf('/iwannaplay') !== 0
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
        let tmp = '';
        for (let player of server.players) {
          tmp += player.name + ',';
        }
        tmp = tmp.slice(0, -1);
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
        } else if (kind === 'playernumber') {
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
    for (let player of server.players)
      if (player.name === playername) {
        let tmp = '';
        for (let player of server.players) {
          if (player.name !== playername) tmp += player.name + ',';
        }
        tmp = tmp.slice(0, -1);
        if (tmp === '') tmp = 'alone';
        else tmp = 'others:' + tmp;
        let response = [
          server.name,
          server.server_ip + ':' + server.server_port,
          server.gamemode + ':' + server.map,
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
    if (server.country === 'China') {
      let counted = false;
      for (let mode in playercount)
        if (server.gamemode.toLowerCase().indexOf(mode) >= 0) {
          counted = true;
          playercount[mode] += server.players.length;
          break;
        }
      if (!counted) playercount.others += server.players.length;
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
