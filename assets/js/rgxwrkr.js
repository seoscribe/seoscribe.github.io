self.addEventListener('message', getJSON);

function getJSON (e) {
  if (e.data) { return conductAnalyses(JSON.parse(e.data)); }
  else { self.close(); }
}

function conductAnalyses (data) {
  
  
  self.postMessage(_results);
  self.close();
}

function processText (plain) {
  var _kwd_d = 0;
  var _rel_d = 0;
  var _lsi_d = 0;
  var _trs_d = 0;
  var _rdblty = 0;
  var _smog = 0;
  var _psv_v = [];
  var _prd_lc = [];
  var _all_uc = [];
  var _paras = [];
  var _sntcs = [];
  var _wrds = [];
  
  if (!!plain && typeof plain.match === 'function') {
    _paras = plain.split('\n') ? plain.split('\n') : [];
    _sntcs = plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) ? plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) : [];
    _wrds = plain.match(/\w+/gi) ? plain.match(/\w+/gi) : [];
    _passive = plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) ? plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) : [];
    _prd_lc = plain.match(/\.+\s+[a-z]/g) ? plain.match(/\.+\s+[a-z]/g) : [];
    _all_uc = plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) ? plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) : [];
    _vrb_ord = plain.match(/''(\s|\n)(asked|replied|said|whispered)(\s|\n)[A-Za-z]*/) ? plain.match(/''(\s|\n)(asked|replied|said|whispered)(\s|\n)[A-Za-z]*/) : [];
  }
  
  if (_wrds.length > 0) {
    wc = _wrds.length;
  }
  
  if (_sntcs.length > 0) {
    checkSentences(_sntcs);
  }
  
  if (_paras.length > 0) {
    checkParagraphs(_paras);
  }
  
  _rdblty = getReadabilityScore(_sntcs, _wrds);
  
  _smog = (_sntcs.length > 29 ? getSMOGScore(_sntcs, _wrds) : 0);
  
  if (!!k) {
    _kwd_d = matchString(_plain, k, false);
    
    rel_wrds.forEach(function (rel_w) {
      _rel_d += matchString(_plain, rel_w);
    });
    
    lsi_wrds.forEach(function (lsi_w) {
      _lsi_d += matchString(_plain, lsi_w);
    });
  }
  
  return [
    _kwd_d, _rel_d, _lsi_d, _trs_d, _rdblty, _smog, _psv_v, _prd_lc, _all_uc, _paras, _sntcs, _wrds  
  ];
}

function getSMOGScore () {
}
