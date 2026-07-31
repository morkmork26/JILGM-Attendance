function doGet(e) {
  var params = e.parameter;
  var action = params.action;
  var ss = SpreadsheetApp.openById('1WEbBBFh-_GeBNAn-mQ3vMQhkZ4jAHejaFd2YS5ZKP-Y');

  switch(action) {
    case 'getDeviceStatus':
      return getDeviceStatus(ss, params);
    case 'registerDevice':
      return registerDevice(ss, params);
    case 'getPendingDevices':
      return getPendingDevices(ss, params);
    case 'updateDeviceStatus':
      return updateDeviceStatus(ss, params);
    default:
      return jsonResponse({success: false, error: 'Unknown action'});
  }
}

function getDeviceStatus(ss, params) {
  var deviceId = params.deviceId;
  var sheet = ss.getSheetByName('Devices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deviceIdCol = headers.indexOf('deviceId');
  var statusCol = headers.indexOf('status');
  var roleCol = headers.indexOf('role');

  for (var i = 1; i < data.length; i++) {
    if (data[i][deviceIdCol] === deviceId) {
      return jsonResponse({
        success: true,
        data: {
          status: data[i][statusCol] || 'Pending',
          role: roleCol >= 0 ? (data[i][roleCol] || 'user') : 'user'
        }
      });
    }
  }
  return jsonResponse({success: true, data: {status: 'unregistered', role: 'user'}});
}

function registerDevice(ss, params) {
  var deviceId = params.deviceId;
  var name = params.name;
  var sheet = ss.getSheetByName('Devices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deviceIdCol = headers.indexOf('deviceId');

  for (var i = 1; i < data.length; i++) {
    if (data[i][deviceIdCol] === deviceId) {
      var statusCol = headers.indexOf('status');
      return jsonResponse({success: true, data: {status: data[i][statusCol]}});
    }
  }

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    if (headers[j] === 'deviceId') newRow.push(deviceId);
    else if (headers[j] === 'name') newRow.push(name);
    else if (headers[j] === 'status') newRow.push('Pending');
    else if (headers[j] === 'registeredAt') newRow.push(new Date().toISOString().slice(0, 10));
    else if (headers[j] === 'role') newRow.push('user');
    else newRow.push('');
  }
  sheet.appendRow(newRow);
  return jsonResponse({success: true, data: {status: 'Pending'}});
}

function getPendingDevices(ss, params) {
  var requestingDeviceId = params.deviceId;
  if (!isAdmin(ss, requestingDeviceId)) {
    return jsonResponse({success: false, error: 'unauthorized'});
  }

  var sheet = ss.getSheetByName('Devices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deviceIdCol = headers.indexOf('deviceId');
  var nameCol = headers.indexOf('name');
  var statusCol = headers.indexOf('status');
  var regCol = headers.indexOf('registeredAt');

  var pending = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][statusCol] === 'Pending') {
      pending.push({
        deviceId: data[i][deviceIdCol],
        name: data[i][nameCol],
        registeredAt: data[i][regCol] || ''
      });
    }
  }
  return jsonResponse({success: true, data: pending});
}

function updateDeviceStatus(ss, params) {
  var requestingDeviceId = params.deviceId;
  if (!isAdmin(ss, requestingDeviceId)) {
    return jsonResponse({success: false, error: 'unauthorized'});
  }

  var targetDeviceId = params.targetDeviceId;
  var newStatus = params.status;
  if (newStatus !== 'Approved' && newStatus !== 'Blocked') {
    return jsonResponse({success: false, error: 'Invalid status'});
  }

  var sheet = ss.getSheetByName('Devices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deviceIdCol = headers.indexOf('deviceId');
  var statusCol = headers.indexOf('status');

  for (var i = 1; i < data.length; i++) {
    if (data[i][deviceIdCol] === targetDeviceId) {
      sheet.getRange(i + 1, statusCol + 1).setValue(newStatus);
      return jsonResponse({success: true});
    }
  }
  return jsonResponse({success: false, error: 'Device not found'});
}

function isAdmin(ss, deviceId) {
  var sheet = ss.getSheetByName('Devices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deviceIdCol = headers.indexOf('deviceId');
  var roleCol = headers.indexOf('role');
  if (roleCol < 0) return false;

  for (var i = 1; i < data.length; i++) {
    if (data[i][deviceIdCol] === deviceId && data[i][roleCol] === 'admin') {
      return true;
    }
  }
  return false;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
