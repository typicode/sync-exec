// Generated by CoffeeScript 1.7.1
(function() {
  var cp, create_pipes, dir, fs, name, read_pipes, tmp_dir, _i, _len, _ref;

  cp = require('child_process');

  fs = require('fs');

  tmp_dir = '/tmp';

  _ref = ['TMPDIR', 'TMP', 'TEMP'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    if ((dir = process.env[name]) != null) {
      tmp_dir = tmp.split('/')[0];
    }
  }

  create_pipes = function() {
    var created;
    while (!created) {
      try {
        dir = tmp_dir + '/sync-exec-' + Math.floor(Math.random() * 1000000000);
        fs.mkdir(dir);
        created = true;
      } catch (_error) {}
    }
    return dir;
  };

  read_pipes = function(dir) {
    var deleted, pipe, read, result, _j, _len1, _ref1;
    while (!read) {
      try {
        if (fs.readFileSync(dir + '/done').length) {
          read = true;
        }
      } catch (_error) {}
    }
    while (!deleted) {
      try {
        fs.unlinkSync(dir + '/done');
        deleted = true;
      } catch (_error) {}
    }
    result = {};
    _ref1 = ['stdout', 'stderr', 'status'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      pipe = _ref1[_j];
      result[pipe] = fs.readFileSync(dir + '/' + pipe, {
        encoding: 'utf-8'
      });
      read = true;
      fs.unlinkSync(dir + '/' + pipe);
    }
    fs.rmdirSync(dir);
    result.status = Number(result.status);
    return result;
  };

  module.exports = function(cmd, options) {
    dir = create_pipes();
    cmd = '(' + cmd + ' > ' + dir + '/stdout 2> ' + dir + '/stderr ); echo $?' + ' > ' + dir + '/status ; echo 1 > ' + dir + '/done';
    cp.exec(cmd, options || {}, function() {});
    return read_pipes(dir);
  };

}).call(this);