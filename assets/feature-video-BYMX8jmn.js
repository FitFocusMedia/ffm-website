import{aq as bt,ar as cr,as as pr,at as Ae,au as hr,av as br,aw as Aa,ax as vr,ay as _e,az as Ht,aA as Gt,aB as Er,aC as Xe,aD as gr,aE as Fe,aF as He}from"./vendor-misc-BT9kFnKO.js";var R=cr,O={VIDEO:"video",THUMBNAIL:"thumbnail",STORYBOARD:"storyboard",DRM:"drm"},f={NOT_AN_ERROR:0,NETWORK_OFFLINE:2000002,NETWORK_UNKNOWN_ERROR:2e6,NETWORK_NO_STATUS:2000001,NETWORK_INVALID_URL:24e5,NETWORK_NOT_FOUND:2404e3,NETWORK_NOT_READY:2412e3,NETWORK_GENERIC_SERVER_FAIL:25e5,NETWORK_TOKEN_MISSING:2403201,NETWORK_TOKEN_MALFORMED:2412202,NETWORK_TOKEN_EXPIRED:2403210,NETWORK_TOKEN_AUD_MISSING:2403221,NETWORK_TOKEN_AUD_MISMATCH:2403222,NETWORK_TOKEN_SUB_MISMATCH:2403232,ENCRYPTED_ERROR:5e6,ENCRYPTED_UNSUPPORTED_KEY_SYSTEM:5000001,ENCRYPTED_GENERATE_REQUEST_FAILED:5000002,ENCRYPTED_UPDATE_LICENSE_FAILED:5000003,ENCRYPTED_UPDATE_SERVER_CERT_FAILED:5000004,ENCRYPTED_CDM_ERROR:5000005,ENCRYPTED_OUTPUT_RESTRICTED:5000006,ENCRYPTED_MISSING_TOKEN:5000002},Ge=e=>e===O.VIDEO?"playback":e,Q=class ce extends Error{constructor(t,a=ce.MEDIA_ERR_CUSTOM,r,i){var n;super(t),this.name="MediaError",this.code=a,this.context=i,this.fatal=r??(a>=ce.MEDIA_ERR_NETWORK&&a<=ce.MEDIA_ERR_ENCRYPTED),this.message||(this.message=(n=ce.defaultMessages[this.code])!=null?n:"")}};Q.MEDIA_ERR_ABORTED=1,Q.MEDIA_ERR_NETWORK=2,Q.MEDIA_ERR_DECODE=3,Q.MEDIA_ERR_SRC_NOT_SUPPORTED=4,Q.MEDIA_ERR_ENCRYPTED=5,Q.MEDIA_ERR_CUSTOM=100,Q.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail.",3:"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",4:"An unsupported error occurred. The server or network failed, or your browser does not support this format.",5:"The media is encrypted and there are no keys to decrypt it."};var h=Q,fr=e=>e==null,vt=(e,t)=>fr(t)?!1:e in t,at={ANY:"any",MUTED:"muted"},k={ON_DEMAND:"on-demand",LIVE:"live",UNKNOWN:"unknown"},G={MSE:"mse",NATIVE:"native"},pe={HEADER:"header",QUERY:"query",NONE:"none"},Be=Object.values(pe),X={M3U8:"application/vnd.apple.mpegurl",MP4:"video/mp4"},Zt={HLS:X.M3U8};[...Object.values(X)];var Tr="en",rt={code:Tr},L=(e,t,a,r,i=e)=>{i.addEventListener(t,a,r),e.addEventListener("teardown",()=>{i.removeEventListener(t,a)},{once:!0})};function yr(e,t,a){t&&a>t&&(a=t);for(let r=0;r<e.length;r++)if(e.start(r)<=a&&e.end(r)>=a)return!0;return!1}var Et=e=>{let t=e.indexOf("?");if(t<0)return[e];let a=e.slice(0,t),r=e.slice(t);return[a,r]},Ze=e=>{let{type:t}=e;if(t){let a=t.toUpperCase();return vt(a,Zt)?Zt[a]:t}return Ar(e)},_a=e=>e==="VOD"?k.ON_DEMAND:k.LIVE,Ra=e=>e==="EVENT"?Number.POSITIVE_INFINITY:e==="VOD"?Number.NaN:0,Ar=e=>{let{src:t}=e;if(!t)return"";let a="";try{a=new URL(t).pathname}catch{console.error("invalid url")}let r=a.lastIndexOf(".");if(r<0)return Rr(e)?X.M3U8:"";let i=a.slice(r+1).toUpperCase();return vt(i,X)?X[i]:""},_r="mux.com",Rr=({src:e,customDomain:t=_r})=>{let a;try{a=new URL(`${e}`)}catch{return!1}let r=a.protocol==="https:",i=a.hostname===`stream.${t}`.toLowerCase(),n=a.pathname.split("/"),s=n.length===2,u=!(n!=null&&n[1].includes("."));return r&&i&&s&&u},le=e=>{let t=(e??"").split(".")[1];if(t)try{let a=t.replace(/-/g,"+").replace(/_/g,"/"),r=decodeURIComponent(atob(a).split("").map(function(i){return"%"+("00"+i.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(r)}catch{return}},Cr=({exp:e},t=Date.now())=>!e||e*1e3<t,kr=({sub:e},t)=>e!==t,Nr=({aud:e},t)=>!e,Or=({aud:e},t)=>e!==t,Ca="en";function E(e,t=!0){var a,r;let i=t&&(r=(a=rt)==null?void 0:a[e])!=null?r:e,n=t?rt.code:Ca;return new Dr(i,n)}var Dr=class{constructor(e,t=(a=>(a=rt)!=null?a:Ca)()){this.message=e,this.locale=t}format(e){return this.message.replace(/\{(\w+)\}/g,(t,a)=>{var r;return(r=e[a])!=null?r:""})}toString(){return this.message}},Sr=Object.values(at),jt=e=>typeof e=="boolean"||typeof e=="string"&&Sr.includes(e),Ir=(e,t,a)=>{let{autoplay:r}=e,i=!1,n=!1,s=jt(r)?r:!!r,u=()=>{i||L(t,"playing",()=>{i=!0},{once:!0})};if(u(),L(t,"loadstart",()=>{i=!1,u(),qe(t,s)},{once:!0}),L(t,"loadstart",()=>{a||(e.streamType&&e.streamType!==k.UNKNOWN?n=e.streamType===k.LIVE:n=!Number.isFinite(t.duration)),qe(t,s)},{once:!0}),a&&a.once(R.Events.LEVEL_LOADED,(l,c)=>{var d;e.streamType&&e.streamType!==k.UNKNOWN?n=e.streamType===k.LIVE:n=(d=c.details.live)!=null?d:!1}),!s){let l=()=>{!n||Number.isFinite(e.startTime)||(a!=null&&a.liveSyncPosition?t.currentTime=a.liveSyncPosition:Number.isFinite(t.seekable.end(0))&&(t.currentTime=t.seekable.end(0)))};a&&L(t,"play",()=>{t.preload==="metadata"?a.once(R.Events.LEVEL_UPDATED,l):l()},{once:!0})}return l=>{i||(s=jt(l)?l:!!l,qe(t,s))}},qe=(e,t)=>{if(!t)return;let a=e.muted,r=()=>e.muted=a;switch(t){case at.ANY:e.play().catch(()=>{e.muted=!0,e.play().catch(r)});break;case at.MUTED:e.muted=!0,e.play().catch(r);break;default:e.play().catch(()=>{});break}},Lr=({preload:e,src:t},a,r)=>{let i=p=>{p!=null&&["","none","metadata","auto"].includes(p)?a.setAttribute("preload",p):a.removeAttribute("preload")};if(!r)return i(e),i;let n=!1,s=!1,u=r.config.maxBufferLength,l=r.config.maxBufferSize,c=p=>{i(p);let b=p??a.preload;s||b==="none"||(b==="metadata"?(r.config.maxBufferLength=1,r.config.maxBufferSize=1):(r.config.maxBufferLength=u,r.config.maxBufferSize=l),d())},d=()=>{!n&&t&&(n=!0,r.loadSource(t))};return L(a,"play",()=>{s=!0,r.config.maxBufferLength=u,r.config.maxBufferSize=l,d()},{once:!0}),c(e),c};function Mr(e,t){var a;if(!("videoTracks"in e))return;let r=new WeakMap;t.on(R.Events.MANIFEST_PARSED,function(l,c){u();let d=e.addVideoTrack("main");d.selected=!0;for(let[p,b]of c.levels.entries()){let g=d.addRendition(b.url[0],b.width,b.height,b.videoCodec,b.bitrate);r.set(b,`${p}`),g.id=`${p}`}}),t.on(R.Events.AUDIO_TRACKS_UPDATED,function(l,c){s();for(let d of c.audioTracks){let p=d.default?"main":"alternative",b=e.addAudioTrack(p,d.name,d.lang);b.id=`${d.id}`,d.default&&(b.enabled=!0)}}),e.audioTracks.addEventListener("change",()=>{var l;let c=+((l=[...e.audioTracks].find(p=>p.enabled))==null?void 0:l.id),d=t.audioTracks.map(p=>p.id);c!=t.audioTrack&&d.includes(c)&&(t.audioTrack=c)}),t.on(R.Events.LEVELS_UPDATED,function(l,c){var d;let p=e.videoTracks[(d=e.videoTracks.selectedIndex)!=null?d:0];if(!p)return;let b=c.levels.map(g=>r.get(g));for(let g of e.videoRenditions)g.id&&!b.includes(g.id)&&p.removeRendition(g)});let i=l=>{let c=l.target.selectedIndex;c!=t.nextLevel&&(t.nextLevel=c)};(a=e.videoRenditions)==null||a.addEventListener("change",i);let n=()=>{for(let l of e.videoTracks)e.removeVideoTrack(l)},s=()=>{for(let l of e.audioTracks)e.removeAudioTrack(l)},u=()=>{n(),s()};t.once(R.Events.DESTROYING,u)}var Qe=e=>"time"in e?e.time:e.startTime;function wr(e,t){t.on(R.Events.NON_NATIVE_TEXT_TRACKS_FOUND,(i,{tracks:n})=>{n.forEach(s=>{var u,l;let c=(u=s.subtitleTrack)!=null?u:s.closedCaptions,d=t.subtitleTracks.findIndex(({lang:b,name:g,type:T})=>b==c?.lang&&g===s.label&&T.toLowerCase()===s.kind),p=((l=s._id)!=null?l:s.default)?"default":`${s.kind}${d}`;gt(e,s.kind,s.label,c?.lang,p,s.default)})});let a=()=>{if(!t.subtitleTracks.length)return;let i=Array.from(e.textTracks).find(u=>u.id&&u.mode==="showing"&&["subtitles","captions"].includes(u.kind));if(!i)return;let n=t.subtitleTracks[t.subtitleTrack],s=n?n.default?"default":`${t.subtitleTracks[t.subtitleTrack].type.toLowerCase()}${t.subtitleTrack}`:void 0;if(t.subtitleTrack<0||i?.id!==s){let u=t.subtitleTracks.findIndex(({lang:l,name:c,type:d,default:p})=>i.id==="default"&&p||l==i.language&&c===i.label&&d.toLowerCase()===i.kind);t.subtitleTrack=u}i?.id===s&&i.cues&&Array.from(i.cues).forEach(u=>{i.addCue(u)})};e.textTracks.addEventListener("change",a),t.on(R.Events.CUES_PARSED,(i,{track:n,cues:s})=>{let u=e.textTracks.getTrackById(n);if(!u)return;let l=u.mode==="disabled";l&&(u.mode="hidden"),s.forEach(c=>{var d;(d=u.cues)!=null&&d.getCueById(c.id)||u.addCue(c)}),l&&(u.mode="disabled")}),t.once(R.Events.DESTROYING,()=>{e.textTracks.removeEventListener("change",a),e.querySelectorAll("track[data-removeondestroy]").forEach(i=>{i.remove()})});let r=()=>{Array.from(e.textTracks).forEach(i=>{var n,s;if(!["subtitles","caption"].includes(i.kind)&&(i.label==="thumbnails"||i.kind==="chapters")){if(!((n=i.cues)!=null&&n.length)){let u="track";i.kind&&(u+=`[kind="${i.kind}"]`),i.label&&(u+=`[label="${i.label}"]`);let l=e.querySelector(u),c=(s=l?.getAttribute("src"))!=null?s:"";l?.removeAttribute("src"),setTimeout(()=>{l?.setAttribute("src",c)},0)}i.mode!=="hidden"&&(i.mode="hidden")}})};t.once(R.Events.MANIFEST_LOADED,r),t.once(R.Events.MEDIA_ATTACHED,r)}function gt(e,t,a,r,i,n){let s=document.createElement("track");return s.kind=t,s.label=a,r&&(s.srclang=r),i&&(s.id=i),n&&(s.default=!0),s.track.mode=["subtitles","captions"].includes(t)?"disabled":"hidden",s.setAttribute("data-removeondestroy",""),e.append(s),s.track}function xr(e,t){let a=Array.prototype.find.call(e.querySelectorAll("track"),r=>r.track===t);a?.remove()}function Te(e,t,a){var r;return(r=Array.from(e.querySelectorAll("track")).find(i=>i.track.label===t&&i.track.kind===a))==null?void 0:r.track}async function ka(e,t,a,r){let i=Te(e,a,r);return i||(i=gt(e,r,a),i.mode="hidden",await new Promise(n=>setTimeout(()=>n(void 0),0))),i.mode!=="hidden"&&(i.mode="hidden"),[...t].sort((n,s)=>Qe(s)-Qe(n)).forEach(n=>{var s,u;let l=n.value,c=Qe(n);if("endTime"in n&&n.endTime!=null)i?.addCue(new VTTCue(c,n.endTime,r==="chapters"?l:JSON.stringify(l??null)));else{let d=Array.prototype.findIndex.call(i?.cues,T=>T.startTime>=c),p=(s=i?.cues)==null?void 0:s[d],b=p?p.startTime:Number.isFinite(e.duration)?e.duration:Number.MAX_SAFE_INTEGER,g=(u=i?.cues)==null?void 0:u[d-1];g&&(g.endTime=c),i?.addCue(new VTTCue(c,b,r==="chapters"?l:JSON.stringify(l??null)))}}),e.textTracks.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),i}var ft="cuepoints",Na=Object.freeze({label:ft});async function Oa(e,t,a=Na){return ka(e,t,a.label,"metadata")}var it=e=>({time:e.startTime,value:JSON.parse(e.text)});function Pr(e,t={label:ft}){let a=Te(e,t.label,"metadata");return a!=null&&a.cues?Array.from(a.cues,r=>it(r)):[]}function Da(e,t={label:ft}){var a,r;let i=Te(e,t.label,"metadata");if(!((a=i?.activeCues)!=null&&a.length))return;if(i.activeCues.length===1)return it(i.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((r=i.activeCues)!=null?r:[],({startTime:u,endTime:l})=>u<=n&&l>n);return it(s||i.activeCues[0])}async function Ur(e,t=Na){return new Promise(a=>{L(e,"loadstart",async()=>{let r=await Oa(e,[],t);L(e,"cuechange",()=>{let i=Da(e);if(i){let n=new CustomEvent("cuepointchange",{composed:!0,bubbles:!0,detail:i});e.dispatchEvent(n)}},{},r),a(r)})})}var Tt="chapters",Sa=Object.freeze({label:Tt}),nt=e=>({startTime:e.startTime,endTime:e.endTime,value:e.text});async function Ia(e,t,a=Sa){return ka(e,t,a.label,"chapters")}function Kr(e,t={label:Tt}){var a;let r=Te(e,t.label,"chapters");return(a=r?.cues)!=null&&a.length?Array.from(r.cues,i=>nt(i)):[]}function La(e,t={label:Tt}){var a,r;let i=Te(e,t.label,"chapters");if(!((a=i?.activeCues)!=null&&a.length))return;if(i.activeCues.length===1)return nt(i.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((r=i.activeCues)!=null?r:[],({startTime:u,endTime:l})=>u<=n&&l>n);return nt(s||i.activeCues[0])}async function Yr(e,t=Sa){return new Promise(a=>{L(e,"loadstart",async()=>{let r=await Ia(e,[],t);L(e,"cuechange",()=>{let i=La(e);if(i){let n=new CustomEvent("chapterchange",{composed:!0,bubbles:!0,detail:i});e.dispatchEvent(n)}},{},r),a(r)})})}function $r(e,t){if(t){let a=t.playingDate;if(a!=null)return new Date(a.getTime()-e.currentTime*1e3)}return typeof e.getStartDate=="function"?e.getStartDate():new Date(NaN)}function Br(e,t){if(t&&t.playingDate)return t.playingDate;if(typeof e.getStartDate=="function"){let a=e.getStartDate();return new Date(a.getTime()+e.currentTime*1e3)}return new Date(NaN)}var fe={VIDEO:"v",THUMBNAIL:"t",STORYBOARD:"s",DRM:"d"},Wr=e=>{if(e===O.VIDEO)return fe.VIDEO;if(e===O.DRM)return fe.DRM},Vr=(e,t)=>{var a,r;let i=Ge(e),n=`${i}Token`;return(a=t.tokens)!=null&&a[i]?(r=t.tokens)==null?void 0:r[i]:vt(n,t)?t[n]:void 0},We=(e,t,a,r,i=!1,n=!(s=>(s=globalThis.navigator)==null?void 0:s.onLine)())=>{var s,u;if(n){let A=E("Your device appears to be offline",i),C,v=h.MEDIA_ERR_NETWORK,I=new h(A,v,!1,C);return I.errorCategory=t,I.muxCode=f.NETWORK_OFFLINE,I.data=e,I}let l="status"in e?e.status:e.code,c=Date.now(),d=h.MEDIA_ERR_NETWORK;if(l===200)return;let p=Ge(t),b=Vr(t,a),g=Wr(t),[T]=Et((s=a.playbackId)!=null?s:"");if(!l||!T)return;let _=le(b);if(b&&!_){let A=E("The {tokenNamePrefix}-token provided is invalid or malformed.",i).format({tokenNamePrefix:p}),C=E("Compact JWT string: {token}",i).format({token:b}),v=new h(A,d,!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_TOKEN_MALFORMED,v.data=e,v}if(l>=500){let A=new h("",d,r??!0);return A.errorCategory=t,A.muxCode=f.NETWORK_UNKNOWN_ERROR,A}if(l===403)if(_){if(Cr(_,c)){let A={timeStyle:"medium",dateStyle:"medium"},C=E("The video’s secured {tokenNamePrefix}-token has expired.",i).format({tokenNamePrefix:p}),v=E("Expired at: {expiredDate}. Current time: {currentDate}.",i).format({expiredDate:new Intl.DateTimeFormat("en",A).format((u=_.exp)!=null?u:0*1e3),currentDate:new Intl.DateTimeFormat("en",A).format(c)}),I=new h(C,d,!0,v);return I.errorCategory=t,I.muxCode=f.NETWORK_TOKEN_EXPIRED,I.data=e,I}if(kr(_,T)){let A=E("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",i).format({tokenNamePrefix:p}),C=E("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}",i).format({tokenNamePrefix:p,playbackId:T,tokenPlaybackId:_.sub}),v=new h(A,d,!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_TOKEN_SUB_MISMATCH,v.data=e,v}if(Nr(_)){let A=E("The {tokenNamePrefix}-token is formatted with incorrect information.",i).format({tokenNamePrefix:p}),C=E("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.",i).format({tokenNamePrefix:p,expectedAud:g}),v=new h(A,d,!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_TOKEN_AUD_MISSING,v.data=e,v}if(Or(_,g)){let A=E("The {tokenNamePrefix}-token is formatted with incorrect information.",i).format({tokenNamePrefix:p}),C=E("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.",i).format({tokenNamePrefix:p,expectedAud:g,aud:_.aud}),v=new h(A,d,!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_TOKEN_AUD_MISMATCH,v.data=e,v}}else{let A=E("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.",i).format({tokenNamePrefix:p,category:t}),C=E("Specified playback ID: {playbackId}",i).format({playbackId:T}),v=new h(A,d,r??!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_TOKEN_MISSING,v.data=e,v}if(l===412){let A=E("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.",i),C=E("Specified playback ID: {playbackId}",i).format({playbackId:T}),v=new h(A,d,r??!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_NOT_READY,v.streamType=a.streamType===k.LIVE?"live":a.streamType===k.ON_DEMAND?"on-demand":"unknown",v.data=e,v}if(l===404){let A=E("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.",i),C=E("Specified playback ID: {playbackId}",i).format({playbackId:T}),v=new h(A,d,r??!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_NOT_FOUND,v.data=e,v}if(l===400){let A=E("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."),C=E("Specified playback ID: {playbackId}",i).format({playbackId:T}),v=new h(A,d,r??!0,C);return v.errorCategory=t,v.muxCode=f.NETWORK_INVALID_URL,v.data=e,v}let y=new h("",d,r??!0);return y.errorCategory=t,y.muxCode=f.NETWORK_UNKNOWN_ERROR,y.data=e,y},zt=R.DefaultConfig.capLevelController,Fr={"720p":921600,"1080p":2073600,"1440p":4194304,"2160p":8294400};function Hr(e){let t=e.toLowerCase().trim();return Fr[t]}var ot=class he extends zt{constructor(t){super(t)}static setMaxAutoResolution(t,a){a?he.maxAutoResolution.set(t,a):he.maxAutoResolution.delete(t)}getMaxAutoResolution(){var t;let a=this.hls;return(t=he.maxAutoResolution.get(a))!=null?t:void 0}get levels(){var t;return(t=this.hls.levels)!=null?t:[]}getValidLevels(t){return this.levels.filter((a,r)=>this.isLevelAllowed(a)&&r<=t)}getMaxLevelCapped(t){let a=this.getValidLevels(t),r=this.getMaxAutoResolution();if(!r)return super.getMaxLevel(t);let i=Hr(r);if(!i)return super.getMaxLevel(t);let n=a.filter(l=>l.width*l.height<=i),s=n.findIndex(l=>l.width*l.height===i);if(s!==-1){let l=n[s];return a.findIndex(c=>c===l)}if(n.length===0)return 0;let u=n[n.length-1];return a.findIndex(l=>l===u)}getMaxLevel(t){if(this.getMaxAutoResolution()!==void 0)return this.getMaxLevelCapped(t);let a=super.getMaxLevel(t),r=this.getValidLevels(t);if(!r[a])return a;let i=Math.min(r[a].width,r[a].height),n=he.minMaxResolution;return i>=n?a:zt.getMaxLevelByMediaSize(r,n*(16/9),n)}};ot.minMaxResolution=720,ot.maxAutoResolution=new WeakMap;var Gr=ot,lt=Gr,Ce={FAIRPLAY:"fairplay",PLAYREADY:"playready",WIDEVINE:"widevine"},Zr=e=>{if(e.includes("fps"))return Ce.FAIRPLAY;if(e.includes("playready"))return Ce.PLAYREADY;if(e.includes("widevine"))return Ce.WIDEVINE},jr=e=>{let t=e.split(`
`).find((a,r,i)=>r&&i[r-1].startsWith("#EXT-X-STREAM-INF"));return fetch(t).then(a=>a.status!==200?Promise.reject(a):a.text())},zr=e=>{let t=e.split(`
`).filter(r=>r.startsWith("#EXT-X-SESSION-DATA"));if(!t.length)return{};let a={};for(let r of t){let i=qr(r),n=i["DATA-ID"];n&&(a[n]={...i})}return{sessionData:a}},Xr=/([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g;function qr(e){let t=[...e.matchAll(Xr)];return Object.fromEntries(t.map(([,a,r])=>[a,r]))}var Qr=e=>{var t,a,r;let i=e.split(`
`),n=(a=((t=i.find(c=>c.startsWith("#EXT-X-PLAYLIST-TYPE")))!=null?t:"").split(":")[1])==null?void 0:a.trim(),s=_a(n),u=Ra(n),l;if(s===k.LIVE){let c=i.find(d=>d.startsWith("#EXT-X-PART-INF"));if(c)l=+c.split(":")[1].split("=")[1]*2;else{let d=i.find(b=>b.startsWith("#EXT-X-TARGETDURATION")),p=(r=d?.split(":"))==null?void 0:r[1];l=+(p??6)*3}}return{streamType:s,targetLiveWindow:u,liveEdgeStartOffset:l}},Jr=async(e,t)=>{if(t===X.MP4)return{streamType:k.ON_DEMAND,targetLiveWindow:Number.NaN,liveEdgeStartOffset:void 0,sessionData:void 0};if(t===X.M3U8){let a=await fetch(e);if(!a.ok)return Promise.reject(a);let r=await a.text(),i=await jr(r);return{...zr(r),...Qr(i)}}return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`),{streamType:void 0,targetLiveWindow:void 0,liveEdgeStartOffset:void 0,sessionData:void 0}},ei=async(e,t,a=Ze({src:e}))=>{var r,i,n,s;let{streamType:u,targetLiveWindow:l,liveEdgeStartOffset:c,sessionData:d}=await Jr(e,a),p=d?.["com.apple.hls.chapters"];(p!=null&&p.URI||p!=null&&p.VALUE.toLocaleLowerCase().startsWith("http"))&&yt((r=p.URI)!=null?r:p.VALUE,t),((i=S.get(t))!=null?i:{}).liveEdgeStartOffset=c,((n=S.get(t))!=null?n:{}).targetLiveWindow=l,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((s=S.get(t))!=null?s:{}).streamType=u,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},yt=async(e,t)=>{var a,r;try{let i=await fetch(e);if(!i.ok)throw new Error(`Failed to fetch Mux metadata: ${i.status} ${i.statusText}`);let n=await i.json(),s={};if(!((a=n?.[0])!=null&&a.metadata))return;for(let l of n[0].metadata)l.key&&l.value&&(s[l.key]=l.value);((r=S.get(t))!=null?r:{}).metadata=s;let u=new CustomEvent("muxmetadata");t.dispatchEvent(u)}catch(i){console.error(i)}},ti=e=>{var t;let a=e.type,r=_a(a),i=Ra(a),n,s=!!((t=e.partList)!=null&&t.length);return r===k.LIVE&&(n=s?e.partTarget*2:e.targetduration*3),{streamType:r,targetLiveWindow:i,liveEdgeStartOffset:n,lowLatency:s}},ai=(e,t,a)=>{var r,i,n,s,u,l,c,d;let{streamType:p,targetLiveWindow:b,liveEdgeStartOffset:g,lowLatency:T}=ti(e);if(p===k.LIVE){T?(a.config.backBufferLength=(r=a.userConfig.backBufferLength)!=null?r:4,a.config.maxFragLookUpTolerance=(i=a.userConfig.maxFragLookUpTolerance)!=null?i:.001,a.config.abrBandWidthUpFactor=(n=a.userConfig.abrBandWidthUpFactor)!=null?n:a.config.abrBandWidthFactor):a.config.backBufferLength=(s=a.userConfig.backBufferLength)!=null?s:8;let _=Object.freeze({get length(){return t.seekable.length},start(y){return t.seekable.start(y)},end(y){var A;return y>this.length||y<0||Number.isFinite(t.duration)?t.seekable.end(y):(A=a.liveSyncPosition)!=null?A:t.seekable.end(y)}});((u=S.get(t))!=null?u:{}).seekable=_}((l=S.get(t))!=null?l:{}).liveEdgeStartOffset=g,((c=S.get(t))!=null?c:{}).targetLiveWindow=b,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((d=S.get(t))!=null?d:{}).streamType=p,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},Xt,qt,Ma=(qt=(Xt=globalThis?.navigator)==null?void 0:Xt.userAgent)!=null?qt:"",Qt,Jt,ea,ri=(ea=(Jt=(Qt=globalThis?.navigator)==null?void 0:Qt.userAgentData)==null?void 0:Jt.platform)!=null?ea:"",ii=Ma.toLowerCase().includes("android")||["x11","android"].some(e=>ri.toLowerCase().includes(e)),ni=e=>/^((?!chrome|android).)*safari/i.test(Ma)&&!!e.canPlayType("application/vnd.apple.mpegurl"),S=new WeakMap,q="mux.com",ta,aa,wa=(aa=(ta=R).isSupported)==null?void 0:aa.call(ta),oi=e=>ii||!ni(e),xa=()=>{if(typeof window<"u")return bt.utils.now()},li=bt.utils.generateUUID,st=({playbackId:e,customDomain:t=q,maxResolution:a,minResolution:r,renditionOrder:i,programStartTime:n,programEndTime:s,assetStartTime:u,assetEndTime:l,playbackToken:c,tokens:{playback:d=c}={},extraSourceParams:p={}}={})=>{if(!e)return;let[b,g=""]=Et(e),T=new URL(`https://stream.${t}/${b}.m3u8${g}`);return d||T.searchParams.has("token")?(T.searchParams.forEach((_,y)=>{y!="token"&&T.searchParams.delete(y)}),d&&T.searchParams.set("token",d)):(a&&T.searchParams.set("max_resolution",a),r&&(T.searchParams.set("min_resolution",r),a&&+a.slice(0,-1)<+r.slice(0,-1)&&console.error("minResolution must be <= maxResolution","minResolution",r,"maxResolution",a)),i&&T.searchParams.set("rendition_order",i),n&&T.searchParams.set("program_start_time",`${n}`),s&&T.searchParams.set("program_end_time",`${s}`),u&&T.searchParams.set("asset_start_time",`${u}`),l&&T.searchParams.set("asset_end_time",`${l}`),Object.entries(p).forEach(([_,y])=>{y!=null&&T.searchParams.set(_,y)})),T.toString()},je=e=>{if(!e)return;let[t]=e.split("?");return t||void 0},At=e=>{if(!e||!e.startsWith("https://stream."))return;let[t]=new URL(e).pathname.slice(1).split(/\.m3u8|\//);return t||void 0},si=e=>{var t,a,r;return(t=e?.metadata)!=null&&t.video_id?e.metadata.video_id:Va(e)&&(r=(a=je(e.playbackId))!=null?a:At(e.src))!=null?r:e.src},Pa=e=>{var t;return(t=S.get(e))==null?void 0:t.error},di=e=>{var t;return(t=S.get(e))==null?void 0:t.metadata},dt=e=>{var t,a;return(a=(t=S.get(e))==null?void 0:t.streamType)!=null?a:k.UNKNOWN},ui=e=>{var t,a;return(a=(t=S.get(e))==null?void 0:t.targetLiveWindow)!=null?a:Number.NaN},_t=e=>{var t,a;return(a=(t=S.get(e))==null?void 0:t.seekable)!=null?a:e.seekable},mi=e=>{var t;let a=(t=S.get(e))==null?void 0:t.liveEdgeStartOffset;if(typeof a!="number")return Number.NaN;let r=_t(e);return r.length?r.end(r.length-1)-a:Number.NaN},Rt=.034,ci=(e,t,a=Rt)=>Math.abs(e-t)<=a,Ua=(e,t,a=Rt)=>e>t||ci(e,t,a),pi=(e,t=Rt)=>e.paused&&Ua(e.currentTime,e.duration,t),Ka=(e,t)=>{var a,r,i;if(!t||!e.buffered.length)return;if(e.readyState>2)return!1;let n=t.currentLevel>=0?(r=(a=t.levels)==null?void 0:a[t.currentLevel])==null?void 0:r.details:(i=t.levels.find(p=>!!p.details))==null?void 0:i.details;if(!n||n.live)return;let{fragments:s}=n;if(!(s!=null&&s.length))return;if(e.currentTime<e.duration-(n.targetduration+.5))return!1;let u=s[s.length-1];if(e.currentTime<=u.start)return!1;let l=u.start+u.duration/2,c=e.buffered.start(e.buffered.length-1),d=e.buffered.end(e.buffered.length-1);return l>c&&l<d},Ya=(e,t)=>e.ended||e.loop?e.ended:t&&Ka(e,t)?!0:pi(e),hi=(e,t,a)=>{$a(t,a,e);let{metadata:r={}}=e,{view_session_id:i=li()}=r,n=si(e);r.view_session_id=i,r.video_id=n,e.metadata=r;let s=d=>{var p;(p=t.mux)==null||p.emit("hb",{view_drm_type:d})};e.drmTypeCb=s,S.set(t,{retryCount:0});let u=bi(e,t),l=Lr(e,t,u);e!=null&&e.muxDataKeepSession&&t!=null&&t.mux&&!t.mux.deleted?u&&t.mux.addHLSJS({hlsjs:u,Hls:u?R:void 0}):Ai(e,t,u),_i(e,t,u),Ur(t),Yr(t);let c=Ir(e,t,u);return{engine:u,setAutoplay:c,setPreload:l}},$a=(e,t,a)=>{let r=t?.engine;e!=null&&e.mux&&!e.mux.deleted&&(a!=null&&a.muxDataKeepSession?r&&e.mux.removeHLSJS():(e.mux.destroy(),delete e.mux)),r&&(r.detachMedia(),r.destroy()),e&&(e.hasAttribute("src")&&(e.removeAttribute("src"),e.load()),e.removeEventListener("error",Ha),e.removeEventListener("error",ut),e.removeEventListener("durationchange",Fa),S.delete(e),e.dispatchEvent(new Event("teardown")))};function Ba(e,t){var a;let r=Ze(e);if(r!==X.M3U8)return!0;let i=!r||((a=t.canPlayType(r))!=null?a:!0),{preferPlayback:n}=e,s=n===G.MSE,u=n===G.NATIVE,l=wa&&(s||oi(t));return i&&(u||!l)}var bi=(e,t)=>{let{debug:a,streamType:r,startTime:i=-1,metadata:n,preferCmcd:s,_hlsConfig:u={},maxAutoResolution:l}=e,c=Ze(e)===X.M3U8,d=Ba(e,t);if(c&&!d&&wa){let p={backBufferLength:30,renderTextTracksNatively:!1,liveDurationInfinity:!0,capLevelOnFPSDrop:!0},b=vi(r),g=Ei(e),T=[pe.QUERY,pe.HEADER].includes(s)?{useHeaders:s===pe.HEADER,sessionId:n?.view_session_id,contentId:n?.video_id}:void 0,_=yi(e),y=new R({debug:a,startPosition:i,cmcd:T,xhrSetup:(A,C)=>{var v,I;if(s&&s!==pe.QUERY)return;let x=new URL(C);if(!x.searchParams.has("CMCD"))return;let ye=((I=(v=x.searchParams.get("CMCD"))==null?void 0:v.split(","))!=null?I:[]).filter(de=>de.startsWith("sid")||de.startsWith("cid")).join(",");x.searchParams.set("CMCD",ye),A.open("GET",x)},...p,..._,...b,...g,...u});return _.capLevelController===lt&&l!==void 0&&lt.setMaxAutoResolution(y,l),y.on(R.Events.MANIFEST_PARSED,async function(A,C){var v,I;let x=(v=C.sessionData)==null?void 0:v["com.apple.hls.chapters"];(x!=null&&x.URI||x!=null&&x.VALUE.toLocaleLowerCase().startsWith("http"))&&yt((I=x?.URI)!=null?I:x?.VALUE,t)}),y}},vi=e=>e===k.LIVE?{backBufferLength:8}:{},Ei=e=>{let{tokens:{drm:t}={},playbackId:a,drmTypeCb:r}=e,i=je(a);return!t||!i?{}:{emeEnabled:!0,drmSystems:{"com.apple.fps":{licenseUrl:ke(e,"fairplay"),serverCertificateUrl:Wa(e,"fairplay")},"com.widevine.alpha":{licenseUrl:ke(e,"widevine")},"com.microsoft.playready":{licenseUrl:ke(e,"playready")}},requestMediaKeySystemAccessFunc:(n,s)=>(n==="com.widevine.alpha"&&(s=[...s.map(u=>{var l;let c=(l=u.videoCapabilities)==null?void 0:l.map(d=>({...d,robustness:"HW_SECURE_ALL"}));return{...u,videoCapabilities:c}}),...s]),navigator.requestMediaKeySystemAccess(n,s).then(u=>{let l=Zr(n);return r?.(l),u}))}},gi=async e=>{let t=await fetch(e);return t.status!==200?Promise.reject(t):await t.arrayBuffer()},fi=async(e,t)=>{let a=await fetch(t,{method:"POST",headers:{"Content-type":"application/octet-stream"},body:e});if(a.status!==200)return Promise.reject(a);let r=await a.arrayBuffer();return new Uint8Array(r)},Ti=(e,t)=>{let a=async n=>{let s=await navigator.requestMediaKeySystemAccess("com.apple.fps",[{initDataTypes:[n],videoCapabilities:[{contentType:"application/vnd.apple.mpegurl",robustness:""}],distinctiveIdentifier:"not-allowed",persistentState:"not-allowed",sessionTypes:["temporary"]}]).then(l=>{var c;return(c=e.drmTypeCb)==null||c.call(e,Ce.FAIRPLAY),l}).catch(()=>{let l=E("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),c=new h(l,h.MEDIA_ERR_ENCRYPTED,!0);c.errorCategory=O.DRM,c.muxCode=f.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM,B(t,c)});if(!s)return;let u=await s.createMediaKeys();try{let l=await gi(Wa(e,"fairplay")).catch(c=>{if(c instanceof Response){let d=We(c,O.DRM,e);return console.error("mediaError",d?.message,d?.context),d?Promise.reject(d):Promise.reject(new Error("Unexpected error in app cert request"))}return Promise.reject(c)});await u.setServerCertificate(l).catch(()=>{let c=E("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),d=new h(c,h.MEDIA_ERR_ENCRYPTED,!0);return d.errorCategory=O.DRM,d.muxCode=f.ENCRYPTED_UPDATE_SERVER_CERT_FAILED,Promise.reject(d)})}catch(l){B(t,l);return}await t.setMediaKeys(u)},r=n=>{let s;if(n==="internal-error"){let u=E("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");s=new h(u,h.MEDIA_ERR_ENCRYPTED,!0),s.errorCategory=O.DRM,s.muxCode=f.ENCRYPTED_CDM_ERROR}else if(n==="output-restricted"||n==="output-downscaled"){let u=E("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");s=new h(u,h.MEDIA_ERR_ENCRYPTED,!1),s.errorCategory=O.DRM,s.muxCode=f.ENCRYPTED_OUTPUT_RESTRICTED}s&&B(t,s)},i=async(n,s)=>{let u=t.mediaKeys.createSession(),l=()=>{u.keyStatuses.forEach(d=>r(d))},c=async d=>{let p=d.message;try{let b=await fi(p,ke(e,"fairplay"));try{await u.update(b)}catch{let g=E("Failed to update DRM license. This may be an issue with the player or your protected content."),T=new h(g,h.MEDIA_ERR_ENCRYPTED,!0);T.errorCategory=O.DRM,T.muxCode=f.ENCRYPTED_UPDATE_LICENSE_FAILED,B(t,T)}}catch(b){if(b instanceof Response){let g=We(b,O.DRM,e);if(console.error("mediaError",g?.message,g?.context),g){B(t,g);return}console.error("Unexpected error in license key request",b);return}console.error(b)}};u.addEventListener("keystatuseschange",l),u.addEventListener("message",c),t.addEventListener("teardown",()=>{u.removeEventListener("keystatuseschange",l),u.removeEventListener("message",c),u.close()},{once:!0}),await u.generateRequest(n,s).catch(d=>{console.error("Failed to generate license request",d);let p=E("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),b=new h(p,h.MEDIA_ERR_ENCRYPTED,!0);return b.errorCategory=O.DRM,b.muxCode=f.ENCRYPTED_GENERATE_REQUEST_FAILED,Promise.reject(b)})};L(t,"encrypted",async n=>{try{let s=n.initDataType;if(s!=="skd"){console.error(`Received unexpected initialization data type "${s}"`);return}t.mediaKeys||await a(s);let u=n.initData;if(u==null){console.error(`Could not start encrypted playback due to missing initData in ${n.type} event`);return}await i(s,u)}catch(s){B(t,s);return}})},ke=({playbackId:e,tokens:{drm:t}={},customDomain:a=q},r)=>{let i=je(e);return`https://license.${a.toLocaleLowerCase().endsWith(q)?a:q}/license/${r}/${i}?token=${t}`},Wa=({playbackId:e,tokens:{drm:t}={},customDomain:a=q},r)=>{let i=je(e);return`https://license.${a.toLocaleLowerCase().endsWith(q)?a:q}/appcert/${r}/${i}?token=${t}`},Va=({playbackId:e,src:t,customDomain:a})=>{if(e)return!0;if(typeof t!="string")return!1;let r=window?.location.href,i=new URL(t,r).hostname.toLocaleLowerCase();return i.includes(q)||!!a&&i.includes(a.toLocaleLowerCase())},yi=(e,t)=>{let a={};return a.capLevelToPlayerSize=e.capRenditionToPlayerSize,a.capLevelToPlayerSize==null?(a.capLevelController=lt,a.capLevelToPlayerSize=!0):a.capLevelController=pr,a},Ai=(e,t,a)=>{var r;let{envKey:i,disableTracking:n,muxDataSDK:s=bt,muxDataSDKOptions:u={}}=e,l=Va(e);if(!n&&(i||l)){let{playerInitTime:c,playerSoftwareName:d,playerSoftwareVersion:p,beaconCollectionDomain:b,debug:g,disableCookies:T}=e,_={...e.metadata,video_title:((r=e?.metadata)==null?void 0:r.video_title)||void 0},y=A=>typeof A.player_error_code=="string"?!1:typeof e.errorTranslator=="function"?e.errorTranslator(A):A;s.monitor(t,{debug:g,beaconCollectionDomain:b,hlsjs:a,Hls:a?R:void 0,automaticErrorTracking:!1,errorTranslator:y,disableCookies:T,...u,data:{...i?{env_key:i}:{},player_software_name:d,player_software:d,player_software_version:p,player_init_time:c,..._}})}},_i=(e,t,a)=>{var r,i;let n=Ba(e,t),{src:s,customDomain:u=q}=e,l=()=>{t.ended||e.disablePseudoEnded||!Ya(t,a)||(Ka(t,a)?t.currentTime=t.buffered.end(t.buffered.length-1):t.dispatchEvent(new Event("ended")))},c,d,p=()=>{let b=_t(t),g,T;b.length>0&&(g=b.start(0),T=b.end(0)),(d!==T||c!==g)&&t.dispatchEvent(new CustomEvent("seekablechange",{composed:!0})),c=g,d=T};if(L(t,"durationchange",p),t&&n){let b=Ze(e);if(typeof s=="string"){if(s.endsWith(".mp4")&&s.includes(u)){let _=At(s),y=new URL(`https://stream.${u}/${_}/metadata.json`);yt(y.toString(),t)}let g=()=>{if(dt(t)!==k.LIVE||Number.isFinite(t.duration))return;let _=setInterval(p,1e3);t.addEventListener("teardown",()=>{clearInterval(_)},{once:!0}),L(t,"durationchange",()=>{Number.isFinite(t.duration)&&clearInterval(_)})},T=async()=>ei(s,t,b).then(g).catch(_=>{if(_ instanceof Response){let y=We(_,O.VIDEO,e);if(y){B(t,y);return}}});if(t.preload==="none"){let _=()=>{T(),t.removeEventListener("loadedmetadata",y)},y=()=>{T(),t.removeEventListener("play",_)};L(t,"play",_,{once:!0}),L(t,"loadedmetadata",y,{once:!0})}else T();(r=e.tokens)!=null&&r.drm?Ti(e,t):L(t,"encrypted",()=>{let _=E("Attempting to play DRM-protected content without providing a DRM token."),y=new h(_,h.MEDIA_ERR_ENCRYPTED,!0);y.errorCategory=O.DRM,y.muxCode=f.ENCRYPTED_MISSING_TOKEN,B(t,y)},{once:!0}),t.setAttribute("src",s),e.startTime&&(((i=S.get(t))!=null?i:{}).startTime=e.startTime,t.addEventListener("durationchange",Fa,{once:!0}))}else t.removeAttribute("src");t.addEventListener("error",Ha),t.addEventListener("error",ut),t.addEventListener("emptied",()=>{t.querySelectorAll("track[data-removeondestroy]").forEach(g=>{g.remove()})},{once:!0}),L(t,"pause",l),L(t,"seeked",l),L(t,"play",()=>{t.ended||Ua(t.currentTime,t.duration)&&(t.currentTime=t.seekable.length?t.seekable.start(0):0)})}else a&&s?(a.once(R.Events.LEVEL_LOADED,(b,g)=>{ai(g.details,t,a),p(),dt(t)===k.LIVE&&!Number.isFinite(t.duration)&&(a.on(R.Events.LEVEL_UPDATED,p),L(t,"durationchange",()=>{Number.isFinite(t.duration)&&a.off(R.Events.LEVELS_UPDATED,p)}))}),a.on(R.Events.ERROR,(b,g)=>{var T,_;let y=Ri(g,e);if(y.muxCode===f.NETWORK_NOT_READY){let A=(T=S.get(t))!=null?T:{},C=(_=A.retryCount)!=null?_:0;if(C<6){let v=C===0?5e3:6e4,I=new h(`Retrying in ${v/1e3} seconds...`,y.code,y.fatal);Object.assign(I,y),B(t,I),setTimeout(()=>{A.retryCount=C+1,g.details==="manifestLoadError"&&g.url&&a.loadSource(g.url)},v);return}else{A.retryCount=0;let v=new h('Try again later or <a href="#" onclick="window.location.reload(); return false;" style="color: #4a90e2;">click here to retry</a>',y.code,y.fatal);Object.assign(v,y),B(t,v);return}}B(t,y)}),a.on(R.Events.MANIFEST_LOADED,()=>{let b=S.get(t);b&&b.error&&(b.error=null,b.retryCount=0,t.dispatchEvent(new Event("emptied")),t.dispatchEvent(new Event("loadstart")))}),t.addEventListener("error",ut),L(t,"waiting",l),Mr(e,a),wr(t,a),a.attachMedia(t)):console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.")};function Fa(e){var t;let a=e.target,r=(t=S.get(a))==null?void 0:t.startTime;if(r&&yr(a.seekable,a.duration,r)){let i=a.preload==="auto";i&&(a.preload="none"),a.currentTime=r,i&&(a.preload="auto")}}async function Ha(e){if(!e.isTrusted)return;e.stopImmediatePropagation();let t=e.target;if(!(t!=null&&t.error))return;let{message:a,code:r}=t.error,i=new h(a,r);if(t.src&&r===h.MEDIA_ERR_SRC_NOT_SUPPORTED&&t.readyState===HTMLMediaElement.HAVE_NOTHING){setTimeout(()=>{var n;let s=(n=Pa(t))!=null?n:t.error;s?.code===h.MEDIA_ERR_SRC_NOT_SUPPORTED&&B(t,i)},500);return}if(t.src&&(r!==h.MEDIA_ERR_DECODE||r!==void 0))try{let{status:n}=await fetch(t.src);i.data={response:{code:n}}}catch{}B(t,i)}function B(e,t){var a;t.fatal&&(((a=S.get(e))!=null?a:{}).error=t,e.dispatchEvent(new CustomEvent("error",{detail:t})))}function ut(e){var t,a;if(!(e instanceof CustomEvent)||!(e.detail instanceof h))return;let r=e.target,i=e.detail;!i||!i.fatal||(((t=S.get(r))!=null?t:{}).error=i,(a=r.mux)==null||a.emit("error",{player_error_code:i.code,player_error_message:i.message,player_error_context:i.context}))}var Ri=(e,t)=>{var a,r,i;e.fatal?console.error("getErrorFromHlsErrorData()",e):t.debug&&console.warn("getErrorFromHlsErrorData() (non-fatal)",e);let n={[R.ErrorTypes.NETWORK_ERROR]:h.MEDIA_ERR_NETWORK,[R.ErrorTypes.MEDIA_ERROR]:h.MEDIA_ERR_DECODE,[R.ErrorTypes.KEY_SYSTEM_ERROR]:h.MEDIA_ERR_ENCRYPTED},s=d=>[R.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED,R.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(d.details)?h.MEDIA_ERR_NETWORK:n[d.type],u=d=>{if(d.type===R.ErrorTypes.KEY_SYSTEM_ERROR)return O.DRM;if(d.type===R.ErrorTypes.NETWORK_ERROR)return O.VIDEO},l,c=s(e);if(c===h.MEDIA_ERR_NETWORK&&e.response){let d=(a=u(e))!=null?a:O.VIDEO;l=(r=We(e.response,d,t,e.fatal))!=null?r:new h("",c,e.fatal)}else if(c===h.MEDIA_ERR_ENCRYPTED)if(e.details===R.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE){let d=E("Attempting to play DRM-protected content without providing a DRM token.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_MISSING_TOKEN}else if(e.details===R.ErrorDetails.KEY_SYSTEM_NO_ACCESS){let d=E("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM}else if(e.details===R.ErrorDetails.KEY_SYSTEM_NO_SESSION){let d=E("Failed to generate a DRM license request. This may be an issue with the player or your protected content.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,!0),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_GENERATE_REQUEST_FAILED}else if(e.details===R.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED){let d=E("Failed to update DRM license. This may be an issue with the player or your protected content.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_UPDATE_LICENSE_FAILED}else if(e.details===R.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED){let d=E("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_UPDATE_SERVER_CERT_FAILED}else if(e.details===R.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR){let d=E("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_CDM_ERROR}else if(e.details===R.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED){let d=E("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");l=new h(d,h.MEDIA_ERR_ENCRYPTED,!1),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_OUTPUT_RESTRICTED}else l=new h(e.error.message,h.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=O.DRM,l.muxCode=f.ENCRYPTED_ERROR;else l=new h("",c,e.fatal);return l.context||(l.context=`${e.url?`url: ${e.url}
`:""}${e.response&&(e.response.code||e.response.text)?`response: ${e.response.code}, ${e.response.text}
`:""}${e.reason?`failure reason: ${e.reason}
`:""}${e.level?`level: ${e.level}
`:""}${e.parent?`parent stream controller: ${e.parent}
`:""}${e.buffer?`buffer length: ${e.buffer}
`:""}${e.error?`error: ${e.error}
`:""}${e.event?`event: ${e.event}
`:""}${e.err?`error message: ${(i=e.err)==null?void 0:i.message}
`:""}`),l.data=e,l},Ga=e=>{throw TypeError(e)},Ct=(e,t,a)=>t.has(e)||Ga("Cannot "+a),w=(e,t,a)=>(Ct(e,t,"read from private field"),a?a.call(e):t.get(e)),W=(e,t,a)=>t.has(e)?Ga("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),K=(e,t,a,r)=>(Ct(e,t,"write to private field"),t.set(e,a),a),Re=(e,t,a)=>(Ct(e,t,"access private method"),a),Ci=()=>{try{return"0.30.2"}catch{}return"UNKNOWN"},ki=Ci(),Ni=()=>ki,Oi=`
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`,o={BEACON_COLLECTION_DOMAIN:"beacon-collection-domain",CUSTOM_DOMAIN:"custom-domain",DEBUG:"debug",DISABLE_TRACKING:"disable-tracking",DISABLE_COOKIES:"disable-cookies",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended",DRM_TOKEN:"drm-token",PLAYBACK_TOKEN:"playback-token",ENV_KEY:"env-key",MAX_RESOLUTION:"max-resolution",MIN_RESOLUTION:"min-resolution",MAX_AUTO_RESOLUTION:"max-auto-resolution",RENDITION_ORDER:"rendition-order",PROGRAM_START_TIME:"program-start-time",PROGRAM_END_TIME:"program-end-time",ASSET_START_TIME:"asset-start-time",ASSET_END_TIME:"asset-end-time",METADATA_URL:"metadata-url",PLAYBACK_ID:"playback-id",PLAYER_SOFTWARE_NAME:"player-software-name",PLAYER_SOFTWARE_VERSION:"player-software-version",PLAYER_INIT_TIME:"player-init-time",PREFER_CMCD:"prefer-cmcd",PREFER_PLAYBACK:"prefer-playback",START_TIME:"start-time",STREAM_TYPE:"stream-type",TARGET_LIVE_WINDOW:"target-live-window",LIVE_EDGE_OFFSET:"live-edge-offset",TYPE:"type",LOGO:"logo",CAP_RENDITION_TO_PLAYER_SIZE:"cap-rendition-to-player-size"},Di=Object.values(o),ra=Ni(),ia="mux-video",F,be,Ne,ve,Oe,De,Se,Ie,Le,Ee,Me,ie,ge,Si=class extends Ae{constructor(){super(),W(this,ie),W(this,F),W(this,be),W(this,Ne),W(this,ve,{}),W(this,Oe,{}),W(this,De),W(this,Se),W(this,Ie),W(this,Le),W(this,Ee,""),W(this,Me),K(this,Ne,xa()),this.nativeEl.addEventListener("muxmetadata",e=>{var t;let a=di(this.nativeEl),r=(t=this.metadata)!=null?t:{};this.metadata={...a,...r},a?.["com.mux.video.branding"]==="mux-free-plan"&&(K(this,Ee,"default"),this.updateLogo())})}static get NAME(){return ia}static get VERSION(){return ra}static get observedAttributes(){var e;return[...Di,...(e=Ae.observedAttributes)!=null?e:[]]}static getLogoHTML(e){return!e||e==="false"?"":e==="default"?Oi:`<img part="logo" src="${e}" />`}static getTemplateHTML(e={}){var t;return`
      ${Ae.getTemplateHTML(e)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML((t=e[o.LOGO])!=null?t:"")}
      </slot>
    `}get preferCmcd(){var e;return(e=this.getAttribute(o.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?Be.includes(e)?this.setAttribute(o.PREFER_CMCD,e):console.warn(`Invalid value for preferCmcd. Must be one of ${Be.join()}`):this.removeAttribute(o.PREFER_CMCD))}get playerInitTime(){return this.hasAttribute(o.PLAYER_INIT_TIME)?+this.getAttribute(o.PLAYER_INIT_TIME):w(this,Ne)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(o.PLAYER_INIT_TIME):this.setAttribute(o.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=w(this,Ie))!=null?e:ia}set playerSoftwareName(e){K(this,Ie,e)}get playerSoftwareVersion(){var e;return(e=w(this,Se))!=null?e:ra}set playerSoftwareVersion(e){K(this,Se,e)}get _hls(){var e;return(e=w(this,F))==null?void 0:e.engine}get mux(){var e;return(e=this.nativeEl)==null?void 0:e.mux}get error(){var e;return(e=Pa(this.nativeEl))!=null?e:null}get errorTranslator(){return w(this,Le)}set errorTranslator(e){K(this,Le,e)}get src(){return this.getAttribute("src")}set src(e){e!==this.src&&(e==null?this.removeAttribute("src"):this.setAttribute("src",e))}get type(){var e;return(e=this.getAttribute(o.TYPE))!=null?e:void 0}set type(e){e!==this.type&&(e?this.setAttribute(o.TYPE,e):this.removeAttribute(o.TYPE))}get preload(){let e=this.getAttribute("preload");return e===""?"auto":["none","metadata","auto"].includes(e)?e:super.preload}set preload(e){e!=this.getAttribute("preload")&&(["","none","metadata","auto"].includes(e)?this.setAttribute("preload",e):this.removeAttribute("preload"))}get debug(){return this.getAttribute(o.DEBUG)!=null}set debug(e){e!==this.debug&&(e?this.setAttribute(o.DEBUG,""):this.removeAttribute(o.DEBUG))}get disableTracking(){return this.hasAttribute(o.DISABLE_TRACKING)}set disableTracking(e){e!==this.disableTracking&&this.toggleAttribute(o.DISABLE_TRACKING,!!e)}get disableCookies(){return this.hasAttribute(o.DISABLE_COOKIES)}set disableCookies(e){e!==this.disableCookies&&(e?this.setAttribute(o.DISABLE_COOKIES,""):this.removeAttribute(o.DISABLE_COOKIES))}get disablePseudoEnded(){return this.hasAttribute(o.DISABLE_PSEUDO_ENDED)}set disablePseudoEnded(e){e!==this.disablePseudoEnded&&(e?this.setAttribute(o.DISABLE_PSEUDO_ENDED,""):this.removeAttribute(o.DISABLE_PSEUDO_ENDED))}get startTime(){let e=this.getAttribute(o.START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set startTime(e){e!==this.startTime&&(e==null?this.removeAttribute(o.START_TIME):this.setAttribute(o.START_TIME,`${e}`))}get playbackId(){var e;return this.hasAttribute(o.PLAYBACK_ID)?this.getAttribute(o.PLAYBACK_ID):(e=At(this.src))!=null?e:void 0}set playbackId(e){e!==this.playbackId&&(e?this.setAttribute(o.PLAYBACK_ID,e):this.removeAttribute(o.PLAYBACK_ID))}get maxResolution(){var e;return(e=this.getAttribute(o.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(o.MAX_RESOLUTION,e):this.removeAttribute(o.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(o.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(o.MIN_RESOLUTION,e):this.removeAttribute(o.MIN_RESOLUTION))}get maxAutoResolution(){var e;return(e=this.getAttribute(o.MAX_AUTO_RESOLUTION))!=null?e:void 0}set maxAutoResolution(e){e==null?this.removeAttribute(o.MAX_AUTO_RESOLUTION):this.setAttribute(o.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return(e=this.getAttribute(o.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(o.RENDITION_ORDER,e):this.removeAttribute(o.RENDITION_ORDER))}get programStartTime(){let e=this.getAttribute(o.PROGRAM_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programStartTime(e){e==null?this.removeAttribute(o.PROGRAM_START_TIME):this.setAttribute(o.PROGRAM_START_TIME,`${e}`)}get programEndTime(){let e=this.getAttribute(o.PROGRAM_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programEndTime(e){e==null?this.removeAttribute(o.PROGRAM_END_TIME):this.setAttribute(o.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){let e=this.getAttribute(o.ASSET_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetStartTime(e){e==null?this.removeAttribute(o.ASSET_START_TIME):this.setAttribute(o.ASSET_START_TIME,`${e}`)}get assetEndTime(){let e=this.getAttribute(o.ASSET_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetEndTime(e){e==null?this.removeAttribute(o.ASSET_END_TIME):this.setAttribute(o.ASSET_END_TIME,`${e}`)}get customDomain(){var e;return(e=this.getAttribute(o.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(o.CUSTOM_DOMAIN,e):this.removeAttribute(o.CUSTOM_DOMAIN))}get capRenditionToPlayerSize(){var e;return((e=this._hlsConfig)==null?void 0:e.capLevelToPlayerSize)!=null?this._hlsConfig.capLevelToPlayerSize:w(this,Me)}set capRenditionToPlayerSize(e){K(this,Me,e)}get drmToken(){var e;return(e=this.getAttribute(o.DRM_TOKEN))!=null?e:void 0}set drmToken(e){e!==this.drmToken&&(e?this.setAttribute(o.DRM_TOKEN,e):this.removeAttribute(o.DRM_TOKEN))}get playbackToken(){var e,t,a,r;if(this.hasAttribute(o.PLAYBACK_TOKEN))return(e=this.getAttribute(o.PLAYBACK_TOKEN))!=null?e:void 0;if(this.hasAttribute(o.PLAYBACK_ID)){let[,i]=Et((t=this.playbackId)!=null?t:"");return(a=new URLSearchParams(i).get("token"))!=null?a:void 0}if(this.src)return(r=new URLSearchParams(this.src).get("token"))!=null?r:void 0}set playbackToken(e){e!==this.playbackToken&&(e?this.setAttribute(o.PLAYBACK_TOKEN,e):this.removeAttribute(o.PLAYBACK_TOKEN))}get tokens(){let e=this.getAttribute(o.PLAYBACK_TOKEN),t=this.getAttribute(o.DRM_TOKEN);return{...w(this,Oe),...e!=null?{playback:e}:{},...t!=null?{drm:t}:{}}}set tokens(e){K(this,Oe,e??{})}get ended(){return Ya(this.nativeEl,this._hls)}get envKey(){var e;return(e=this.getAttribute(o.ENV_KEY))!=null?e:void 0}set envKey(e){e!==this.envKey&&(e?this.setAttribute(o.ENV_KEY,e):this.removeAttribute(o.ENV_KEY))}get beaconCollectionDomain(){var e;return(e=this.getAttribute(o.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(o.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(o.BEACON_COLLECTION_DOMAIN))}get streamType(){var e;return(e=this.getAttribute(o.STREAM_TYPE))!=null?e:dt(this.nativeEl)}set streamType(e){e!==this.streamType&&(e?this.setAttribute(o.STREAM_TYPE,e):this.removeAttribute(o.STREAM_TYPE))}get targetLiveWindow(){return this.hasAttribute(o.TARGET_LIVE_WINDOW)?+this.getAttribute(o.TARGET_LIVE_WINDOW):ui(this.nativeEl)}set targetLiveWindow(e){e!=this.targetLiveWindow&&(e==null?this.removeAttribute(o.TARGET_LIVE_WINDOW):this.setAttribute(o.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e,t;if(this.hasAttribute(o.LIVE_EDGE_OFFSET)){let{liveEdgeOffset:a}=this,r=(e=this.nativeEl.seekable.end(0))!=null?e:0,i=(t=this.nativeEl.seekable.start(0))!=null?t:0;return Math.max(i,r-a)}return mi(this.nativeEl)}get liveEdgeOffset(){if(this.hasAttribute(o.LIVE_EDGE_OFFSET))return+this.getAttribute(o.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){e!=this.liveEdgeOffset&&(e==null?this.removeAttribute(o.LIVE_EDGE_OFFSET):this.setAttribute(o.LIVE_EDGE_OFFSET,`${+e}`))}get seekable(){return _t(this.nativeEl)}async addCuePoints(e){return Oa(this.nativeEl,e)}get activeCuePoint(){return Da(this.nativeEl)}get cuePoints(){return Pr(this.nativeEl)}async addChapters(e){return Ia(this.nativeEl,e)}get activeChapter(){return La(this.nativeEl)}get chapters(){return Kr(this.nativeEl)}getStartDate(){return $r(this.nativeEl,this._hls)}get currentPdt(){return Br(this.nativeEl,this._hls)}get preferPlayback(){let e=this.getAttribute(o.PREFER_PLAYBACK);if(e===G.MSE||e===G.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===G.MSE||e===G.NATIVE?this.setAttribute(o.PREFER_PLAYBACK,e):this.removeAttribute(o.PREFER_PLAYBACK))}get metadata(){return{...this.getAttributeNames().filter(e=>e.startsWith("metadata-")&&![o.METADATA_URL].includes(e)).reduce((e,t)=>{let a=this.getAttribute(t);return a!=null&&(e[t.replace(/^metadata-/,"").replace(/-/g,"_")]=a),e},{}),...w(this,ve)}}set metadata(e){K(this,ve,e??{}),this.mux&&this.mux.emit("hb",w(this,ve))}get _hlsConfig(){return w(this,De)}set _hlsConfig(e){K(this,De,e)}get logo(){var e;return(e=this.getAttribute(o.LOGO))!=null?e:w(this,Ee)}set logo(e){e?this.setAttribute(o.LOGO,e):this.removeAttribute(o.LOGO)}load(){K(this,F,hi(this,this.nativeEl,w(this,F)))}unload(){$a(this.nativeEl,w(this,F),this),K(this,F,void 0)}attributeChangedCallback(e,t,a){var r,i;switch(Ae.observedAttributes.includes(e)&&!["src","autoplay","preload"].includes(e)&&super.attributeChangedCallback(e,t,a),e){case o.PLAYER_SOFTWARE_NAME:this.playerSoftwareName=a??void 0;break;case o.PLAYER_SOFTWARE_VERSION:this.playerSoftwareVersion=a??void 0;break;case"src":{let n=!!t,s=!!a;!n&&s?Re(this,ie,ge).call(this):n&&!s?this.unload():n&&s&&(this.unload(),Re(this,ie,ge).call(this));break}case"autoplay":if(a===t)break;(r=w(this,F))==null||r.setAutoplay(this.autoplay);break;case"preload":if(a===t)break;(i=w(this,F))==null||i.setPreload(a);break;case o.PLAYBACK_ID:this.src=st(this);break;case o.DEBUG:{let n=this.debug;this.mux&&console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."),this._hls&&(this._hls.config.debug=n);break}case o.METADATA_URL:a&&fetch(a).then(n=>n.json()).then(n=>this.metadata=n).catch(()=>console.error(`Unable to load or parse metadata JSON from metadata-url ${a}!`));break;case o.STREAM_TYPE:(a==null||a!==t)&&this.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}));break;case o.TARGET_LIVE_WINDOW:(a==null||a!==t)&&this.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0,detail:this.targetLiveWindow}));break;case o.LOGO:(a==null||a!==t)&&this.updateLogo();break;case o.DISABLE_TRACKING:{if(a==null||a!==t){let n=this.currentTime,s=this.paused;this.unload(),Re(this,ie,ge).call(this).then(()=>{this.currentTime=n,s||this.play()})}break}case o.DISABLE_COOKIES:{(a==null||a!==t)&&this.disableCookies&&document.cookie.split(";").forEach(n=>{n.trim().startsWith("muxData")&&(document.cookie=n.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/"))});break}case o.CAP_RENDITION_TO_PLAYER_SIZE:(a==null||a!==t)&&(this.capRenditionToPlayerSize=a!=null?!0:void 0)}}updateLogo(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector('slot[name="logo"]');if(!e)return;let t=this.constructor.getLogoHTML(w(this,Ee)||this.logo);e.innerHTML=t}connectedCallback(){var e;(e=super.connectedCallback)==null||e.call(this),this.nativeEl&&this.src&&!w(this,F)&&Re(this,ie,ge).call(this)}disconnectedCallback(){this.unload()}handleEvent(e){e.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(e.type,{composed:!0,detail:e.detail}))}};F=new WeakMap,be=new WeakMap,Ne=new WeakMap,ve=new WeakMap,Oe=new WeakMap,De=new WeakMap,Se=new WeakMap,Ie=new WeakMap,Le=new WeakMap,Ee=new WeakMap,Me=new WeakMap,ie=new WeakSet,ge=async function(){w(this,be)||(await K(this,be,Promise.resolve()),K(this,be,null),this.load())};var Za=e=>{throw TypeError(e)},ja=(e,t,a)=>t.has(e)||Za("Cannot "+a),Ii=(e,t,a)=>(ja(e,t,"read from private field"),a?a.call(e):t.get(e)),Li=(e,t,a)=>t.has(e)?Za("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),Mi=(e,t,a,r)=>(ja(e,t,"write to private field"),t.set(e,a),a),za=class{addEventListener(){}removeEventListener(){}dispatchEvent(t){return!0}};if(typeof DocumentFragment>"u"){class e extends za{}globalThis.DocumentFragment=e}var wi=class extends za{},xi={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(wi)}},Pi={customElements:xi},Ui=typeof window>"u"||typeof globalThis.customElements>"u",Je=Ui?Pi:globalThis,we,na=class extends hr(br(Si)){constructor(){super(...arguments),Li(this,we)}get autoplay(){let e=this.getAttribute("autoplay");return e===null?!1:e===""?!0:e}set autoplay(e){let t=this.autoplay;e!==t&&(e?this.setAttribute("autoplay",typeof e=="string"?e:""):this.removeAttribute("autoplay"))}get muxCastCustomData(){return{mux:{playbackId:this.playbackId,minResolution:this.minResolution,maxResolution:this.maxResolution,renditionOrder:this.renditionOrder,customDomain:this.customDomain,tokens:{drm:this.drmToken},envKey:this.envKey,metadata:this.metadata,disableCookies:this.disableCookies,disableTracking:this.disableTracking,beaconCollectionDomain:this.beaconCollectionDomain,startTime:this.startTime,preferCmcd:this.preferCmcd}}}get castCustomData(){var e;return(e=Ii(this,we))!=null?e:this.muxCastCustomData}set castCustomData(e){Mi(this,we,e)}};we=new WeakMap;Je.customElements.get("mux-video")||(Je.customElements.define("mux-video",na),Je.MuxVideoElement=na);var Xa=e=>{throw TypeError(e)},kt=(e,t,a)=>t.has(e)||Xa("Cannot "+a),N=(e,t,a)=>(kt(e,t,"read from private field"),a?a.call(e):t.get(e)),V=(e,t,a)=>t.has(e)?Xa("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),Z=(e,t,a,r)=>(kt(e,t,"write to private field"),t.set(e,a),a),M=(e,t,a)=>(kt(e,t,"access private method"),a),ze=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment>"u"){class e extends ze{}globalThis.DocumentFragment=e}var Nt=class extends ze{},Ki=class extends ze{},Yi={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(Nt)}},xe,$i=class{constructor(e,t={}){V(this,xe),Z(this,xe,t?.detail)}get detail(){return N(this,xe)}initCustomEvent(){}};xe=new WeakMap;function Bi(e,t){return new Nt}var qa={document:{createElement:Bi},DocumentFragment,customElements:Yi,CustomEvent:$i,EventTarget:ze,HTMLElement:Nt,HTMLVideoElement:Ki},Qa=typeof window>"u"||typeof globalThis.customElements>"u",H=Qa?qa:globalThis,Ve=Qa?qa.document:globalThis.document;function Wi(e){let t="";return Object.entries(e).forEach(([a,r])=>{r!=null&&(t+=`${mt(a)}: ${r}; `)}),t?t.trim():void 0}function mt(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function Ja(e){return e.replace(/[-_]([a-z])/g,(t,a)=>a.toUpperCase())}function Y(e){if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}function er(e){let t=Vi(e).toString();return t?"?"+t:""}function Vi(e){let t={};for(let a in e)e[a]!=null&&(t[a]=e[a]);return new URLSearchParams(t)}var tr=(e,t)=>!e||!t?!1:e.contains(t)?!0:tr(e,t.getRootNode().host),ar="mux.com",Fi=()=>{try{return"3.11.4"}catch{}return"UNKNOWN"},Hi=Fi(),rr=()=>Hi,Gi=(e,{token:t,customDomain:a=ar,thumbnailTime:r,programTime:i}={})=>{var n;let s=t==null?r:void 0,{aud:u}=(n=le(t))!=null?n:{};if(!(t&&u!=="t"))return`https://image.${a}/${e}/thumbnail.webp${er({token:t,time:s,program_time:i})}`},Zi=(e,{token:t,customDomain:a=ar,programStartTime:r,programEndTime:i}={})=>{var n;let{aud:s}=(n=le(t))!=null?n:{};if(!(t&&s!=="s"))return`https://image.${a}/${e}/storyboard.vtt${er({token:t,format:"webp",program_start_time:r,program_end_time:i})}`},Ot=e=>{if(e){if([k.LIVE,k.ON_DEMAND].includes(e))return e;if(e!=null&&e.includes("live"))return k.LIVE}},ji={crossorigin:"crossOrigin",playsinline:"playsInline"};function zi(e){var t;return(t=ji[e])!=null?t:Ja(e)}var ne,oe,U,Xi=class{constructor(e,t){V(this,ne),V(this,oe),V(this,U,[]),Z(this,ne,e),Z(this,oe,t)}[Symbol.iterator](){return N(this,U).values()}get length(){return N(this,U).length}get value(){var e;return(e=N(this,U).join(" "))!=null?e:""}set value(e){var t;e!==this.value&&(Z(this,U,[]),this.add(...(t=e?.split(" "))!=null?t:[]))}toString(){return this.value}item(e){return N(this,U)[e]}values(){return N(this,U).values()}keys(){return N(this,U).keys()}forEach(e){N(this,U).forEach(e)}add(...e){var t,a;e.forEach(r=>{this.contains(r)||N(this,U).push(r)}),!(this.value===""&&!((t=N(this,ne))!=null&&t.hasAttribute(`${N(this,oe)}`)))&&((a=N(this,ne))==null||a.setAttribute(`${N(this,oe)}`,`${this.value}`))}remove(...e){var t;e.forEach(a=>{N(this,U).splice(N(this,U).indexOf(a),1)}),(t=N(this,ne))==null||t.setAttribute(`${N(this,oe)}`,`${this.value}`)}contains(e){return N(this,U).includes(e)}toggle(e,t){return typeof t<"u"?t?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){this.remove(e),this.add(t)}};ne=new WeakMap,oe=new WeakMap,U=new WeakMap;var ir=`[mux-player ${rr()}]`;function z(...e){console.warn(ir,...e)}function $(...e){console.error(ir,...e)}function nr(e){var t;let a=(t=e.message)!=null?t:"";e.context&&(a+=` ${e.context}`),e.file&&(a+=` ${E("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${e.file}`),z(a)}var P={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},te={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},oa=Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),qi=Object.values(P).filter(e=>P.PLAYSINLINE!==e),Qi=Object.values(te),Ji=[...qi,...Qi],en=class extends H.HTMLElement{static get observedAttributes(){return Ji}constructor(){super()}attributeChangedCallback(e,t,a){var r,i;switch(e){case te.MUTED:{this.media&&(this.media.muted=a!=null,this.media.defaultMuted=a!=null);return}case te.VOLUME:{let n=(r=Y(a))!=null?r:1;this.media&&(this.media.volume=n);return}case te.PLAYBACKRATE:{let n=(i=Y(a))!=null?i:1;this.media&&(this.media.playbackRate=n,this.media.defaultPlaybackRate=n);return}}}play(){var e,t;return(t=(e=this.media)==null?void 0:e.play())!=null?t:Promise.reject()}pause(){var e;(e=this.media)==null||e.pause()}load(){var e;(e=this.media)==null||e.load()}get media(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var e,t;return(t=(e=this.media)==null?void 0:e.paused)!=null?t:!0}get duration(){var e,t;return(t=(e=this.media)==null?void 0:e.duration)!=null?t:NaN}get ended(){var e,t;return(t=(e=this.media)==null?void 0:e.ended)!=null?t:!1}get buffered(){var e,t;return(t=(e=this.media)==null?void 0:e.buffered)!=null?t:oa}get seekable(){var e,t;return(t=(e=this.media)==null?void 0:e.seekable)!=null?t:oa}get readyState(){var e,t;return(t=(e=this.media)==null?void 0:e.readyState)!=null?t:0}get videoWidth(){var e,t;return(t=(e=this.media)==null?void 0:e.videoWidth)!=null?t:0}get videoHeight(){var e,t;return(t=(e=this.media)==null?void 0:e.videoHeight)!=null?t:0}get currentSrc(){var e,t;return(t=(e=this.media)==null?void 0:e.currentSrc)!=null?t:""}get currentTime(){var e,t;return(t=(e=this.media)==null?void 0:e.currentTime)!=null?t:0}set currentTime(e){this.media&&(this.media.currentTime=Number(e))}get volume(){var e,t;return(t=(e=this.media)==null?void 0:e.volume)!=null?t:1}set volume(e){this.media&&(this.media.volume=Number(e))}get playbackRate(){var e,t;return(t=(e=this.media)==null?void 0:e.playbackRate)!=null?t:1}set playbackRate(e){this.media&&(this.media.playbackRate=Number(e))}get defaultPlaybackRate(){var e;return(e=Y(this.getAttribute(te.PLAYBACKRATE)))!=null?e:1}set defaultPlaybackRate(e){e!=null?this.setAttribute(te.PLAYBACKRATE,`${e}`):this.removeAttribute(te.PLAYBACKRATE)}get crossOrigin(){return ue(this,P.CROSSORIGIN)}set crossOrigin(e){this.setAttribute(P.CROSSORIGIN,`${e}`)}get autoplay(){return ue(this,P.AUTOPLAY)!=null}set autoplay(e){e?this.setAttribute(P.AUTOPLAY,typeof e=="string"?e:""):this.removeAttribute(P.AUTOPLAY)}get loop(){return ue(this,P.LOOP)!=null}set loop(e){e?this.setAttribute(P.LOOP,""):this.removeAttribute(P.LOOP)}get muted(){var e,t;return(t=(e=this.media)==null?void 0:e.muted)!=null?t:!1}set muted(e){this.media&&(this.media.muted=!!e)}get defaultMuted(){return ue(this,P.MUTED)!=null}set defaultMuted(e){e?this.setAttribute(P.MUTED,""):this.removeAttribute(P.MUTED)}get playsInline(){return ue(this,P.PLAYSINLINE)!=null}set playsInline(e){$("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(e){["","none","metadata","auto"].includes(e)?this.setAttribute(P.PRELOAD,e):this.removeAttribute(P.PRELOAD)}};function ue(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var la=en,tn=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`,me=new WeakMap,an=class or{constructor(t,a){this.element=t,this.type=a,this.element.addEventListener(this.type,this);let r=me.get(this.element);r&&r.set(this.type,this)}set(t){if(typeof t=="function")this.handleEvent=t.bind(this.element);else if(typeof t=="object"&&typeof t.handleEvent=="function")this.handleEvent=t.handleEvent.bind(t);else{this.element.removeEventListener(this.type,this);let a=me.get(this.element);a&&a.delete(this.type)}}static for(t){me.has(t.element)||me.set(t.element,new Map);let a=t.attributeName.slice(2),r=me.get(t.element);return r&&r.has(a)?r.get(a):new or(t.element,a)}};function rn(e,t){return e instanceof He&&e.attributeName.startsWith("on")?(an.for(e).set(t),e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),!0):!1}function nn(e,t){return t instanceof lr&&e instanceof Fe?(t.renderInto(e),!0):!1}function on(e,t){return t instanceof DocumentFragment&&e instanceof Fe?(t.childNodes.length&&e.replace(...t.childNodes),!0):!1}function ln(e,t){if(e instanceof He){let a=e.attributeNamespace,r=e.element.getAttributeNS(a,e.attributeName);return String(t)!==r&&(e.value=String(t)),!0}return e.value=String(t),!0}function sn(e,t){if(e instanceof He&&t instanceof Element){let a=e.element;return a[e.attributeName]!==t&&(e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),a[e.attributeName]=t),!0}return!1}function dn(e,t){if(typeof t=="boolean"&&e instanceof He){let a=e.attributeNamespace,r=e.element.hasAttributeNS(a,e.attributeName);return t!==r&&(e.booleanValue=t),!0}return!1}function un(e,t){return t===!1&&e instanceof Fe?(e.replace(""),!0):!1}function mn(e,t){sn(e,t)||dn(e,t)||rn(e,t)||un(e,t)||nn(e,t)||on(e,t)||ln(e,t)}var et=new Map,sa=new WeakMap,da=new WeakMap,lr=class{constructor(e,t,a){this.strings=e,this.values=t,this.processor=a,this.stringsKey=this.strings.join("")}get template(){if(et.has(this.stringsKey))return et.get(this.stringsKey);{let e=Ve.createElement("template"),t=this.strings.length-1;return e.innerHTML=this.strings.reduce((a,r,i)=>a+r+(i<t?`{{ ${i} }}`:""),""),et.set(this.stringsKey,e),e}}renderInto(e){var t;let a=this.template;if(sa.get(e)!==a){sa.set(e,a);let i=new gr(a,this.values,this.processor);da.set(e,i),e instanceof Fe?e.replace(...i.children):e.appendChild(i);return}let r=da.get(e);(t=r?.update)==null||t.call(r,this.values)}},cn={processCallback(e,t,a){var r;if(a){for(let[i,n]of t)if(i in a){let s=(r=a[i])!=null?r:"";mn(n,s)}}}};function Pe(e,...t){return new lr(e,t,cn)}function pn(e,t){e.renderInto(t)}var hn=e=>{let{tokens:t}=e;return t.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""},bn=e=>Pe`
  <style>
    ${hn(e)}
    ${tn}
  </style>
  ${fn(e)}
`,vn=e=>{let t=e.hotKeys?`${e.hotKeys}`:"";return Ot(e.streamType)==="live"&&(t+=" noarrowleft noarrowright"),t},En={TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",THUMB:"thumb",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",MENU_ITEM:"menu-item",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"},gn=Object.values(En).join(", "),fn=e=>{var t,a,r,i,n,s,u,l,c,d,p,b,g,T,_,y,A,C,v,I,x,ye,de,Dt,St,It,Lt,Mt,wt,xt,Pt,Ut,Kt,Yt,$t,Bt,Wt,Vt,Ft;return Pe`
  <media-theme
    template="${e.themeTemplate||!1}"
    defaultstreamtype="${(t=e.defaultStreamType)!=null?t:!1}"
    hotkeys="${vn(e)||!1}"
    nohotkeys="${e.noHotKeys||!e.hasSrc||!1}"
    noautoseektolive="${!!((a=e.streamType)!=null&&a.includes(k.LIVE))&&e.targetLiveWindow!==0}"
    novolumepref="${e.novolumepref||!1}"
    nomutedpref="${e.nomutedpref||!1}"
    disabled="${!e.hasSrc||e.isDialogOpen}"
    audio="${(r=e.audio)!=null?r:!1}"
    style="${(i=Wi({"--media-primary-color":e.primaryColor,"--media-secondary-color":e.secondaryColor,"--media-accent-color":e.accentColor}))!=null?i:!1}"
    defaultsubtitles="${!e.defaultHiddenCaptions}"
    forwardseekoffset="${(n=e.forwardSeekOffset)!=null?n:!1}"
    backwardseekoffset="${(s=e.backwardSeekOffset)!=null?s:!1}"
    playbackrates="${(u=e.playbackRates)!=null?u:!1}"
    defaultshowremainingtime="${(l=e.defaultShowRemainingTime)!=null?l:!1}"
    defaultduration="${(c=e.defaultDuration)!=null?c:!1}"
    hideduration="${(d=e.hideDuration)!=null?d:!1}"
    title="${(p=e.title)!=null?p:!1}"
    videotitle="${(b=e.videoTitle)!=null?b:!1}"
    proudlydisplaymuxbadge="${(g=e.proudlyDisplayMuxBadge)!=null?g:!1}"
    exportparts="${gn}"
    onclose="${e.onCloseErrorDialog}"
    onfocusin="${e.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      inert="${(T=e.noHotKeys)!=null?T:!1}"
      target-live-window="${(_=e.targetLiveWindow)!=null?_:!1}"
      stream-type="${(y=Ot(e.streamType))!=null?y:!1}"
      crossorigin="${(A=e.crossOrigin)!=null?A:""}"
      playsinline
      autoplay="${(C=e.autoplay)!=null?C:!1}"
      muted="${(v=e.muted)!=null?v:!1}"
      loop="${(I=e.loop)!=null?I:!1}"
      preload="${(x=e.preload)!=null?x:!1}"
      debug="${(ye=e.debug)!=null?ye:!1}"
      prefer-cmcd="${(de=e.preferCmcd)!=null?de:!1}"
      disable-tracking="${(Dt=e.disableTracking)!=null?Dt:!1}"
      disable-cookies="${(St=e.disableCookies)!=null?St:!1}"
      prefer-playback="${(It=e.preferPlayback)!=null?It:!1}"
      start-time="${e.startTime!=null?e.startTime:!1}"
      beacon-collection-domain="${(Lt=e.beaconCollectionDomain)!=null?Lt:!1}"
      player-init-time="${(Mt=e.playerInitTime)!=null?Mt:!1}"
      player-software-name="${(wt=e.playerSoftwareName)!=null?wt:!1}"
      player-software-version="${(xt=e.playerSoftwareVersion)!=null?xt:!1}"
      env-key="${(Pt=e.envKey)!=null?Pt:!1}"
      custom-domain="${(Ut=e.customDomain)!=null?Ut:!1}"
      src="${e.src?e.src:e.playbackId?st(e):!1}"
      cast-src="${e.src?e.src:e.playbackId?st(e):!1}"
      cast-receiver="${(Kt=e.castReceiver)!=null?Kt:!1}"
      drm-token="${($t=(Yt=e.tokens)==null?void 0:Yt.drm)!=null?$t:!1}"
      exportparts="video"
      disable-pseudo-ended="${(Bt=e.disablePseudoEnded)!=null?Bt:!1}"
      max-auto-resolution="${(Wt=e.maxAutoResolution)!=null?Wt:!1}"
      cap-rendition-to-player-size="${(Vt=e.capRenditionToPlayerSize)!=null?Vt:!1}"
    >
      ${e.storyboard?Pe`<track label="thumbnails" default kind="metadata" src="${e.storyboard}" />`:Pe``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${e.poster?e.poster:!1}"
        placeholdersrc="${(Ft=e.placeholder)!=null?Ft:!1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`},sr=e=>e.charAt(0).toUpperCase()+e.slice(1),Tn=(e,t=!1)=>{var a,r;if(e.muxCode){let i=sr((a=e.errorCategory)!=null?a:"video"),n=Ge((r=e.errorCategory)!=null?r:O.VIDEO);if(e.muxCode===f.NETWORK_OFFLINE)return E("Your device appears to be offline",t);if(e.muxCode===f.NETWORK_TOKEN_EXPIRED)return E("{category} URL has expired",t).format({category:i});if([f.NETWORK_TOKEN_SUB_MISMATCH,f.NETWORK_TOKEN_AUD_MISMATCH,f.NETWORK_TOKEN_AUD_MISSING,f.NETWORK_TOKEN_MALFORMED].includes(e.muxCode))return E("{category} URL is formatted incorrectly",t).format({category:i});if(e.muxCode===f.NETWORK_TOKEN_MISSING)return E("Invalid {categoryName} URL",t).format({categoryName:n});if(e.muxCode===f.NETWORK_NOT_FOUND)return E("{category} does not exist",t).format({category:i});if(e.muxCode===f.NETWORK_NOT_READY){let s=e.streamType==="live"?"Live stream":"Video";return E("{mediaType} is not currently available",t).format({mediaType:s})}}if(e.code){if(e.code===h.MEDIA_ERR_NETWORK)return E("Network Error",t);if(e.code===h.MEDIA_ERR_DECODE)return E("Media Error",t);if(e.code===h.MEDIA_ERR_SRC_NOT_SUPPORTED)return E("Source Not Supported",t)}return E("Error",t)},yn=(e,t=!1)=>{var a,r;if(e.muxCode){let i=sr((a=e.errorCategory)!=null?a:"video"),n=Ge((r=e.errorCategory)!=null?r:O.VIDEO);return e.muxCode===f.NETWORK_OFFLINE?E("Check your internet connection and try reloading this video.",t):e.muxCode===f.NETWORK_TOKEN_EXPIRED?E("The video’s secured {tokenNamePrefix}-token has expired.",t).format({tokenNamePrefix:n}):e.muxCode===f.NETWORK_TOKEN_SUB_MISMATCH?E("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",t).format({tokenNamePrefix:n}):e.muxCode===f.NETWORK_TOKEN_MALFORMED?E("{category} URL is formatted incorrectly",t).format({category:i}):[f.NETWORK_TOKEN_AUD_MISMATCH,f.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode)?E("The {tokenNamePrefix}-token is formatted with incorrect information.",t).format({tokenNamePrefix:n}):[f.NETWORK_TOKEN_MISSING,f.NETWORK_INVALID_URL].includes(e.muxCode)?E("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",t).format({tokenNamePrefix:n}):e.muxCode===f.NETWORK_NOT_FOUND?"":e.message}return e.code&&(e.code===h.MEDIA_ERR_NETWORK||e.code===h.MEDIA_ERR_DECODE||(e.code,h.MEDIA_ERR_SRC_NOT_SUPPORTED)),e.message},An=(e,t=!1)=>{let a=Tn(e,t).toString(),r=yn(e,t).toString();return{title:a,message:r}},_n=e=>{if(e.muxCode){if(e.muxCode===f.NETWORK_TOKEN_EXPIRED)return"403-expired-token.md";if(e.muxCode===f.NETWORK_TOKEN_MALFORMED)return"403-malformatted-token.md";if([f.NETWORK_TOKEN_AUD_MISMATCH,f.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode))return"403-incorrect-aud-value.md";if(e.muxCode===f.NETWORK_TOKEN_SUB_MISMATCH)return"403-playback-id-mismatch.md";if(e.muxCode===f.NETWORK_TOKEN_MISSING)return"missing-signed-tokens.md";if(e.muxCode===f.NETWORK_NOT_FOUND)return"404-not-found.md";if(e.muxCode===f.NETWORK_NOT_READY)return"412-not-playable.md"}if(e.code){if(e.code===h.MEDIA_ERR_NETWORK)return"";if(e.code===h.MEDIA_ERR_DECODE)return"media-decode-error.md";if(e.code===h.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""},ua=(e,t)=>{let a=_n(e);return{message:e.message,context:e.context,file:a}},Rn=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}" exportparts="thumb">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`,ct=Ve.createElement("template");"innerHTML"in ct&&(ct.innerHTML=Rn);var ma,ca,dr=class extends vr{};dr.template=(ca=(ma=ct.content)==null?void 0:ma.children)==null?void 0:ca[0];H.customElements.get("media-theme-gerwig")||H.customElements.define("media-theme-gerwig",dr);var Cn="gerwig",j={SRC:"src",POSTER:"poster"},m={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",FULLSCREEN_ELEMENT:"fullscreen-element",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",NO_MUTED_PREF:"no-muted-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended"},pt=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","nomutedpref","proudlydisplaymuxbadge"];function kn(e,t){var a,r,i;return{src:!e.playbackId&&e.src,playbackId:e.playbackId,hasSrc:!!e.playbackId||!!e.src||!!e.currentSrc,poster:e.poster,storyboard:((a=e.media)==null?void 0:a.currentSrc)&&e.storyboard,storyboardSrc:e.getAttribute(m.STORYBOARD_SRC),fullscreenElement:e.getAttribute(m.FULLSCREEN_ELEMENT),placeholder:e.getAttribute("placeholder"),themeTemplate:On(e),thumbnailTime:!e.tokens.thumbnail&&e.thumbnailTime,autoplay:e.autoplay,crossOrigin:e.crossOrigin,loop:e.loop,noHotKeys:e.hasAttribute(m.NOHOTKEYS),hotKeys:e.getAttribute(m.HOTKEYS),muted:e.muted,paused:e.paused,preload:e.preload,envKey:e.envKey,preferCmcd:e.preferCmcd,debug:e.debug,disableTracking:e.disableTracking,disableCookies:e.disableCookies,tokens:e.tokens,beaconCollectionDomain:e.beaconCollectionDomain,maxResolution:e.maxResolution,minResolution:e.minResolution,maxAutoResolution:e.maxAutoResolution,programStartTime:e.programStartTime,programEndTime:e.programEndTime,assetStartTime:e.assetStartTime,assetEndTime:e.assetEndTime,renditionOrder:e.renditionOrder,metadata:e.metadata,playerInitTime:e.playerInitTime,playerSoftwareName:e.playerSoftwareName,playerSoftwareVersion:e.playerSoftwareVersion,startTime:e.startTime,preferPlayback:e.preferPlayback,audio:e.audio,defaultStreamType:e.defaultStreamType,targetLiveWindow:e.getAttribute(o.TARGET_LIVE_WINDOW),streamType:Ot(e.getAttribute(o.STREAM_TYPE)),primaryColor:e.getAttribute(m.PRIMARY_COLOR),secondaryColor:e.getAttribute(m.SECONDARY_COLOR),accentColor:e.getAttribute(m.ACCENT_COLOR),forwardSeekOffset:e.forwardSeekOffset,backwardSeekOffset:e.backwardSeekOffset,defaultHiddenCaptions:e.defaultHiddenCaptions,defaultDuration:e.defaultDuration,defaultShowRemainingTime:e.defaultShowRemainingTime,hideDuration:Dn(e),playbackRates:e.getAttribute(m.PLAYBACK_RATES),customDomain:(r=e.getAttribute(o.CUSTOM_DOMAIN))!=null?r:void 0,title:e.getAttribute(m.TITLE),videoTitle:(i=e.getAttribute(m.VIDEO_TITLE))!=null?i:e.getAttribute(m.TITLE),novolumepref:e.hasAttribute(m.NO_VOLUME_PREF),nomutedpref:e.hasAttribute(m.NO_MUTED_PREF),proudlyDisplayMuxBadge:e.hasAttribute(m.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:e.castReceiver,disablePseudoEnded:e.hasAttribute(m.DISABLE_PSEUDO_ENDED),capRenditionToPlayerSize:e.capRenditionToPlayerSize,...t,extraSourceParams:e.extraSourceParams}}var Nn=Aa.formatErrorMessage;Aa.formatErrorMessage=e=>{var t,a;if(e instanceof h){let r=An(e,!1);return`
      ${r!=null&&r.title?`<h3>${r.title}</h3>`:""}
      ${r!=null&&r.message||r!=null&&r.linkUrl?`<p>
        ${r?.message}
        ${r!=null&&r.linkUrl?`<a
              href="${r.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(t=r.linkText)!=null?t:""} ${E("(opens in a new window)")}"
              >${(a=r.linkText)!=null?a:r.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return Nn(e)};function On(e){var t,a;let r=e.theme;if(r){let i=(a=(t=e.getRootNode())==null?void 0:t.getElementById)==null?void 0:a.call(t,r);if(i&&i instanceof HTMLTemplateElement)return i;r.startsWith("media-theme-")||(r=`media-theme-${r}`);let n=H.customElements.get(r);if(n!=null&&n.template)return n.template}}function Dn(e){var t;let a=(t=e.mediaController)==null?void 0:t.querySelector("media-time-display");return a&&getComputedStyle(a).getPropertyValue("--media-duration-display-display").trim()==="none"}function pa(e){let t=e.videoTitle?{video_title:e.videoTitle}:{};return e.getAttributeNames().filter(a=>a.startsWith("metadata-")).reduce((a,r)=>{let i=e.getAttribute(r);return i!==null&&(a[r.replace(/^metadata-/,"").replace(/-/g,"_")]=i),a},t)}var Sn=Object.values(o),In=Object.values(j),Ln=Object.values(m),ha=rr(),ba="mux-player",va={isDialogOpen:!1},Mn={redundant_streams:!0},Ue,Ke,Ye,ae,$e,se,D,J,ur,ht,re,Ea,ga,fa,Ta,wn=class extends la{constructor(){super(),V(this,D),V(this,Ue),V(this,Ke,!1),V(this,Ye,{}),V(this,ae,!0),V(this,$e,new Xi(this,"hotkeys")),V(this,se,{...va,onCloseErrorDialog:e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&M(this,D,ht).call(this,{isDialogOpen:!1})},onFocusInErrorDialog:e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&(tr(this,Ve.activeElement)||e.preventDefault())}}),Z(this,Ue,xa()),this.attachShadow({mode:"open"}),M(this,D,ur).call(this),this.isConnected&&M(this,D,J).call(this)}static get NAME(){return ba}static get VERSION(){return ha}static get observedAttributes(){var e;return[...(e=la.observedAttributes)!=null?e:[],...In,...Sn,...Ln]}get mediaTheme(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("media-theme")}get mediaController(){var e,t;return(t=(e=this.mediaTheme)==null?void 0:e.shadowRoot)==null?void 0:t.querySelector("media-controller")}connectedCallback(){let e=this.media;e&&(e.metadata=pa(this))}attributeChangedCallback(e,t,a){switch(M(this,D,J).call(this),super.attributeChangedCallback(e,t,a),e){case m.HOTKEYS:N(this,$e).value=a;break;case m.THUMBNAIL_TIME:{a!=null&&this.tokens.thumbnail&&z(E("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break}case m.THUMBNAIL_TOKEN:{if(a){let r=le(a);if(r){let{aud:i}=r,n=fe.THUMBNAIL;i!==n&&z(E("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:i,expectedAud:n,tokenNamePrefix:"thumbnail"}))}}break}case m.STORYBOARD_TOKEN:{if(a){let r=le(a);if(r){let{aud:i}=r,n=fe.STORYBOARD;i!==n&&z(E("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:i,expectedAud:n,tokenNamePrefix:"storyboard"}))}}break}case m.DRM_TOKEN:{if(a){let r=le(a);if(r){let{aud:i}=r,n=fe.DRM;i!==n&&z(E("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:i,expectedAud:n,tokenNamePrefix:"drm"}))}}break}case o.PLAYBACK_ID:{a!=null&&a.includes("?token")&&$(E("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:a}));break}case o.STREAM_TYPE:{a&&![k.LIVE,k.ON_DEMAND,k.UNKNOWN].includes(a)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=a.includes("dvr")?Number.POSITIVE_INFINITY:0:nr({file:"invalid-stream-type.md",message:E("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):a===k.LIVE?this.getAttribute(m.TARGET_LIVE_WINDOW)==null&&(this.targetLiveWindow=0):this.targetLiveWindow=Number.NaN;break}case m.FULLSCREEN_ELEMENT:{if(a!=null||a!==t){let r=Ve.getElementById(a),i=r?.querySelector("mux-player");this.mediaController&&r&&i&&(this.mediaController.fullscreenElement=r)}break}case o.CAP_RENDITION_TO_PLAYER_SIZE:{(a==null||a!==t)&&(this.capRenditionToPlayerSize=a!=null?!0:void 0);break}}[o.PLAYBACK_ID,j.SRC,m.PLAYBACK_TOKEN].includes(e)&&t!==a&&Z(this,se,{...N(this,se),...va}),M(this,D,re).call(this,{[zi(e)]:a})}async requestFullscreen(e){var t;if(!(!this.mediaController||this.mediaController.hasAttribute(_e.MEDIA_IS_FULLSCREEN)))return(t=this.mediaController)==null||t.dispatchEvent(new H.CustomEvent(Ht.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((a,r)=>{var i;(i=this.mediaController)==null||i.addEventListener(Gt.MEDIA_IS_FULLSCREEN,()=>a(),{once:!0})})}async exitFullscreen(){var e;if(!(!this.mediaController||!this.mediaController.hasAttribute(_e.MEDIA_IS_FULLSCREEN)))return(e=this.mediaController)==null||e.dispatchEvent(new H.CustomEvent(Ht.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((t,a)=>{var r;(r=this.mediaController)==null||r.addEventListener(Gt.MEDIA_IS_FULLSCREEN,()=>t(),{once:!0})})}get preferCmcd(){var e;return(e=this.getAttribute(o.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?Be.includes(e)?this.setAttribute(o.PREFER_CMCD,e):z(`Invalid value for preferCmcd. Must be one of ${Be.join()}`):this.removeAttribute(o.PREFER_CMCD))}get hasPlayed(){var e,t;return(t=(e=this.mediaController)==null?void 0:e.hasAttribute(_e.MEDIA_HAS_PLAYED))!=null?t:!1}get inLiveWindow(){var e;return(e=this.mediaController)==null?void 0:e.hasAttribute(_e.MEDIA_TIME_IS_LIVE)}get _hls(){var e;return(e=this.media)==null?void 0:e._hls}get mux(){var e;return(e=this.media)==null?void 0:e.mux}get theme(){var e;return(e=this.getAttribute(m.THEME))!=null?e:Cn}set theme(e){this.setAttribute(m.THEME,`${e}`)}get themeProps(){let e=this.mediaTheme;if(!e)return;let t={};for(let a of e.getAttributeNames()){if(pt.includes(a))continue;let r=e.getAttribute(a);t[Ja(a)]=r===""?!0:r}return t}set themeProps(e){var t,a;M(this,D,J).call(this);let r={...this.themeProps,...e};for(let i in r){if(pt.includes(i))continue;let n=e?.[i];typeof n=="boolean"||n==null?(t=this.mediaTheme)==null||t.toggleAttribute(mt(i),!!n):(a=this.mediaTheme)==null||a.setAttribute(mt(i),n)}}get playbackId(){var e;return(e=this.getAttribute(o.PLAYBACK_ID))!=null?e:void 0}set playbackId(e){e?this.setAttribute(o.PLAYBACK_ID,e):this.removeAttribute(o.PLAYBACK_ID)}get src(){var e,t;return this.playbackId?(e=ee(this,j.SRC))!=null?e:void 0:(t=this.getAttribute(j.SRC))!=null?t:void 0}set src(e){e?this.setAttribute(j.SRC,e):this.removeAttribute(j.SRC)}get poster(){var e;let t=this.getAttribute(j.POSTER);if(t!=null)return t;let{tokens:a}=this;if(a.playback&&!a.thumbnail){z("Missing expected thumbnail token. No poster image will be shown");return}if(this.playbackId&&!this.audio)return Gi(this.playbackId,{customDomain:this.customDomain,thumbnailTime:(e=this.thumbnailTime)!=null?e:this.startTime,programTime:this.programStartTime,token:a.thumbnail})}set poster(e){e||e===""?this.setAttribute(j.POSTER,e):this.removeAttribute(j.POSTER)}get storyboardSrc(){var e;return(e=this.getAttribute(m.STORYBOARD_SRC))!=null?e:void 0}set storyboardSrc(e){e?this.setAttribute(m.STORYBOARD_SRC,e):this.removeAttribute(m.STORYBOARD_SRC)}get storyboard(){let{tokens:e}=this;if(this.storyboardSrc&&!e.storyboard)return this.storyboardSrc;if(!(this.audio||!this.playbackId||!this.streamType||[k.LIVE,k.UNKNOWN].includes(this.streamType)||e.playback&&!e.storyboard))return Zi(this.playbackId,{customDomain:this.customDomain,token:e.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(m.AUDIO)}set audio(e){if(!e){this.removeAttribute(m.AUDIO);return}this.setAttribute(m.AUDIO,"")}get hotkeys(){return N(this,$e)}get nohotkeys(){return this.hasAttribute(m.NOHOTKEYS)}set nohotkeys(e){if(!e){this.removeAttribute(m.NOHOTKEYS);return}this.setAttribute(m.NOHOTKEYS,"")}get thumbnailTime(){return Y(this.getAttribute(m.THUMBNAIL_TIME))}set thumbnailTime(e){this.setAttribute(m.THUMBNAIL_TIME,`${e}`)}get videoTitle(){var e,t;return(t=(e=this.getAttribute(m.VIDEO_TITLE))!=null?e:this.getAttribute(m.TITLE))!=null?t:""}set videoTitle(e){e!==this.videoTitle&&(e?this.setAttribute(m.VIDEO_TITLE,e):this.removeAttribute(m.VIDEO_TITLE))}get placeholder(){var e;return(e=ee(this,m.PLACEHOLDER))!=null?e:""}set placeholder(e){this.setAttribute(m.PLACEHOLDER,`${e}`)}get primaryColor(){var e,t;let a=this.getAttribute(m.PRIMARY_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=H.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_primary-color"))==null?void 0:t.trim(),a))return a}set primaryColor(e){this.setAttribute(m.PRIMARY_COLOR,`${e}`)}get secondaryColor(){var e,t;let a=this.getAttribute(m.SECONDARY_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=H.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_secondary-color"))==null?void 0:t.trim(),a))return a}set secondaryColor(e){this.setAttribute(m.SECONDARY_COLOR,`${e}`)}get accentColor(){var e,t;let a=this.getAttribute(m.ACCENT_COLOR);if(a!=null||this.mediaTheme&&(a=(t=(e=H.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_accent-color"))==null?void 0:t.trim(),a))return a}set accentColor(e){this.setAttribute(m.ACCENT_COLOR,`${e}`)}get defaultShowRemainingTime(){return this.hasAttribute(m.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(e){e?this.setAttribute(m.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(m.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(m.PLAYBACK_RATES))return this.getAttribute(m.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(e=>Number(e)).filter(e=>!Number.isNaN(e)).sort((e,t)=>e-t)}set playbackRates(e){if(!e){this.removeAttribute(m.PLAYBACK_RATES);return}this.setAttribute(m.PLAYBACK_RATES,e.join(" "))}get forwardSeekOffset(){var e;return(e=Y(this.getAttribute(m.FORWARD_SEEK_OFFSET)))!=null?e:10}set forwardSeekOffset(e){this.setAttribute(m.FORWARD_SEEK_OFFSET,`${e}`)}get backwardSeekOffset(){var e;return(e=Y(this.getAttribute(m.BACKWARD_SEEK_OFFSET)))!=null?e:10}set backwardSeekOffset(e){this.setAttribute(m.BACKWARD_SEEK_OFFSET,`${e}`)}get defaultHiddenCaptions(){return this.hasAttribute(m.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(e){e?this.setAttribute(m.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(m.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return Y(this.getAttribute(m.DEFAULT_DURATION))}set defaultDuration(e){e==null?this.removeAttribute(m.DEFAULT_DURATION):this.setAttribute(m.DEFAULT_DURATION,`${e}`)}get playerInitTime(){return this.hasAttribute(o.PLAYER_INIT_TIME)?Y(this.getAttribute(o.PLAYER_INIT_TIME)):N(this,Ue)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(o.PLAYER_INIT_TIME):this.setAttribute(o.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=this.getAttribute(o.PLAYER_SOFTWARE_NAME))!=null?e:ba}get playerSoftwareVersion(){var e;return(e=this.getAttribute(o.PLAYER_SOFTWARE_VERSION))!=null?e:ha}get beaconCollectionDomain(){var e;return(e=this.getAttribute(o.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(o.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(o.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var e;return(e=this.getAttribute(o.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(o.MAX_RESOLUTION,e):this.removeAttribute(o.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(o.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(o.MIN_RESOLUTION,e):this.removeAttribute(o.MIN_RESOLUTION))}get maxAutoResolution(){var e;return(e=this.getAttribute(o.MAX_AUTO_RESOLUTION))!=null?e:void 0}set maxAutoResolution(e){e==null?this.removeAttribute(o.MAX_AUTO_RESOLUTION):this.setAttribute(o.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return(e=this.getAttribute(o.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(o.RENDITION_ORDER,e):this.removeAttribute(o.RENDITION_ORDER))}get programStartTime(){return Y(this.getAttribute(o.PROGRAM_START_TIME))}set programStartTime(e){e==null?this.removeAttribute(o.PROGRAM_START_TIME):this.setAttribute(o.PROGRAM_START_TIME,`${e}`)}get programEndTime(){return Y(this.getAttribute(o.PROGRAM_END_TIME))}set programEndTime(e){e==null?this.removeAttribute(o.PROGRAM_END_TIME):this.setAttribute(o.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){return Y(this.getAttribute(o.ASSET_START_TIME))}set assetStartTime(e){e==null?this.removeAttribute(o.ASSET_START_TIME):this.setAttribute(o.ASSET_START_TIME,`${e}`)}get assetEndTime(){return Y(this.getAttribute(o.ASSET_END_TIME))}set assetEndTime(e){e==null?this.removeAttribute(o.ASSET_END_TIME):this.setAttribute(o.ASSET_END_TIME,`${e}`)}get extraSourceParams(){return this.hasAttribute(m.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(m.EXTRA_SOURCE_PARAMS)).entries()].reduce((e,[t,a])=>(e[t]=a,e),{}):Mn}set extraSourceParams(e){e==null?this.removeAttribute(m.EXTRA_SOURCE_PARAMS):this.setAttribute(m.EXTRA_SOURCE_PARAMS,new URLSearchParams(e).toString())}get customDomain(){var e;return(e=this.getAttribute(o.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(o.CUSTOM_DOMAIN,e):this.removeAttribute(o.CUSTOM_DOMAIN))}get envKey(){var e;return(e=ee(this,o.ENV_KEY))!=null?e:void 0}set envKey(e){this.setAttribute(o.ENV_KEY,`${e}`)}get noVolumePref(){return this.hasAttribute(m.NO_VOLUME_PREF)}set noVolumePref(e){e?this.setAttribute(m.NO_VOLUME_PREF,""):this.removeAttribute(m.NO_VOLUME_PREF)}get noMutedPref(){return this.hasAttribute(m.NO_MUTED_PREF)}set noMutedPref(e){e?this.setAttribute(m.NO_MUTED_PREF,""):this.removeAttribute(m.NO_MUTED_PREF)}get debug(){return ee(this,o.DEBUG)!=null}set debug(e){e?this.setAttribute(o.DEBUG,""):this.removeAttribute(o.DEBUG)}get disableTracking(){return ee(this,o.DISABLE_TRACKING)!=null}set disableTracking(e){this.toggleAttribute(o.DISABLE_TRACKING,!!e)}get disableCookies(){return ee(this,o.DISABLE_COOKIES)!=null}set disableCookies(e){e?this.setAttribute(o.DISABLE_COOKIES,""):this.removeAttribute(o.DISABLE_COOKIES)}get streamType(){var e,t,a;return(a=(t=this.getAttribute(o.STREAM_TYPE))!=null?t:(e=this.media)==null?void 0:e.streamType)!=null?a:k.UNKNOWN}set streamType(e){this.setAttribute(o.STREAM_TYPE,`${e}`)}get defaultStreamType(){var e,t,a;return(a=(t=this.getAttribute(m.DEFAULT_STREAM_TYPE))!=null?t:(e=this.mediaController)==null?void 0:e.getAttribute(m.DEFAULT_STREAM_TYPE))!=null?a:k.ON_DEMAND}set defaultStreamType(e){e?this.setAttribute(m.DEFAULT_STREAM_TYPE,e):this.removeAttribute(m.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var e,t;return this.hasAttribute(m.TARGET_LIVE_WINDOW)?+this.getAttribute(m.TARGET_LIVE_WINDOW):(t=(e=this.media)==null?void 0:e.targetLiveWindow)!=null?t:Number.NaN}set targetLiveWindow(e){e==this.targetLiveWindow||Number.isNaN(e)&&Number.isNaN(this.targetLiveWindow)||(e==null?this.removeAttribute(m.TARGET_LIVE_WINDOW):this.setAttribute(m.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e;return(e=this.media)==null?void 0:e.liveEdgeStart}get startTime(){return Y(ee(this,o.START_TIME))}set startTime(e){this.setAttribute(o.START_TIME,`${e}`)}get preferPlayback(){let e=this.getAttribute(o.PREFER_PLAYBACK);if(e===G.MSE||e===G.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===G.MSE||e===G.NATIVE?this.setAttribute(o.PREFER_PLAYBACK,e):this.removeAttribute(o.PREFER_PLAYBACK))}get metadata(){var e;return(e=this.media)==null?void 0:e.metadata}set metadata(e){if(M(this,D,J).call(this),!this.media){$("underlying media element missing when trying to set metadata. metadata will not be set.");return}this.media.metadata={...pa(this),...e}}get _hlsConfig(){var e;return(e=this.media)==null?void 0:e._hlsConfig}set _hlsConfig(e){if(M(this,D,J).call(this),!this.media){$("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");return}this.media._hlsConfig=e}async addCuePoints(e){var t;if(M(this,D,J).call(this),!this.media){$("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");return}return(t=this.media)==null?void 0:t.addCuePoints(e)}get activeCuePoint(){var e;return(e=this.media)==null?void 0:e.activeCuePoint}get cuePoints(){var e,t;return(t=(e=this.media)==null?void 0:e.cuePoints)!=null?t:[]}addChapters(e){var t;if(M(this,D,J).call(this),!this.media){$("underlying media element missing when trying to addChapters. chapters will not be added.");return}return(t=this.media)==null?void 0:t.addChapters(e)}get activeChapter(){var e;return(e=this.media)==null?void 0:e.activeChapter}get chapters(){var e,t;return(t=(e=this.media)==null?void 0:e.chapters)!=null?t:[]}getStartDate(){var e;return(e=this.media)==null?void 0:e.getStartDate()}get currentPdt(){var e;return(e=this.media)==null?void 0:e.currentPdt}get tokens(){let e=this.getAttribute(m.PLAYBACK_TOKEN),t=this.getAttribute(m.DRM_TOKEN),a=this.getAttribute(m.THUMBNAIL_TOKEN),r=this.getAttribute(m.STORYBOARD_TOKEN);return{...N(this,Ye),...e!=null?{playback:e}:{},...t!=null?{drm:t}:{},...a!=null?{thumbnail:a}:{},...r!=null?{storyboard:r}:{}}}set tokens(e){Z(this,Ye,e??{})}get playbackToken(){var e;return(e=this.getAttribute(m.PLAYBACK_TOKEN))!=null?e:void 0}set playbackToken(e){this.setAttribute(m.PLAYBACK_TOKEN,`${e}`)}get drmToken(){var e;return(e=this.getAttribute(m.DRM_TOKEN))!=null?e:void 0}set drmToken(e){this.setAttribute(m.DRM_TOKEN,`${e}`)}get thumbnailToken(){var e;return(e=this.getAttribute(m.THUMBNAIL_TOKEN))!=null?e:void 0}set thumbnailToken(e){this.setAttribute(m.THUMBNAIL_TOKEN,`${e}`)}get storyboardToken(){var e;return(e=this.getAttribute(m.STORYBOARD_TOKEN))!=null?e:void 0}set storyboardToken(e){this.setAttribute(m.STORYBOARD_TOKEN,`${e}`)}addTextTrack(e,t,a,r){var i;let n=(i=this.media)==null?void 0:i.nativeEl;if(n)return gt(n,e,t,a,r)}removeTextTrack(e){var t;let a=(t=this.media)==null?void 0:t.nativeEl;if(a)return xr(a,e)}get textTracks(){var e;return(e=this.media)==null?void 0:e.textTracks}get castReceiver(){var e;return(e=this.getAttribute(m.CAST_RECEIVER))!=null?e:void 0}set castReceiver(e){e!==this.castReceiver&&(e?this.setAttribute(m.CAST_RECEIVER,e):this.removeAttribute(m.CAST_RECEIVER))}get castCustomData(){var e;return(e=this.media)==null?void 0:e.castCustomData}set castCustomData(e){if(!this.media){$("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");return}this.media.castCustomData=e}get noTooltips(){return this.hasAttribute(m.NO_TOOLTIPS)}set noTooltips(e){if(!e){this.removeAttribute(m.NO_TOOLTIPS);return}this.setAttribute(m.NO_TOOLTIPS,"")}get proudlyDisplayMuxBadge(){return this.hasAttribute(m.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(e){e?this.setAttribute(m.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(m.PROUDLY_DISPLAY_MUX_BADGE)}get capRenditionToPlayerSize(){var e;return(e=this.media)==null?void 0:e.capRenditionToPlayerSize}set capRenditionToPlayerSize(e){if(!this.media){$("underlying media element missing when trying to set capRenditionToPlayerSize");return}this.media.capRenditionToPlayerSize=e}};Ue=new WeakMap,Ke=new WeakMap,Ye=new WeakMap,ae=new WeakMap,$e=new WeakMap,se=new WeakMap,D=new WeakSet,J=function(){var e,t,a,r;if(!N(this,Ke)){Z(this,Ke,!0),M(this,D,re).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof H.HTMLElement))throw""}catch{$("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch{$("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof Er))throw""}catch{$("<media-controller> failed to upgrade!")}M(this,D,Ea).call(this),M(this,D,ga).call(this),M(this,D,fa).call(this),Z(this,ae,(t=(e=this.mediaController)==null?void 0:e.hasAttribute(Xe.USER_INACTIVE))!=null?t:!0),M(this,D,Ta).call(this),(a=this.media)==null||a.addEventListener("streamtypechange",()=>M(this,D,re).call(this)),(r=this.media)==null||r.addEventListener("loadstart",()=>M(this,D,re).call(this))}},ur=function(){var e,t;try{(e=window?.CSS)==null||e.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),(t=window?.CSS)==null||t.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch{}},ht=function(e){Object.assign(N(this,se),e),M(this,D,re).call(this)},re=function(e={}){pn(bn(kn(this,{...N(this,se),...e})),this.shadowRoot)},Ea=function(){let e=t=>{var a,r;if(!(t!=null&&t.startsWith("theme-")))return;let i=t.replace(/^theme-/,"");if(pt.includes(i))return;let n=this.getAttribute(t);n!=null?(a=this.mediaTheme)==null||a.setAttribute(i,n):(r=this.mediaTheme)==null||r.removeAttribute(i)};new MutationObserver(t=>{for(let{attributeName:a}of t)e(a)}).observe(this,{attributes:!0}),this.getAttributeNames().forEach(e)},ga=function(){let e=t=>{var a;let r=(a=this.media)==null?void 0:a.error;if(!(r instanceof h)){let{message:n,code:s}=r??{};r=new h(n,s)}if(!(r!=null&&r.fatal)){z(r),r.data&&z(`${r.name} data:`,r.data);return}let i=ua(r);i.message&&nr(i),$(r),r.data&&$(`${r.name} data:`,r.data),M(this,D,ht).call(this,{isDialogOpen:!0})};this.addEventListener("error",e),this.media&&(this.media.errorTranslator=(t={})=>{var a,r,i;if(!(((a=this.media)==null?void 0:a.error)instanceof h))return t;let n=ua((r=this.media)==null?void 0:r.error);return{player_error_code:(i=this.media)==null?void 0:i.error.code,player_error_message:n.message?String(n.message):t.player_error_message,player_error_context:n.context?String(n.context):t.player_error_context}})},fa=function(){var e,t,a,r;let i=()=>M(this,D,re).call(this);(t=(e=this.media)==null?void 0:e.textTracks)==null||t.addEventListener("addtrack",i),(r=(a=this.media)==null?void 0:a.textTracks)==null||r.addEventListener("removetrack",i)},Ta=function(){var e,t;if(!/Firefox/i.test(navigator.userAgent))return;let a,r=new WeakMap,i=()=>this.streamType===k.LIVE&&!this.secondaryColor&&this.offsetWidth>=800,n=(l,c,d=!1)=>{i()||Array.from(l&&l.activeCues||[]).forEach(p=>{if(!(!p.snapToLines||p.line<-5||p.line>=0&&p.line<10))if(!c||this.paused){let b=p.text.split(`
`).length,g=-3;this.streamType===k.LIVE&&(g=-2);let T=g-b;if(p.line===T&&!d)return;r.has(p)||r.set(p,p.line),p.line=T}else setTimeout(()=>{p.line=r.get(p)||"auto"},500)})},s=()=>{var l,c;n(a,(c=(l=this.mediaController)==null?void 0:l.hasAttribute(Xe.USER_INACTIVE))!=null?c:!1)},u=()=>{var l,c;let d=Array.from(((c=(l=this.mediaController)==null?void 0:l.media)==null?void 0:c.textTracks)||[]).filter(p=>["subtitles","captions"].includes(p.kind)&&p.mode==="showing")[0];d!==a&&a?.removeEventListener("cuechange",s),a=d,a?.addEventListener("cuechange",s),n(a,N(this,ae))};u(),(e=this.textTracks)==null||e.addEventListener("change",u),(t=this.textTracks)==null||t.addEventListener("addtrack",u),this.addEventListener("userinactivechange",()=>{var l,c;let d=(c=(l=this.mediaController)==null?void 0:l.hasAttribute(Xe.USER_INACTIVE))!=null?c:!0;N(this,ae)!==d&&(Z(this,ae,d),n(a,N(this,ae)))})};function ee(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var ya=wn,mr=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment>"u"){class e extends mr{}globalThis.DocumentFragment=e}var xn=class extends mr{},Pn={get(e){},define(e,t,a){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(xn)}},Un={customElements:Pn},Kn=typeof window>"u"||typeof globalThis.customElements>"u",tt=Kn?Un:globalThis;tt.customElements.get("mux-player")||(tt.customElements.define("mux-player",ya),tt.MuxPlayerElement=ya);export{xa as Q};
