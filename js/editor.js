;(function(win,doc){
        var keyword = doc.getElementById('keyword');
        var content = doc.getElementsByTagName('textarea')[0];
        var kd = doc.getElementById('keyword_density');
        var kh = doc.getElementById('keyword_headings');
        var kfp = doc.getElementById('keyword_first_paragraph');
        var r_ease = doc.getElementById('readability_score');
        var rel_d = doc.getElementById('rel_density');
        var trn_d = doc.getElementById('trn_density');
        var wc = doc.getElementById('word_count');
        var btn_save = doc.getElementById('save_storage');
        var btn_exp_txt = doc.getElementById('exp_txt');
        var btn_exp_html = doc.getElementById('exp_htm');
        var chk_nt_md = doc.getElementById('night_mode');
        var ss_warn = doc.getElementById('ss_warn');
        var sp_warn = doc.getElementById('sp_warn');
        var no_hdngs = doc.getElementById('no_hdngs');
        var no_links = doc.getElementById('no_links');
        var font = doc.createElement('link');
        var k = keyword.value.toLowerCase();
        var kc = 0;
        var rc = 0;
        var tc = 0;
        var hc = 0;
        var ssc = 0;
        var spc = 0;
        var syll = 0;
        var rel_words = [];
        var lsi_words = [];
        var trn_words = ['I mean','above all','accordingly','as a consequence','actually','additionally','admittedly','after this','afterwards','albeit','all in all','all the same','also','alternatively','although','altogether','and yet','anyhow','anyway','as I have said','as a final point','as a matter of fact','as a result','as an illustration','as for','as has been mentioned','as has been noted','as long as','as was previously stated','as well','at any rate','at first','at last','be that as it may','because of the fact','before this','besides','briefly','but','but also','but even so','by the same token','by the way','by way of contrast','by way of example','concerning','consequently','considering','conversely','despite','due to the fact','either','either way','equally','ergo','especially','even if','even more','even though','eventually','finally','first of all','firstly','for a start','for as much as','for example','for fear','for instance','for one thing','for starters','for the purpose of','for the simple reason that','for this reason','further','furthermore','given that','given these points','granted that','granting that','hence','however','if not','if so','in a like manner','in a word','in addition to','in all honesty','in any case','in any event','in as much as','in case','in conclusion','in consequence','in contrast','in either case','in either event','in fact','in light of the fact','in order that','in order to','in other words','in particular','in short','in spite of','in summary','in that case','in that since','in the end','in the event that','in the first place','in the hope that','in the same way','in view of the fact','incidentally','including','indeed','initially','instead','last but not least','lastly','lest','let alone','likewise','long story short','more importantly','moreover','much less','namely','neither','nevertheless','next','nonetheless','nor','not only','not to mention','notably','notwithstanding','on the condition that','on the other hand','on the subject of','on the whole','only if','or at least','otherwise','overall','owing to the fact','particularly','previously','provided that','providing that','rather','regarding','regardless','secondly','seeing that','similarly','so as to','so long as','so much so that','so that','speaking of which','specifically','still','subsequently','such as','that being the case','that is to say','therefore','thirdly','though','thus','to be brief','to begin with','to change the topic','to conclude','to get back to the point','to illustrate','to put it another way','to put it briefly','to resume','to return to the subject','to say nothing of','to start with','to sum up','to summarize','to tell the truth','to the end that','under those circumstances','unless,what is more','whatever happens','when in fact','whereas','whichever happens','while','with regards to','with this in mind'];
        var storage_ok = 'localStorage' in win;

        initApp();
        eventWireUp();

        function initApp(){
          if(storage_ok){
            if(win.localStorage.getItem('autosaved_kw') || typeof win.localStorage.getItem('autosaved_kw') !== 'undefined'){
              keyword.value = win.localStorage.getItem('autosaved_kw');
            }

            if(win.localStorage.getItem('autosaved_txt') || typeof win.localStorage.getItem('autosaved_txt') !== 'undefined'){
              content.value = win.localStorage.getItem('autosaved_txt');
            }

            if(!win.localStorage.getItem('night_mode') || typeof win.localStorage.getItem('night_mode') === 'undefined'){
              storeNightMode();

            } else if(win.localStorage.getItem('night_mode') !== 'false'){
              chk_nt_md.checked = !0;
              setNightMode();

            } else {
              setNightMode();
            }
          }

          if(keyword.value) startSEOScribe();
          if(!('URL' in win) && 'webkitURL' in win) win.URL = win.webkitURL;

          font.href = 'https://fonts.googleapis.com/css?family=Karla:400,700&amp;subset=latin-ext';
          font.rel = 'stylesheet';
          doc.head.appendChild(font);
        }

        function eventWireUp(){
          win.addEventListener('load', function(){
            doc.documentElement.setAttribute('data-font-loaded', !0);
          }, false);
          keyword.addEventListener('blur', startSEOScribe, false);
          content.addEventListener('blur', checkContent, false);
          content.addEventListener('keydown', rebounce(checkContent), false);
          btn_exp_txt.addEventListener('click', exportText, false);
          btn_exp_html.addEventListener('click', exportText, false);

          if(storage_ok){
            win.addEventListener('unload', saveToStorage, false);
            btn_save.addEventListener('click', saveToStorage, false);
            chk_nt_md.addEventListener('click', storeNightMode, false);
          }
        }

        function startSEOScribe(){
          k = keyword.value.toLowerCase();
          rel_words = [];

          if(storage_ok) win.localStorage.setItem('autosaved_kw', k);
          if(!k) return;

          getRelatedWords();
        }

        function checkContent(){
          var _paras = !!content.value ? content.value.split('\n') : [];
          var _sntcs = !!content.value && content.value.match(/[^\.!\?]+[\.!\?]+/g) ? content.value.match(/[^\.!\?]+[\.!\?]+/g) : [];
          var _wrds = !!content.value && content.value.match(/\w+/gi) ? content.value.match(/\w+/gi) : [];
          var _html = !!content.value && content.value.match(/<\/?[\w\s="/.':;#-\/\?]+>/gi) ? true : false;
          var p_count = _paras.length;
          var s_count = _sntcs.length;
          var w_count = _wrds.length;

          if(storage_ok) win.localStorage.setItem('autosaved_txt', content.value);

          wc.value = w_count;
          adjustWordCountColor(wc.value, wc);

          kc = 0;
          rc = 0;
          tc = 0;
          ssc = 0;
          spc = 0;
          syll = 0;
          kd.textContent = '0%';
          rel_d.textContent = '0%';
          trn_d.textContent = '0%';
          kfp.textContent = 'No';
          r_ease.textContent = 'N/A';
          kh.parentNode.setAttribute('hidden','');
          ss_warn.setAttribute('hidden','');
          no_hdngs.setAttribute('hidden','');
          no_links.setAttribute('hidden','');

          if(!k) return;

          kc = matchString(content.value, k);

          rel_words.forEach(function(rel_w){
            rc += matchString(content.value, rel_w);
          });

          if(_paras.length > 0){
            kfp.textContent = !!matchString(_paras[0], k) ? 'Yes' : 'No';

            _paras.forEach(function(para){
              if(para.split(' ').length < 200){
                spc++;
              }

              if((spc / p_count * 100 << 0) < 80){
                sp_warn.removeAttribute('hidden');
              } else {
                sp_warn.setAttribute('hidden','');
              }
            });
          }

          if(_sntcs.length > 0){
            _sntcs.forEach(function(sntc){
              if(sntc.split(' ').length < 20){
                ssc++;
              }

              if((ssc / s_count * 100 << 0) < 80){
                ss_warn.removeAttribute('hidden');
              } else {
                ss_warn.setAttribute('hidden','');
              }

              trn_words.forEach(function(trn_w){
                tc += matchString(sntc, trn_w);
              });
            });
          }

          kd.textContent = (kc / w_count * 100 << 0) + '%';
          rel_d.textContent = (rc / w_count * 100 << 0) + '%';
          trn_d.textContent = (tc / s_count * 100 << 0) + '%';
          adjustDensityColor(kc / w_count * 100 << 0, kd);
          adjustDensityColor(rc / w_count * 100 << 0, rel_d);

          if(!content.value) return;
          r_ease.textContent = getReadabilityScore(_sntcs, _wrds);

          if(!_html) return;
          checkHTML();
        }

        function checkHTML(){
          var _prsr = new DOMParser();
          var _doc = _prsr.parseFromString('<!doctype html><html><head><meta charset="utf-8"></head><body>' + content.value + '</body></html>','text/html');
          var _hdngs = _doc.querySelectorAll('h1,h2,h3,h4,h5,h6,header');

          if(_hdngs.length < 1){
            no_hdngs.removeAttribute('hidden');
          } else {
            no_hdngs.setAttribute('hidden','');
          }

          if(_doc.querySelectorAll('a[href]').length < 1){
            no_links.removeAttribute('hidden');
          } else {
            no_links.setAttribute('hidden','');
          }

          kh.parentNode.removeAttribute('hidden');
          hc = 0;

          [].slice.call(_hdngs).forEach(function(heading){
            if(matchString(heading.textContent, k) > 0){
              hc++;
            } else {
              for(var j = 0; j < rel_words.length; ++j){
                if(matchString(heading.textContent, rel_words[j]) > 0){
                  hc++;
                  break;
                }
              }
            }
          });

          kh.textContent = hc > 0 && hc === _hdngs.length ? 'Yes' : 'No';
        }

        function matchString(string, to_match){
          var rgx = new RegExp('\\b' + to_match + '\\b', 'gi');
          var idx = string.match(rgx);
          if(idx && idx.length > 0){
            return idx.length;
          }
          return 0;
        }

        function adjustDensityColor(val, el){
          el.style.width = val + '%';
          if(val >= 15 && val > 14){
            el.style.borderColor = 'rgba(244,67,54,.7)';
          }
          else if(val < 14 && val >= 6 && val > 0){
            el.style.borderColor = 'rgba(255,138,34,.7)';
          }
          else if(val <= 5 && val >= 4 && val > 0){
            el.style.borderColor = 'rgba(255,204,0,.7)';
          }
          else if(val < 4 && val > 0){
            el.style.borderColor = 'rgba(154,205,50,.7)';
          }
          else {
            el.style.borderColor = 'rgba(244,67,54,.7)';
          }
        }

        function adjustWordCountColor(val, el){
          el.style.width = val <= 300 ? val / 3 + '%' : '100%';
          if(val > 299){
            el.style.borderColor = 'rgba(154,205,50,.7)';
          }
          else if(val <= 299 && val > 199){
            el.style.borderColor = 'rgba(255,204,0,.7)';
          }
          else if(val <= 199 && val > 49){
            el.style.borderColor = 'rgba(255,138,34,.7)';
          }
          else if(val <= 49){
            el.style.borderColor = 'rgba(244,67,54,.7)';
          }
          else {
            el.style.borderColor = 'rgba(244,67,54,.7)';
          }
        }

        function clean(word){
          if(typeof word === 'string'){
            return word.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').toLowerCase();
          }
          return word;
        }

        function getRelatedWords(){
          var xhr = new XMLHttpRequest();
          var prep, qs;

          if(k.split(' ').length > 1){
            prep = k.split(' ').map(function(word){
              return win.encodeURIComponent(clean(word));
            });
            qs = prep.join('+');
          } else {
            qs = k;
          }

          xhr.open('GET', 'http://api.datamuse.com/words?ml=' + qs, true);
          xhr.responseType = 'json';
          xhr.onload = function(){
            if(xhr.readyState = 4 && xhr.status >= 200 && xhr.status < 300){
              rel_words = xhr.response.map(function(datum){
                return datum.word;
              });
              checkContent();
            }
          };
          xhr.onerror = xhr.onabort = xhr.ontimeout = function(){
            console.error('There was an error with the request: ' + xhr.status);
          };
          xhr.send(null);
        }

        function getLSIWords(){

        }

        function countSyllables(word){
          var _wrd = clean(word).toLowerCase();

          if(word.length <= 3) return 1;

          _wrd = _wrd.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
          _wrd = _wrd.replace(/^y/, '');
          return (_wrd.match(/[aeiouy]{1,2}/g) ? _wrd.match(/[aeiouy]{1,2}/g).length : 1);
        }

        function getReadabilityScore(sntcs, wrds){
          if(sntcs.length === 0 || wrds.length === 0) return 'N/A';
          syll = 0;
          wrds.forEach(function(wrd){
            syll += countSyllables(wrd);
          });
          return (206 - 1.015 * (wrds.length / sntcs.length) - 84 * (syll / wrds.length)).toFixed(1);
        }

        function saveToStorage(){
          if(storage_ok){
            win.localStorage.setItem('autosaved_txt', content.value);
            win.localStorage.setItem('autosaved_kw', k);
          }
        }

        function exportText(){
          var txt_type = 'text/' + ((event.target || this).getAttribute('data-txt-type') || 'plain');
          var dl_link = doc.createElement('a');
          var _blob = txt_type === 'text/html'
                    ? '<!doctype html><html><head><meta charset="utf-8"></head><body>' + content.value + '</body></html>'
                    : content.value;

          dl_link.download = (keyword.value || 'untitled')
                           + '-'
                           + (new Date().toDateString().toLowerCase().split(' ').join('-'))
                           + (txt_type === 'text/html' ? '.html' : '.txt');

          dl_link.href = createBlob(txt_type, _blob);
          dl_link.textContent = 'Download';
          dl_link.target = '_blank';
          dl_link.rel = 'noreferrer noopener nofollow';
          dl_link.style.display = 'none';
          dl_link.onclick = function(){doc.body.removeChild(this)};

          doc.body.appendChild(dl_link);
          dl_link.click();
        }

        function createBlob(mimetype, data){
          if('createObjectURL' in win.URL){
            return win.URL.createObjectURL(new Blob([data],{type: mimetype}));
          }
          return 'data:' + mimetype + ',' + win.encodeURIComponent(data);
        }

        function exportRTF(){
        }

        function exportWord(){
          //var doc = new DOCXjs();
          //doc.text('');
        }

        function exportPDF(){
          //var doc = new jsPDF();
          //doc.text(35, 25, '');
        }

        function storeNightMode(){
          if(storage_ok){
            win.localStorage.setItem('night_mode', chk_nt_md.checked);
            setNightMode();
          }
        }

        function setNightMode(){
          if(storage_ok){
            doc.documentElement.setAttribute('data-night-mode', win.localStorage.getItem('night_mode') !== 'true' ? 'off' : 'on');
          }
        }

        function rebounce(f){
          var scheduled, context, args;
          return function(){
            context = this;
            args = [];
            for (var i = 0; i < arguments.length; ++i){
              args[i] = arguments[i];
            }
            if (!!scheduled){
              win.cancelAnimationFrame(scheduled);
            }
            scheduled = win.requestAnimationFrame(function(){
              f.apply(context,args);
              scheduled = null;
            });
          }
        }

      })(window,window.document);
