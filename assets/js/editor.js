;(function (win,doc) {
  'use strict';
  var wrkr;
  var root_el = doc.documentElement || doc.getElementsByTagName('html')[0];
  var keyword = doc.getElementById('keyword');
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
  var rel_words = [];
  win.lsi_words = [];
  win.updateLSIWords = updateLSIWords;

  initApp();

  function initApp () {
    if (!('Worker' in win)) {
      throw new win.Error('Please use an up-to-date browser');
    }
    
    wrkr = new win.Worker('https://seoscribe.net/assets/js/editor-worker.js');

    if (!('performance' in win)) {
      win.performance = {
        'now': function () { return new win.Date().getTime()}
      };
    }

    if (!('URL' in win) && 'webkitURL' in win) {
      win.URL = win.webkitURL;
    }

    if ('localStorage' in win) {
      if (win.localStorage.getItem('autosaved_kw')) {
        keyword.value = win.localStorage.getItem('autosaved_kw');
      }

      if (win.localStorage.getItem('autosaved_txt')) {
        content.value = win.localStorage.getItem('autosaved_txt'); checkContent();
      }

      if (!win.localStorage.getItem('night_mode')) {
        storeNightMode();

      } else if (win.localStorage.getItem('night_mode') !== 'false') {
        chk_nt_md.checked = !0;
        setNightMode();

      } else {
        setNightMode();
      }
    }

    if (win.location.protocol === 'https:' && 'serviceWorker' in win.navigator) {
      win.navigator.serviceWorker.register('https://seoscribe.net/editor/sw.js', {
        scope: 'https://seoscribe.net/editor/'
      }).then(function (registration) {
        win.console.info('SW registered [' + registration.scope + ']')
      }).catch(function (err) {
        win.console.warn('SW failed to register [' + err + ']')
      });
    }
    
    eventWireUp();
    startSEOScribe();
    asyncLoadFonts(['https://fonts.googleapis.com/css?family=Karla:400,700&amp;subset=latin-ext']);
  }

  function eventWireUp () {
    win.addEventListener('load', function () {root_el.setAttribute('data-font-loaded',!0)}, {passive: true, capture: false, once: true});
    wrkr.addEventListener('message', updateUI, {passive: true, capture: false, once: false});
    keyword.addEventListener('blur', startSEOScribe, {passive: true, capture: false, once: false});
    content.addEventListener('blur', checkContent, {passive: true, capture: false, once: false});
    content.addEventListener('keyup', rebounce(checkContent), {passive: true, capture: false, once: false});
    btn_exp_txt.addEventListener('click', exportText, {passive: true, capture: false, once: false});
    btn_exp_html.addEventListener('click', exportText, {passive: true, capture: false, once: false});
    btn_menu.addEventListener('click', toggleMenu, {passive: true, capture: false, once: false});

    if ('localStorage' in win) {
      win.addEventListener('unload', saveToStorage, {passive: true, capture: false, once: true});
      btn_save.addEventListener('click', saveToStorage, {passive: true, capture: false, once: false});
      chk_nt_md.addEventListener('click', storeNightMode, {passive: true, capture: false, once: false});
    }
  }

  function updateUI (e) {
    var _results;
    var hc = 0;

    if (typeof e !== 'object' || !e) {
      return;
    }
    
    resetUI();

    if (e.type === 'message' && !!e.data) {
      _results = e.data;
      wrd_c.textContent = _results.word_count;
      kd.textContent = _results.keyword_density + '%';
      rel_d.textContent = _results.related_word_density + '%';
      lsi_d.textContent = _results.lsi_word_density + '%';
      trn_d.textContent = _results.transition_word_density + '%';
      kfp.textContent = _results.keyword_in_first_para;
      r_ease.textContent = _results.readability;
      _results.sentences_too_long ? ss_warn.removeAttribute('hidden') : ss_warn.setAttribute('hidden', '');
      _results.paragraphs_too_long ? sp_warn.removeAttribute('hidden') : sp_warn.setAttribute('hidden', '');
      
      if (_results.SMOG_readability > 0) {
        r_smog.textContent = _results.SMOG_readability;
        r_smog.parentNode.setAttribute('hidden', '');
      }
      
      adjustDensityColor(_results.keyword_density, kd);
      adjustDensityColor(_results.related_word_density, rel_d);
      adjustDensityColor(_results.lsi_word_density, lsi_d);
      adjustWordCountColor(_results.word_count, wrd_c);
      
    } else if (!!e.html_data && typeof e.html_data === 'object') {
      _results = e.html_data;
      kh.parentNode.getAttribute('hidden') ? kh.parentNode.removeAttribute('hidden') : kh.parentNode.setAttribute('hidden', '');
      _results.headings.length < 1 ? no_hdngs.removeAttribute('hidden') : no_hdngs.setAttribute('hidden', '');
      _results.links < 1 ? no_links.removeAttribute('hidden') : no_links.setAttribute('hidden', '');
      _results.lists < 1 ? no_lists.removeAttribute('hidden') : no_lists.setAttribute('hidden', '');
      _results.images < 1 ? no_imgs.removeAttribute('hidden') : no_imgs.setAttribute('hidden', '');
      !!_results.no_alts ? no_img_alts.removeAttribute('hidden') : no_img_alts.setAttribute('hidden', '');

      _results.headings.forEach(function (heading) {
        var j = 0;
        if (matchString(heading.textContent, k, false) > 0) {
          hc++;
        } else {
          for (; j < rel_words.length; ++j) {
            if (matchString(heading.textContent, rel_words[j], true) > 0) {
              hc++;
              break;
            }
          }
        }
      });

      kh.textContent = hc === _results.headings.length && hc > 0 ? 'Yes' : 'No';
    }
  }

  function startSEOScribe () {
    var _k = keyword.value;
    if (_k.toLowerCase().trim() === k) { return; }
    k = _k.toLowerCase().trim();
    rel_words = [];
    win.lsi_words = [];

    if (!k) {
      return;
    }

    if ('localStorage' in win) {
      win.localStorage.setItem('autosaved_kw', k);
    }

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

    if ('localStorage' in win ) {
      win.localStorage.setItem('autosaved_txt', _txt_to_process);
    }

    if (!k && !_txt_to_process) {
      return;
    } else if (!_has_html) {
      root_el.setAttribute('data-has-html', 'false');
    } else {
      root_el.setAttribute('data-has-html', 'true');
    }

    wrkr.postMessage({
      'keyword': k,
      'plain': (!!_has_html ? parseHTML(_txt_to_process) : _txt_to_process),
      'rel_wrds': rel_words,
      'lsi_wrds': win.lsi_words
    });

    sweepJSONP();
  }

  function parseHTML (markup) {
    var _prsr = new win.DOMParser();
    var _doc = _prsr.parseFromString(['<!doctype html><html><head><meta charset="utf-8"></head><body>', markup, '</body></html>'].join(''),'text/html');

    updateUI({
      'html_data': {
        'headings': [].slice.call(_doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,header')),
        'links': _doc.querySelectorAll('a[href]').length,
        'lists': _doc.querySelectorAll('ul li,ol li,dl dd').length,
        'images': _doc.querySelectorAll('img[src]').length,
        'no_alts': _doc.querySelectorAll('img[src]').length > 0 && _doc.querySelectorAll('img[alt]').length < 1
      }
    });

    return _doc.body.textContent;
  }

  function resetUI () {
    kd.textContent = '0%';
    rel_d.textContent = '0%';
    lsi_d.textContent = '0%';
    trn_d.textContent = '0%';
    kfp.textContent = 'No';
    r_ease.textContent = 'N/A';
    r_smog.textContent = 'N/A';
    r_smog.parentNode.setAttribute('hidden', '');
    ss_warn.setAttribute('hidden', '');
    sp_warn.setAttribute('hidden', '');
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
  
  function matchString (string, to_match, exact) {
    var _is_phrase; // if to_match is a phrase
    var _rgx;       // the regular expression pattern
    var _idx;       // the regex matches

    switch (true) {
      case !!(typeof string !== 'string'):
      case !!(typeof to_match !== 'string'):
      case !(string):
      case !(to_match):
        return 0;
    }

    _is_phrase = !!(to_match.split(' ').length > 1);

    _rgx = ((typeof exact !== 'undefined' && !!exact) || !!_is_phrase) ?
      to_match :
        to_match + '|' + to_match + 's|' + to_match + 'i?es';
    
    _idx = string.match(new self.RegExp('\\b(' + _rgx + ')\\b', 'gi'));

    if (_idx && _idx.length > 0) {
      return _idx.length;
    }

    return 0;
  }


  function clean (word) {
    if (typeof word !== 'string') {
      throw new TypeError('Expected param of type \'string\'; received:' + typeof word);
    }
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
  
  function toggleMenu () {
    root_el.getAttribute('data-menu-open') === 'true'
      ? root_el.setAttribute('data-menu-open','false')
        : root_el.setAttribute('data-menu-open','true');
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
