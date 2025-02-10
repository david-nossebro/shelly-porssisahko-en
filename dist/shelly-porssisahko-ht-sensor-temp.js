/**
 * @license
 * 
 * shelly-porssisahko
 * shelly-porssisahko-en
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * https://github.com/jisotalo/shelly-porssisahko-en
 * 
 * License: GNU Affero General Public License v3.0 
 */
const CNST={INST_COUNT:"undefined"==typeof INSTANCE_COUNT?3:INSTANCE_COUNT,HIST_LEN:"undefined"==typeof HIST_LEN?24:HIST_LEN,ERR_LIMIT:3,ERR_DELAY:120,DEF_INST_ST:{chkTs:0,st:0,str:"",cmd:-1,configOK:0,fCmdTs:0,fCmd:0},DEF_CFG:{COM:{g:"fi",vat:25.5,day:0,night:0,names:[]},INST:{en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,i:0,m:60,oc:0}}};let _={s:{v:"3.2.0",dn:"",configOK:0,timeOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,enCnt:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[CNST.DEF_INST_ST],p:[[],[]],h:[],c:{c:CNST.DEF_CFG.COM,i:[CNST.DEF_CFG.INST]}},_i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0,cmd=[],prevEpoch=0,loopRunning=!1;function getKvsKey(e){let t="porssi";return t=0<=e?t+"-"+(e+1):t}function isCurrentHour(e,t){t-=e;return 0<=t&&t<3600}function limit(e,t,n){return Math.min(n,Math.max(e,t))}function epoch(e){return Math.floor((e?e.getTime():Date.now())/1e3)}function getDate(e){return e.getDate()}function updateTz(e){let t=e.toString(),n=0;"+0000"==(t=t.substring(3+t.indexOf("GMT")))?(t="Z",n=0):(n=+t.substring(0,3),t=t.substring(0,3)+":"+t.substring(3)),t!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=t,_.s.tzh=n}function log(e){console.log("shelly-porssisahko: "+e)}function reqLogic(){for(let e=0;e<CNST.INST_COUNT;e++)_.si[e].chkTs=0}function updateState(){var e=new Date,t=(_.s.timeOK=null!=Shelly.getComponentStatus("sys").unixtime&&2e3<e.getFullYear(),_.s.dn=Shelly.getComponentConfig("sys").device.name,epoch(e));for(_.s.timeOK&&300<Math.abs(t-prevEpoch)&&(log("Time changed 5 min+ -> refresh"),_.s.p[0].ts=0,_.s.p[0].now=0,_.s.p[1].ts=0,_.p[0]=[],_.p[1]=[]),prevEpoch=t,_.s.enCnt=0,_i=0;_i<CNST.INST_COUNT;_i++)_.c.i[_i].en&&_.s.enCnt++;!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(e))}function getConfig(p){var e=getKvsKey(p);Shelly.call("KVS.Get",{key:e},function(t,e,n){p<0?_.c.c=t?JSON.parse(t.value):{}:_.c.i[p]=t?JSON.parse(t.value):{},"function"==typeof USER_CONFIG&&USER_CONFIG(p,!0);{t=p;var s=function(e){p<0?_.s.configOK=e?1:0:(log("config for #"+(p+1)+" read, enabled: "+_.c.i[p].en),_.si[p].configOK=e?1:0,_.si[p].chkTs=0),loopRunning=!1,Timer.set(500,!1,loop)};let e=0;if(CNST.DEF_CFG.COM||CNST.DEF_CFG.INST){var o,i=t<0?CNST.DEF_CFG.COM:CNST.DEF_CFG.INST,c=t<0?_.c.c:_.c.i[t];for(o in i)if(void 0===c[o])c[o]=i[o],e++;else if("object"==typeof i[o])for(var r in i[o])void 0===c[o][r]&&(c[o][r]=i[o][r],e++);t>=CNST.INST_COUNT-1&&(CNST.DEF_CFG.COM=null,CNST.DEF_CFG.INST=null),0<e?(t=getKvsKey(t),Shelly.call("KVS.Set",{key:t,value:JSON.stringify(c)},function(e,t,n,s){t&&log("failed to set config: "+t+" - "+n),s(0==t)},s)):s(!0)}else s(!0)}})}function loop(){try{if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let e=0;e<CNST.INST_COUNT;e++)if(!_.si[e].configOK)return void getConfig(e);for(let e=0;e<CNST.INST_COUNT;e++)if(function(e){var t=_.si[e],n=_.c.i[e];if(1!=n.en)return void(_.h[e]=[]);var e=new Date,s=new Date(1e3*t.chkTs);return 0==t.chkTs||s.getHours()!=e.getHours()||s.getFullYear()!=e.getFullYear()||0<t.fCmdTs&&t.fCmdTs-epoch(e)<0||0==t.fCmdTs&&n.m<60&&e.getMinutes()>=n.m&&t.cmd+n.i==1}(e))return void Timer.set(500,!1,logic,e);"function"==typeof USER_LOOP?USER_LOOP():loopRunning=!1}else getConfig(-1)}catch(e){log("error at main loop:"+e),loopRunning=!1}}function pricesNeeded(e){var t=new Date;let n=!1;return n=1==e?_.s.timeOK&&0===_.s.p[1].ts&&15<=t.getHours():((e=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(t))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||e)),_.s.errCnt>=CNST.ERR_LIMIT&&epoch(t)-_.s.errTs<CNST.ERR_DELAY?n=!1:_.s.errCnt>=CNST.ERR_LIMIT&&(_.s.errCnt=0),n}function getPrices(r){try{log("fetching prices for day "+r);let i=new Date;updateTz(i);var t=1==r?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let e=t.getFullYear()+"-"+(t.getMonth()<9?"0"+(1+t.getMonth()):1+t.getMonth())+"-"+(getDate(t)<10?"0"+getDate(t):getDate(t))+"T00:00:00"+_.s.tz.replace("+","%2b");var n=e.replace("T00:00:00","T23:59:59");let c={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+e+"&end="+n,timeout:5,ssl_ca:"*"};i=null,e=null,Shelly.call("HTTP.GET",c,function(t,e,n){c=null;try{if(0!==e||null==t||200!==t.code||!t.body_b64)throw Error(e+"("+n+") - "+JSON.stringify(t));{t.headers=null,n=t.message=null,_.p[r]=[],_.s.p[r].avg=0,_.s.p[r].high=-999,_.s.p[r].low=999,t.body_b64=atob(t.body_b64),t.body_b64=t.body_b64.substring(1+t.body_b64.indexOf("\n"));let e=0;for(;0<=e;){t.body_b64=t.body_b64.substring(e);var s=[e=0,0];if(0===(e=1+t.body_b64.indexOf('"',e)))break;s[0]=+t.body_b64.substring(e,t.body_b64.indexOf('"',e)),e=2+t.body_b64.indexOf('"',e),e=2+t.body_b64.indexOf(';"',e),s[1]=+(""+t.body_b64.substring(e,t.body_b64.indexOf('"',e)).replace(",",".")),s[1]=s[1]/10*(100+(0<s[1]?_.c.c.vat:0))/100;var o=new Date(1e3*s[0]).getHours();s[1]+=7<=o&&o<22?_.c.c.day:_.c.c.night,_.p[r].push(s),_.s.p[r].avg+=s[1],s[1]>_.s.p[r].high&&(_.s.p[r].high=s[1]),s[1]<_.s.p[r].low&&(_.s.p[r].low=s[1]),e=t.body_b64.indexOf("\n",e)}if(t=null,_.s.p[r].avg=0<_.p[r].length?_.s.p[r].avg/_.p[r].length:0,_.s.p[r].ts=epoch(i),_.p[r].length<23)throw Error("invalid data received")}}catch(e){log("error getting prices: "+e),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[r].ts=0,_.p[r]=[]}0==r&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)})}catch(e){log("error getting prices: "+e),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[r].ts=0,_.p[r]=[],0==r&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)}}function logic(r){try{"function"==typeof USER_CONFIG&&USER_CONFIG(r,!1),cmd[r]=!1;var e,t,n=new Date;updateTz(n),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var t=epoch();for(let e=0;e<_.p[0].length;e++)if(isCurrentHour(_.p[0][e][0],t))return _.s.p[0].now=_.p[0][e][1];_.s.timeOK=!1,_.s.p[0].ts=0,_.s.errCnt+=1,_.s.errTs=epoch()}else _.s.p[0].ts,_.s.p[0].now=0}();let i=_.si[r],c=_.c.i[r];function s(e){if(null==e)loopRunning=!1;else if(cmd[r]!=e&&(i.st=12),cmd[r]=e,c.i&&(cmd[r]=!cmd[r]),log("logic for #"+(r+1)+" done, cmd: "+e+" -> output: "+cmd[r]),1==c.oc&&i.cmd==cmd[r])log("outputs already set for #"+(r+1)),i.cmd=cmd[r]?1:0,i.chkTs=epoch(),loopRunning=!1;else{let s=0,o=0;for(let e=0;e<c.o.length;e++)!function(e,o,i){e="{id:"+o+",on:"+(cmd[e]?"true":"false")+"}",Shelly.call("Switch.Set",e,function(e,t,n,s){0!=t&&log("setting output "+o+" failed: "+t+" - "+n),i(0==t)},i)}(r,c.o[e],function(e){if(s++,e&&o++,s==c.o.length){if(o==s){if(i.cmd!=cmd[r]){for(var t=r,n=0<_.s.enCnt?CNST.HIST_LEN/_.s.enCnt:CNST.HIST_LEN;0<CNST.HIST_LEN&&_.h[t].length>=n;)_.h[t].splice(0,1);_.h[t].push([epoch(),cmd[t]?1:0,_.si[t].st])}i.cmd=cmd[r]?1:0,i.chkTs=epoch(),Timer.set(500,!1,loop)}loopRunning=!1}})}}0===c.mode?(cmd[r]=1===c.m0.c,i.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(n)?1===c.mode?(cmd[r]=_.s.p[0].now<=("avg"==c.m1.l?_.s.p[0].avg:c.m1.l),i.st=cmd[r]?2:3):2===c.mode&&(cmd[r]=function(e){var t=_.c.i[e],n=(t.m2.ps=limit(0,t.m2.ps,23),t.m2.pe=limit(t.m2.ps,t.m2.pe,24),t.m2.ps2=limit(0,t.m2.ps2,23),t.m2.pe2=limit(t.m2.ps2,t.m2.pe2,24),t.m2.c=limit(0,t.m2.c,0<t.m2.p?t.m2.p:t.m2.pe-t.m2.ps),t.m2.c2=limit(0,t.m2.c2,t.m2.pe2-t.m2.ps2),[]);for(_inc=t.m2.p<0?1:t.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==t.m2.p&&1<=_i?t.m2.c2:t.m2.c)<=0)){var s=[];for(_start=_i,_end=_i+t.m2.p,t.m2.p<0&&0==_i?(_start=t.m2.ps,_end=t.m2.pe):-2==t.m2.p&&1==_i&&(_start=t.m2.ps2,_end=t.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)s.push(_j);if(t.m2.s){for(_avg=999,_startIndex=0,_j=0;_j<=s.length-_cnt;_j++){for(_sum=0,_k=_j;_k<_j+_cnt;_k++)_sum+=_.p[0][s[_k]][1];_sum/_cnt<_avg&&(_avg=_sum/_cnt,_startIndex=_j)}for(_j=_startIndex;_j<_startIndex+_cnt;_j++)n.push(s[_j])}else{for(_j=0,_k=1;_k<s.length;_k++){var o=s[_k];for(_j=_k-1;0<=_j&&_.p[0][o][1]<_.p[0][s[_j]][1];_j--)s[_j+1]=s[_j];s[_j+1]=o}for(_j=0;_j<_cnt;_j++)n.push(s[_j])}if(-1==t.m2.p||-2==t.m2.p&&1<=_i)break}let i=epoch(),c=!1;for(let e=0;e<n.length;e++)if(isCurrentHour(_.p[0][n[e]][0],i)){c=!0;break}return c}(r),i.st=cmd[r]?5:4,!cmd[r]&&_.s.p[0].now<=("avg"==c.m2.l?_.s.p[0].avg:c.m2.l)&&(cmd[r]=!0,i.st=6),cmd[r])&&_.s.p[0].now>("avg"==c.m2.m?_.s.p[0].avg:c.m2.m)&&(cmd[r]=!1,i.st=11):_.s.timeOK?(i.st=7,e=1<<n.getHours(),(c.b&e)==e&&(cmd[r]=!0)):(cmd[r]=1===c.e,i.st=8),_.s.timeOK&&0<c.f&&(t=1<<n.getHours(),(c.f&t)==t)&&(cmd[r]=(c.fc&t)==t,i.st=10),cmd[r]&&_.s.timeOK&&n.getMinutes()>=c.m&&(i.st=13,cmd[r]=!1),_.s.timeOK&&0<i.fCmdTs&&(0<i.fCmdTs-epoch(n)?(cmd[r]=1==i.fCmd,i.st=9):i.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(r,cmd[r],s):s(cmd[r])}catch(e){log("error running logic: "+JSON.stringify(e)),loopRunning=!1}}let _avg=999,_startIndex=0,_sum=0;log("v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),_.c.i.pop(),_.si.pop();for(let e=0;e<CNST.INST_COUNT;e++)_.si.push(Object.assign({},CNST.DEF_INST_ST)),_.c.i.push(Object.assign({},CNST.DEF_CFG.INST)),_.c.c.names.push("-"),_.h.push([]),cmd.push(!1);CNST.DEF_INST_ST=null,prevEpoch=epoch(),HTTPServer.registerEndpoint("",function(n,s){try{if(loopRunning)return n=null,s.code=503,void s.send();var o=function(e){var t={},n=e.split("&");for(let e=0;e<n.length;e++){var s=n[e].split("=");t[s[0]]=s[1]}return t}(n.query),i=parseInt(o.i);n=null;let e="application/json",t=(s.code=200,!0);var c="text/html",r="text/javascript";if("s"===o.r)updateState(),0<=i&&i<CNST.INST_COUNT&&(s.body=JSON.stringify({s:_.s,si:_.si[i],c:_.c.c,ci:_.c.i[i],p:_.p})),t=!1;else if("c"===o.r)updateState(),0<=i&&i<CNST.INST_COUNT?s.body=JSON.stringify(_.c.i[i]):s.body=JSON.stringify(_.c.c),t=!1;else if("h"===o.r)0<=i&&i<CNST.INST_COUNT&&(s.body=JSON.stringify(_.h[i])),t=!1;else if("r"===o.r){if(0<=i&&i<CNST.INST_COUNT)log("config changed for #"+(i+1)),_.si[i].configOK=!1;else{log("config changed");for(let e=0;e<CNST.INST_COUNT;e++)_.si[e].configOK=!1}_.s.configOK=!1,reqLogic(),loopRunning||(loopRunning=!0,getConfig(i)),_.s.p[0].ts=0,_.s.p[1].ts=0,s.code=204,t=!1}else"f"===o.r&&o.ts?(0<=i&&i<CNST.INST_COUNT&&(_.si[i].fCmdTs=+(""+o.ts),_.si[i].fCmd=+(""+o.c),_.si[i].chkTs=0),s.code=204,t=!1):o.r?"s.js"===o.r?(s.body=atob("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"),e=r):"s.css"===o.r?(s.body=atob("H4sIAAAAAAAACpVWTW/jNhD9K4MNFki8liwl6zSh0KA9LVB0i17aS9EDRY0s1hRJkONEXsP/vSD1YTlxsO3FMMkZzpt584ZaLRawAN+gUvvEGue99LzZmoubCWoI5tfiBn7ZeS9BekNcGUigIbJstfpn2ElrCYu46dlqtZHU7MpUmHYyWF2M+f8cRjy/SoHaI4Mvv/0BP9c1OgNfUKPjCn7flUqK0QSe79IMFitYwAFK0yVefpN6w6A0rkKXlKYr4AilqfZL4HAAYZRxDK5Q1Fmdj2fBmYvtxpmdrhhc3Yo7XGcFKKkxaVBuGmKQp5+xLaA2mkIYZJClj9NOzVup9gz+RFdxzQtoeZe8yIoaBp8fXbAbVnmWfQzHbiM1gwz4jkwBlldVRL62HeSZjbivSJJCOMyDDjB6/6Q0RKaNXtFBGLs/t8/Sh2DPldzoxKOqGdQKuwR1VQBhR0k8YuBCmuGStFYdHKCS3iq+783jPvHSwwGs8ZKkCS6oOMlnLM7Ll/NSPIrJhbESa+NwOS55TegiGZpQE4MPH4pTOOKlwpnzZK2Qu8AsNeNpyFQZTgwU1j128ktImzl8bfR0XaJ4iWp+Wiojtq+Yvk1/WIeaTZxkkKe3YWdoKzfY2Q68UbKCq/yeZw/rAsTO+dBg1khN6Ka4Q6pwOO+CUyl56Y3aERbwLZG6wo5BXgAZe4ITcmSQzXDlsa/Oal/XdTF1+djHxnIhaR+dY42YaFBssfp0VpTvX9Tnf+GeeMWnV6lOYfNZVre9q7FzFjZOVkX8TQhbqzhhIozatdozyGsXRRL+RGdv9ayQ6W2swkmm/XqCGtcDT+S49pY71DSROeY4du2wTcaORy+NDMSM5PNK7jyDdSCQa9nynsGAKvexk7gDqWupo9uUpNSxy4aOO8JPW9zXjrfooc8o9AQcepC1cS0DZ4gTXt/dZxVubuAIx14eqRBPFCbXE7knqlgtnadENFJVS0jLzXIw8y2Qm5+Os+FlqFZpVFXAMzqSgqtxFJCx70u6Vl3SmsCzivrDLqmkQzGMBPMSc2uxkvx6PgQfMtvdwOHyjLoPlM2nUS/oYcpFGSQPtpv1zneaZbR8Aqap6ZO/vgvxVwv4yrdSb4AahDtXQe8MGwNkQGNHkcTFqo/RnzLIYQVJfDL62rZzBpZwVW6f3psuZ5q/6P+KoyHvQfEh71NXRvVN71s//rPZtW8Zn/vmtoNScbHtFfEfGO3zf234VMnnCegAYIBwiujDAIgDdK42xW143Md/b8tzwnwB7/yh7EkWQTOz1hE4jd5azkfux6KXcsSF4WV4cdxGw5f8IZtZPoyXt5RnJz76Cg6Pc6hGPtQrjrhg7tbzosTHPBumZavWr5kdo5RLuPKJaN+R5xGktjv6i/YWfyx3REb//fqjIA8COp5kf7jwoTJkN8rjNCJC3KmudwHU5Xr6XdtyF8T79p37F+1MBlZ6CgAA"),e="text/css"):"status"===o.r?(s.body=atob("H4sIAAAAAAAACpWSzU7DMBCEX8XKCSrl74DEwfUFTggEEk/geB3kyvYGe5OUt0f5qVugRXCxZH2zM7OWOcnGaqasjHGbOaZUJjgFwQnEvR6M0kx6YAo9BbScgBnYxhz8QbWOjvVtJZ576npiHsckVA7EI0ow/q0oiqNzVMF0ZNAnZaQU/BKm3FMbj2OiTwg6AYegE3klSUdkfIuCl/OCgoMZDlu2ds9au88dNrlCm32BpCZWMxdufgBHdZUJ3iwFIyME+cHLRvASzCD48pZzeGeqs9mnLnfLo16wWQZIrX4ndovqXGf7l84OQ8DxUu36H7V/daq/F17O2Hdis8FBh2BA83K6z0nz1JDWTvr5o4ig3x/iVUayySNJ6mOxi9k1L1f8Ce8QLX7HAgAA"),e=c):"status.js"===o.r?(s.body=atob("H4sIAAAAAAAACoVXW2/bOBZ+n19BsxmVrGRGcge7qCXamOlMpw/tdLA1sA+BsVEkWhYikQ55rDSw9N8H1MWWE3ebJugheS4fz5U6FALQA38dgV5EkKJEFWYXS47f4sVfCtCTAHQv1aOMriFdRNegF6/DREkD6I4TyheHKtYIOPDFgyFAWS6l0B9Xnz9xjEMg2EyTMsXUezBHmhl4KgRLVKE0x69838dey5lKTDtKqseBLFUqBnrnH6n8RAanzSOZy40aaAOYNqHFmfDYPMkEAV8cQD8d8g2Buq5UniKfc24gBkHvyDna0Y0+qTjNZcYYw6EojLAKJp0UbLV6RH9orTTBUqE0hhjT0Lp30yn2tnzDTItD8A1LPGPXectS2Y3cA04qJuSSXLZvWFKmS/zlLzzHXz58wN91as+YaSEknmMt0oG38+ZI5+cvv//xv6+r/9xUzJ6te742ACM2P9qwHSuEzGC73LLdjb9mUj0yUB/ybyIlM+pilFzf/3eL53gwZh0/0vHOupgZWH5d/brqjNrlmmmxK+JEEPyzwd5G6TKG32MQq7wURIpHZBckEG/fGLZ5X6YrQ71JQOn8mR6XVCxfYkRyWQkNIqUWC/UwnrR2teOQS8BcjqM7vbB/2G0ZhwTosujMDYYl2/uVWeIve9jtASVbkdyLFMWAsNthv4S7FaJ0jt9b/lxmSLXyNpXonJxy7oVJbMtQyPiuOEXxeWLcvlcStCrQq6tDLg24QYNyI18fBW+/X3+2/Ki3ZamsaxzlbdUbAdF1vsA0FEzGpTA3VuvacQi4HKMaYffsgHrg8ltEkhcw6GDZ1vYIMXznulb9FGGX+FGfZWCW+G+dJ8Kg/S6N4Ue+/hzDlpXxN3KU9ywVWIraCPwpAGwAdq3SNgA9mOrcqV8h1r25q8P/S8st2+9sdBtE9jvIS4GuDoQceSjLRAeUTi/JnY7pdSDeXv/Lt7+zX+ixunCAaYPS+MlQNEWV0CZXEt26W1a1/UTa/nvoOsuplRexMRwDusvw4tdK6DgTXRd/fvhJPQoDl88+5tn2eNi1fy1gr6XtmGCjI9yHuXBvf0L9j7V/XNhlurg6AIurbNQtmq5ZtGovMBdnreUHzNs82/6Iu4V+23ia9y2gHSCjaMs+X4ZcaGfJi/NgTT2ivfQ0+F6ji/628bzs0DaXLx91LWXs6nxD/Am3lnWbv63RnN+s7cmMc951bdrHvmLljO0ifxnMOzLcKE3sgAHuh2B7uFXUtfEQXN5Llnw647204wQRh2W7SGadnsSam5Ay4j7tJJTFYBULDp7h4Pb2BgSOY9NjSQZMxjM9Jej8zBjn4DgnvtmJcUZH8EUIkXGcCYHF2S2mAQ3Bdaliu73ZEqAWaqvA0EMn+u7dO09y/6jMcD80EVeDhjI0rtsxixEbcGNtumWrX7i8s3ujbmC9vgnWobguI4sduLguPckNbU6yMoRI9rJ5h80K0qZ9N7y0FYQQqVNk3M7NMbdCLZvgMA1CP+LCcXoksYURHWGJHtZ0StWNcIM1t3thT8fNeS5cgJZvyDQYQlPXz3OC3mkR3zdN0zvRk3xC0nFTPwXMXk48yzcx3Go3uFKsvYSftcSuBAv7Dto4QRQJyrn9z3HsTjLe8lYXuHzOR4xexnFcZbi/R7nsKymusi6xy7BzCPGPteQ4FSt9+4Cq62C0a4s/4uSkL2DFM30BK2hdz0ZCOctlUuxTYYigg47snOeF4tkLxTNWjKXtYrIKK5a32TcB6tlnY13bRdAtHGdsg5zqkoghqqauj7Sg5/Eecc3GbDNa1340cIkFN33lU8chxu3ZbGZI6qXjuX4bgUbty4Pjq0Nih95HtdeGUM7PR2W/3QZTL/FGSZg+ijzbwvxOFWloX3XN1UEu8V2c3Gda7WU6fyVS+687xOMx0Q6KodFucsCLYZq3Qzexb8nm+WwZpkv3cPjRJDrOoiV2Xn2b/Tv4ZQBZ1PVqid+8aZcvBlg3lPp5euzyzVlNuQ8NDTXxh7nkY0o9TYJhHWBKmyaJIbHd72C/zVQhmGi/RIB63/+csQ8c2Bu0l+0XHiJ2mJbCmDgTp4fbhSej/Z5omjAh1Hv/29eugyS0+QfICS8MTA4AAA=="),e=r):"history"===o.r?(s.body=atob("H4sIAAAAAAAACmWNOw7CMBBEr2K5giJY6TdbUdHQcAH/AoscHLybKLk9IgSElGaKefOBQKPyyTI3uk2TatNUddlVPieN8AfFv1mtEcS6FBGkIEj4YeWuGi/UxY15HqQfZGMfI/tCvVB+gFnGXA6zotBwdSMWBLM+mUDjVz8dLPF54p0W65ZsLvPhznoPZuUvUGxSH9cAAAA="),e=c):"history.js"===o.r?(s.body=atob("H4sIAAAAAAAAClWSUW/TMBDHv4p3KsgmabZR8dLUqYAx7WFs0hqeooi57qW18OxiXzZVWb47Sgqok/xwtny/++tndxaJRVnVufYuEltLkkX3O3KI052JBCIzzmG4Kb/fSlhQKBa0YdrbuFdOzoo7z4ZrPhwW57QpFucUCujzZxWYlioenGYDcNgHeYrNKRw603B6fXWttVJGUoQiILXBsTUXuWk4kFpP//JBSqXJPGOp1mIEYqqkelGG2BbpSpHiPx5uVwksg9y9NxIS4yKNHJX5X2KYdsajVNlGkRKZRbel3cnEHm1EZhr+6WJ2JqXKtN+8SRROXUDe+MCR+YbFLPpAnFMahCxCdVFPqbqoxTGmO3qD1Ek+rEQ+jg6tilFCYwiKSdf48KSoNE/IHb6wK0XIL3H2AUdOP8p9FMnYGelgUYL21of5pMPqsl7CNiA6mEPADfQD8Xh839K+JXZ/B/P/9fU1vAEWk25Vfi6//VyVDxVWH+t6mQXcW6WRA+OtI2PZuyggBfgXJYHjU586SaTr+14r0jtOohs+lLeYYQg+cBLpqT7q+1xzkX79ssr2bdxxLfo/Hd7yEYwCAAA="),e=r):"config"===o.r?(s.body=atob("H4sIAAAAAAAACpVWXW/iOBT9K1ZWq2kfQsDtzlQoWGIZumUFpCp0+2ycC/HWH6nthGF//SokARJaOvOC4Pp+HJ977jVhzHPE4wFbb3yBmKDWDhwjU01jrjadTicMYp6T8OiGrNsJGMTcpoLu+korKI/LYM8xtPJKn7VWzrf8P+j3OhgkGUWzWTRHi/FyOZn/tahSO7oSUEdLxJhHQmdI6GIy0plyZld8DS0IYK4AsSGhTh3XCuVUZDBYc3LPlaAqbtoByNg6rTht2kVOptTlZ2ZHptwlGS0CgrJcjaSCt+3ddck/w+UeEFdptseTU4eKWw5uCPq9hr40VNk1GLQGsIWh+83HuI+OYTHdHcJY8PqSnLAoXa9LMPa7304jFN8krhVTchjsSWz3ochyoRnz5VM0Rb+FNqVq31xOwqD4QT7tzCkfY1W4xXtOBF2BqKlxuxQGLAH2utI/igKgCIrmQXR/HwaVZ8XWnEpokqoOZzMdQ0sBUsdA2j0iiwSE2CGduTRztplOZ86WzN0e/F8Md9BwP1bQrCWyLhmKLd3ZprVHIuWzhKoNnMEZaeWMFkhylTlo4ZFcHRopuapjJioH4yoyP2CRq/xQ40/KXrMUJTozRYHiePV6OB1LMBtQbPczvTHmo+ZEORjD4+oKMTjKha2FKv4goc2kpGZHFoneBgmPCy4qU6UhHg/WSa0kK/fK9I6yDaqk7wq5UjGZDefPwymaRd/Hv6TPaN/gn6BAdn0m4zMWLkB6fJqMxmg6mU2WvwTp0XAGSHDJXUsWPV9w2R7xjwGMHsbDx/FiiR6i56fPF+ophiWXgFIwXMft6cJ+Cqalf3xL8G3SUj8mPdyy3ZG7luUr+dqy3JJ2phty07Jg0s7s9wjLrNMSXfUq4NctD3zwwJWHvT7MJSoXXUlBQlxxf1NMbr/ees7UqsY+K2d4n67VI+yntm5Rv9tFPmoewslhPUMPOjOIFc/ZWTKmjjs9aWLAJyAQfgcGvogDN4GcJT6Ceic5Uw43cJU7Ft4yUI5TcWlFSezbt8P+KBcn0upM8WX6KkJwWSu+3vz0Rwel785KI1JemJTqGfROLmdpDiXmVebcQT0LmgM5+btz9o7u/78M598XZ06O1emPz3ejQrH/tGFQlfJmVGVUIF1tVo+EK/NJCq2Y4Ox18GXLVay3HZ2CuvIC7/pLlbN6/l5g9Tzx6ouUn5YZnjpi4O1ve+U5uvKZVmu+6fxrvWJAyuP/ASvBRdcMCgAA"),e=c):"config.js"===o.r?(s.body=atob("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"),e=r):s.code=404:(s.body=atob("H4sIAAAAAAAACqVTS27bMBC9CssChY1aUrMrYpJZJAHarAoUyLagybE1MU2qnLENo+hteoZcIBcr9HFjJQ2QopuRZubNm8dHSb3xyfGhgZo3wag2imDjSkM0agNshattJmC95WXx0ShGDmC+PNxnIqSHX/X64V5VfbUfiHYDeoewb1Jm4VJkiKzlHj3X2sMOHRRdMsOIjDYU5GwAfSaN8rgTLlgizanpU/T6rzuHHjUYhxFqolGVx90xdoEggOMWipHYqNQwpih2NmxBfzCXKXJOQbw9U1UPPZlup1xqDuZdG+fiZkuE4jMltiGJibKizrDUNXND51V1h32nXKJgm1fA+tsi2Lg2Jx1VWTN9KvN4aLugJ7lRGJsti/aOdLYeU2+w7Yyxi4LY8paEq8GtwevheSQgI1SwCwhimfIIf1xQdG3ztSurqs/GGorhEjs7ikeSZ27/g+waiVM+vKzzCeCP0E99/bVKB5r/kepSXOLqZaXj/qOjwIxx9WpPe5qx0D6Sy9iwcSkSi6vrW73H6NO+DMnZ9mMuU8YVxhKjC1sPNJFtJ9SJWE7nAVh47ZPbbiDyzGWwDNcB2kyDNr4clSYwndmmgegvawy+RyySP5Qn1RaU4fsNte0fO5sF6TGL7EXL6ZxKyk5fXd9ewLm8yFq+hzJDE6yDiWwPLmdSjnZOaPpz5ugZZcC4ltO5IyozBC2JDwGoBmDZwsvuZ2wXSSodkezW9a8jekc0yJ9IKu9ITlU1ePwbJRfPYBAFAAA="),e=c);s.headers=[["Content-Type",e]],t&&s.headers.push(["Content-Encoding","gzip"])}catch(e){log("server error: "+e),s.code=500}s.send()}),Timer.set(1e4,!0,loop),loop();
//end

/**
 * Tämä käyttäjäskripti hyödyntää Shelly H&T:n (Gen 1, Plus, Gen 3) lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Tämä muuttaa ainoastaan #1 ohjauksen asetuksia, muihin ei kosketa.
 * 
 * Käyttöönotto:
 * -----
 * Shelly H&T gen 1
 * -----
 * Lisää Shelly H&T-asetuksiin "actions >- sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 * 
 * -----
 * Shelly H&T Plus ja H&T gen 3
 * -----
 * Lisää uusi Action->Temperature
 * Laita Then Do -kohdalla alle uusi osoite
 *    http://ip-osoite/script/1/update-temp?temp=$temperature
 * missä ip-osoite on tämän Shellyn osoite. 
 */

//Mitä ohjausta hienosäädetään (0 = ohjaus #1, 1 = ohjaus #2 jne.)
let INSTANCE = 0;

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;

//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(inst, initialized) {
  //Jos kyseessä on jonkun muun asetukset niin ei tehdä mitään
  if (inst != INSTANCE) {
    return;
  }

  //Vähän apumuuttujia
  const state = _;
  const config = state.c.i[inst];

  //Jos asetuksia ei vielä ole, skipataan (uusi asennus)
  if (typeof config.m2 == "undefined") {
    console.log("Tallenna asetukset kerran käyttäjäskriptiä varten");
    return;
  }

  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.c;
    originalConfig.minutes = config.m;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.si[inst].str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

    } else {
      let age = (Date.now() - data.ts) / 1000.0 / 60.0 / 60.0;
      console.log("Lämpötila on tiedossa (päivittynyt " + age.toFixed(2) + " h sitten):", data);

      if (age <= TEMPERATURE_MAX_AGE_HOURS * 60) {
        //------------------------------
        // Toimintalogiikka
        // muokkaa haluamaksesi
        //------------------------------

        //Muutetaan lämpötilan perusteella lämmitystuntien määrää ja minuutteja
        if (data.temp <= -15) {
          hours = 8;
          minutes = 60;

        } else if (data.temp <= -10) {
          hours = 7;
          minutes = 45;

        } else if (data.temp <= -5) {
          hours = 6;
          minutes = 45;

        } else {
          //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
        }

        //------------------------------
        // Toimintalogiikka päättyy
        //------------------------------
        state.si[inst].str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.si[inst].str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.si[inst].str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.c = hours;
  config.m = minutes;
}

/**
 * Apufunktio, joka kerää parametrit osoitteesta
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Takaisinkutsu, joka suoritetaan kun saadaan HTTP-pyyntö
 */
function onHttpRequest(request, response) {
  try {
    let params = parseParams(request.query);
    request = null;

    if (params.temp != undefined) {
      data = {
        temp: Number(params.temp),
        ts: Math.floor(Date.now())
      };

      console.log("Lämpötilatiedot päivitetty, pyydetään pörssisähkölogiikan ajoa. Data:", data);

      _.si[INSTANCE].chkTs = 0; //Requesting to run logic again

      response.code = 200;

    } else {
      console.log("Lämpötilatiedojen päivitys epäonnistui, 'temp' puuttuu parametreista:", params);
      response.code = 400;
    }

    response.send();

  } catch (err) {
    console.log("Virhe:", err);
  }
}

//Rekisteröidään /script/x/update-temp -osoite
HTTPServer.registerEndpoint('update-temp', onHttpRequest);