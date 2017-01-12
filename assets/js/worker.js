self.addEventListener('message', getJSON);

function getJSON (e) {
  if (e.data) {
    return conductAnalyses(e.data);
  }
}

function conductAnalyses (data) {
  self.postMessage(processText(data.keyword, data.plain, data.rel_wrds, data.lsi_wrds));
}

function processText (keyword, plain, rel_wrds, lsi_wrds) {
  var _wc = 0;
  var _kc= 0;
  var _rc = 0;
  var _lc = 0;

  var _rdblty = 0;
  var _smog = 0;

  var _wrds = [];
  var _paras = [];
  var _sntcs = [];

  var _psv_v = [];
  var _prd_lc = [];
  var _all_uc = [];

  var _sntc_data = [];
  var _para_data = [];

  var i = rel_wrds.length, j = 0;
  var m = lsi_wrds.length, n = 0;

  if (!!plain && typeof plain.match === 'function') {
    _wrds = plain.match(/\w+/gi) ?
      plain.match(/\w+/gi) : [];

    _paras = plain.split('\n') ?
      plain.split('\n') : [];

    _sntcs = plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) ?
      plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) : [];

    _psv_v = plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) ?
      plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) : [];

    _prd_lc = plain.match(/\.+\s+[a-z]/g) ?
      plain.match(/\.+\s+[a-z]/g) : [];

    _all_uc = plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) ?
      plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) : [];
  }

  if (_wrds.length > 0) {
    _wc = _wrds.length;
  }

  if (_sntcs.length > 0) {
    _sntc_data = checkSentences(_sntcs);
  }

  if (_paras.length > 0) {
    _para_data = checkParagraphs(_paras, keyword);
  }

  if (_sntcs.length > 0) {
    _rdblty = getReadabilityScore(_sntcs, _wrds);

    _smog = (_sntcs.length > 29 ?
    getSMOGScore(_sntcs, _wrds) : 0);
  }

  if (typeof keyword !== 'undefined' && !!keyword) {
    _kc = matchString(plain, keyword, false);
  }

  if (typeof rel_wrds !== 'undefined' && i > 0) {
    for (; j < i; ++j) {
      _rc += matchString(plain, rel_wrds[j], false);
    }
  }

  if (typeof lsi_wrds !== 'undefined' && m > 0) {
    for (; n < m; ++n) {
      _lc += matchString(plain, lsi_wrd[n], false);
    }
  }

  return self.JSON.stringify({
    'word_count': _wc,
    'keyword_density': (_kc / _wc * 100 << 0),
    'related_word_density': (_rc / _wc * 100 << 0),
    'lsi_word_density': (_lc / _wc * 100 << 0),
    'transitive_verb_density': (_sntc_data[0] / _wc * 100 << 0),
    'readability': _rdblty,
    'SMOG_readability': _smog,
    'passive_voice': _psv_v,
    'period_lowercase': _prd_lc,
    'all_caps': _all_uc,
    'keyword_in_first_para': _para_data[0],
    'paragraphs_too_long': _para_data[1],
    'sentences_too_long': _sntc_data[1]
  });
}

function checkParagraphs (paras, keyword) {
  var _first = false;
  var _para_wc = 0;
  var _warn = false;

  if (paras.length > 0) {
    if (!!matchString(paras[0], keyword)) {
      _first = true;
    }

    paras.forEach(function (para) {
      if (para.split(' ').length < 200) {
        _para_wc++;
      }

      if ((_para_wc / paras.length * 100 << 0) < 80) {
        _warn = true;
      }
    });
  }

  return [_first, _warn];
}

function checkSentences (sntcs) {
  var _trs_words = ['I mean','above all','accordingly','as a consequence','actually','additionally','admittedly','after this','afterwards','albeit','all in all','all the same','also','alternatively','although','altogether','and yet','anyhow','anyway','as I have said','as a final point','as a matter of fact','as a result','as an illustration','as for','as has been mentioned','as has been noted','as long as','as was previously stated','as well','at any rate','at first','at last','be that as it may','because of the fact','before this','besides','briefly','but','but also','but even so','by the same token','by the way','by way of contrast','by way of example','concerning','consequently','considering','conversely','despite','due to the fact','either','either way','equally','ergo','especially','even if','even more','even though','eventually','finally','first of all','firstly','for a start','for as much as','for example','for fear','for instance','for one thing','for starters','for the purpose of','for the simple reason that','for this reason','further','furthermore','given that','given these points','granted that','granting that','hence','however','if not','if so','in a like manner','in a word','in addition to','in all honesty','in any case','in any event','in as much as','in case','in conclusion','in consequence','in contrast','in either case','in either event','in fact','in light of the fact','in order that','in order to','in other words','in particular','in short','in spite of','in summary','in that case','in that since','in the end','in the event that','in the first place','in the hope that','in the same way','in view of the fact','incidentally','including','indeed','initially','instead','last but not least','lastly','lest','let alone','likewise','long story short','more importantly','moreover','much less','namely','neither','nevertheless','next','nonetheless','nor','not only','not to mention','notably','notwithstanding','on the condition that','on the other hand','on the subject of','on the whole','only if','or at least','otherwise','overall','owing to the fact','particularly','previously','provided that','providing that','rather','regarding','regardless','secondly','seeing that','similarly','so as to','so long as','so much so that','so that','speaking of which','specifically','still','subsequently','such as','that being the case','that is to say','therefore','thirdly','though','thus','to be brief','to begin with','to change the topic','to conclude','to get back to the point','to illustrate','to put it another way','to put it briefly','to resume','to return to the subject','to say nothing of','to start with','to sum up','to summarize','to tell the truth','to the end that','under those circumstances','unless,what is more','whatever happens','when in fact','whereas','whichever happens','while','with regards to','with this in mind'];
  var _tc = 0;
  var _sntc_wc = 0;
  var _warn = false;

  if (sntcs.length > 0) {
    sntcs.forEach(function (sntc) {
      if (sntc.split(' ').length < 30) {
        _sntc_wc++;
      }

      if ((_sntc_wc / sntcs.length * 100 << 0) < 80) {
        _warn = true;
      }

      _trs_words.forEach(function (trs_word) {
        _tc += matchString(sntc, trs_word, true);
      });
    });
  }

  return [_tc, _warn]
}

function matchString (string, to_match, exact) {
  var _multi;
  var _rgx
  var _idx;

  if (!to_match || to_match.length < 1) {
    return 0;
  }

  _multi = to_match.split(' ').length;
  _rgx = ((typeof exact !== 'undefined' && !!exact) || _multi > 1) ? to_match : to_match + '|' + to_match + 's|' + to_match + 'i?es';
  _idx = string.match(new win.RegExp('\\b(' + _rgx + ')\\b', 'gi'));

  if (_idx && _idx.length > 0) {
    return _idx.length;
  }

  return 0;
}

function getReadabilityScore (sntcs, wrds) {
  var _syll = 0;
  var _score = 0;

  if (sntcs.length < 1 || wrds.length < 1) {
    return 'N/A';
  }

  wrds.forEach(function (wrd) {
    _syll += countSyllables(wrd);
  });

  if (_syll > 0) {
    _score = (206.835 - 1.015 * (wrds.length / sntcs.length) - 84.6 * (_syll / wrds.length)).toFixed(1);
  }

  return _score > 100 ?
    '100.0' : _score < 0 ?
      '0.0' : _score;
}

function getSMOGScore (sntcs, wrds) {
  var _smog = 0;
  var _p_syll = 0;

  if (sntcs.length < 1 || wrds.length < 1) {
    return 'N/A';
  }

  wrds.forEach(function (wrd) {
    if (countSyllables(wrd) > 2) {
      _p_syll++;
    }
  });

  if (_p_syll > 0) {
    _smog = (1.0430 * win.Math.sqrt(p_syll * (30 / sntcs.length)) + 3.1291).toFixed(1);
  }

  return _smog > 100 ?
    '100.0' : _smog < 0 ?
      '0.0' : _smog;
}

function countSyllables (word) {
  var _wrd = clean(word);
  if (word.length <= 3) { return 1; }
  _wrd = _wrd.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  _wrd = _wrd.replace(/^y/, '');
  return (_wrd.match(/[aeiouy]{1,2}/g)
    ? _wrd.match(/[aeiouy]{1,2}/g).length
    : 1
  );
}

function clean (word) {
  if (typeof word !== 'string') {
    throw new TypeError('Expected param of type \'string\'; received: ' + typeof word);
  }
  return word.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').toLowerCase();
}
