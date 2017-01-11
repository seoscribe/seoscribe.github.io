;(function (win,doc) {
  'use strict';
  var root_el = doc.documentElement || doc.getElementsByTagName('html')[0];
  var keyword = doc.getElementById('keyword');
  var sidebar = doc.getElementsByTagName('aside')[0];
  var content = doc.getElementsByTagName('textarea')[0];
  var kd = doc.getElementById('keyword_density');
  var kh = doc.getElementById('keyword_headings');
  var kfp = doc.getElementById('keyword_first_paragraph');
  var r_ease = doc.getElementById('readability_score');
  var r_smog = doc.getElementById('smog_score');
  var rel_d = doc.getElementById('rel_density');
  var lsi_d = doc.getElementById('lsi_density');
  var trn_d = doc.getElementById('trn_density');
  var wrd_c = doc.getElementById('word_count');
  var btn_save = doc.getElementById('save_storage');
  var btn_exp_txt = doc.getElementById('exp_txt');
  var btn_exp_html = doc.getElementById('exp_htm');
  var chk_nt_md = doc.getElementById('night_mode');
  var ss_warn = doc.getElementById('ss_warn');
  var sp_warn = doc.getElementById('sp_warn');
  var no_hdngs = doc.getElementById('no_hdngs');
  var no_links = doc.getElementById('no_links');
  var no_lists = doc.getElementById('no_lists');
  var no_imgs = doc.getElementById('no_imgs');
  var no_img_alts = doc.getElementById('no_img_alts');
  var btn_menu = doc.getElementById('btn_menu');
  var k = keyword.value.toLowerCase();
  var qs = '';
  var wc = 0;
  var kc = 0;
  var rc = 0;
  var lc = 0;
  var tc = 0;
  var hc = 0;
  var ssc = 0;
  var spc = 0;
  var syll = 0;
  var p_syll = 0;
  var rel_words = [];
  var trn_words = ['I mean','above all','accordingly','as a consequence','actually','additionally','admittedly','after this','afterwards','albeit','all in all','all the same','also','alternatively','although','altogether','and yet','anyhow','anyway','as I have said','as a final point','as a matter of fact','as a result','as an illustration','as for','as has been mentioned','as has been noted','as long as','as was previously stated','as well','at any rate','at first','at last','be that as it may','because of the fact','before this','besides','briefly','but','but also','but even so','by the same token','by the way','by way of contrast','by way of example','concerning','consequently','considering','conversely','despite','due to the fact','either','either way','equally','ergo','especially','even if','even more','even though','eventually','finally','first of all','firstly','for a start','for as much as','for example','for fear','for instance','for one thing','for starters','for the purpose of','for the simple reason that','for this reason','further','furthermore','given that','given these points','granted that','granting that','hence','however','if not','if so','in a like manner','in a word','in addition to','in all honesty','in any case','in any event','in as much as','in case','in conclusion','in consequence','in contrast','in either case','in either event','in fact','in light of the fact','in order that','in order to','in other words','in particular','in short','in spite of','in summary','in that case','in that since','in the end','in the event that','in the first place','in the hope that','in the same way','in view of the fact','incidentally','including','indeed','initially','instead','last but not least','lastly','lest','let alone','likewise','long story short','more importantly','moreover','much less','namely','neither','nevertheless','next','nonetheless','nor','not only','not to mention','notably','notwithstanding','on the condition that','on the other hand','on the subject of','on the whole','only if','or at least','otherwise','overall','owing to the fact','particularly','previously','provided that','providing that','rather','regarding','regardless','secondly','seeing that','similarly','so as to','so long as','so much so that','so that','speaking of which','specifically','still','subsequently','such as','that being the case','that is to say','therefore','thirdly','though','thus','to be brief','to begin with','to change the topic','to conclude','to get back to the point','to illustrate','to put it another way','to put it briefly','to resume','to return to the subject','to say nothing of','to start with','to sum up','to summarize','to tell the truth','to the end that','under those circumstances','unless,what is more','whatever happens','when in fact','whereas','whichever happens','while','with regards to','with this in mind'];
  win.lsi_words = [];
  win.updateLSIWords = updateLSIWords;

  initApp();
  eventWireUp();

  function initApp () {
    if (!('performance' in win)) { win.performance = {'now': function () { return new win.Date().getTime()}};}
    if (!('URL' in win) && 'webkitURL' in win) { win.URL = win.webkitURL; }
    if ('localStorage' in win) {
      if (win.localStorage.getItem('autosaved_kw')) { keyword.value = win.localStorage.getItem('autosaved_kw'); }
      if (win.localStorage.getItem('autosaved_txt')) {content.value = win.localStorage.getItem('autosaved_txt'); checkContent(); }
      if (!win.localStorage.getItem('night_mode')) { storeNightMode(); }
      else if (win.localStorage.getItem('night_mode') !== 'false') { chk_nt_md.checked = !0; setNightMode(); }
      else { setNightMode(); }
    }
    startSEOScribe();
    checkContent();
    if (win.location.protocol === 'https:' && 'serviceWorker' in win.navigator) {
      win.navigator.serviceWorker.register('https://seoscribe.net/editor/sw.js', {
        scope: 'https://seoscribe.net/editor/'
      }).then(function (registration) {
        console.info('SW registered [' + registration.scope + ']')
      }).catch(function (err) {
        console.warn('SW failed to register [' + err + ']')
      });
    }
    asyncLoadFonts(['https://fonts.googleapis.com/css?family=Karla:400,700&amp;subset=latin-ext']);
  }

  function eventWireUp () {
    win.addEventListener('load', function () {
      root_el.setAttribute('data-font-loaded', !0);
    }, {passive: true, capture: false, once: true});
    keyword.addEventListener('blur', startSEOScribe, {passive: true, capture: false, once: false});
    content.addEventListener('blur', checkContent, {passive: true, capture: false, once: false});
    content.addEventListener('keydown', rebounce(checkContent), {passive: true, capture: false, once: false});
    btn_exp_txt.addEventListener('click', exportText, {passive: true, capture: false, once: false});
    btn_exp_html.addEventListener('click', exportText, {passive: true, capture: false, once: false});
    btn_menu.addEventListener('click', function () {
      root_el.getAttribute('data-menu-open') === 'true'
        ? root_el.setAttribute('data-menu-open','false')
        : root_el.setAttribute('data-menu-open','true');
    }, {passive: true, capture: false, once: false});
    if ('localStorage' in win) {
      win.addEventListener('unload', saveToStorage, {passive: true, capture: false, once: true});
      btn_save.addEventListener('click', saveToStorage, {passive: true, capture: false, once: false});
      chk_nt_md.addEventListener('click', storeNightMode, {passive: true, capture: false, once: false});
    }
  }

  function startSEOScribe () {
    var _k = keyword.value;
    if (_k.toLowerCase().trim() === k) { return; }
    k = _k.toLowerCase().trim();
    rel_words = [];
    win.lsi_words = [];
    if (!k) { return; }
    if ('localStorage' in win) { win.localStorage.setItem('autosaved_kw', k); }
    if (k.split(' ').length > 1) {
      qs = k.split(' ').map(function (word) {
        return win.encodeURIComponent(clean(word));
      }).join('+');
    } else {
      qs = k;
    }
    getRelatedWords();
    getLSIWords();
  }

  function checkContent () {
    var _txt_to_process = content.value;
    var _has_html = !!_txt_to_process && _txt_to_process.match(/<\/?[\w\s="/.':;#-\/\?]+>+[\/?[\w\s="/.':;#-\/\?]+<\/?[\w\s="/.':;#-\/\?]+>/gi) ? true : false;
    if ('localStorage' in win ) { win.localStorage.setItem('autosaved_txt', _txt_to_process); }
    resetAll();
    if (!k && !_txt_to_process) {
      return;
    } else if (!_has_html) {
      root_el.setAttribute('data-has-html', 'false');
      processText(_txt_to_process);
    } else {
      root_el.setAttribute('data-has-html', 'true');
      parseHTML();
    }
    sweepJSONP();
  }

  function processText (_plain) {
    var _paras = [];
    var _sntcs = [];
    var _wrds = [];
    var _passive = [];
    var _prd_lc = [];
    var _all_uc = [];
    var _hck_phr = [];
    var _vrb_ord = [];
    if (!!_plain && typeof _plain.match === 'function') {
      _paras = _plain.split('\n') ? _plain.split('\n') : [];
      _sntcs = _plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) ? _plain.match(/[^\.!\?\n]+[\.!\?\n]+/g) : [];
      _wrds = _plain.match(/\w+/gi) ? _plain.match(/\w+/gi) : [];
      _passive = _plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) ? _plain.match(/(was|were)(\s|\n)[a-z]*(ing|ed)(\s|\n)by(\s|\n)/g) : [];
      _prd_lc = _plain.match(/\.+\s+[a-z]/g) ? _plain.match(/\.+\s+[a-z]/g) : [];
      _all_uc = _plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) ? _plain.match(/([A-Z]+[A-Z]+\s+[A-Z]+[A-Z])/g) : [];
      _hck_phr = _plain.match(/(\s|\n)[A-Z][a-z]+ing((\s|\n)[A-Za-z]*)*,(\s|\n)/) ? _plain.match(/(\s|\n)[A-Z][a-z]+ing((\s|\n)[A-Za-z]*)*,(\s|\n)/) : [];
      _vrb_ord = _plain.match(/''(\s|\n)(asked|replied|said|whispered)(\s|\n)[A-Za-z]*/) ? _plain.match(/''(\s|\n)(asked|replied|said|whispered)(\s|\n)[A-Za-z]*/) : [];
    }
    if (_wrds.length > 0) {
      wc = _wrds.length;
    }
    if (_sntcs.length > 0) {
      checkSentences(_sntcs);
      r_ease.textContent = getReadabilityScore(_sntcs, _wrds);
    }
    if (_paras.length > 0) {
      checkParagraphs(_paras);
    }
    if (_sntcs.length > 29) {
      r_smog.parentNode.removeAttribute('hidden');
      r_smog.textContent = getSMOGScore(_sntcs, _wrds);
    }
    if (!!k) {
      kc = matchString(_plain, k, false);
      rel_words.forEach(function (rel_w) {
        rc += matchString(_plain, rel_w);
      });
      win.lsi_words.forEach(function (lsi_w) {
        lc += matchString(_plain, lsi_w);
      });
    }
    updateKeywordMetrics(_sntcs.length);
  }

  function parseHTML () {
    var _prsr = new win.DOMParser();
    var _doc = _prsr.parseFromString('<!doctype html><html><head><meta charset="utf-8"></head><body>' + content.value + '</body></html>','text/html');
    var _hdngs = [].slice.call(_doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,header'));
    processText(_doc.body.textContent);
    if (_hdngs.length < 1) {
      no_hdngs.removeAttribute('hidden');
    } else {
      no_hdngs.setAttribute('hidden', '');
    }
    if (_doc.querySelectorAll('a[href]').length < 1) {
      no_links.removeAttribute('hidden');
    } else {
      no_links.setAttribute('hidden', '');
    }
    if (_doc.querySelectorAll('ul li,ol li').length < 1) {
      no_lists.removeAttribute('hidden');
    } else {
      no_lists.setAttribute('hidden', '');
    }
    if (_doc.querySelectorAll('img[src]').length < 1) {
      no_imgs.removeAttribute('hidden');
    } else {
      no_imgs.setAttribute('hidden', '');
    }
    if (_doc.querySelectorAll('img[src]').length > 0 && _doc.querySelectorAll('img[alt]').length < 1) {
      no_img_alts.removeAttribute('hidden');
    } else {
      no_img_alts.setAttribute('hidden', '');
    }
    kh.parentNode.removeAttribute('hidden');
    hc = 0;
    _hdngs.forEach(function(heading){
      if (matchString(heading.textContent, k) > 0) {
        hc++;
      } else {
        for (var j = 0; j < rel_words.length; ++j) {
          if (matchString(heading.textContent, rel_words[j]) > 0) {
            hc++;
            break;
          }
        }
      }
    });
    kh.textContent = hc > 0 && hc === _hdngs.length ? 'Yes' : 'No';
  }

  function resetAll () {
    wc = 0;
    kc = 0;
    rc = 0;
    lc = 0;
    tc = 0;
    ssc = 0;
    spc = 0;
    syll = 0;
    p_syll = 0;
    kd.textContent = '0%';
    rel_d.textContent = '0%';
    lsi_d.textContent = '0%';
    trn_d.textContent = '0%';
    kfp.textContent = 'No';
    r_ease.textContent = 'N/A';
    r_smog.textContent = 'N/A';
    r_smog.parentNode.setAttribute('hidden', '');
    kh.parentNode.setAttribute('hidden', '');
    ss_warn.setAttribute('hidden', '');
    sp_warn.setAttribute('hidden', '');
    no_hdngs.setAttribute('hidden', '');
    no_links.setAttribute('hidden', '');
    no_lists.setAttribute('hidden', '');
    no_imgs.setAttribute('hidden', '');
    no_img_alts.setAttribute('hidden', '');
  }

  function checkParagraphs (_p) {
    if (_p.length > 0) {
      kfp.textContent = !!matchString(_p[0], k) ? 'Yes' : 'No';
      _p.forEach(function (para) {
        if (para.split(' ').length < 200) { spc++; }
        if ((spc / _p.length * 100 << 0) < 80) { sp_warn.removeAttribute('hidden'); }
        else { sp_warn.setAttribute('hidden', ''); }
      });
    }
  }

  function checkSentences (_s) {
    if (_s.length > 0) {
      _s.forEach(function (sntc) {
        if (sntc.split(' ').length < 30) { ssc++; }
        if ((ssc / _s.length * 100 << 0) < 80) { ss_warn.removeAttribute('hidden'); }
        else { ss_warn.setAttribute('hidden', ''); }
        trn_words.forEach(function (trn_w) { tc += matchString(sntc, trn_w, true); });
      });
    }
  }

  function updateKeywordMetrics (_s_c) {
    wrd_c.textContent = wc;
    kd.textContent = (kc / wc * 100 << 0) + '%';
    rel_d.textContent = (rc / wc * 100 << 0) + '%';
    lsi_d.textContent = (lc / wc * 100 << 0) + '%';
    trn_d.textContent = (tc / _s_c * 100 << 0) + '%';
    adjustDensityColor(kc / wc * 100 << 0, kd);
    adjustDensityColor((rc / 2) / wc * 100 << 0, rel_d);
    adjustDensityColor((lc / 2) / wc * 100 << 0, lsi_d);
    adjustWordCountColor(wc, wrd_c);
  }

  function matchString (string, to_match, exact) {
    var rgx;
    var idx;
    var _multi;
    if (!to_match || to_match.length < 1) { return; }
    _multi = to_match.split(' ').length;
    if ((typeof exact !== 'undefined' && !!exact) || _multi > 1) {
      rgx = new win.RegExp('\\b(' + to_match + ')\\b', 'gi');
    } else {
      rgx = new win.RegExp('\\b(' + to_match + '|' + to_match + 's|' + to_match + 'i?es)\\b', 'gi');
    }
    idx = string.match(rgx);
    if (idx && idx.length > 0) { return idx.length; }
    return 0;
  }

  function adjustDensityColor (val, el) {
    el.style.width = val + '%';

    if (val >= 15 && val > 14) {
      el.style.borderColor = 'rgba(244,67,54,.7)';

    } else if (val < 14 && val >= 6 && val > 0) {
      el.style.borderColor = 'rgba(255,138,34,.7)';

    } else if (val <= 5 && val >= 4 && val > 0) {
      el.style.borderColor = 'rgba(255,204,0,.7)';

    } else if (val < 4 && val > 0) {
      el.style.borderColor = 'rgba(154,205,50,.7)';

    } else {
      el.style.borderColor = 'rgba(244,67,54,.7)';
    }
  }

  function adjustWordCountColor (val, el) {
    el.style.width = val <= 1000 ? val / 10 + '%' : '100%';

    if (val > 399) {
      el.style.borderColor = 'rgba(154,205,50,.7)';

    } else if (val <= 399 && val > 299) {
      el.style.borderColor = 'rgba(255,204,0,.7)';

    } else if (val <= 299 && val > 199) {
      el.style.borderColor = 'rgba(255,138,34,.7)';

    } else if (val <= 199) {
      el.style.borderColor = 'rgba(244,67,54,.7)';

    } else {
      el.style.borderColor = 'rgba(244,67,54,.7)';
    }
  }

  function clean (word) {
    if (typeof word !== 'string') { return void 0; }
    return word.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').toLowerCase();
  }

  function getRelatedWords () {
    var xhr = new win.XMLHttpRequest();
    xhr.open('GET', win.location.protocol + '//api.datamuse.com/words?ml=' + qs, true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
        rel_words = xhr.response.map(function (datum) {
          return datum.word;
        });
        checkContent();
      }
    };
    xhr.onerror = xhr.onabort = xhr.ontimeout = function () {
      win.console.error('There was an error with the request: ' + xhr.status);
    };
    xhr.send(null);
  }

  function getLSIWords () {
    var _script = doc.createElement('script');
    _script.async = !0;
    _script.src = win.location.protocol + '//api.bing.com/osjson.aspx?JsonType=callback&JsonCallback=updateLSIWords&query=' + qs;
    _script.setAttribute('data-lsi','true');
    doc.body.appendChild(_script);
  }

  function updateLSIWords (resp) {
    win.lsi_words = resp[1];
    checkContent();
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

  function getReadabilityScore (sntcs, wrds) {
    var _score = 0;
    if (sntcs.length < 1 || wrds.length < 1) { return 'N/A'; }
    syll = 0;
    wrds.forEach(function (wrd) { syll += countSyllables(wrd); });
    if (syll > 0) { _score = (206.835 - 1.015 * (wrds.length / sntcs.length) - 84.6 * (syll / wrds.length)).toFixed(1); }
    return _score > 100 ? '100.0' : _score < 0 ? '0.0' : _score;
  }

  function getSMOGScore (sntcs, wrds) {
    var _smog = 0;
    if (sntcs.length < 1 || wrds.length < 1) { return 'N/A'; }
    p_syll = 0;
    wrds.forEach(function (wrd) { if (countSyllables(wrd) > 2) { p_syll++; } });
    if (p_syll > 0) { _smog = (1.0430 * win.Math.sqrt(p_syll * (30 / sntcs.length)) + 3.1291).toFixed(1); }
    return _smog > 100 ? '100.0' : _smog < 0 ? '0.0' : _smog;
  }

  function saveToStorage (e) {
    var evt = (e.target || this);
    if ('localStorage' in win) {
      win.localStorage.setItem('autosaved_txt', content.value);
      win.localStorage.setItem('autosaved_kw', k);
      if (typeof evt !== 'undefined' && 'setAttribute' in evt) {
        evt.textContent = 'Saved';
        evt.setAttribute('disabled', '');
        win.setTimeout(function () {
          evt.textContent = 'Save';
          evt.removeAttribute('disabled');
        }, 3e3);
      }
    }
  }

  function exportText (e) {
    var evt = (e.target || this);
    var txt_type = 'text/' + (evt.getAttribute('data-txt-type') || 'plain');
    var dl_link = doc.createElement('a');
    var _blob = txt_type === 'text/html'
              ? ['<!doctype html><html><head><meta charset="utf-8"></head><body>', content.value, '</body></html>'].join('')
              : content.value;
    evt.setAttribute('disabled', '');
    win.setTimeout(function () { evt.removeAttribute('disabled') }, 2e3);
    dl_link.href = createBlob(txt_type, _blob);
    dl_link.textContent = 'Download';
    dl_link.style.display = 'none';
    dl_link.addEventListener('click', removeThisEl, { passive: true, capture: false, once: true });
    if ('download' in dl_link) {
      dl_link.download = [(k || 'untitled'), '-', (new win.Date().toDateString().split(' ').join('-')), (txt_type === 'text/html' ? '.html' : '.txt')].join('');
    } else {
      dl_link.target = '_blank';
      dl_link.rel = 'noreferrer noopener nofollow';
    }
    (doc.body || doc.getElementsByTagName('body')[0]).appendChild(dl_link);
    dl_link.click();
  }

  function removeThisEl (e) {
    var evt = (e.target || this);
    evt.removeEventListener('click', removeThisEl, { passive: true, capture: false, once: true });
    (doc.body || doc.getElementsByTagName('body')[0]).removeChild(evt);
  }

  function createBlob (mimetype, data) {
    if ('createObjectURL' in win.URL) {
      return win.URL.createObjectURL(new win.Blob([data], { type: mimetype }));
    }
    return 'data:' + mimetype + ',' + win.encodeURIComponent(data);
  }

  function exportRTF () {
  }

  function exportWord () {
    //var doc = new DOCXjs();
    //doc.text('');
  }

  function exportPDF () {
    //var doc = new jsPDF();
    //doc.text('');
  }

  function storeNightMode () {
    if ('localStorage' in win) {
      win.localStorage.setItem('night_mode', chk_nt_md.checked);
      setNightMode();
    }
  }

  function setNightMode () {
    if ('localStorage' in win) {
      doc.documentElement.setAttribute('data-night-mode', win.localStorage.getItem('night_mode') !== 'true' ? 'off' : 'on');
    }
  }

  function sweepJSONP () {
    var _scripts = doc.querySelectorAll('[data-lsi]');
    var i = _scripts.length;
    var j = 0;
    for (; j < i; ++j) {
      _scripts[j].parentNode.removeChild(_scripts[j]);
    }
  }

  function asyncLoadFonts (urls) {
    var font;
    var i = urls.length;
    var j = 0;
    for (; j < i; ++j) {
      font = doc.createElement('link');
      font.href = urls[j];
      font.rel = 'stylesheet';
      (doc.head || doc.getElementsByTagName('head')[0]).appendChild(font);
    }
  }

  function rebounce (func) {
    var scheduled, context, args, i, j;
    return function () {
      context = this;
      args = [];
      i = arguments.length;
      j = 0;

      for (; j < i; ++j) {
        args[j] = arguments[j];
      }

      if (!!scheduled) {
        win.cancelAnimationFrame(scheduled);
      }

      scheduled = win.requestAnimationFrame(function () {
        func.apply(context, args);
        scheduled = null;
      });
    }
  }
  
})(window, window.document);
