function strtotime(text, now) {
  //  discuss at: http://phpjs.org/functions/strtotime/
  //     version: 1109.2016
  // original by: Caio Ariede (http://caioariede.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Caio Ariede (http://caioariede.com)
  // improved by: A. Matías Quezada (http://amatiasq.com)
  // improved by: preuter
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Mirko Faber
  //    input by: David
  // bugfixed by: Wagner B. Soares
  // bugfixed by: Artur Tchernychev
  //        note: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
  //   example 1: strtotime('+1 day', 1129633200);
  //   returns 1: 1129719600
  //   example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
  //   returns 2: 1130425202
  //   example 3: strtotime('last month', 1129633200);
  //   returns 3: 1127041200
  //   example 4: strtotime('2009-05-04 08:30:00 GMT');
  //   returns 4: 1241425800

  var parsed, match, today, year, date, days, ranges, len, times, regex, i, fail = false;

  if (!text) {
    return fail;
  }

  // Unecessary spaces
  text = text.replace(/^\s+|\s+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\t\r\n]/g, '')
    .toLowerCase();

  // in contrast to php, js Date.parse function interprets:
  // dates given as yyyy-mm-dd as in timezone: UTC,
  // dates with "." or "-" as MDY instead of DMY
  // dates with two-digit years differently
  // etc...etc...
  // ...therefore we manually parse lots of common date formats
  match = text.match(
    /^(\d{1,4})([\-\.\/\:])(\d{1,2})([\-\.\/\:])(\d{1,4})(?:\s(\d{1,2}):(\d{2})?:?(\d{2})?)?(?:\s([A-Z]+)?)?$/);

  if (match && match[2] === match[4]) {
    if (match[1] > 1901) {
      switch (match[2]) {
      case '-':
        {
          // YYYY-M-D
          if (match[3] > 12 || match[5] > 31) {
            return fail;
          }

          return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      case '.':
        {
          // YYYY.M.D is not parsed by strtotime()
          return fail;
        }
      case '/':
        {
          // YYYY/M/D
          if (match[3] > 12 || match[5] > 31) {
            return fail;
          }

          return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      }
    } else if (match[5] > 1901) {
      switch (match[2]) {
      case '-':
        {
          // D-M-YYYY
          if (match[3] > 12 || match[1] > 31) {
            return fail;
          }

          return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      case '.':
        {
          // D.M.YYYY
          if (match[3] > 12 || match[1] > 31) {
            return fail;
          }

          return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      case '/':
        {
          // M/D/YYYY
          if (match[1] > 12 || match[3] > 31) {
            return fail;
          }

          return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      }
    } else {
      switch (match[2]) {
      case '-':
        {
          // YY-M-D
          if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
            return fail;
          }

          year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1];
          return new Date(year, parseInt(match[3], 10) - 1, match[5],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      case '.':
        {
          // D.M.YY or H.MM.SS
          if (match[5] >= 70) {
            // D.M.YY
            if (match[3] > 12 || match[1] > 31) {
              return fail;
            }

            return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
              match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
          }
          if (match[5] < 60 && !match[6]) {
            // H.MM.SS
            if (match[1] > 23 || match[3] > 59) {
              return fail;
            }

            today = new Date();
            return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
              match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000;
          }

          // invalid format, cannot be parsed
          return fail;
        }
      case '/':
        {
          // M/D/YY
          if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
            return fail;
          }

          year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5];
          return new Date(year, parseInt(match[1], 10) - 1, match[3],
            match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
        }
      case ':':
        {
          // HH:MM:SS
          if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
            return fail;
          }

          today = new Date();
          return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
            match[1] || 0, match[3] || 0, match[5] || 0) / 1000;
        }
      }
    }
  }

  // other formats and "now" should be parsed by Date.parse()
  if (text === 'now') {
    return now === null || isNaN(now) ? new Date()
      .getTime() / 1000 | 0 : now | 0;
  }
  if (!isNaN(parsed = Date.parse(text))) {
    return parsed / 1000 | 0;
  }

  date = now ? new Date(now * 1000) : new Date();
  days = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6
  };
  ranges = {
    'yea': 'FullYear',
    'mon': 'Month',
    'day': 'Date',
    'hou': 'Hours',
    'min': 'Minutes',
    'sec': 'Seconds'
  };

  function lastNext(type, range, modifier) {
    var diff, day = days[range];

    if (typeof day !== 'undefined') {
      diff = day - date.getDay();

      if (diff === 0) {
        diff = 7 * modifier;
      } else if (diff > 0 && type === 'last') {
        diff -= 7;
      } else if (diff < 0 && type === 'next') {
        diff += 7;
      }

      date.setDate(date.getDate() + diff);
    }
  }

  function process(val) {
    var splt = val.split(' '), // Todo: Reconcile this with regex using \s, taking into account browser issues with split and regexes
      type = splt[0],
      range = splt[1].substring(0, 3),
      typeIsNumber = /\d+/.test(type),
      ago = splt[2] === 'ago',
      num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

    if (typeIsNumber) {
      num *= parseInt(type, 10);
    }

    if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
      return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
    }

    if (range === 'wee') {
      return date.setDate(date.getDate() + (num * 7));
    }

    if (type === 'next' || type === 'last') {
      lastNext(type, range, num);
    } else if (!typeIsNumber) {
      return false;
    }

    return true;
  }

  times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
    '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
    '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
  regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

  match = text.match(new RegExp(regex, 'gi'));
  if (!match) {
    return fail;
  }

  for (i = 0, len = match.length; i < len; i++) {
    if (!process(match[i])) {
      return fail;
    }
  }

  // ECMAScript 5 only
  // if (!match.every(process))
  //    return false;

  return (date.getTime() / 1000);
}

function rawurlencode(str) {
  //       discuss at: http://phpjs.org/functions/rawurlencode/
  //      original by: Brett Zamir (http://brett-zamir.me)
  //         input by: travc
  //         input by: Brett Zamir (http://brett-zamir.me)
  //         input by: Michael Grier
  //         input by: Ratheous
  //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Joris
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //             note: This reflects PHP 5.3/6.0+ behavior
  //             note: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
  //             note: pages served as UTF-8
  //        example 1: rawurlencode('Kevin van Zonneveld!');
  //        returns 1: 'Kevin%20van%20Zonneveld%21'
  //        example 2: rawurlencode('http://kevin.vanzonneveld.net/');
  //        returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
  //        example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
  //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

  str = (str + '')
    .toString();

  // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
  // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .
  replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function bin2hex(s) {
  //  discuss at: http://phpjs.org/functions/bin2hex/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
  //   example 1: bin2hex('Kev');
  //   returns 1: '4b6576'
  //   example 2: bin2hex(String.fromCharCode(0x00));
  //   returns 2: '00'

  var i, l, o = '',
    n;

  s += '';

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i)
      .toString(16);
    o += n.length < 2 ? '0' + n : n;
  }

  return o;
}

function ord(string) {
  //  discuss at: http://phpjs.org/functions/ord/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K');
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536

  var str = string + '',
    code = str.charCodeAt(0);
  if (0xD800 <= code && code <= 0xDBFF) {
    // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
    var hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate, so we return its value;
      return code;
      // we could also throw an error as it is not a complete character, but someone may want to know
    }
    var low = str.charCodeAt(1);
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate, so we return its value;
    return code;
    // we could also throw an error as it is not a complete character, but someone may want to know
  }
  return code;
}

function sprintf() {
  //  discuss at: http://phpjs.org/functions/sprintf/
  // original by: Ash Searle (http://hexmen.com/blog/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Dj
  // improved by: Allidylls
  //    input by: Paulo Freitas
  //    input by: Brett Zamir (http://brett-zamir.me)
  //   example 1: sprintf("%01.2f", 123.1);
  //   returns 1: 123.10
  //   example 2: sprintf("[%10s]", 'monkey');
  //   returns 2: '[    monkey]'
  //   example 3: sprintf("[%'#10s]", 'monkey');
  //   returns 3: '[####monkey]'
  //   example 4: sprintf("%d", 123456789012345);
  //   returns 4: '123456789012345'
  //   example 5: sprintf('%-03s', 'E');
  //   returns 5: 'E00'

  var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
  var a = arguments;
  var i = 0;
  var format = a[i++];

  // pad()
  var pad = function (str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' ';
    }
    var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
      .join(chr);
    return leftJustify ? str + padding : padding + str;
  };

  // justify()
  var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
    var diff = minWidth - value.length;
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = pad(value, minWidth, customPadChar, leftJustify);
      } else {
        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
      }
    }
    return value;
  };

  // formatBaseX()
  var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0;
    prefix = prefix && number && {
      '2': '0b',
      '8': '0',
      '16': '0x'
    }[base] || '';
    value = prefix + pad(number.toString(base), precision || 0, '0', false);
    return justify(value, prefix, leftJustify, minWidth, zeroPad);
  };

  // formatString()
  var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
    if (precision != null) {
      value = value.slice(0, precision);
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
  };

  // doFormat()
  var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
    var number, prefix, method, textTransform, value;

    if (substring === '%%') {
      return '%';
    }

    // parse flags
    var leftJustify = false;
    var positivePrefix = '';
    var zeroPad = false;
    var prefixBaseX = false;
    var customPadChar = ' ';
    var flagsl = flags.length;
    for (var j = 0; flags && j < flagsl; j++) {
      switch (flags.charAt(j)) {
      case ' ':
        positivePrefix = ' ';
        break;
      case '+':
        positivePrefix = '+';
        break;
      case '-':
        leftJustify = true;
        break;
      case "'":
        customPadChar = flags.charAt(j + 1);
        break;
      case '0':
        zeroPad = true;
        customPadChar = '0';
        break;
      case '#':
        prefixBaseX = true;
        break;
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0;
    } else if (minWidth === '*') {
      minWidth = +a[i++];
    } else if (minWidth.charAt(0) == '*') {
      minWidth = +a[minWidth.slice(1, -1)];
    } else {
      minWidth = +minWidth;
    }

    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth;
      leftJustify = true;
    }

    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite');
    }

    if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
    } else if (precision === '*') {
      precision = +a[i++];
    } else if (precision.charAt(0) == '*') {
      precision = +a[precision.slice(1, -1)];
    } else {
      precision = +precision;
    }

    // grab value using valueIndex if required?
    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

    switch (type) {
    case 's':
      return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
    case 'c':
      return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
    case 'b':
      return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'o':
      return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'x':
      return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'X':
      return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
        .toUpperCase();
    case 'u':
      return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    case 'i':
    case 'd':
      number = +value || 0;
      // Plain Math.round doesn't just truncate
      number = Math.round(number - number % 1);
      prefix = number < 0 ? '-' : positivePrefix;
      value = prefix + pad(String(Math.abs(number)), precision, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    case 'e':
    case 'E':
    case 'f': // Should handle locales (as per setlocale)
    case 'F':
    case 'g':
    case 'G':
      number = +value;
      prefix = number < 0 ? '-' : positivePrefix;
      method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
      textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
      value = prefix + Math.abs(number)[method](precision);
      return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
    default:
      return substring;
    }
  };

  return format.replace(regex, doFormat);
}

function strftime(fmt, timestamp) {
  //       discuss at: http://phpjs.org/functions/strftime/
  //      original by: Blues (http://tech.bluesmoon.info/)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //         input by: Alex
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      improved by: Brett Zamir (http://brett-zamir.me)
  //       depends on: setlocale
  //             note: Uses global: php_js to store locale info
  //        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
  //        returns 1: 'Tuesday'

  this.php_js = this.php_js || {};
  // ensure setup of localization variables takes place
  this.setlocale('LC_ALL', 0);
  // END REDUNDANT
  var phpjs = this.php_js;

  // BEGIN STATIC
  var _xPad = function (x, pad, r) {
    if (typeof r === 'undefined') {
      r = 10;
    }
    for (; parseInt(x, 10) < r && r > 1; r /= 10) {
      x = pad.toString() + x;
    }
    return x.toString();
  };

  var locale = phpjs.localeCategories.LC_TIME;
  var locales = phpjs.locales;
  var lc_time = locales[locale].LC_TIME;

  var _formats = {
    a: function (d) {
      return lc_time.a[d.getDay()];
    },
    A: function (d) {
      return lc_time.A[d.getDay()];
    },
    b: function (d) {
      return lc_time.b[d.getMonth()];
    },
    B: function (d) {
      return lc_time.B[d.getMonth()];
    },
    C: function (d) {
      return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
    },
    d: ['getDate', '0'],
    e: ['getDate', ' '],
    g: function (d) {
      return _xPad(parseInt(this.G(d) / 100, 10), 0);
    },
    G: function (d) {
      var y = d.getFullYear();
      var V = parseInt(_formats.V(d), 10);
      var W = parseInt(_formats.W(d), 10);

      if (W > V) {
        y++;
      } else if (W === 0 && V >= 52) {
        y--;
      }

      return y;
    },
    H: ['getHours', '0'],
    I: function (d) {
      var I = d.getHours() % 12;
      return _xPad(I === 0 ? 12 : I, 0);
    },
    j: function (d) {
      var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
      // Line differs from Yahoo implementation which would be equivalent to replacing it here with:
      ms += d.getTimezoneOffset() * 60000;
      // ms = new Date('' + d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' GMT') - ms;
      var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
      return _xPad(doy, 0, 100);
    },
    k: ['getHours', '0'],
    // not in PHP, but implemented here (as in Yahoo)
    l: function (d) {
      var l = d.getHours() % 12;
      return _xPad(l === 0 ? 12 : l, ' ');
    },
    m: function (d) {
      return _xPad(d.getMonth() + 1, 0);
    },
    M: ['getMinutes', '0'],
    p: function (d) {
      return lc_time.p[d.getHours() >= 12 ? 1 : 0];
    },
    P: function (d) {
      return lc_time.P[d.getHours() >= 12 ? 1 : 0];
    },
    s: function (d) {
      // Yahoo uses return parseInt(d.getTime()/1000, 10);
      return Date.parse(d) / 1000;
    },
    S: ['getSeconds', '0'],
    u: function (d) {
      var dow = d.getDay();
      return ((dow === 0) ? 7 : dow);
    },
    U: function (d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 6 - d.getDay();
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0);
    },
    V: function (d) {
      var woy = parseInt(_formats.W(d), 10);
      var dow1_1 = (new Date('' + d.getFullYear() + '/1/1'))
        .getDay();
      // First week is 01 and not 00 as in the case of %U and %W,
      // so we add 1 to the final result except if day 1 of the year
      // is a Monday (then %W returns 01).
      // We also need to subtract 1 if the day 1 of the year is
      // Friday-Sunday, so the resulting equation becomes:
      var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
      if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31'))
        .getDay() < 4) {
        idow = 1;
      } else if (idow === 0) {
        idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
      }
      return _xPad(idow, 0);
    },
    w: 'getDay',
    W: function (d) {
      var doy = parseInt(_formats.j(d), 10);
      var rdow = 7 - _formats.u(d);
      var woy = parseInt((doy + rdow) / 7, 10);
      return _xPad(woy, 0, 10);
    },
    y: function (d) {
      return _xPad(d.getFullYear() % 100, 0);
    },
    Y: 'getFullYear',
    z: function (d) {
      var o = d.getTimezoneOffset();
      var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
      var M = _xPad(o % 60, 0);
      return (o > 0 ? '-' : '+') + H + M;
    },
    Z: function (d) {
      return d.toString()
        .replace(/^.*\(([^)]+)\)$/, '$1');
      /*
      // Yahoo's: Better?
      var tz = d.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, '$2').replace(/[a-z ]/g, '');
      if(tz.length > 4) {
        tz = Dt.formats.z(d);
      }
      return tz;
      */
    },
    '%': function (d) {
      return '%';
    }
  };
  // END STATIC
  /* Fix: Locale alternatives are supported though not documented in PHP; see http://linux.die.net/man/3/strptime
Ec
EC
Ex
EX
Ey
EY
Od or Oe
OH
OI
Om
OM
OS
OU
Ow
OW
Oy
  */

  var _date = ((typeof timestamp === 'undefined') ? new Date() : // Not provided
    (typeof timestamp === 'object') ? new Date(timestamp) : // Javascript Date()
    new Date(timestamp * 1000) // PHP API expects UNIX timestamp (auto-convert to int)
  );

  var _aggregates = {
    c: 'locale',
    D: '%m/%d/%y',
    F: '%y-%m-%d',
    h: '%b',
    n: '\n',
    r: 'locale',
    R: '%H:%M',
    t: '\t',
    T: '%H:%M:%S',
    x: 'locale',
    X: 'locale'
  };

  // First replace aggregates (run in a loop because an agg may be made up of other aggs)
  while (fmt.match(/%[cDFhnrRtTxX]/)) {
    fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
      var f = _aggregates[m1];
      return (f === 'locale' ? lc_time[m1] : f);
    });
  }

  // Now replace formats - we need a closure so that the date object gets passed through
  var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
    var f = _formats[m1];
    if (typeof f === 'string') {
      return _date[f]();
    } else if (typeof f === 'function') {
      return f(_date);
    } else if (typeof f === 'object' && typeof f[0] === 'string') {
      return _xPad(_date[f[0]](), f[1]);
    } else {
      // Shouldn't reach here
      return m1;
    }
  });
  return str;
}

function htmlentities(string, quote_style, charset, double_encode) {
  //  discuss at: http://phpjs.org/functions/htmlentities/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: nobbler
  // improved by: Jack
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
  // bugfixed by: Onno Marsman
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //    input by: Ratheous
  //  depends on: get_html_translation_table
  //   example 1: htmlentities('Kevin & van Zonneveld');
  //   returns 1: 'Kevin &amp; van Zonneveld'
  //   example 2: htmlentities("foo'bar","ENT_QUOTES");
  //   returns 2: 'foo&#039;bar'

  var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
    symbol = '';
  string = string == null ? '' : string + '';

  if (!hash_map) {
    return false;
  }

  if (quote_style && quote_style === 'ENT_QUOTES') {
    hash_map["'"] = '&#039;';
  }

  if ( !! double_encode || double_encode == null) {
    for (symbol in hash_map) {
      if (hash_map.hasOwnProperty(symbol)) {
        string = string.split(symbol)
          .join(hash_map[symbol]);
      }
    }
  } else {
    string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
      for (symbol in hash_map) {
        if (hash_map.hasOwnProperty(symbol)) {
          text = text.split(symbol)
            .join(hash_map[symbol]);
        }
      }

      return text + entity;
    });
  }

  return string;
}

function get_html_translation_table(table, quote_style) {
  //  discuss at: http://phpjs.org/functions/get_html_translation_table/
  // original by: Philip Peterson
  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: noname
  // bugfixed by: Alex
  // bugfixed by: Marco
  // bugfixed by: madipta
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: T.Wild
  // improved by: KELAN
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: Frank Forte
  //    input by: Ratheous
  //        note: It has been decided that we're not going to add global
  //        note: dependencies to php.js, meaning the constants are not
  //        note: real constants, but strings instead. Integers are also supported if someone
  //        note: chooses to create the constants themselves.
  //   example 1: get_html_translation_table('HTML_SPECIALCHARS');
  //   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}

  var entities = {},
    hash_map = {},
    decimal;
  var constMappingTable = {},
    constMappingQuoteStyle = {};
  var useTable = {},
    useQuoteStyle = {};

  // Translate arguments
  constMappingTable[0] = 'HTML_SPECIALCHARS';
  constMappingTable[1] = 'HTML_ENTITIES';
  constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
  constMappingQuoteStyle[2] = 'ENT_COMPAT';
  constMappingQuoteStyle[3] = 'ENT_QUOTES';

  useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
  useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() :
    'ENT_COMPAT';

  if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
    throw new Error('Table: ' + useTable + ' not supported');
    // return false;
  }

  entities['38'] = '&amp;';
  if (useTable === 'HTML_ENTITIES') {
    entities['160'] = '&nbsp;';
    entities['161'] = '&iexcl;';
    entities['162'] = '&cent;';
    entities['163'] = '&pound;';
    entities['164'] = '&curren;';
    entities['165'] = '&yen;';
    entities['166'] = '&brvbar;';
    entities['167'] = '&sect;';
    entities['168'] = '&uml;';
    entities['169'] = '&copy;';
    entities['170'] = '&ordf;';
    entities['171'] = '&laquo;';
    entities['172'] = '&not;';
    entities['173'] = '&shy;';
    entities['174'] = '&reg;';
    entities['175'] = '&macr;';
    entities['176'] = '&deg;';
    entities['177'] = '&plusmn;';
    entities['178'] = '&sup2;';
    entities['179'] = '&sup3;';
    entities['180'] = '&acute;';
    entities['181'] = '&micro;';
    entities['182'] = '&para;';
    entities['183'] = '&middot;';
    entities['184'] = '&cedil;';
    entities['185'] = '&sup1;';
    entities['186'] = '&ordm;';
    entities['187'] = '&raquo;';
    entities['188'] = '&frac14;';
    entities['189'] = '&frac12;';
    entities['190'] = '&frac34;';
    entities['191'] = '&iquest;';
    entities['192'] = '&Agrave;';
    entities['193'] = '&Aacute;';
    entities['194'] = '&Acirc;';
    entities['195'] = '&Atilde;';
    entities['196'] = '&Auml;';
    entities['197'] = '&Aring;';
    entities['198'] = '&AElig;';
    entities['199'] = '&Ccedil;';
    entities['200'] = '&Egrave;';
    entities['201'] = '&Eacute;';
    entities['202'] = '&Ecirc;';
    entities['203'] = '&Euml;';
    entities['204'] = '&Igrave;';
    entities['205'] = '&Iacute;';
    entities['206'] = '&Icirc;';
    entities['207'] = '&Iuml;';
    entities['208'] = '&ETH;';
    entities['209'] = '&Ntilde;';
    entities['210'] = '&Ograve;';
    entities['211'] = '&Oacute;';
    entities['212'] = '&Ocirc;';
    entities['213'] = '&Otilde;';
    entities['214'] = '&Ouml;';
    entities['215'] = '&times;';
    entities['216'] = '&Oslash;';
    entities['217'] = '&Ugrave;';
    entities['218'] = '&Uacute;';
    entities['219'] = '&Ucirc;';
    entities['220'] = '&Uuml;';
    entities['221'] = '&Yacute;';
    entities['222'] = '&THORN;';
    entities['223'] = '&szlig;';
    entities['224'] = '&agrave;';
    entities['225'] = '&aacute;';
    entities['226'] = '&acirc;';
    entities['227'] = '&atilde;';
    entities['228'] = '&auml;';
    entities['229'] = '&aring;';
    entities['230'] = '&aelig;';
    entities['231'] = '&ccedil;';
    entities['232'] = '&egrave;';
    entities['233'] = '&eacute;';
    entities['234'] = '&ecirc;';
    entities['235'] = '&euml;';
    entities['236'] = '&igrave;';
    entities['237'] = '&iacute;';
    entities['238'] = '&icirc;';
    entities['239'] = '&iuml;';
    entities['240'] = '&eth;';
    entities['241'] = '&ntilde;';
    entities['242'] = '&ograve;';
    entities['243'] = '&oacute;';
    entities['244'] = '&ocirc;';
    entities['245'] = '&otilde;';
    entities['246'] = '&ouml;';
    entities['247'] = '&divide;';
    entities['248'] = '&oslash;';
    entities['249'] = '&ugrave;';
    entities['250'] = '&uacute;';
    entities['251'] = '&ucirc;';
    entities['252'] = '&uuml;';
    entities['253'] = '&yacute;';
    entities['254'] = '&thorn;';
    entities['255'] = '&yuml;';
  }

  if (useQuoteStyle !== 'ENT_NOQUOTES') {
    entities['34'] = '&quot;';
  }
  if (useQuoteStyle === 'ENT_QUOTES') {
    entities['39'] = '&#39;';
  }
  entities['60'] = '&lt;';
  entities['62'] = '&gt;';

  // ascii decimals to real symbols
  for (decimal in entities) {
    if (entities.hasOwnProperty(decimal)) {
      hash_map[String.fromCharCode(decimal)] = entities[decimal];
    }
  }

  return hash_map;
}

function setlocale(category, locale) {
  //  discuss at: http://phpjs.org/functions/setlocale/
  // original by: Brett Zamir (http://brett-zamir.me)
  // original by: Blues at http://hacks.bluesmoon.info/strftime/strftime.js
  // original by: YUI Library: http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html
  //  depends on: getenv
  //        note: Is extensible, but currently only implements locales en,
  //        note: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
  //        note: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
  //        note: Uses global: php_js to store locale info
  //        note: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
  //   example 1: setlocale('LC_ALL', 'en_US');
  //   returns 1: 'en_US'

  var categ = '',
    cats = [],
    i = 0,
    d = this.window.document;

  // BEGIN STATIC
  var _copy = function _copy(orig) {
    if (orig instanceof RegExp) {
      return new RegExp(orig);
    } else if (orig instanceof Date) {
      return new Date(orig);
    }
    var newObj = {};
    for (var i in orig) {
      if (typeof orig[i] === 'object') {
        newObj[i] = _copy(orig[i]);
      } else {
        newObj[i] = orig[i];
      }
    }
    return newObj;
  };

  // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
  // See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
  // https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
  // not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
  // The function name indicates the number of plural forms (nplural)
  // Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
  // including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
  // and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
  var _nplurals1 = function (n) {
    // e.g., Japanese
    return 0;
  };
  var _nplurals2a = function (n) {
    // e.g., English
    return n !== 1 ? 1 : 0;
  };
  var _nplurals2b = function (n) {
    // e.g., French
    return n > 1 ? 1 : 0;
  };
  var _nplurals2c = function (n) {
    // e.g., Icelandic (MDC)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
  };
  var _nplurals3a = function (n) {
    // e.g., Latvian (MDC has a different order from gettext)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
  };
  var _nplurals3b = function (n) {
    // e.g., Scottish Gaelic
    return n === 1 ? 0 : n === 2 ? 1 : 2;
  };
  var _nplurals3c = function (n) {
    // e.g., Romanian
    return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
  };
  var _nplurals3d = function (n) {
    // e.g., Lithuanian (MDC has a different order from gettext)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  };
  var _nplurals3e = function (n) {
    // e.g., Croatian
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 :
      2;
  };
  var _nplurals3f = function (n) {
    // e.g., Slovak
    return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
  };
  var _nplurals3g = function (n) {
    // e.g., Polish
    return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  };
  var _nplurals3h = function (n) {
    // e.g., Macedonian (MDC)
    return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
  };
  var _nplurals4a = function (n) {
    // e.g., Slovenian
    return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
  };
  var _nplurals4b = function (n) {
    // e.g., Maltese (MDC)
    return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
  };
  var _nplurals5 = function (n) {
    // e.g., Irish Gaeilge (MDC)
    return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
  };
  var _nplurals6 = function (n) {
    // e.g., Arabic (MDC) - Per MDC puts 0 as last group
    return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <=
      99 ? 3 : 4;
  };
  // END STATIC
  // BEGIN REDUNDANT
  try {
    this.php_js = this.php_js || {};
  } catch (e) {
    this.php_js = {};
  }

  var phpjs = this.php_js;

  // Reconcile Windows vs. *nix locale names?
  // Allow different priority orders of languages, esp. if implement gettext as in
  //     LANGUAGE env. var.? (e.g., show German if French is not available)
  if (!phpjs.locales) {
    // Can add to the locales
    phpjs.locales = {};

    phpjs.locales.en = {
      'LC_COLLATE': // For strcoll

      function (str1, str2) {
        // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
        return (str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1);
      },
      'LC_CTYPE': {
        // Need to change any of these for English as opposed to C?
        an: /^[A-Za-z\d]+$/g,
        al: /^[A-Za-z]+$/g,
        ct: /^[\u0000-\u001F\u007F]+$/g,
        dg: /^[\d]+$/g,
        gr: /^[\u0021-\u007E]+$/g,
        lw: /^[a-z]+$/g,
        pr: /^[\u0020-\u007E]+$/g,
        pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
        sp: /^[\f\n\r\t\v ]+$/g,
        up: /^[A-Z]+$/g,
        xd: /^[A-Fa-f\d]+$/g,
        CODESET: 'UTF-8',
        // Used by sql_regcase
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      'LC_TIME': {
        // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December'
        ],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      },
      // Assuming distinction between numeric and monetary is thus:
      // See below for C locale
      'LC_MONETARY': {
        // original by Windows "english" (English_United States.1252) locale
        int_curr_symbol: 'USD',
        currency_symbol: '$',
        mon_decimal_point: '.',
        mon_thousands_sep: ',',
        mon_grouping: [3],
        // use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
        positive_sign: '',
        negative_sign: '-',
        int_frac_digits: 2,
        // Fractional digits only for money defaults?
        frac_digits: 2,
        p_cs_precedes: 1,
        // positive currency symbol follows value = 0; precedes value = 1
        p_sep_by_space: 0,
        // 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
        n_cs_precedes: 1,
        // see p_cs_precedes
        n_sep_by_space: 0,
        // see p_sep_by_space
        p_sign_posn: 3,
        // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
        n_sign_posn: 0 // see p_sign_posn
      },
      'LC_NUMERIC': {
        // original by Windows "english" (English_United States.1252) locale
        decimal_point: '.',
        thousands_sep: ',',
        grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
      },
      'LC_MESSAGES': {
        YESEXPR: '^[yY].*',
        NOEXPR: '^[nN].*',
        YESSTR: '',
        NOSTR: ''
      },
      nplurals: _nplurals2a
    };
    phpjs.locales.en_US = _copy(phpjs.locales.en);
    phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
    phpjs.locales.en_US.LC_TIME.x = '%D';
    phpjs.locales.en_US.LC_TIME.X = '%r';
    // The following are original by *nix settings
    phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
    phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
    phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
    phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
    phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
    phpjs.locales.en_US.LC_NUMERIC.grouping = [];

    phpjs.locales.en_GB = _copy(phpjs.locales.en);
    phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

    phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
    // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
    phpjs.locales.C = _copy(phpjs.locales.en);
    phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
    phpjs.locales.C.LC_MONETARY = {
      int_curr_symbol: '',
      currency_symbol: '',
      mon_decimal_point: '',
      mon_thousands_sep: '',
      mon_grouping: [],
      p_cs_precedes: 127,
      p_sep_by_space: 127,
      n_cs_precedes: 127,
      n_sep_by_space: 127,
      p_sign_posn: 127,
      n_sign_posn: 127,
      positive_sign: '',
      negative_sign: '',
      int_frac_digits: 127,
      frac_digits: 127
    };
    phpjs.locales.C.LC_NUMERIC = {
      decimal_point: '.',
      thousands_sep: '',
      grouping: []
    };
    // D_T_FMT
    phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y';
    // D_FMT
    phpjs.locales.C.LC_TIME.x = '%m/%d/%y';
    // T_FMT
    phpjs.locales.C.LC_TIME.X = '%H:%M:%S';
    phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
    phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

    phpjs.locales.fr = _copy(phpjs.locales.en);
    phpjs.locales.fr.nplurals = _nplurals2b;
    phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct',
      'nov', 'd\u00E9c'
    ];
    phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt',
      'septembre', 'octobre', 'novembre', 'd\u00E9cembre'
    ];
    phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
    phpjs.locales.fr.LC_TIME.p = ['', ''];
    phpjs.locales.fr.LC_TIME.P = ['', ''];
    phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
    phpjs.locales.fr.LC_TIME.X = '%T';

    phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
    phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
  }
  if (!phpjs.locale) {
    phpjs.locale = 'en_US';
    var NS_XHTML = 'http://www.w3.org/1999/xhtml';
    var NS_XML = 'http://www.w3.org/XML/1998/namespace';
    if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
      if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML,
        'html')[0].getAttributeNS(NS_XML, 'lang')) {
        phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
      } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) {
        // XHTML 1.0 only
        phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
      }
    } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
      phpjs.locale = d.getElementsByTagName('html')[0].lang;
    }
  }
  // PHP-style
  phpjs.locale = phpjs.locale.replace('-', '_');
  // Fix locale if declared locale hasn't been defined
  if (!(phpjs.locale in phpjs.locales)) {
    if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
      phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
    }
  }

  if (!phpjs.localeCategories) {
    phpjs.localeCategories = {
      'LC_COLLATE': phpjs.locale,
      // for string comparison, see strcoll()
      'LC_CTYPE': phpjs.locale,
      // for character classification and conversion, for example strtoupper()
      'LC_MONETARY': phpjs.locale,
      // for localeconv()
      'LC_NUMERIC': phpjs.locale,
      // for decimal separator (See also localeconv())
      'LC_TIME': phpjs.locale,
      // for date and time formatting with strftime()
      'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
    };
  }
  // END REDUNDANT
  if (locale === null || locale === '') {
    locale = this.getenv(category) || this.getenv('LANG');
  } else if (Object.prototype.toString.call(locale) === '[object Array]') {
    for (i = 0; i < locale.length; i++) {
      if (!(locale[i] in this.php_js.locales)) {
        if (i === locale.length - 1) {
          // none found
          return false;
        }
        continue;
      }
      locale = locale[i];
      break;
    }
  }

  // Just get the locale
  if (locale === '0' || locale === 0) {
    if (category === 'LC_ALL') {
      for (categ in this.php_js.localeCategories) {
        // Add ".UTF-8" or allow ".@latint", etc. to the end?
        cats.push(categ + '=' + this.php_js.localeCategories[categ]);
      }
      return cats.join(';');
    }
    return this.php_js.localeCategories[category];
  }

  if (!(locale in this.php_js.locales)) {
    // Locale not found
    return false;
  }

  // Set and get locale
  if (category === 'LC_ALL') {
    for (categ in this.php_js.localeCategories) {
      this.php_js.localeCategories[categ] = locale;
    }
  } else {
    this.php_js.localeCategories[category] = locale;
  }
  return locale;
}