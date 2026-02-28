import{s as i}from"./index-udrIuK_D.js";async function v(){const{data:t,error:e}=await i.from("crm_leads").select("*").order("priority_score",{ascending:!1});return e?(console.error("Error fetching leads:",e),[]):t||[]}async function b(t){const{data:e,error:n}=await i.from("crm_leads").select("*").eq("id",t).single();return n?(console.error("Error fetching lead:",n),null):e}async function k(t,e){const{data:n,error:o}=await i.from("crm_leads").update({...e,updated_at:new Date().toISOString()}).eq("id",t).select().single();if(o)throw console.error("Error updating lead:",o),o;return n}async function E(t){const{data:e,error:n}=await i.from("crm_activities").select("*").eq("lead_id",t).order("created_at",{ascending:!1});return n?(console.error("Error fetching activities:",n),[]):e||[]}async function T(t,e){const{data:n,error:o}=await i.from("crm_activities").insert([{lead_id:t,type:e.type,notes:e.notes,created_at:new Date().toISOString()}]).select().single();if(o)throw console.error("Error adding activity:",o),o;return await i.from("crm_leads").update({last_contact:new Date().toISOString()}).eq("id",t),n}async function A(t,e){const{data:n,error:o}=await i.from("crm_activities").update({type:e.type,notes:e.notes}).eq("id",t).select().single();if(o)throw console.error("Error updating activity:",o),o;return n}async function H(t){const{error:e}=await i.from("crm_activities").delete().eq("id",t);if(e)throw console.error("Error deleting activity:",e),e;return!0}const f=[{id:"cold-outreach",name:"Cold Outreach",subject:"{{org_name}} — free event coverage?",body:`{{decision_maker || "Hey"}},

I'll keep this short.

We film {{sport}} events — multi-camera, professional grade, full match coverage for every athlete. Livestream if you want it.

Here's the thing: you pay nothing.

We make money when athletes buy their footage through our portal after the event. You get free professional coverage. Athletes get content they actually want. Everyone wins.

We just covered NBA Sydney Nationals — 400 athletes across 2 days. The org paid $0.

If that sounds interesting, I'll explain how it works in 10 minutes. If not, no worries.

Brandon
0411 934 935`},{id:"follow-up-1",name:"Follow-up #1",subject:"Re: {{org_name}} coverage",body:`{{decision_maker || "Hey"}},

Following up on my last email.

I know you're busy running events, so here's the short version:

→ Professional multi-camera coverage for {{org_name}}
→ Athletes buy their own footage (you don't lift a finger)
→ You pay nothing. Ever.

We've done this for grappling comps, bodybuilding shows, and fight nights. Happy to send examples if useful.

10 minutes to see if it fits?

Brandon
0411 934 935`},{id:"meeting-request",name:"Meeting Request",subject:"{{org_name}} — quick call?",body:`{{decision_maker || "Hey"}},

Thanks for getting back.

Here's what I'll cover (10 min max):
1. How the zero-cost model works (and why there's no catch)
2. What your athletes would actually receive
3. What we'd need from you (almost nothing)

Send me a time that works or just call me direct.

Brandon
0411 934 935`},{id:"post-meeting",name:"Post-Meeting Follow-up",subject:"{{org_name}} — next steps",body:`{{decision_maker || "Hey"}},

Good chat. Here's the recap:

WHAT YOU GET (at zero cost):
→ Multi-camera coverage, every mat, every match
→ Livestream/PPV if you want it
→ Event highlight reel for your socials
→ Full photo gallery

WHAT ATHLETES GET:
→ Professional footage of their matches
→ Access through our portal
→ Delivered within days of the event

WHAT IT COSTS YOU:
→ $0 upfront
→ $0 ongoing
→ We make money on athlete purchases only

NEXT STEP:
I'm sending the agreement now. Read it, flag anything, we lock in the dates.

Questions? Call me.

Brandon
0411 934 935`},{id:"breakup",name:"Breakup Email",subject:"{{org_name}} — closing the loop",body:`{{decision_maker || "Hey"}},

I've sent a few emails about covering {{org_name}} events. Haven't heard back, so I'll assume the timing's not right.

All good. If you ever want professional coverage at no cost, the offer stands.

Good luck with the season.

Brandon`}];function I(){return f}function S(t,e){const n=f.find(c=>c.id===t);if(!n)return null;const o={org_name:e.org_name||"",decision_maker:e.contact?.decision_maker||"",sport:e.sport||"",upcoming_event:e.events?.upcoming?.[0]||"",event_date:e.events?.upcoming?.[0]?.split(":")?.[1]?.trim()||""};let s=n.subject,l=n.body;const u=/\{\{(\w+)\s*\|\|\s*"([^"]*)"\}\}/g;s=s.replace(u,(c,a,d)=>o[a]||d),l=l.replace(u,(c,a,d)=>o[a]||d);const m=/\{\{(\w+)\}\}/g;return s=s.replace(m,(c,a)=>o[a]||""),l=l.replace(m,(c,a)=>o[a]||""),{subject:s,body:l}}async function L(){const t=await v(),{data:e}=await i.from("crm_activities").select("*").order("created_at",{ascending:!1}),n=e||[],o={new:0,contacted:0,meeting:0,proposal:0,negotiating:0,signed:0,lost:0};t.forEach(r=>{const g=r.stage||"new";o.hasOwnProperty(g)&&o[g]++});const s=t.length,l=t.filter(r=>!["signed","lost","do_not_contact"].includes(r.stage)).length,u=o.signed,m=s>0?Math.round(u/s*100):0;let c=0;t.forEach(r=>{if(["proposal","negotiating","signed"].includes(r.stage)){const g=r.revenue_potential?.match(/\$(\d+)K/);g&&(c+=parseInt(g[1])*1e3)}});const a=new Date,d=new Date(a);d.setDate(a.getDate()-a.getDay()),d.setHours(0,0,0,0);const p=n.filter(r=>r.type==="Meeting"&&new Date(r.created_at)>=d).length,y=n.slice(0,10).map(r=>{const g=t.find(w=>w.id===r.lead_id);return{...r,lead_name:g?.org_name||"Unknown"}}),h={1:0,2:0,3:0};return t.forEach(r=>{h.hasOwnProperty(r.tier)&&h[r.tier]++}),{totalLeads:s,activeLeads:l,signedLeads:u,conversionRate:m,pipelineValue:c,meetingsThisWeek:p,stageCounts:o,tierCounts:h,recentActivities:y}}export{L as a,b,E as c,T as d,A as e,H as f,v as g,I as h,S as r,k as u};
