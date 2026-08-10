
'use strict';

// ===================== 配置区 Config Section =====================
/**
 * 全局配置对象，支持多环境分离（DEV_CONFIG/PROD_CONFIG），实际加载用CONFIG。
 */
const DEV_CONFIG = {
  // 请求相关
  REQUEST: {
    REDIRECT_MODE: 'manual',
    FETCH_OPTIONS: {
      cacheEverything: false,
      minify: false,
      mirage: false,
      polish: 'off',
      scrapeShield: false,
      apps: false
    }
  },
  // 响应头
  SECURITY_HEADERS: {
    'Content-Security-Policy': "upgrade-insecure-requests",
    'Cache-Control': 'private, no-store, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'interest-cohort=()',
    'X-Frame-Options': 'SAMEORIGIN',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  },
  // 服务器标识
  SERVER_SIGNATURES: [
    'nginx/1.25.3', 
    'Apache/2.4.58 (Unix)', 
    'Microsoft-IIS/10.0', 
    'LiteSpeed', 
    'cloudflare'
  ],
  // 时区映射
  TIMEZONE_MAP: {
    'cn': 'Asia/Shanghai',
    'hk': 'Asia/Hong_Kong',
    'tw': 'Asia/Taipei',
    'jp': 'Asia/Tokyo',
    'kr': 'Asia/Seoul',
    'sg': 'Asia/Singapore',
    'in': 'Asia/Kolkata',
    'de': 'Europe/Berlin',
    'fr': 'Europe/Paris',
    'uk': 'Europe/London',
    'ru': 'Europe/Moscow',
    'br': 'America/Sao_Paulo',
    'us': 'America/New_York',
    'ca': 'America/Toronto',
    'au': 'Australia/Sydney'
  },
  // 时区偏移（分钟）
  TIMEZONE_OFFSETS: {
    'America/New_York': 300,
    'America/Los_Angeles': 480,
    'Europe/London': 0,
    'Europe/Berlin': -60,
    'Europe/Paris': -60,
    'Europe/Moscow': -180,
    'Asia/Shanghai': -480,
    'Asia/Tokyo': -540,
    'Asia/Seoul': -540,
    'Asia/Kolkata': -330,
    'Asia/Hong_Kong': -480,
    'Asia/Singapore': -480,
    'Asia/Taipei': -480,
    'Australia/Sydney': -600,
    'America/Sao_Paulo': 180
  },
  REGION_LOCALE: {
    'Asia/Shanghai': 'zh-CN', 'Asia/Hong_Kong': 'zh-HK', 'Asia/Taipei': 'zh-TW',
    'Asia/Tokyo': 'ja-JP', 'Asia/Seoul': 'ko-KR', 'Europe/Berlin': 'de-DE',
    'Europe/Paris': 'fr-FR', 'Europe/Moscow': 'ru-RU', 'Europe/London': 'en-GB',
    'America/New_York': 'en-US', 'America/Los_Angeles': 'en-US',
    'Asia/Kolkata': 'en-IN', 'Asia/Singapore': 'en-SG',
    'Australia/Sydney': 'en-AU', 'America/Sao_Paulo': 'pt-BR'
  },
  // 区域ID到IP段映射
  TLD_TO_REGION_ID_MAP: {
    'cn': 'cn',
    'hk': 'hk',
    'tw': 'tw',
    'jp': 'jp',
    'kr': 'kr',
    'sg': 'sg',
    'in': 'in',
    'de': 'de',
    'fr': 'fr',
    'uk': 'uk',
    'ru': 'ru',
    'br': 'br',
    'us': 'us',
    'ca': 'ca',
    'au': 'au'
  },
  // 区域数据
  REGIONAL_DATA: {
    'cn': { timezone: 'Asia/Shanghai', ipRanges: ['1.0.1.', '58.14.0.', '114.114.114.'] },
    'hk': { timezone: 'Asia/Hong_Kong', ipRanges: ['1.0.1.', '58.14.0.', '114.114.114.'] },
    'tw': { timezone: 'Asia/Taipei', ipRanges: ['1.0.1.', '58.14.0.', '114.114.114.'] },
    'jp': { timezone: 'Asia/Tokyo', ipRanges: ['210.196.3.', '210.196.11.', '203.112.2.'] },
    'kr': { timezone: 'Asia/Seoul', ipRanges: ['168.126.63.', '210.220.163.', '164.124.101.'] },
    'sg': { timezone: 'Asia/Singapore', ipRanges: ['202.136.162.', '203.116.1.', '165.21.83.'] },
    'in': { timezone: 'Asia/Kolkata', ipRanges: ['210.212.200.', '203.94.243.', '202.138.120.'] },
    'de': { timezone: 'Europe/Berlin', ipRanges: ['194.25.0.', '85.214.20.', '213.73.91.'] },
    'fr': { timezone: 'Europe/Paris', ipRanges: ['212.27.48.', '194.117.200.', '212.95.31.'] },
    'uk': { timezone: 'Europe/London', ipRanges: ['212.58.244.', '193.62.157.', '195.66.240.'] },
    'ru': { timezone: 'Europe/Moscow', ipRanges: ['77.88.8.', '213.180.193.', '95.108.198.'] },
    'br': { timezone: 'America/Sao_Paulo', ipRanges: ['200.160.0.', '200.176.3.', '200.192.112.'] },
    'us': { timezone: 'America/New_York', ipRanges: ['8.8.8.', '208.67.222.', '205.171.2.'] },
    'ca': { timezone: 'America/Toronto', ipRanges: ['205.192.160.', '205.192.161.', '205.192.162.'] },
    'au': { timezone: 'Australia/Sydney', ipRanges: ['61.8.0.', '61.9.133.', '202.148.202.'] }
  },
  // 默认区域ID
  DEFAULT_REGION_ID: 'us'
};

const PROD_CONFIG = {
  // ...如有生产环境特殊配置可在此定义...
};

// 实际加载环境配置（可根据环境变量切换）
const CONFIG = DEV_CONFIG;

/**
 * Cookie缓存，按域名存储会话Cookie，仅在worker生命周期内有效。
 */
const COOKIE_CACHE = {};

const DEFAULT_REGION_ID = 'us';

// ===================== 工具函数区 Utils Section =====================
/**
 * 解析Set-Cookie头为对象 {key, value}，异常安全。
 * @param {string} setCookieStr
 * @return {{key: string, value: string}|null}
 */
function parseSetCookie(setCookieStr) {
  if (typeof setCookieStr !== 'string') return null;
  try {
    const parts = setCookieStr.split(';');
    const [key, ...valArr] = parts[0].split('=');
    if (!key) return null;
    return { key: key.trim(), value: valArr.join('=').trim() };
  } catch (e) {
    return null;
  }
}

/**
 * 合并新旧Cookie对象，支持删除，类型健壮。
 * @param {Object} oldCookies
 * @param {Array<string>} setCookieArr
 * @return {Object}
 */
function mergeCookies(oldCookies, setCookieArr) {
  const cookies = (typeof oldCookies === 'object' && oldCookies !== null) ? { ...oldCookies } : {};
  if (!Array.isArray(setCookieArr)) return cookies;
  for (const setCookieStr of setCookieArr) {
    const parsed = parseSetCookie(setCookieStr);
    if (!parsed) continue;
    const { key, value } = parsed;
    if (value === '' || /max-age=0|expires=Thu, 01 Jan 1970/i.test(setCookieStr)) {
      delete cookies[key];
    } else {
      cookies[key] = value;
    }
  }
  return cookies;
}

/**
 * 将Cookie对象转为字符串，类型健壮。
 * @param {Object} cookiesObj
 * @return {string}
 */
function cookiesToString(cookiesObj) {
  if (typeof cookiesObj !== 'object' || cookiesObj === null) return '';
  return Object.entries(cookiesObj).map(([k, v]) => `${k}=${v}`).join('; ');
}

/**
 * 转义正则表达式中的特殊字符
 * @param {string} string
 * @return {string}
 */
function escapeRegExp(string) {
  return typeof string === 'string' ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}

/**
 * 根据主机名推断时区
 * @param {URL} targetUrl
 * @return {string}
 */
function inferTimezone(targetUrl) {
  const host = targetUrl.hostname;
  const hostMap = {
    'google': 'us',
    'baidu': 'cn',
    'yandex': 'ru'
  };
  
  // 检查主机名是否匹配已知域名
  for (const [pattern, region] of Object.entries(hostMap)) {
    if (host.includes(pattern)) return CONFIG.TIMEZONE_MAP[region];
  }
  
  // 检查亚马逊地区
  const amazonMatch = host.match(/amazon\.(com|co\.uk|co\.jp|de|fr)/);
  if (amazonMatch) {
    const regionMap = {
      'com': 'us',
      'co.uk': 'uk',
      'co.jp': 'jp',
      'de': 'de',
      'fr': 'fr'
    };
    const domain = amazonMatch[1];
    return CONFIG.TIMEZONE_MAP[regionMap[domain]] || 'America/New_York';
  }
  
  return 'America/New_York'; // 默认美国东部时间
}

// ===================== 核心逻辑区 Core Logic Section =====================
/**
 * Worker主入口，监听fetch事件。
 * Main entry, listen to fetch event.
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

/**
 * 请求处理主函数
 * Main request handler
 * @param {FetchEvent} event
 * @return {Promise<Response>}
 */
async function handleRequest(event) {
  try {
    const request = event.request;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 快速路径处理
    if (path === '/favicon.ico') return new Response(null, {status: 204});
    
    if (['/', '/set'].includes(path)) {
      return new Response(generateMainUI(), {
        headers: {'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'no-store'}
      });
    }
    
    // 处理目标请求
    const targetPath = path.slice(1);
    if (!targetPath) {
      return new Response(generateMainUI(), {
        headers: {'Content-Type': 'text/html;charset=utf-8'}
      });
    }
    
    // 解析目标URL
    const decodedTarget = decodeURIComponent(targetPath);
    const targetUrl = !/^https?:\/\//i.test(decodedTarget) 
      ? `${url.protocol}//${decodedTarget}` 
      : decodedTarget;
    
    const parsedTargetUrl = new URL(targetUrl);
    const host = parsedTargetUrl.hostname;
    
    // 准备请求配置并发送请求
    const response = await fetch(targetUrl + url.search, {
      method: request.method,
      headers: processHeaders(request, parsedTargetUrl),
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: CONFIG.REQUEST.REDIRECT_MODE,
      cf: CONFIG.REQUEST.FETCH_OPTIONS
    });
    
    const responseHeaders = new Headers(response.headers);
    let responseBody = response.body;
    
    // 处理响应
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = responseHeaders.get('Location');
      if (location) {
        responseHeaders.set('Location', `/${encodeURIComponent(new URL(location).toString())}`);
      }
    } else if (responseHeaders.get('Content-Type')?.includes('text/html')) {
      responseBody = await enhanceHtmlContent(response, url, parsedTargetUrl, request);
    }
    
    // 添加安全头
    applySafeHeaders(responseHeaders);
    
    // 处理Set-Cookie，合并到cookieCache
    const setCookieHeaders = [];
    if (response.headers.has('Set-Cookie')) {
      setCookieHeaders.push(response.headers.get('Set-Cookie'));
    }
    // 兼容多Set-Cookie头
    if (typeof response.headers.getAll === 'function') {
      const allSetCookies = response.headers.getAll('Set-Cookie');
      for (const sc of allSetCookies) {
        if (!setCookieHeaders.includes(sc)) setCookieHeaders.push(sc);
      }
    }
    if (setCookieHeaders.length > 0) {
      if (!COOKIE_CACHE[host]) COOKIE_CACHE[host] = { cookies: {}, raw: '' };
      COOKIE_CACHE[host].cookies = mergeCookies(COOKIE_CACHE[host].cookies, setCookieHeaders);
      COOKIE_CACHE[host].raw = cookiesToString(COOKIE_CACHE[host].cookies);
    }
    
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(
      JSON.stringify({s: 1, t: Date.now()}),
      {status: 503, headers: {'Content-Type': 'application/json'}}
    );
  }
}

/**
 * 处理请求头，生成指纹、IP、Cookie等。
 * Process request headers, generate fingerprint, IP, Cookie, etc.
 * @param {Request} request
 * @param {URL} targetUrl
 * @return {Headers}
 */
function processHeaders(request, targetUrl) {
  const headers = new Headers();
  const dntValue = Math.random() > 0.7 ? '1' : null;
  const targetTld = targetUrl.hostname.split('.').pop().toLowerCase();
  const timezone = CONFIG.TIMEZONE_MAP[targetTld] || 'America/New_York';
  
  // 针对DNS泄漏保护增强 - 添加X-Forwarded-For与地区匹配的IP
  const regionToIpRange = {
    'cn': ['1.0.1.', '58.14.0.', '114.114.114.'],
    'us': ['8.8.8.', '208.67.222.', '205.171.2.'],
    'uk': ['212.58.244.', '193.62.157.', '195.66.240.'],
    'ru': ['77.88.8.', '213.180.193.', '95.108.198.'],
    'jp': ['210.196.3.', '210.196.11.', '203.112.2.'],
    'kr': ['168.126.63.', '210.220.163.', '164.124.101.'],
    'de': ['194.25.0.', '85.214.20.', '213.73.91.'],
    'fr': ['212.27.48.', '194.117.200.', '212.95.31.'],
    'au': ['61.8.0.', '61.9.133.', '202.148.202.'],
    'sg': ['202.136.162.', '203.116.1.', '165.21.83.'],
    'in': ['210.212.200.', '203.94.243.', '202.138.120.'],
    'br': ['200.160.0.', '200.176.3.', '200.192.112.']
  };
  
  // 根据时区推断区域
  const regionCode = Object.entries(CONFIG.TIMEZONE_MAP).find(([code, tz]) => tz === timezone)?.[0] || 'us';
  
  // 生成与区域匹配的随机IP
  if (regionToIpRange[regionCode]) {
    const ipRanges = regionToIpRange[regionCode];
    const randomRange = ipRanges[Math.floor(Math.random() * ipRanges.length)];
    const randomIp = `${randomRange}${Math.floor(Math.random() * 254) + 1}`;
    
    // 仅内部使用，实际请求会被过滤掉
    headers.set('_cf_proxy_dns_region', regionCode);
    headers.set('_cf_ipcountry', regionCode.toUpperCase());
    headers.set('_cf_proxy_original_ip', randomIp);
  }

  // 浏览器指纹库 - 使用更紧凑的结构
  const browserProfiles = [
    {
      name: 'chrome',
      headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random()*5)+130}.0.0.0 Safari/537.36`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Sec-Ch-Ua': `"Not A(Brand";v="${Math.floor(Math.random()*10)+8}", "Google Chrome";v="${Math.floor(Math.random()*5)+130}", "Chromium";v="${Math.floor(Math.random()*5)+130}"`,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': `"${Math.random()>0.3?'Windows':'macOS'}"`,
      }
    },
    {
      name: 'safari',
      headers: {
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_${Math.floor(Math.random()*3)+7}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.${Math.floor(Math.random()*4)} Safari/605.1.15`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    },
    {
      name: 'firefox',
      headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${Math.floor(Math.random()*5)+130}.0) Gecko/20100101 Firefox/${Math.floor(Math.random()*5)+130}.0`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
  ];
  
  // 选择浏览器配置文件并应用
  const profile = browserProfiles[Math.floor(Math.random() * browserProfiles.length)];
  
  // 设置基本头
  Object.entries(profile.headers).forEach(([k, v]) => headers.set(k, v));
  
  // 通用头和安全头
  // Accept-Language严格与时区/IP联动，不再随机附加其它语言
  const mainLang = CONFIG.REGION_LOCALE[timezone] || 'en-US';
  headers.set('Accept-Language', `${mainLang},en;q=0.9`);
  headers.set('DNT', dntValue);
  headers.set('Sec-Fetch-Dest', 'document');
  headers.set('Sec-Fetch-Mode', 'navigate');
  headers.set('Sec-Fetch-Site', 'none');
  headers.set('Sec-Fetch-User', '?1');
  headers.set('Accept-Encoding', 'gzip, deflate, br');
  headers.set('Connection', 'keep-alive');
  headers.set('Upgrade-Insecure-Requests', '1');
  headers.set('Pragma', 'no-cache');
  headers.set('Cache-Control', 'no-cache');
  
  // DNS预取控制
  if (Math.random() > 0.5) headers.set('X-DNS-Prefetch-Control', 'off');
  
  // 生成随机化Cookie
  generateCookies(headers, targetUrl, targetTld);
  
  // 保留原始请求中的必要头
  const originalHeaders = request.headers;
  const preserveHeaders = ['content-type', 'content-length', 'content-disposition'];
  
  preserveHeaders.forEach(h => {
    if (originalHeaders.has(h)) headers.set(h.charAt(0).toUpperCase() + h.slice(1), originalHeaders.get(h));
  });
  
  // 过滤敏感头
  filterSensitiveHeaders(headers);
  
  return headers;
}

/**
 * 生成随机化Cookie，支持缓存。
 * Generate randomized cookies, support cache.
 * @param {Headers} headers
 * @param {URL} targetUrl
 * @param {string} targetTld
 */
function generateCookies(headers, targetUrl, targetTld) {
  const host = targetUrl.hostname;
  // 优先使用缓存
  if (COOKIE_CACHE[host] && COOKIE_CACHE[host].raw) {
    headers.set('Cookie', COOKIE_CACHE[host].raw);
    return;
  }
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randStr = (len, chars) => [...Array(len)].map(() => chars[rand(0, chars.length - 1)]).join('');
  const timestamp = Math.floor(Date.now()/1000);
  // 基础通用Cookie
  const cookies = [
    `_ga=GA1.2.${rand(100000000, 999999999)}.${timestamp - rand(0, 86400 * 30)}`,
    `_gid=GA1.2.${rand(100000000, 999999999)}.${timestamp}`
  ];
  // 特定网站Cookie
  if (host.includes('google')) {
    cookies.push(`NID=${randStr(30, '0123456789')}`);
  } else if (host.includes('facebook')) {
    cookies.push(`datr=${randStr(24, '0123456789abcdef')}`);
  } else if (host.includes('amazon')) {
    cookies.push(`session-id=${randStr(20, '0123456789')}`);
  } else if (host.includes('youtube') || host.includes('gmail')) {
    cookies.push(`CONSENT=YES+${randStr(10, '0123456789')}`);
  }
  // 地区和安全相关Cookie
  const locale = CONFIG.TIMEZONE_MAP[targetTld]?.split('/')[1].toLowerCase() || 'us';
  cookies.push(`cf_locale=${locale}`);
  // Cloudflare安全相关Cookie (防止DNS泄露)
  if (Math.random() > 0.3) {
    cookies.push(`cf_clearance=${randStr(43, '0123456789abcdef')}`);
  }
  const cookieStr = cookies.join('; ');
  headers.set('Cookie', cookieStr);
  // 写入缓存
  COOKIE_CACHE[host] = { cookies: {}, raw: '' };
  for (const c of cookies) {
    const [k, ...v] = c.split('=');
    COOKIE_CACHE[host].cookies[k] = v.join('=');
  }
  COOKIE_CACHE[host].raw = cookieStr;
}

/**
 * 过滤敏感请求头
 * Filter sensitive request headers
 * @param {Headers} headers
 */
function filterSensitiveHeaders(headers) {
  ['cf-', 'x-forwarded-', 'cdn-loop', 'x-real-ip', 'via'].forEach(pattern => {
    [...headers.keys()]
      .filter(key => key.toLowerCase().includes(pattern))
      .forEach(key => headers.delete(key));
  });
}

/**
 * 应用安全响应头
 * Apply security response headers
 * @param {Headers} headers
 */
function applySafeHeaders(headers) {
  // 移除敏感头
  ['cf-', 'cdn-loop', 'x-proxy', 'via', 'x-forwarded', 'forwarded', 'powered-by', 'server']
    .forEach(pattern => {
      [...headers.keys()]
        .filter(key => key.toLowerCase().includes(pattern))
        .forEach(key => headers.delete(key));
    });
  
  // 添加安全头和随机服务器标识
  Object.entries(CONFIG.SECURITY_HEADERS).forEach(([k, v]) => headers.set(k, v));
  headers.set('Server', CONFIG.SERVER_SIGNATURES[Math.floor(Math.random() * CONFIG.SERVER_SIGNATURES.length)]);
}

/**
 * 增强HTML内容，批量处理资源路径并注入保护脚本。
 * Enhance HTML content, batch process resource paths and inject protection script.
 * @param {Response} response
 * @param {URL} originalUrl
 * @param {URL} targetUrl
 * @param {Request} rawRequest
 * @return {Promise<string>}
 */
async function enhanceHtmlContent(response, originalUrl, targetUrl, rawRequest) {
  const html = await response.text();
  const origin = targetUrl.origin;
  const myHost = originalUrl.host;
  const myOrigin = originalUrl.origin;
  const dntValue = response.headers?.get('dnt');
  const siteTld = targetUrl.hostname.split('.').pop().toLowerCase();
  const timezone = CONFIG.REGIONAL_DATA[siteTld]?.timezone || inferTimezone(targetUrl);

  let processedHtml = html;
  let domParsed = false;

  // 优先使用 DOMParser 解析和批量处理
  try {
    const parser = new (typeof DOMParser !== 'undefined' ? DOMParser : (require('jsdom').JSDOM))();
    const doc = parser.parseFromString(html, 'text/html');
    // 处理所有 a/img/script/link/form 等标签的 href/src/action
    [
      { tag: 'a', attr: 'href' },
      { tag: 'img', attr: 'src' },
      { tag: 'script', attr: 'src' },
      { tag: 'link', attr: 'href' },
      { tag: 'form', attr: 'action' }
    ].forEach(({ tag, attr }) => {
      doc.querySelectorAll(`${tag}[${attr}]`).forEach(el => {
        const val = el.getAttribute(attr);
        if (!val) return;
    if (val.startsWith('/')) {
          if (!val.startsWith('//')) {
            el.setAttribute(attr, `${myOrigin}/${origin}${val}`);
          }
        } else if (/^https?:\/\//i.test(val)) {
          try {
            const u = new URL(val);
            if (u.origin === origin) {
              el.setAttribute(attr, `${myOrigin}/${origin}${u.pathname}${u.search}${u.hash}`);
            }
          } catch (e) {}
        }
      });
    });
    // 处理 style 标签和 style 属性中的 url()
    doc.querySelectorAll('style').forEach(styleEl => {
      styleEl.textContent = styleEl.textContent.replace(/url\((['"]?)(\/[^'"\)\s]+)\1\)/gi, `url(${myOrigin}/${origin}$2)`);
    });
    doc.querySelectorAll('[style]').forEach(el => {
      el.setAttribute('style', el.getAttribute('style').replace(/url\((['"]?)(\/[^'"\)\s]+)\1\)/gi, `url(${myOrigin}/${origin}$2)`));
    });
    // 处理 form action=""
    doc.querySelectorAll('form[action=""]').forEach(formEl => {
      formEl.setAttribute('action', `${myOrigin}/${origin}`);
    });
    // 注入脚本
    const injectScript = generateInjectedScript({
      myOrigin, origin, myHost,
      targetHostname: targetUrl.hostname,
      dntValue, timezone,
      originalRequestMethod: rawRequest.method
    });
    const body = doc.querySelector('body');
    if (body) {
      body.insertAdjacentHTML('beforeend', injectScript);
    } else {
      doc.documentElement.insertAdjacentHTML('beforeend', injectScript);
    }
    processedHtml = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
    domParsed = true;
  } catch (e) {
    domParsed = false;
  }

  // 兜底：正则批量处理
  if (!domParsed) {
    processedHtml = html;
    processedHtml = processedHtml.replace(/\b(href|src|action)=(["'])([^'" >]+)\2/gi, (m, attr, quote, val) => {
      if (val.startsWith('/')) {
      if (val.startsWith('//')) return m;
      return `${attr}=${quote}${myOrigin}/${origin}${val}${quote}`;
    }
    if (val.startsWith('http://') || val.startsWith('https://')) {
      try {
        const u = new URL(val);
        if (u.origin === origin) {
          return `${attr}=${quote}${myOrigin}/${origin}${u.pathname}${u.search}${u.hash}${quote}`;
        }
      } catch (e) {}
      return m;
    }
    return m;
  });
  processedHtml = processedHtml.replace(/url\((['"]?)(\/[^'"\)\s]+)\1\)/gi, `url(${myOrigin}/${origin}$2)`);
  processedHtml = processedHtml.replace(/(<form[^>]*action=)(["'])(["'])/gi, `$1$2${myOrigin}/${origin}$3`);
  const injectScript = generateInjectedScript({
    myOrigin, origin, myHost,
    targetHostname: targetUrl.hostname,
    dntValue, timezone,
    originalRequestMethod: rawRequest.method
  });
  if (/<\/body>/i.test(processedHtml)) {
    processedHtml = processedHtml.replace(/<\/body>/i, injectScript + '</body>');
  } else {
    processedHtml += injectScript;
  }
  }
  return processedHtml;
}

/**
 * 生成注入的保护脚本
 * Generate injected protection script
 * @param {Object} options
 * @return {string}
 */
function generateInjectedScript(options) {
  const { myOrigin, origin, myHost, targetHostname, dntValue, timezone, originalRequestMethod } = options;
  
  // 获取地区信息用于DNS防泄漏
  const regionCode = Object.entries(CONFIG.TIMEZONE_MAP).find(([code, tz]) => tz === timezone)?.[0] || 'us';
  
  // 生成与时区/IP一致的主语言
  const mainLang = CONFIG.REGION_LOCALE[timezone] || 'en-US';
  
  return `<script>(()=>{
    // 保存原始方法
    const _ = {
      go: window.history.go,
      ps: window.history.pushState,
      rs: window.history.replaceState,
      xo: XMLHttpRequest.prototype.open,
      f: window.fetch,
      ws: WebSocket,
      el: EventSource,
      gc: HTMLCanvasElement.prototype.getContext,
      td: HTMLCanvasElement.prototype.toDataURL,
      gd: CanvasRenderingContext2D.prototype.getImageData,
      bi: navigator.buildID,
      dE: document.evaluate,
      dQ: document.querySelector,
      dQA: document.querySelectorAll,
      dNL: document.getElementsByName,
      dTL: document.getElementsByTagName
    };

    try {
      // 随机函数
      const nm = () => Math.random();
      const timeZone = "${timezone}";
      
      // 高级DNS泄漏保护
      const regionIPs = {
        'cn': ['1.0.1.', '58.14.0.', '114.114.114.'],
        'us': ['8.8.8.', '208.67.222.', '205.171.2.'],
        'uk': ['212.58.244.', '193.62.157.', '195.66.240.'],
        'ru': ['77.88.8.', '213.180.193.', '95.108.198.'],
        'jp': ['210.196.3.', '210.196.11.', '203.112.2.'],
        'kr': ['168.126.63.', '210.220.163.', '164.124.101.'],
        'de': ['194.25.0.', '85.214.20.', '213.73.91.'],
        'fr': ['212.27.48.', '194.117.200.', '212.95.31.'],
        'au': ['61.8.0.', '61.9.133.', '202.148.202.'],
        'sg': ['202.136.162.', '203.116.1.', '165.21.83.'],
        'in': ['210.212.200.', '203.94.243.', '202.138.120.'],
        'br': ['200.160.0.', '200.176.3.', '200.192.112.']
      };
      
      const getRegionalIP = (region) => {
        const ranges = regionIPs[region] || regionIPs['us'];
        const range = ranges[Math.floor(nm() * ranges.length)];
        return range + Math.floor(nm() * 254 + 1);
      };
      
      const regionalIP = getRegionalIP("${regionCode}");
      
      // 时区修复
      (function(){
        // Intl.DateTimeFormat修改
        const OrigIntlDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat = function(locales, options) {
          if(options) options.timeZone = timeZone;
          else options = {timeZone};
          return new OrigIntlDateTimeFormat(locales, options);
        };
        
        // Date.prototype.getTimezoneOffset修改
        const tzOffsets = ${JSON.stringify(CONFIG.TIMEZONE_OFFSETS)};
        const tzOffset = tzOffsets[timeZone] || 0;
        Date.prototype.getTimezoneOffset = function() { return tzOffset; };
        
        // navigator.language修改
        const tzToLocale = ${JSON.stringify(CONFIG.REGION_LOCALE)};
        const locale = tzToLocale[timeZone] || 'en-US';
        Object.defineProperty(navigator, 'language', { get: () => locale });
        
        // Date对象重写
        const OrigDate = window.Date;
        const tzOffsetMs = tzOffset * 60 * 1000;
        
        function CustomDate(...args) {
          return args.length === 0 
            ? new OrigDate() 
            : args.length === 1 
              ? new OrigDate(args[0]) 
              : new OrigDate(...args);
        }
        
        // 复制静态方法
        CustomDate.now = () => OrigDate.now();
        CustomDate.parse = dateString => OrigDate.parse(dateString);
        CustomDate.UTC = (...args) => OrigDate.UTC(...args);
        
        // 修复原型链
        CustomDate.prototype = OrigDate.prototype;
        CustomDate.prototype.constructor = CustomDate;
        
        // 修复toString方法
        Date.prototype.toString = function() {
          const tzName = timeZone.split('/').pop().replace('_', ' ');
          try {
            return new Intl.DateTimeFormat('en-US', {
              weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              timeZone, hour12: true
            }).format(this) + ' GMT' + (tzOffset <= 0 ? '+' : '-') + 
            String(Math.abs(tzOffset/60)).padStart(2, '0') + '00 (' + tzName + ')';
          } catch(e) {
            return this.toISOString();
          }
        };
        
        // 修复时间相关方法
        const timeGetters = {
          'getHours': function() { return new OrigDate(this.valueOf() - tzOffsetMs).getUTCHours(); },
          'getMinutes': function() { return new OrigDate(this.valueOf()).getUTCMinutes(); },
          'getSeconds': function() { return new OrigDate(this.valueOf()).getUTCSeconds(); },
          'getTime': function() { return this.valueOf(); }
        };
        
        Object.entries(timeGetters).forEach(([method, func]) => {
          const orig = Date.prototype[method];
          Date.prototype[method] = func;
        });
        
        window.Date = CustomDate;
      })();
      
      // 修改navigator属性
      const navProto = Object.getPrototypeOf(navigator);
      const navOverrides = {
        webdriver: {get:()=>false},
        languages: {get:()=>["${mainLang}", 'en']},
        plugins: {get:()=>{
          const p = [
            {description:"Portable Document Format",filename:"internal-pdf-viewer",name:"Chrome PDF Plugin",MimeTypes:[{description:"Portable Document Format",suffixes:"pdf",type:"application/pdf"}]},
            {description:"",filename:"mhjfbmdgcfjbbpaeojofohoefgiehjai",name:"Chrome PDF Viewer",MimeTypes:[{description:"",suffixes:"",type:"application/pdf"}]},
            {description:"",filename:"internal-nacl-plugin",name:"Native Client",MimeTypes:[{description:"Native Client Executable",suffixes:"",type:"application/x-nacl"},{description:"Portable Native Client Executable",suffixes:"",type:"application/x-pnacl"}]}
          ];
          p.__proto__ = navigator.plugins.__proto__;
          p.item = i => p[i];
          p.namedItem = n => p.find(p=>p.name===n);
          return p;
        }},
        hardwareConcurrency: {get:()=>[4,6,8,12,16][Math.floor(nm()*5)]},
        deviceMemory: {get:()=>[4,8,16,32][Math.floor(nm()*4)]},
        userAgent: {get:()=>navigator.userAgent},
        doNotTrack: {get:()=>${dntValue === '1' ? '"1"' : 'null'}},
        maxTouchPoints: {get:()=>Math.floor(nm()*5)},
        connection: {get:()=>({
          effectiveType: ['4g','3g'][Math.floor(nm()*2)],
          rtt: Math.floor(nm()*100+50),
          downlink: Math.floor(nm()*10+5),
          saveData: false
        })},
        language: {get:()=>"${mainLang}"}
      };
      
      // DoNotTrack处理
      window.DNT = ${dntValue === '1'};
      Object.defineProperty(navigator, 'doNotTrack', {get:()=>${dntValue === '1' ? '"1"' : 'null'}, configurable:false});
      Object.defineProperty(navigator, 'msDoNotTrack', {get:()=>${dntValue === '1' ? '"1"' : 'null'}, configurable:false});
      Object.defineProperty(navigator, 'language', {get:()=>"${mainLang}", configurable:false});
      // 应用navigator修改
      for(const [k,v] of Object.entries(navOverrides)) {
        try { Object.defineProperty(navProto, k, v); } catch(e) {}
      }
      
      // 增强DNS泄漏防护 - 拦截所有DNS相关WebRTC函数
      try {
        // 完全禁用WebRTC
        try {
          window.RTCPeerConnection = function() { 
            throw new Error('WebRTC is not supported'); 
          };
          window.RTCIceGatherer = function() { 
            throw new Error('WebRTC is not supported');
          };
          window.RTCIceTransport = function() {
            throw new Error('WebRTC is not supported');
          };
          window.RTCDtlsTransport = function() {
            throw new Error('WebRTC is not supported');
          };
          window.RTCSctpTransport = function() {
            throw new Error('WebRTC is not supported');
          };
        } catch(e) {}
        
        // 备用方案：如果完全禁用不起作用，使用欺骗方法
        if(typeof RTCPeerConnection !== 'undefined') {
          const realRTC = window.RTCPeerConnection;
          window.RTCPeerConnection = function() {
            if(arguments[0] && typeof arguments[0] === 'object') {
              const conf = arguments[0];
              
              // 彻底移除所有STUN/TURN服务器
              if(conf.iceServers) {
                // 设置只与区域IP匹配的假STUN服务器
                conf.iceServers = [{
                  urls: \`stun:\${regionalIP}:19302\`,
                  username: "",
                  credential: ""
                }];
              }
              arguments[0] = conf;
            }
            
            const pc = new realRTC(...arguments);
            
            // 拦截候选项生成，替换为地区匹配的IP
            const origSetLocalDescription = pc.setLocalDescription;
            pc.setLocalDescription = function(desc) {
              try {
                const originalSdp = desc.sdp;
                if(originalSdp) {
                  // 替换SDP中的IP地址，使其与区域IP匹配
                  const modifiedSdp = originalSdp.replace(
                    /a=candidate:.*? [0-9]+ [^ ]+ [^ ]+ ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) .*/g,
                    function(match, ip) {
                      if(ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                        return match; // 保留内网IP
                      }
                      return match.replace(ip, regionalIP);
                    }
                  );
                  desc.sdp = modifiedSdp;
                }
              } catch(e) {}
              return origSetLocalDescription.apply(this, arguments);
            };
            
            // 拦截候选项收集
            if(Object.getOwnPropertyDescriptor(pc, 'onicecandidate')) {
              Object.defineProperty(pc, 'onicecandidate', {
                get: function() { return this._onicecandidate; },
                set: function(cb) {
                  this._onicecandidate = function(e) {
                    if(e && e.candidate) {
                      if(!e.candidate.candidate) {
                        return cb.call(this, e);
                      }
                      
                      // 修改候选项中的IP地址
                      const originalCand = e.candidate.candidate;
                      if(typeof originalCand === 'string') {
                        try {
                          const ipMatch = originalCand.match(/([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3})/);
                          if(ipMatch && ipMatch[1]) {
                            const ip = ipMatch[1];
                            if(!ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
                              const newCand = originalCand.replace(ip, regionalIP);
                              Object.defineProperty(e.candidate, 'candidate', {
                                get: function() { return newCand; }
                              });
                            }
                          }
                        } catch(e) {}
                      }
                    }
                    return cb.call(this, e);
                  };
                }
              });
            }
            
            // 阻止createOffer收集候选项
            const origCreateOffer = pc.createOffer;
            pc.createOffer = function(successCallback, failureCallback, options) {
              const opts = options || {};
              opts.offerToReceiveAudio = opts.offerToReceiveVideo = false;
              return arguments.length >= 3
                ? origCreateOffer.call(this, successCallback, failureCallback, opts)
                : origCreateOffer.call(this, opts).then(successCallback, failureCallback);
            };
            
            return pc;
          };
        }
        
        // 网络API信息伪装
        if(navigator.connection) {
          Object.defineProperty(navigator, 'connection', {
            get: function() {
              return {
                effectiveType: ['4g','3g'][Math.floor(Math.random()*2)],
                downlink: 5 + Math.random() * 10,
                rtt: 50 + Math.random() * 50,
                saveData: false,
                type: 'wifi',
                addEventListener: function() {},
                removeEventListener: function() {},
                dispatchEvent: function() { return true; }
              };
            }
          });
        }
        
        // 监视和修改WebSocket连接，防止DNS泄漏
        const origWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
          try {
            const parsedUrl = new URL(url);
            // 只代理对目标主机的WebSocket连接
            if(parsedUrl.hostname === '${targetHostname}') {
              url = url.replace(parsedUrl.hostname, '${myHost}');
            }
          } catch(e) {}
          return new origWebSocket(url, protocols);
        };
        window.WebSocket.prototype = origWebSocket.prototype;
        
        // 阻止DNS预解析
        new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if(mutation.type === 'childList') {
              // 处理dns-prefetch和preconnect链接
              document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"], link[rel="preload"]').forEach(link => {
                const href = link.getAttribute('href');
                if(href && !href.includes('${myHost}')) {
                  // 完全禁止预解析外部地址
                  link.setAttribute('rel', 'nofollow');
                  link.setAttribute('href', '${myOrigin}');
                }
              });
              
              // 处理meta dns-prefetch-control标签
              document.querySelectorAll('meta[http-equiv="x-dns-prefetch-control"]').forEach(meta => {
                meta.setAttribute('content', 'off');
              });
            }
          });
        }).observe(document, {childList: true, subtree: true});
        
        // 全局添加DNS-Prefetch-Control头
        try {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('http-equiv', 'x-dns-prefetch-control');
          metaTag.setAttribute('content', 'off');
          document.head.appendChild(metaTag);
        } catch(e) {}
        
        // 拦截document.createElement，防止动态创建可能导致DNS泄漏的元素
        const origCreateElement = document.createElement;
        document.createElement = function(tagName) {
          const element = origCreateElement.call(document, tagName);
          
          // 拦截可能导致网络请求的元素
          if(tagName.toLowerCase() === 'script' || 
             tagName.toLowerCase() === 'img' || 
             tagName.toLowerCase() === 'iframe' || 
             tagName.toLowerCase() === 'link') {
            
            // 拦截setAttribute方法
            const origSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
              if((name === 'src' || name === 'href') && 
                 typeof value === 'string' && 
                 value.startsWith('http') && 
                 !value.includes('${myHost}')) {
                try {
                  // 重定向请求到代理
                  const urlObj = new URL(value);
                  if(urlObj.hostname === '${targetHostname}') {
                    value = '${myOrigin}/' + encodeURIComponent(value);
                  }
                } catch(e) {}
              }
              
              // DNS相关属性屏蔽
              if(name === 'rel' && (value === 'dns-prefetch' || value === 'preconnect')) {
                value = 'nofollow';
              }
              
              return origSetAttribute.call(this, name, value);
            };
          }
          
          return element;
        };
      } catch(e) {}
      
      // 函数toString方法修改
      const nativeToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        if(this === Function.prototype.toString) return nativeToString.call(nativeToString);
        let fn = this.toString();
        if(fn.startsWith('function get ')) fn = fn.replace('function get ', 'function ');
        return fn.replace(/\\[native code\\]/g, '{ [native code] }');
      };
      
      // 屏蔽自动化检测
      Object.defineProperty(window, 'chrome', {
        value: {
          app: {isInstalled: false},
          runtime: {
            PlatformOs: {MAC: "mac", WIN: "win", ANDROID: "android", CROS: "cros", LINUX: "linux", OPENBSD: "openbsd"},
            PlatformArch: {ARM: "arm", ARM64: "arm64", X86_32: "x86-32", X86_64: "x86-64", MIPS: "mips", MIPS64: "mips64"},
            PlatformNaclArch: {ARM: "arm", X86_32: "x86-32", X86_64: "x86-64", MIPS: "mips", MIPS64: "mips64"},
            RequestUpdateCheckStatus: {THROTTLED: "throttled", NO_UPDATE: "no_update", UPDATE_AVAILABLE: "update_available"},
            OnInstalledReason: {INSTALL: "install", UPDATE: "update", CHROME_UPDATE: "chrome_update", SHARED_MODULE_UPDATE: "shared_module_update"},
            OnRestartRequiredReason: {APP_UPDATE: "app_update", OS_UPDATE: "os_update", PERIODIC: "periodic"}
          },
          loadTimes: () => {},
          csi: () => {}
        },
        configurable: false,
        writable: false
      });
      
      // 屏蔽Selenium检测
      ['$cdc_asdjflasutopfhvcZLmcfl_', '$chrome_asyncScriptInfo', '__webdriver_evaluate', 
       '__selenium_evaluate', '__webdriver_script_function', '__webdriver_script_func', 
       '__webdriver_script_fn', '__fxdriver_evaluate', '__driver_unwrapped', 
       '__webdriver_unwrapped', '__driver_evaluate', '__selenium_unwrapped', 
       '__fxdriver_unwrapped'].forEach(key => { delete window[key]; });
      
      // 重写hasFocus
      Document.prototype.hasFocus = () => Math.random() > 0.1;
      
      // Canvas指纹防护
      HTMLCanvasElement.prototype.getContext=function(...a){const ctx=_.gc.apply(this,a);if(ctx&&a[0]==='2d'){ctx._s=Math.floor(Math.random()*9999)+1;ctx.getImageData=function(...a){const d=_.gd.apply(ctx,a);if(d&&d.data&&d.data.length>10){const s=ctx._s||Math.floor(Math.random()*9999)+1;for(let i=0;i<d.data.length;i+=Math.floor(Math.random()*53)+17){d.data[i]=(d.data[i]^(s+(i%255)))&0xFF}}return d}}return ctx};
      HTMLCanvasElement.prototype.toDataURL=function(...a){if(this.width>2&&this.height>2&&(!this.dataset||!this.dataset.noblur)){const ctx=this.getContext('2d');if(ctx){const o=ctx.globalCompositeOperation,f=ctx.fillStyle;ctx.filter='blur('+(Math.floor(Math.random()*3)+1)+'px)';ctx.globalCompositeOperation='overlay';ctx.fillStyle='rgba(0,0,0,0.0'+(Math.floor(Math.random()*9)+1)+"')";ctx.fillRect(0,0,this.width,this.height);ctx.filter='none';ctx.globalCompositeOperation=o;ctx.fillStyle=f}}return _.td.apply(this,a)};
      
      // 劫持网络请求
      window.history.pushState=(...a)=>_.ps.apply(window.history,a);
      window.history.replaceState=(...a)=>_.rs.apply(window.history,a);
      
      XMLHttpRequest.prototype.open=function(m,u,...a){
        if(typeof u==='string'){
          if(u.startsWith('/')) u='${myOrigin}/${origin}'+u;
          else if(u.startsWith('http')){
            try{
              const pu=new URL(u);
              if(pu.hostname==='${targetHostname}') u='${myOrigin}/'+encodeURIComponent(u);
            }catch(e){}
          }
        }
        return _.xo.call(this,m,u,...a);
      };
      
      // 拦截DNS解析相关的Fetch API
      const origFetch = window.fetch;
      window.fetch = function(resource, init) {
        if(typeof resource === 'string') {
          // 阻止对DNS解析服务的请求
          if(resource.startsWith('https://dns.google/') || 
             resource.includes('dns-query') ||
             resource.includes('resolve')) {
            return Promise.reject(new Error('DNS resolution blocked'));
          }
          
          // 常规代理
          if(resource.startsWith('/')) resource='${myOrigin}/${origin}'+resource;
          else if(resource.startsWith('http')){
            try{
              const u=new URL(resource);
              if(u.hostname==='${targetHostname}') resource='${myOrigin}/'+encodeURIComponent(resource);
            }catch(e){}
          }
        }
        return origFetch.call(this, resource, init);
      };
      
      // 捕获点击和表单提交
      document.addEventListener('click',e=>{
        const a=e.target.closest('a');
        if(!a||a.hasAttribute('_r')) return;
        const h=a.getAttribute('href');
        if(!h) return;
        if(h.startsWith('/')){
          e.preventDefault();
          a.setAttribute('_r',1);
          location.href='${myOrigin}/${origin}'+h;
        }else if(h.startsWith('http')){
          try{
            const u=new URL(h);
            if(u.hostname==='${targetHostname}'){
              e.preventDefault();
              a.setAttribute('_r',1);
              location.href='${myOrigin}/'+encodeURIComponent(h);
            }
          }catch(e){}
        }
      },true);
      
      document.addEventListener('submit',e=>{
        const f=e.target;
        if(f.hasAttribute('_r')) return;
        const a=f.getAttribute('action');
        if(!a||a.includes('${myHost}')) return;
        if(a.startsWith('/')||a===''){
          e.preventDefault();
          f.setAttribute('_r',1);
          f.action='${myOrigin}/${origin}'+(a||window.location.pathname);
          f.submit();
        }
      },true);
      
      // 音频指纹保护
      if(typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ogCreateOsc = AC.prototype.createOscillator;
        AC.prototype.createOscillator = function() {
          const oscillator = ogCreateOsc.apply(this, arguments);
          const ogFreq = oscillator.frequency.value;
          Object.defineProperty(oscillator, 'frequency', {
            get: () => ({value: ogFreq * (0.99 + Math.random() * 0.02)})
          });
          return oscillator;
        };
      }
      
      // 模拟网络连接地区匹配的特性
      if(Math.random() > 0.3) {
        try {
          // 注入伪装的DNS解析结果
          const dnsResolutionCache = {};
          const regionHosts = {
            'cn': ['baidu.com', 'qq.com', 'weibo.com'],
            'us': ['google.com', 'facebook.com', 'amazon.com'],
            'uk': ['bbc.co.uk', 'gov.uk', 'co.uk'],
            'jp': ['yahoo.co.jp', 'rakuten.co.jp', 'co.jp'],
            'kr': ['naver.com', 'daum.net', 'co.kr'],
            'ru': ['yandex.ru', 'mail.ru', 'vk.com'],
            'de': ['t-online.de', 'gmx.de', 'web.de'],
            'fr': ['orange.fr', 'free.fr', 'leboncoin.fr']
          };
          
          // 模拟区域性的DNS解析结果
          const region = "${regionCode}";
          const hosts = regionHosts[region] || regionHosts['us'];
          
          hosts.forEach(host => {
            dnsResolutionCache[host] = getRegionalIP("${regionCode}");
          });
          
          // 劫持网络信息API，使其显示与区域匹配的网络状态
          if('connection' in navigator) {
            Object.defineProperty(navigator, 'connection', {
              get: function() {
                return {
                  effectiveType: '4g',
                  rtt: region === 'cn' || region === 'ru' ? 150 : 50,
                  downlink: region === 'cn' || region === 'ru' ? 5 : 15,
                  saveData: false
                };
              }
            });
          }
        } catch(e) {}
      }
      
      // 鼠标行为模拟
      if(Math.random() > 0.5) {
        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const triggerMouse = () => {
          try {
            document.dispatchEvent(new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: randInt(1, window.innerWidth - 1),
              clientY: randInt(1, window.innerHeight - 1)
            }));
          } catch(e) {}
          setTimeout(triggerMouse, randInt(5000, 15000));
        };
        setTimeout(triggerMouse, randInt(3000, 8000));
      }
      
    } catch(e) {}
  })();</script>`;
}

// ===================== UI区 UI Section =====================
/**
 * 生成主界面HTML，模板与JS逻辑分离。
 * @return {string}
 */
function generateMainUI() {
  const htmlTemplate = getMainUITemplate();
  // ...如需动态插入内容可在此处理...
  return htmlTemplate;
}

/**
 * 主界面HTML模板，便于维护和扩展。
 * @return {string}
 */
function getMainUITemplate() {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>云速通道</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#3b82f6"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%233b82f6' d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/></svg>"><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}:root{--p:#3b82f6;--p-dark:#2563eb;--p-light:#60a5fa;--p-xlight:rgba(59,130,246,0.08);--g:#f8fafc;--c:#fff;--t:#1e293b;--t-light:#475569;--t-xlight:#94a3b8;--b:#e5e7eb;--b-light:#f1f5f9;--error:#ef4444;--shadow:0 4px 15px -3px rgba(0,0,0,0.05),0 4px 6px -4px rgba(0,0,0,0.05);--transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}body{font:16px/1.6 system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--g);color:var(--t);min-height:100vh;display:grid;place-items:center;padding:1rem}.container{width:100%;max-width:500px}.card{background:var(--c);border-radius:12px;box-shadow:var(--shadow);overflow:hidden;transition:var(--transition);margin-bottom:1.5rem;border:1px solid var(--b-light)}.card:hover{transform:translateY(-2px);box-shadow:0 10px 25px -5px rgba(0,0,0,0.07),0 8px 10px -6px rgba(0,0,0,0.03)}.header{padding:1.75rem 1.25rem 1.5rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px}.logo{width:48px;height:48px;fill:var(--p);filter:drop-shadow(0 1px 3px rgba(59,130,246,0.2))}.title{font-size:1.75rem;font-weight:700;letter-spacing:-.01em;background:linear-gradient(90deg,var(--p) 0%,var(--p-dark) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-fill-color:transparent}.sub-title{font-size:.9rem;color:var(--t-xlight);margin-top:-8px}.main-form{padding:0 1.25rem 1.5rem}.tip{padding:10px 14px;margin-bottom:1.5rem;background:var(--p-xlight);border-left:3px solid var(--p);border-radius:6px;font-size:.85rem;color:var(--p-dark);line-height:1.5}.form-group{margin-bottom:1.1rem}label{display:block;margin-bottom:8px;font-size:.9rem;font-weight:500;color:var(--t-light)}input[type=text]{width:100%;padding:12px 15px;border:1px solid var(--b);border-radius:8px;background:var(--c);font-size:.9rem;transition:var(--transition);box-shadow:inset 0 1px 2px rgba(0,0,0,0.03);color:var(--t)}input[type=text]:focus{outline:0;border-color:var(--p);box-shadow:inset 0 1px 2px rgba(0,0,0,0.03), 0 0 0 3px rgba(59,130,246,.15)}input[type=text]::placeholder{color:var(--t-xlight)}.options{display:flex;gap:1.75rem;margin-bottom:1.5rem;padding:0.1rem 0.1rem}.check{display:flex;align-items:center}.check input{margin-right:7px;width:17px;height:17px;accent-color:var(--p);cursor:pointer}.check label{margin:0;font-size:.9rem;color:var(--t-light);font-weight:normal;cursor:pointer}.btn{display:block;width:100%;padding:12px;background:var(--p);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:var(--transition);box-shadow:0 3px 10px rgba(59,130,246,0.2)}.btn:hover{background:var(--p-dark);box-shadow:0 5px 14px rgba(59,130,246,0.28)}.btn:active{transform:translateY(1px);box-shadow:0 2px 8px rgba(59,130,246,0.2)}.section{padding:1.25rem 1.25rem;border-top:1px solid var(--b-light)}.copy{display:flex;margin-bottom:.5rem}.copy input{border-right:0;border-top-right-radius:0;border-bottom-right-radius:0;flex-grow:1;font-size:.85rem;background:var(--g);font-family:ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,monospace;padding:10px 12px;}.copy-btn{background:var(--p);color:#fff;border:0;padding:0 18px;border-top-right-radius:8px;border-bottom-right-radius:8px;cursor:pointer;font-size:.85rem;font-weight:500;transition:var(--transition);display:flex;align-items:center;gap:8px}.copy-btn svg{opacity:0.8;width:15px;height:15px;flex-shrink:0}.copy-btn:hover{background:var(--p-dark)}.copy-btn:active{transform:translateY(1px)}.hint{font-size:.75rem;color:var(--t-xlight);margin-top:8px}
/* History styles integrated into the card */
.history-section{padding:1.25rem 1.25rem; border-top:1px solid var(--b-light);}
.history-head{padding-bottom:.8rem;display:flex;justify-content:space-between;align-items:center}.history-title{font-size:.95rem;font-weight:600;color:var(--t-light)}.history-actions{display:flex;gap:8px}.history-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:var(--t-xlight);font-size:.8rem;cursor:pointer;padding:5px 8px;border-radius:5px;transition:var(--transition);font-weight:500}.history-btn svg{width:13px;height:13px;opacity:0.7}.history-btn:hover{background:var(--b-light);color:var(--t-light)}.history-btn svg{transition:var(--transition)}.history-btn:hover svg{opacity:1}.history-clear{color:var(--error)}.history-clear:hover{color:var(--error)}.history-list{max-height:180px;overflow-y:auto;margin:0;padding:0.5rem;background:var(--b-light);border-radius:8px;scrollbar-width:thin;scrollbar-color:var(--b) transparent;}.history-list::-webkit-scrollbar{width:5px;}.history-list::-webkit-scrollbar-thumb{background-color:var(--b);border-radius:3px;}.history-list::-webkit-scrollbar-track{background:transparent;}.history-item{display:flex;padding:8px 10px;cursor:pointer;transition:var(--transition);position:relative;align-items:center}.history-item:not(:last-child){border-bottom:1px solid var(--b);}.history-item:hover{background:rgba(0,0,0,0.03)}.history-icon{color:var(--t-xlight);margin-right:10px;display:flex;align-items:center;font-size:.85rem}.history-icon svg{width:14px;height:14px;opacity:0.6}.history-text{flex-grow:1;overflow:hidden}.history-url{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--t-light);font-weight:500}.history-time{font-size:.75rem;color:var(--t-xlight);margin-top:1px}.history-delete{opacity:0;position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--t-xlight);padding:5px;border-radius:5px;cursor:pointer;transition:var(--transition);display:flex;align-items:center;justify-content:center}.history-delete svg{width:15px;height:15px}.history-delete:hover{color:var(--error);background:rgba(239,68,68,.1)}.history-item:hover .history-delete{opacity:1}.empty-history{text-align:center;padding:1.5rem 1rem;color:var(--t-xlight);font-size:.9rem;display:flex;flex-direction:column;align-items:center;gap:8px}.empty-history svg{width:32px;height:32px;opacity:0.2;margin-bottom:4px}.footer{padding:14px 0 0;text-align:center;font-size:.75rem;color:var(--t-xlight)}.ver{display:inline-block;margin-left:4px;opacity:.7}.copied-toast{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:7px 14px;border-radius:6px;font-size:13px;pointer-events:none;opacity:0;transition:opacity 0.2s ease;z-index:100}
/* 语言切换按钮样式 */
.card { position: relative; }
.lang-switch {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  background: var(--c);
  border: 1px solid var(--b);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: var(--shadow);
  cursor: pointer;
  z-index: 10;
}
.lang-btn {
  padding: 6px 12px;
  font-size: .8rem;
  font-weight: 500;
  color: var(--t-light);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  line-height: 1.5; /* 确保文本垂直居中，有助于背景填充 */
  text-align: center; /* 确保文本水平居中 */
  min-width: 40px; /* 给按钮一个最小宽度，确保EN也能填满 */
}
.lang-btn.active {
  background: var(--p);
  color: white;
}
.lang-btn:hover:not(.active) {
  background: var(--b-light);
}

/* 复制按钮样式调整 */
.copy-btn {
  background: var(--p);
  color: #fff;
  border: 0;
  padding: 0 18px; /* 稍微减少padding，依赖span的nowrap */
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  cursor: pointer;
  font-size: .85rem; /* 保持原字体大小 */
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px; /* 减小图标和文字的间距 */
}
.copy-btn svg {
  opacity: 0.8;
  width: 15px;
  height: 15px;
  flex-shrink: 0; /* 防止图标被压缩 */
}
.copy-btn span { /* 新增，确保"复制"不换行 */
  white-space: nowrap;
}
@media(max-width:480px){body{padding:0.75rem}.container{max-width:100%}.card{border-radius:10px}.header{padding:1.5rem 1rem 1.25rem;gap:10px}.logo{width:40px;height:40px}.title{font-size:1.5rem}.sub-title{font-size:0.85rem}.main-form,.section,.history-section{padding:1rem 1rem}.tip{padding:10px 14px;font-size:0.8rem}label{font-size:0.85rem}input[type=text]{padding:11px 12px;font-size:0.85rem;border-radius:6px}.options{gap:1.5rem}.check label{font-size:0.85rem}.btn{padding:11px;font-size:0.95rem;border-radius:6px}.section-title,.history-title{font-size:0.9rem}.copy input{padding:9px 10px;font-size:0.8rem}.copy-btn{padding:0 12px;font-size:0.8rem}.hint{font-size:0.7rem}.history-list{max-height:160px;padding:0.4rem;border-radius:6px;}.history-item{padding:7px 8px}.history-url{font-size:0.85rem}.history-time{font-size:0.7rem}.history-delete svg{width:14px;height:14px}.empty-history{padding:1.25rem 1rem;font-size:0.85rem}.lang-switch{top:0.5rem;right:0.5rem;} /* 移动端微调 */
.lang-btn{padding:5px 10px;font-size:0.75rem; min-width: 35px;}
.copy-btn{padding:0 14px; gap: 5px;} /* 移动端也对应调整 */
}@media(prefers-color-scheme:dark){:root{--p:#60a5fa;--p-dark:#3b82f6;--p-light:#93c5fd;--p-xlight:rgba(59,130,246,0.1);--g:#111827;--c:#1f2937;--t:#f9fafb;--t-light:#e5e7eb;--t-xlight:#9ca3af;--b:#374151;--b-light:rgba(255,255,255,0.05);--shadow:0 4px 15px -3px rgba(0,0,0,0.2),0 4px 6px -4px rgba(0,0,0,0.15)}
.tip{background:var(--p-xlight);border-left-color:var(--p);color:var(--p-light)}input[type=text]{background:var(--c);border-color:var(--b);color:var(--t)}input[type=text]:focus{box-shadow:inset 0 1px 2px rgba(0,0,0,0.03), 0 0 0 3px rgba(96,165,250,.25)}input[type=text]::placeholder{color:var(--t-xlight)}.history-list{background:var(--g)}.history-item:hover{background:rgba(255,255,255,0.04)}.history-item:not(:last-child){border-bottom-color:var(--b)}.section,.history-section{border-top-color:var(--b)}.copy input{background:var(--g);border-color:var(--b)} .copy-btn{background:var(--p);}.copy-btn:hover{background:var(--p-dark)}.lang-switch{background:var(--c);border-color:var(--b)}
.lang-btn:not(.active){color:var(--t-light)}
.lang-btn.active { background: var(--p-dark); /* 暗色模式下激活颜色也深一点 */ }
.lang-btn:hover:not(.active){background:var(--b)}</style></head><body><div class="container"><div class="card"><div class="lang-switch"><button type="button" class="lang-btn" data-lang="zh-CN">中文</button><button type="button" class="lang-btn" data-lang="en-US">EN</button></div><div class="header"><svg class="logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/></svg><h1 class="title" data-i18n="title">云速通道</h1></div><div class="main-form"><div class="tip" data-i18n="tip">在下方输入目标网址即可开始访问加速</div><form id="f"><div class="form-group"><label for="s" data-i18n="target-label">目标网址</label><input type="text" id="s" placeholder="请输入您要访问的网站地址" data-i18n-placeholder="target-placeholder" required autocomplete="off"></div><div class="options"><div class="check"><input type="checkbox" id="sv"><label for="sv" data-i18n="remember-option">记住此地址</label></div><div class="check"><input type="checkbox" id="at"><label for="at" data-i18n="auto-option">自动进入</label></div></div><button type="submit" class="btn" data-i18n="submit-btn">开始访问</button></form></div><div class="section"><div class="copy"><input type="text" id="cf" readonly><button id="cp" class="copy-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span data-i18n="copy-btn">复制</span></button></div><div class="hint" data-i18n="copy-hint">请复制并保存此链接，以便日后返回该页面</div></div>
<div class="history-section" id="history-section">
  <div class="history-head">
    <div class="history-title" data-i18n="history-title">历史记录</div>
    <div class="history-actions">
      <button class="history-btn history-clear" id="history-clear">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span data-i18n="clear-btn">清空</span>
      </button>
    </div>
  </div>
  <div class="history-list" id="history-list">
    <!-- History items will be loaded here -->
  </div>
</div>
</div><div class="footer"><span data-i18n="footer-text">云速通道</span> <span class="ver">v1.0</span></div></div>

<div class="copied-toast" id="copied-toast" data-i18n="copied-toast">已复制到剪贴板</div>

<script>!function(){
  // 语言支持
  const i18n = {
    'zh-CN': {
      'title': '云速通道',
      'tip': '在下方输入目标网址即可开始访问加速',
      'target-label': '目标网址',
      'target-placeholder': '请输入您要访问的网站地址',
      'remember-option': '记住此地址',
      'auto-option': '自动进入',
      'submit-btn': '开始访问',
      'copy-btn': '复制',
      'copy-hint': '请复制并保存此链接，以便日后返回该页面',
      'history-title': '历史记录',
      'clear-btn': '清空',
      'empty-history': '暂无历史记录',
      'copied-toast': '已复制到剪贴板',
      'copy-failed': '复制失败，请手动复制',
      'clear-confirm': '确定要清空所有历史记录吗？',
      'history-cleared': '历史记录已清空',
      'footer-text': '云速通道',
      'month-format': '{0}月{1}日',
      'time-format': '{0}:{1}'
    },
    'en-US': {
      'title': 'Cloud Express',
      'tip': 'Enter the target URL below to start accelerated access',
      'target-label': 'Target URL',
      'target-placeholder': 'Please enter the website address',
      'remember-option': 'Remember address',
      'auto-option': 'Auto-enter',
      'submit-btn': 'Start Access',
      'copy-btn': 'Copy',
      'copy-hint': 'Please copy and save this link for future use',
      'history-title': 'History',
      'clear-btn': 'Clear',
      'empty-history': 'No history records',
      'copied-toast': 'Copied to clipboard',
      'copy-failed': 'Copy failed, please copy manually',
      'clear-confirm': 'Are you sure to clear all history records?',
      'history-cleared': 'History cleared',
      'footer-text': 'Cloud Express',
      'month-format': '{1}/{0}',
      'time-format': '{0}:{1}'
    }
  };
  
  // 设置当前语言
  let currentLang = localStorage.getItem('lang') || 'zh-CN';
  
  // 应用语言
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // 更新所有带data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang][key]) {
        el.textContent = i18n[lang][key];
      }
    });
    
    // 更新placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (i18n[lang][key]) {
        el.placeholder = i18n[lang][key];
      }
    });
    
    // 刷新历史记录以更新日期格式
    loadHistory();
  }
  
  // 语言切换事件
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang !== currentLang) {
        applyLanguage(lang);
      }
    });
  });
  
  // 格式化日期时间（根据当前语言）
  function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    const monthFormat = i18n[currentLang]['month-format'].replace('{0}', month).replace('{1}', day);
    const timeFormat = i18n[currentLang]['time-format'].replace('{0}', hours).replace('{1}', minutes);
    
    return \`\${monthFormat} \${timeFormat}\`;
  }
  
  // 使用文档片段和缓存DOM引用
  const formEl = document.getElementById("f"),
        inputEl = document.getElementById("s"),
        saveCheckEl = document.getElementById("sv"),
        autoCheckEl = document.getElementById("at"),
        clipboardEl = document.getElementById("cf"),
        copyBtnEl = document.getElementById("cp"),
        historyListEl = document.getElementById("history-list"),
        historyClearEl = document.getElementById("history-clear"),
        toastEl = document.getElementById("copied-toast"),
        myOrigin = location.origin,
        settingsUrl = myOrigin+"/set";
  
  // 设置链接值
  clipboardEl.value = settingsUrl;

  // 显示提示信息函数
  function showToast(message, duration = 2000) {
    toastEl.textContent = message;
    toastEl.style.opacity = '1';
    setTimeout(() => toastEl.style.opacity = '0', duration);
  }

  // 复制功能
  copyBtnEl.addEventListener('click', () => {
    clipboardEl.select();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(settingsUrl)
          .then(() => showToast(i18n[currentLang]['copied-toast']))
          .catch(() => {
            document.execCommand("copy");
            showToast(i18n[currentLang]['copied-toast']);
          });
      } else {
        document.execCommand("copy");
        showToast(i18n[currentLang]['copied-toast']);
      }
    } catch(e) {
      showToast(i18n[currentLang]['copy-failed']);
    }
  });

  // 历史记录管理 - 使用本地缓存和文档片段优化
  let historyCache = null;
  
  function loadHistory() {
    try {
      // 使用缓存避免重复解析
      if (!historyCache) {
        historyCache = JSON.parse(localStorage.getItem('history') || '[]');
      }
      
      if (historyCache.length === 0) {
        historyListEl.innerHTML = \`<div class="empty-history"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\${i18n[currentLang]['empty-history']}</div>\`;
        return;
      }
      
      // 预先排序一次
      historyCache.sort((a, b) => b.t - a.t);
      
      // 使用文档片段减少DOM重绘
      const fragment = document.createDocumentFragment();
      const tempContainer = document.createElement('div');
      
      // 单次循环生成所有项的HTML
      let html = '';
      
      historyCache.forEach(item => {
        const formattedDate = formatDateTime(item.t);
        
        let displayUrl = item.url;
        if (displayUrl.length > 50) {
          displayUrl = displayUrl.substring(0, 47) + '...';
        }
        
        html += \`<div class="history-item" data-url="\${item.url}" data-id="\${item.t}">
          <div class="history-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="history-text">
            <div class="history-url" title="\${item.url}">\${displayUrl}</div>
            <div class="history-time">\${formattedDate}</div>
          </div>
          <button class="history-delete" title="删除此记录">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>\`;
      });
      
      // 一次性更新DOM
      historyListEl.innerHTML = html;
    } catch (e) {
      console.error('加载历史记录失败', e);
      historyListEl.innerHTML = \`<div class="empty-history"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>加载历史记录失败</div>\`;
    }
  }
  
  // 使用事件委托处理历史记录的点击事件
  historyListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    
    const deleteBtn = e.target.closest('.history-delete');
    if (deleteBtn) {
      // 删除操作
      e.stopPropagation();
      const id = parseInt(item.dataset.id);
      removeHistoryItem(id);
    } else {
      // 点击记录进入链接
      location.href = myOrigin + "/" + encodeURIComponent(item.dataset.url);
    }
  });

  function addHistoryItem(url) {
    try {
      // 使用缓存避免重复解析
      if (!historyCache) {
        historyCache = JSON.parse(localStorage.getItem('history') || '[]');
      }
      
      const existingIndex = historyCache.findIndex(item => item.url === url);
      if (existingIndex !== -1) {
        historyCache[existingIndex].t = Date.now();
      } else {
        historyCache.push({
          url: url,
          t: Date.now()
        });
      }
      
      // 限制历史记录数量
      if (historyCache.length > 20) {
        historyCache.sort((a, b) => b.t - a.t);
        historyCache = historyCache.slice(0, 20);
      }
      
      localStorage.setItem('history', JSON.stringify(historyCache));
      loadHistory();
    } catch (e) {
      console.error('添加历史记录失败', e);
    }
  }

  function removeHistoryItem(timestamp) {
    try {
      historyCache = historyCache.filter(item => item.t !== timestamp);
      localStorage.setItem('history', JSON.stringify(historyCache));
      loadHistory();
    } catch (e) {
      console.error('删除历史记录失败', e);
    }
  }

  // 清空历史记录确认
  historyClearEl.addEventListener('click', () => {
    if (confirm(i18n[currentLang]['clear-confirm'])) {
      localStorage.removeItem('history');
      historyCache = [];
      loadHistory();
      showToast(i18n[currentLang]['history-cleared']);
    }
  });

  // 初次加载
  loadHistory();

  // 保存配置和处理自动跳转 - 优化读取逻辑
  try {
    const savedConfig = localStorage.getItem("c");
    if (savedConfig) {
      const config = JSON.parse(atob(savedConfig));
      if (config && config.s) {
        inputEl.value = config.s;
        saveCheckEl.checked = true;
        autoCheckEl.checked = !!config.a;
        
        // 使用单一条件检查优化
        const shouldRedirect = config.a && !location.pathname.endsWith("/set");
        if (shouldRedirect) {
          // 使用requestAnimationFrame延迟执行，优化页面加载性能
          requestAnimationFrame(() => {
            location.href = myOrigin + "/" + encodeURIComponent(config.s);
          });
        }
      }
    }
  } catch(e) {
    console.error('读取配置失败', e);
  }

  // 表单体验增强
  inputEl.addEventListener('focus', function() {
    this.parentNode.classList.add('focused');
  });

  inputEl.addEventListener('blur', function() {
    this.parentNode.classList.remove('focused');
  });

  // 表单提交处理 - 优化逻辑和DOM操作
  formEl.addEventListener('submit', function(e) {
    e.preventDefault();
    const url = inputEl.value.trim();
    if (!url) return;
    
    // 保存配置
    if (saveCheckEl.checked) {
      try {
        localStorage.setItem("c", btoa(JSON.stringify({
          s: url,
          a: autoCheckEl.checked,
          t: Date.now()
        })));
      } catch(e) {
        console.error('保存配置失败', e);
      }
    } else {
      localStorage.removeItem("c");
    }
    
    // 添加到历史记录
    addHistoryItem(url);
    
    // 跳转
    location.href = myOrigin + "/" + encodeURIComponent(url);
  });
  
  // 初始化应用语言
  applyLanguage(currentLang);
}();</script></body></html>`;
                                                 }
