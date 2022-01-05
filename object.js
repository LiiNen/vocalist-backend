function getObject(target) {
  if(target == 'list') {
    return 'music.id, music.title, music.artist, music.number';
  }
  else if(target == 'chart') {
    return 'music.id, music.title, music.artist, music.number, music.chart';
  }
  else if(target == 'playlist') {
    return 'count(music_id) as count, id, title, emoji';
  }
  else if(target == 'curation') {
    return 'count(music_id) as count, id, title, content, ctype_id';
  }
  else if(target == 'love') {
    return 'music.id, music.title, music.artist, 1 as islike, love.pitch, music.number, music.cluster';
  }
  else {
    return '*';
  }
}

module.exports = getObject;