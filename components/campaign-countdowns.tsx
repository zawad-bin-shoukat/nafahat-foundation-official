'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {campaignPhase,remainingTime} from '@/lib/campaigns';
import {useSite} from './context';
import {detailPath} from './shared';
export function CampaignCountdowns(){
 const {data,t,lang}=useSite();const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const campaigns=data.projects.filter(p=>campaignPhase(p,now??0)==='ongoing');
 if(!now||!campaigns.length)return null;
 const number=(n:number)=>n.toLocaleString(lang==='bn'?'bn-BD':'en-GB',{minimumIntegerDigits:2,useGrouping:false});
 return <section className="section campaign-section" aria-labelledby="ongoing-heading"><div className="wrap"><div className="section-head"><div><span className="eyebrow">{t('এখন চলছে','HAPPENING NOW')}</span><h2 id="ongoing-heading">{t('চলমান ক্যাম্পেইন','Ongoing campaigns')}</h2></div><Link className="text-link" href={`/${lang}/projects/`}>{t('সব প্রকল্প','All projects')}</Link></div><div className="campaign-grid">{campaigns.map(p=><article className="campaign-clock-card" key={p.id}>{p.imageUrl&&<img className="campaign-cover" src={p.imageUrl} alt="" loading="lazy"/>}<div className="campaign-clock-body"><span className="tag">{t('চলমান','Ongoing')}</span><h3>{t(p.titleBn,p.titleEn)}</h3><p>{t(p.summaryBn,p.summaryEn)}</p><div className="countdown" role="timer" aria-live="off" aria-label={t('ক্যাম্পেইন শেষ হতে বাকি','Time remaining until campaign ends')}>{remainingTime(p.endsAt!,now).map((value,i)=><div key={i}><strong>{number(value)}</strong><span>{t(['দিন','ঘণ্টা','মিনিট','সেকেন্ড'][i],['Days','Hours','Minutes','Seconds'][i])}</span></div>)}</div><p className="small-text muted">{t('শেষ সময়: ','Ends: ')}<time dateTime={p.endsAt}>{new Date(p.endsAt!).toLocaleString(lang==='bn'?'bn-BD':'en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'})}</time> {t('(বাংলাদেশ সময়)','(Bangladesh time)')}</p><div className="actions"><Link className="button outline" href={detailPath(lang,'projects',p.id)}>{t('বিস্তারিত দেখুন','View campaign')}</Link>{p.accepting&&<Link className="button" href={`/${lang}/donate/?project=${encodeURIComponent(p.id)}`}>{t('অনুদান দিন','Contribute')}</Link>}</div></div></article>)}</div></div></section>
}
