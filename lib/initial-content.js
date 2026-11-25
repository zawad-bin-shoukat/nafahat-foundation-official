import {withCampaignDefaults} from './campaigns.js';
import {annualProjects,annualEvents,annualReports,annualPosts} from './annual-report-2025.js';
const initialContent={
  "projects": [
    {
      "id": "winter-relief",
      "kind": "winter",
      "titleBn": "শীতনিবারক সামগ্রী বিতরণ",
      "titleEn": "Winter relief & clothing",
      "labelBn": "মানবিক সহায়তা",
      "labelEn": "Humanitarian service",
      "summaryBn": "শীতার্ত মানুষের জন্য কম্বল, শীতবস্ত্র এবং ব্যবহারযোগ্য পোশাক সংগ্রহ ও বিতরণ।",
      "summaryEn": "Collecting and distributing blankets, winter essentials, and usable clothes for people in need.",
      "bodyBn": "নাফাহাত ফাউন্ডেশনের শীতকালীন উদ্যোগে অর্থ ও ব্যবহারযোগ্য পোশাক সংগ্রহ করা হয়। পোশাক সংগ্রহের ব্যবস্থা ঢাকা ও টাঙ্গাইলের জন্য। বর্তমান সংগ্রহের সময়সীমা ও বিতরণের পরিকল্পনা ফাউন্ডেশন নিশ্চিত করবে।",
      "bodyEn": "This initiative supports winter clothing distribution through financial contributions and usable clothing. Clothing collection coordination is available in Dhaka and Tangail. The foundation will confirm current collection dates and distribution plans.",
      "accepting": true,
      "methods": [
        "bKash",
        "Rocket"
      ],
      "reference": "winter",
      "instructionsBn": "বিকাশ বা রকেট অ্যাপ থেকে 01771525664 নম্বরে এই শীতকালীন প্রকল্পের অনুদান পাঠান। পাঠানোর আগে অ্যাপে প্রাপকের পরিচয় নিশ্চিত করুন। রেফারেন্স দেওয়ার সুযোগ থাকলে winter লিখুন। টাকা পাঠানোর পর নিচে ট্রানজ্যাকশন আইডি ও অন্যান্য তথ্য জমা দিন।",
      "instructionsEn": "Send your contribution for the winter campaign to 01771525664 using bKash or Rocket. Confirm the recipient in your payment app before sending. Use winter as the reference where available. After sending, submit the transaction ID and payment details below."
    },
    {
      "id": "learning-circles",
      "kind": "learning",
      "titleBn": "হালাকাহ ও পাঠচক্র",
      "titleEn": "Halaqahs & study circles",
      "labelBn": "ইলম ও দাওয়াহ",
      "labelEn": "Knowledge & dawah",
      "summaryBn": "দ্বীনি আলোচনা, ইতিহাস এবং জীবনে প্রয়োগের শিক্ষা নিয়ে একসাথে শেখার আয়োজন।",
      "summaryEn": "Gatherings for Islamic learning, history, reflection, and practical lessons.",
      "bodyBn": "ফাউন্ডেশনের আয়োজনে হালাকাহ ও নিয়মিত পাঠচক্র অনুষ্ঠিত হয়। ঘোষিত বিষয়গুলোর মধ্যে রয়েছে মুসলিম ইতিহাস ও সীরাহ থেকে শিক্ষা। পরবর্তী আয়োজনের নিশ্চিত সময়সূচি অনুষ্ঠান বিভাগে প্রকাশ করা হবে।",
      "bodyEn": "The foundation organizes halaqahs and study circles, including discussions of Muslim history and lessons from Seerah. Confirmed upcoming schedules will be published in Events.",
      "accepting": false,
      "methods": [],
      "reference": "",
      "instructionsBn": "",
      "instructionsEn": ""
    },
    {
      "id": "community",
      "kind": "community",
      "titleBn": "ভ্রাতৃত্ব ও সদস্য কার্যক্রম",
      "titleEn": "Brotherhood & member activities",
      "labelBn": "একসাথে পথচলা",
      "labelEn": "Community",
      "summaryBn": "সদস্যদের মিলন, দ্বীনি মুযাকারা এবং দায়িত্বশীল স্বেচ্ছাসেবায় অংশগ্রহণ।",
      "summaryEn": "Member gatherings, Islamic discussions, and opportunities for responsible volunteering.",
      "bodyBn": "সদস্যদের গেট-টুগেদারে ফাউন্ডেশনের কার্যক্রম, অর্জন, সীমাবদ্ধতা ও পরবর্তী পদক্ষেপ নিয়ে আলোচনা হয়। কাজের মাধ্যমে ভ্রাতৃত্ব ও দায়িত্বশীলতা গড়ে তোলাই আমাদের প্রত্যয়।",
      "bodyEn": "Member gatherings provide space to discuss the foundation’s work, achievements, limitations, and next steps, strengthening brotherhood and shared responsibility.",
      "accepting": false,
      "methods": [],
      "reference": "",
      "instructionsBn": "",
      "instructionsEn": ""
    }
  ],
  "posts": [
    {
      "id": "seerah",
      "categoryBn": "সীরাহ",
      "categoryEn": "Seerah",
      "titleBn": "সীরাহ হতে শিক্ষা",
      "titleEn": "Lessons from Seerah",
      "summaryBn": "রাসূলুল্লাহ ﷺ-এর সীরাহ থেকে শিক্ষা গ্রহণ এবং জীবনে ধারণ করার উদ্যোগ।",
      "summaryEn": "Learning from the life of Prophet Muhammad ﷺ and applying those lessons in daily life.",
      "bodyBn": "ফাউন্ডেশনের ঘোষিত “সীরাহ হতে শিক্ষা” সিরিজে সাপ্তাহিক পাঠচক্রের আলোচিত শিক্ষাগুলো তুলে ধরার পরিকল্পনা রয়েছে। অনুমোদিত পূর্ণ পর্বগুলো এখানে প্রকাশ করা হবে।",
      "bodyEn": "The foundation’s announced “Lessons from Seerah” series shares learning from its weekly study circle. Complete approved installments will be published here.",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-14"
    },
    {
      "id": "history",
      "categoryBn": "হালাকাহ",
      "categoryEn": "Halaqah",
      "titleBn": "এই জমিনের ভূমিপুত্রদের ইতিহাস",
      "titleEn": "Learning our history",
      "summaryBn": "ইতিহাসের পাঠের মাধ্যমে মুসলিম আত্মপরিচয় নিয়ে আলোচনা।",
      "summaryEn": "Reflecting on Muslim identity through historical learning.",
      "bodyBn": "ফাউন্ডেশনের প্রকাশিত পোস্টে “এই জমিনের ভূমিপুত্রদের ইতিহাস” শীর্ষক হালাকাহর কথা জানানো হয়েছে। আলোচনার অনুমোদিত সারসংক্ষেপ ও পরবর্তী আয়োজন এখানে প্রকাশ করা হবে।",
      "bodyEn": "A foundation post describes a halaqah on the history of this land’s people. Approved discussion notes and upcoming gatherings will be published here.",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-26"
    },
    {
      "id": "reminders",
      "categoryBn": "স্মরণিকা",
      "categoryEn": "Reminders",
      "titleBn": "দ্বীনি স্মরণিকা",
      "titleEn": "Islamic reminders",
      "summaryBn": "আইয়ামে বীযসহ নিয়মিত আমলের বিষয়ে সময়োপযোগী স্মরণিকা।",
      "summaryEn": "Timely reminders about practices including Ayyam al-Beed.",
      "bodyBn": "প্রকাশের আগে দ্বীনি লেখার বিষয়বস্তু ও তারিখ অনুমোদিত হবে। পুরোনো পোস্টারের তারিখকে বর্তমান মাসের তারিখ হিসেবে ব্যবহার করা হবে না।",
      "bodyEn": "Reminder content and dates require editorial review before publication. Dates shown in historical posters are not current calendar guidance.",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation"
    }
  ],
  "events": [
    {
      "id": "members-gathering-october-2026",
      "titleBn": "সদস্যদের গেট-টুগেদার ও দ্বীনি মুযাকারা",
      "titleEn": "Member gathering & Islamic discussion",
      "bodyBn": "২০ অক্টোবর ২০২৬ নাফাহাত ফাউন্ডেশনের সদস্যদের একটি গেট-টুগেদার অনুষ্ঠিত হয়। ফাউন্ডেশনের পরবর্তী পদক্ষেপ, অর্জন ও সীমাবদ্ধতা নিয়ে আলোচনা হয়। দুপুরের খাবারের পাশাপাশি সদস্যদের মধ্যে দ্বীনি মুযাকারাও হয়। ২৪ অক্টোবরের ফেসবুক পোস্টে আয়োজনটির বিবরণ প্রকাশ করা হয়।",
      "bodyEn": "Members gathered on 20 October 2026 to discuss the foundation’s next steps, achievements, and limitations. The gathering included lunch and Islamic discussion. The foundation shared an account of the gathering in its 24 October Facebook post.",
      "date": "20 October 2026 / ২০ অক্টোবর ২০২৬",
      "status": "past",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-24"
    },
    {
      "id": "history-halaqah-october-2026",
      "titleBn": "“এই জমিনের ভূমিপুত্রদের ইতিহাস” হালাকাহ",
      "titleEn": "Halaqah: the history of this land’s people",
      "bodyBn": "২৬ অক্টোবরের পোস্টে “এই জমিনের ভূমিপুত্রদের ইতিহাস” শীর্ষক হালাকাহর একাংশ তুলে ধরা হয়। মুসলিম ইতিহাস ও আত্মপরিচয় নিয়ে আলোচনা এই আয়োজনের মূল বিষয়। এখানে দেখানো তারিখটি পোস্টের প্রকাশের তারিখ; আয়োজনের সুনির্দিষ্ট তারিখ পোস্টে দেওয়া নেই।",
      "bodyEn": "The 26 October post shared part of a halaqah about the history of this land’s people, reflecting on Muslim history and identity. The date shown is the publication date; the exact event date was not specified in the post.",
      "date": "Post: 26 October 2026 / পোস্ট: ২৬ অক্টোবর ২০২৬",
      "status": "past",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-26"
    }
  ],
  "reports": [],
  "updates": [
    {
      "id": "winter-update-november-20-2026",
      "titleBn": "২০ নভেম্বর: শীতকালীন ফান্ড আপডেট ও প্রস্তুতির গল্প",
      "titleEn": "20 November: winter fund update & a story of preparation",
      "bodyBn": "২০ নভেম্বরের ফেসবুক পোস্টে শীতকালীন ফান্ডের পরিমাণ ৭,২৪০ টাকা জানানো হয়। পোস্টে আগের কম্বল বিতরণের প্রস্তুতির স্মৃতিচারণ এবং স্থানীয় বাসিন্দাদের সহযোগিতার কথা তুলে ধরা হয়েছে। এটি সেই দিনের প্রকাশিত ফেসবুক আপডেট; ওয়েবসাইটের যাচাইকৃত অনুদানের মোট হিসাবের অংশ নয়।",
      "bodyEn": "The 20 November Facebook post reported a winter fund update of BDT 7,240 and recalled local residents helping prepare an earlier blanket distribution. This is a dated, self-reported Facebook update, separate from donations verified on this website.",
      "date": "20 November 2026 / ২০ নভেম্বর ২০২৬",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation/posts/pfbid02qMBrQUJmwWwP2xTGFpwgbjNjuUR9n97rZ2sgBTBdA3rGvKhF9hfoiyns42gZMyCRl",
      "publishedAt": "2026-11-20"
    },
    {
      "id": "winter-appeal-november-2026",
      "titleBn": "শীতনিবারক সামগ্রী বিতরণের উদ্যোগ",
      "titleEn": "Winter essentials distribution appeal",
      "bodyBn": "৫ নভেম্বরের পোস্টে দ্বিতীয়বারের মতো “শীতনিবারক সামগ্রী বিতরণ” প্রকল্পের ঘোষণা দেওয়া হয়। অর্থ সংগ্রহের পাশাপাশি ব্যবহারযোগ্য পুরোনো পোশাক সংগ্রহের ব্যবস্থাও রাখা হয়। পোশাক সংগ্রহের এলাকা ঢাকা ও টাঙ্গাইল। পোস্টারে সহযোগিতা পাঠানোর শেষ সময় ২৫ নভেম্বর উল্লেখ করা হয়েছে। বর্তমান নির্দেশনা জানতে প্রকল্পের পৃষ্ঠা দেখুন।",
      "bodyEn": "The 5 November post announced the second winter essentials distribution project. Alongside fundraising, it invited donations of usable clothes, with collection coordination in Dhaka and Tangail. The poster stated a 25 November contribution deadline. See the project page for current instructions.",
      "date": "5 November 2026 / ৫ নভেম্বর ২০২৬",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-11-05"
    },
    {
      "id": "ayyam-al-beed-october-2026",
      "titleBn": "আর্কাইভ: অক্টোবরের আইয়ামে বীযের স্মরণিকা",
      "titleEn": "Archive: October Ayyam al-Beed reminder",
      "bodyBn": "২৪ অক্টোবরের পোস্টে আইয়ামে বীযের রোজার স্মরণিকা প্রকাশ করা হয়। প্রকাশিত পোস্টারে ২৫, ২৬ ও ২৭ অক্টোবর ২০২৬ তারিখ দেখানো হয়েছে। এটি পুরোনো পোস্টের সংরক্ষিত বিবরণ, বর্তমান মাসের রোজার তারিখ বা চাঁদ দেখার ঘোষণা নয়।",
      "bodyEn": "The 24 October post shared an Ayyam al-Beed fasting reminder. The published poster displayed 25, 26, and 27 October 2026. This is an archived description of that post, not current fasting dates or a moon-sighting announcement.",
      "date": "24 October 2026 / ২৪ অক্টোবর ২০২৬",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-24"
    },
    {
      "id": "seerah-series-announcement",
      "titleBn": "“সীরাহ হতে শিক্ষা” সিরিজের ঘোষণা",
      "titleEn": "Announcing “Lessons from Seerah”",
      "bodyBn": "১৪ অক্টোবরের পোস্টে “সীরাহ হতে শিক্ষা” নামে নতুন সিরিজের ঘোষণা দেওয়া হয়। সাপ্তাহিক পাঠচক্রে আলোচিত সীরাহর গুরুত্বপূর্ণ শিক্ষা ও উপদেশগুলো নিয়ে প্রতি রবিবার নতুন পর্ব প্রকাশের পরিকল্পনা জানানো হয়। পূর্ণ পাঠগুলো প্রকাশের জন্য দ্বীনি পাঠ বিভাগ রাখা হয়েছে।",
      "bodyEn": "The 14 October post announced a new “Lessons from Seerah” series, with plans for Sunday installments drawing on lessons discussed in the weekly study circle. The Learning section provides a place to publish the complete lessons.",
      "date": "14 October 2026 / ১৪ অক্টোবর ২০২৬",
      "sourceUrl": "https://web.facebook.com/nafahat.foundation",
      "publishedAt": "2026-10-14"
    }
  ]
};
// Keep legacy news records readable without changing stored content or financial records.
export function organizeContent(input){
  const result=structuredClone(input);
  result.projects=result.projects.map(withCampaignDefaults);
  for(const item of result.updates||[]){
    const learning=['ayyam-al-beed-october-2026','seerah-series-announcement'].includes(item.id);
    const key=learning?'posts':'events';
    const entry=learning?{categoryBn:'স্মরণিকা ও ঘোষণা',categoryEn:'Reminders & announcements',summaryBn:item.titleBn,summaryEn:item.titleEn,...item}:{status:'notice',...(item.id.startsWith('winter-')?{projectId:'winter-relief'}:{}),...item};
    result[key]=[...result[key].filter(x=>x.id!==item.id),entry];
  }
  result.updates=[];
  result.posts.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
  result.events.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
  return result;
}
// Database records continue to override seeds by ID; never rewrite existing campaigns.
export const seed=organizeContent({...initialContent,projects:[...initialContent.projects,...annualProjects],events:[...initialContent.events,...annualEvents],reports:[...initialContent.reports,...annualReports],posts:[...initialContent.posts,...annualPosts]});
