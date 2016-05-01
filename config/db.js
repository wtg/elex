module.exports = function (ip) {
  return 'mongodb://' + (ip || 'localhost') + '/elex';
}
