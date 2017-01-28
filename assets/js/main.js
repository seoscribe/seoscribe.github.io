;(function (win, doc) {
  var root_el = doc.documentElement || doc.getElementsByTagName('html')[0];
  var body_el = doc.body || doc.getElementsByTagName('body')[0];
  var banner_el = doc.getElementsByTagName('header')[0];
  var nav_el = doc.getElementsByTagName('nav')[0];
  var menu_el = doc.getElementById('menu');
  var last_sn = [].slice.call(doc.getElementsByTagName('section'), -1)[0];
  var hdr_content = [].slice.call(doc.querySelector('header').querySelectorAll('h1,h2,a'));
  var _wh = (win.innerHeight || banner_el.clientHeight) - 64;

  init();

  function init () {
    win.addEventListener('scroll', rebounce(handleScroll), { passive: true, capture: false, once: false });
    win.addEventListener('load', handleLoad, { passive: true, capture: false, once: true });
    win.addEventListener('click', dispatchClicks, { passive: true, capture: false, once: false });
    win.console.log('%c%s', 'color:#222;background:#ffc107;font-size:18px;font-weight:bold;padding:4px;', 'Welcome to SEO Scribe');
    win.console.log('%c%s', 'color:#222;background:#ffc107;font-size:14px;padding:4px;', 'Thanks for taking an interest in what\'s under the hood. \n\n You can also check out all of our source code on Github: \n\n https://github.com/seoscribe/');
  }

  function dispatchClicks (e) {
    var evt = (e.target || this);
    switch (evt.getAttribute('data-event')) {
      case 'showMenu':
        return showMenu();
      case 'scrollToTop':
        return scrollToTop();
      default:
        return void 0;
    }
  }

  function handleLoad () {
    win.removeEventListener('load', handleLoad, { passive: true, capture: false, once: true });
    win.clearTimeout(win.connection.timer);

    asyncLoadCSS(['https://fonts.googleapis.com/css?family=Karla:400,700&amp;subset=latin-ext']);

    root_el.setAttribute('data-font-loaded', 'true');

    if (!win.connection.slow) {
      root_el.setAttribute('data-slow-connection', 'false');
      addVideo();
    }

    handleScroll();
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('https://seoscribe.net/sw.js', {
        scope: '/'
      }).then(function (registration) {
        console.info('SW registered [' + registration.scope + ']');
      }).catch(function (err) {
        console.warn('SW failed to register [' + err + ']');
      });
    } else if ('applicationCache' in win) {
      root_el.setAttribute('manifest', '/main.appcache');
    }
  }

  function handleScroll () {
    var oY = (win.scrollY || win.pageYOffset);
    var oD = ((_wh - oY) / _wh);

    hdr_content.forEach(function (el) {
      if (oD >= 0 && oD <= 1) {
        el.style.opacity = oD;
      }
    });

    if (typeof root_el.getAttribute('data-scrolled') === 'undefined') {
      return;

    } else if (oY < _wh && root_el.getAttribute('data-scrolled') === 'false') {
      return;
      
    } else if (oY >= _wh && root_el.getAttribute('data-scrolled') === 'true') {

      if (last_sn.getBoundingClientRect().top < _wh / 4) {
        root_el.setAttribute('data-footer-shown', 'true');
      } else {
        root_el.setAttribute('data-footer-shown','false');
      }

    } else if (oY >= _wh && root_el.getAttribute('data-scrolled') === 'false') {
      root_el.setAttribute('data-scrolled', 'true');

    } else if(oY < _wh && root_el.getAttribute('data-scrolled') === 'true') {
      root_el.setAttribute('data-scrolled', 'false');

    } else {
      return;
    }
  }

  function showMenu () {
    root_el.setAttribute('data-menu-open',
      (root_el.getAttribute('data-menu-open') === 'true' ? 'false' : 'true')
    );
    menu_el.setAttribute('aria-hidden',
      (menu_el.getAttribute('aria-hidden') === 'true' ? 'false' : 'true')
    );
    [].slice.call(doc.getElementsByTagName('video')).forEach(function(vid){
      if (root_el.getAttribute('data-menu-open') === 'true') {
        if (isPlaying(vid)) {
          vid.pause();
        }
      } else {
        if (!isPlaying(vid)) {
          vid.play();
        }
      }
    });
  }

  function isPlaying (media_el) {
    return !!(media_el.currentTime > 0 && !media_el.paused && !media_el.ended && media_el.readyState > 2)
  }

  function asyncLoadCSS (urls) {
    var _preloads = doc.querySelectorAll('link[rel="preload"][as="style"]');
    var i, j = 0;
    if (_preloads.length > 0) {
      i = _preloads.length;
      for (; j < i; ++j) { 
        urls.push(_preloads[j].getAttribute('href'));
      }
    }
    urls.forEach(function (url) {
      var _css = doc.createElement('link');
      _css.href = url;
      _css.rel = 'stylesheet';
      doc.head.appendChild(_css);
    });
  }

  function asyncLoadJS (urls, callback) {
    urls.forEach(function (url) {
      var _js = doc.createElement('script');
      _js.src = url;
      _js.setAttribute('async', '');
      _js.setAttribute('defer', '');
      if (typeof callback === 'function') {
        _js.addEventListener('load', callback, { passive: true, capture: false, once: true });
      }
      doc.head.appendChild(_js);
    });
  }

  function addVideo () {
    if (win.innerWidth > 768 && 'HTMLVideoElement' in win) {
      root_el.setAttribute('data-autoplay', 'true');
      banner_el.insertAdjacentHTML('afterBegin', '<div class="bg-vid"><video preload="auto" autoplay="true" autostart="true" poster="https://seoscribe.net/assets/img/perf.jpg" muted loop webkit-playsinline playsinline><source src="https://seoscribe.net/assets/vid/perf.webm" type="video/webm"><source src="https://seoscribe.net/assets/vid/perf.mp4" type="video/mp4"></video></div>');
    }
  }

  function rebounce (func) {
    var scheduled, context, args, i;
    return function () {
      context = this;
      args = [];
      i = 0;
      for (; i < arguments.length; ++i) {
        args[i] = arguments[i];
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

  function scrollToTop () {
    var sY = (win.scrollY || win.pageYOffset);
    if (sY > _wh / 10) {
      return win.requestAnimationFrame(function () {
        win.scrollTo(0, win.scrollY / 2);
        return scrollToTop();
      });
    } else {
      win.location.replace('#');
    }
  }

})(window, window.document);
