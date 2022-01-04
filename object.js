function getObject(id) {
  switch(id) {
    case 0:
      return 'music.id, music.title, music.artist, music.cluster, music.number';
    default:
      return '*';
  }
}

module.exports = getObject;