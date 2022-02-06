function getObject(target) {
  if(target == 'list') {
    return 'music.id, music.title, music.artist, music.number, music.isMR, music.isLIVE';
  }
  else if(target == 'chart') {
    return 'music.id, music.title, music.artist, music.number, music.chart, music.isMR, music.isLIVE';
  }
  else if(target == 'playlist') {
    return 'count(music_id) as count, playlist.id, title, emoji';
  }
  else if(target == 'curation') {
    return 'count(music_id) as count, id, title, content, ctype_id';
  }
  else if(target == 'love') {
    return 'music.id, music.title, music.artist, 1 as islike, love.pitch, music.number, music.isMR, music.isLIVE';
  }
  else {
    return '*';
  }
}

module.exports = getObject;