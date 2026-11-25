'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {campaignPhase} from '@/lib/campaigns';
import {useSite} from './context';
import {CampaignTimer} from './campaign-countdowns';
import {PhotoGallery} from './photo-gallery';
import {Icon,ProjectCard} from './shared';

export function CampaignDetail({id}:{id:string}){
 const {data,t,lang,notice}=useSite();
 const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const p=data.projects.find(project=>project.id===id);
 if(!p)return <div className="content wrap">{t('প্রকল্পটি পাওয়া যায়নি।','Project not found.')}</div>;
 const title=t(p.titleBn,p.titleEn),photos=[...new Set(p.imageUrls||[])].filter(src=>src!==p.imageUrl);
 const events=data.events.filter(event=>event.projectId===p.id);
 const phase=now===null?'unscheduled':campaignPhase(p,now);
 const status=phase==='ongoing'?t('চলমান ক্যাম্পেইন','Ongoing campaign'):phase==='ended'?t('ক্যাম্পেইন শেষ হয়েছে','Campaign ended'):phase==='upcoming'?t('আসন্ন ক্যাম্পেইন','Upcoming campaign'):t(p.labelBn,p.labelEn);
 const deadline=p.endsAt?new Date(p.endsAt):null;
 const validDeadline=deadline&&!Number.isNaN(deadline.getTime());
 const dateOptions={timeZone:'Asia/Dhaka',day:'numeric',month:'long',year:'numeric'} as const;
 const donateUrl=`/${lang}/donate/?project=${encodeURIComponent(p.id)}`;
 async function share(){try{const url=window.location.origin+window.location.pathname+window.location.search;if(navigator.share)await navigator.share({title,url});else{await navigator.clipboard.writeText(url);notice(t('প্রকল্পের লিংক কপি হয়েছে।','Campaign link copied.'))}}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))notice(t('ব্রাউজারের ঠিকানা থেকে লিংকটি কপি করুন।','Copy this page’s link from your browser address bar.'))}}
 return <>
  <section className="campaign-heading"><div className="wrap">
   <div className="campaign-breadcrumb"><Link href={`/${lang}/`}>{t('প্রথম পাতা','Home')}</Link><span aria-hidden="true">/</span><Link href={`/${lang}/projects/`}>{t('প্রকল্প','Projects')}</Link><span aria-hidden="true">/</span><span>{title}</span></div>
   <div className="campaign-heading-row"><div><span className="eyebrow">NAFAHAT FOUNDATION · {t('মানুষের পাশে','SERVING OUR COMMUNITY')}</span><h1>{title}</h1><p>{t(p.summaryBn,p.summaryEn)}</p></div>{p.accepting&&<a className="button campaign-mobile-donate" href="#campaign-support">{t('এই প্রকল্পে অনুদান দিন','Support this campaign')} ↓</a>}<button className="button outline small share-campaign" type="button" onClick={share}><span aria-hidden="true">↗</span>{t('শেয়ার করুন','Share campaign')}</button></div>
  </div></section>
  <div className="wrap campaign-detail-layout">
   <article className="campaign-story">
    <figure className="campaign-main-photo">{p.imageUrl?<PhotoGallery images={[p.imageUrl]} variant="cover"/>:<div className="campaign-photo-placeholder"><Icon name={p.kind}/><span>{t('নাফাহাত ফাউন্ডেশন','Nafahat Foundation')}</span></div>}</figure>
    <nav className="campaign-section-nav" aria-label={t('প্রকল্পের বিভাগ','Campaign sections')}><a href="#campaign-about">{t('বিস্তারিত','Overview')}</a><a href="#campaign-gallery">{t('ছবির গ্যালারি','Photo gallery')}{photos.length>0&&<span>{photos.length}</span>}</a>{events.length>0&&<a href="#campaign-updates">{t('আপডেট','Updates')}<span>{events.length}</span></a>}</nav>
    <section className="campaign-story-section" id="campaign-about"><span className="eyebrow">{t('আমাদের উদ্যোগ','THE INITIATIVE')}</span><h2>{t('এই উদ্যোগ সম্পর্কে','Together, we can make a difference')}</h2><div className="preline campaign-description">{t(p.bodyBn,p.bodyEn)}</div>{p.sourceUrl&&<p><a className="text-link small-text" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{t('মূল ফেসবুক পোস্ট দেখুন','Read the original Facebook post')} ↗</a></p>}</section>
    <section className="campaign-story-section" id="campaign-gallery"><div className="section-head"><div><span className="eyebrow">{t('কার্যক্রমের মুহূর্ত','MOMENTS FROM OUR WORK')}</span><h2>{t('ছবির গ্যালারি','Photo gallery')}</h2></div>{photos.length>0&&<span className="tag">{photos.length} {t('টি ছবি','photos')}</span>}</div>{photos.length?<><p className="small-text muted">{t('ছবিতে চাপ দিয়ে বড় করে দেখুন।','Select a photo to view it in full.')}</p><PhotoGallery images={photos}/></>:<p className="gallery-empty">{t('এই প্রকল্পের অন্যান্য ছবি শিগগিরই এখানে যুক্ত হবে।','More photographs from this initiative will be added here.')}</p>}</section>
    {events.length>0&&<section className="campaign-story-section" id="campaign-updates"><span className="eyebrow">{t('সাথে থাকুন','FOLLOW THE JOURNEY')}</span><h2>{t('ঘোষণা ও কার্যক্রমের আপডেট','Campaign updates')}</h2><div className="campaign-updates">{events.map(event=><article key={event.id}>{event.date&&<span className="small-text muted">{event.date}</span>}<h3><Link href={`/${lang}/events/#${encodeURIComponent(event.id)}`}>{t(event.titleBn,event.titleEn)}</Link></h3><p className="preline">{t(event.bodyBn,event.bodyEn)}</p><Link className="text-link small-text" href={`/${lang}/events/#${encodeURIComponent(event.id)}`}>{t('সম্পূর্ণ আপডেট দেখুন','View full update')} →</Link></article>)}</div></section>}
   </article>
   <aside id="campaign-support" className="campaign-support" aria-label={t('সহযোগিতা ও ক্যাম্পেইনের সময়সীমা','Support and campaign deadline')}><div className="campaign-support-card"><span className={`campaign-status ${phase==='ongoing'?'is-live':''}`}>{phase==='ongoing'&&<span className="status-dot"/>}{status}</span><h2>{t('আপনার সহযোগিতায় পাশে দাঁড়াই','Be part of this initiative')}</h2><p className="muted">{t('ছোট ছোট সহযোগিতায় এগিয়ে চলে আমাদের এই পথচলা।','Every contribution helps us continue this work together.')}</p>
    {validDeadline&&<div className="campaign-deadline"><span className="small-text muted">{t('ক্যাম্পেইনের শেষ সময়','Campaign deadline')}</span><strong><time dateTime={p.endsAt}>{deadline.toLocaleDateString(lang==='bn'?'bn-BD':'en-GB',dateOptions)}</time></strong><span className="small-text muted">{deadline.toLocaleTimeString(lang==='bn'?'bn-BD':'en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit'})} {t('বাংলাদেশ সময়','Bangladesh time')}</span>{phase==='ongoing'&&<CampaignTimer endsAt={p.endsAt!} now={now!}/>}{phase==='upcoming'&&<p className="small-text">{t('শুরু হবে: ','Starts: ')}{new Date(p.startsAt!).toLocaleDateString(lang==='bn'?'bn-BD':'en-GB',dateOptions)}</p>}</div>}
    <div className="campaign-verified"><span className="small-text muted">{t('ওয়েবসাইটে যাচাইকৃত অনুদান','Donations verified on this website')}</span><strong>৳{Number(p.verifiedTotal||0).toLocaleString(lang==='bn'?'bn-BD':'en-BD')}</strong></div>
    {p.accepting?<><Link className="button support-primary" href={donateUrl}>{t('এই প্রকল্পে অনুদান দিন','Donate to this campaign')} <span aria-hidden="true">→</span></Link><p className="small-text muted">{t('পেমেন্টের পর তথ্য জমা দিন। আমাদের টিম যাচাই করে অনুদান নিশ্চিত করবে।','Submit your payment details after sending your contribution. Our team will verify and confirm it.')}</p>{p.methods?.length>0&&<div className="campaign-payment-methods">{p.methods.map(method=><span className="tag" key={method}>{method==='bkash'?'bKash':method==='rocket'?'Rocket':method}</span>)}</div>}</>:<p className="notice small-text">{t('এই প্রকল্পে বর্তমানে আর্থিক অনুদান গ্রহণ করা হচ্ছে না।','Financial donations are not currently being collected for this initiative.')}</p>}
    {p.kind==='winter'&&<Link className="button outline support-primary" href={`/${lang}/clothing/`}>{t('ব্যবহারযোগ্য পোশাক দান করুন','Contribute usable clothing')}</Link>}<div className="campaign-trust"><Link href={`/${lang}/reports/`}>{t('স্বচ্ছতা ও প্রতিবেদন','Transparency & reports')} →</Link><span>{t('শুধু যাচাইকৃত অনুদান মোট হিসাবে যুক্ত হয়।','Only verified donations are included in the total.')}</span></div>
   </div><div className="campaign-help"><h3>{t('আরও জানতে চান?','Have a question?')}</h3><p>{t('এই প্রকল্প সম্পর্কে জানতে আমাদের সাথে যোগাযোগ করুন।','Contact us to learn more about this initiative.')}</p><a className="text-link small-text" href="mailto:nafahat.foundation19@gmail.com">nafahat.foundation19@gmail.com ↗</a></div></aside>
  </div>
  {data.projects.some(project=>project.id!==p.id)&&<section className="section campaign-related"><div className="wrap"><div className="section-head"><div><span className="eyebrow">{t('কল্যাণের পথে একসাথে','MORE WAYS TO GET INVOLVED')}</span><h2>{t('আমাদের অন্যান্য উদ্যোগ','Explore our other initiatives')}</h2></div><Link className="text-link" href={`/${lang}/projects/`}>{t('সব প্রকল্প','All projects')} →</Link></div><div className="grid">{data.projects.filter(project=>project.id!==p.id).slice(0,3).map(project=><ProjectCard key={project.id} project={project}/>)}</div></div></section>}
 </>;
}
