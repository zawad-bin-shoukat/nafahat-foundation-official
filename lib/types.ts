export type Language='bn'|'en';
export type MediaFields={reportUrl?:string;reportPages?:number[];sourceUrl?:string;imageUrl?:string;imageUrls?:string[];publishedAt?:string};
export type FAQ={questionBn:string;questionEn:string;answerBn:string;answerEn:string};
export type Expense={labelBn:string;labelEn:string;amount:number};
export type Completion={date:string;outcomesBn:string;outcomesEn:string;expenses:Expense[];websiteTotal?:number;offlineTotal?:number;offlineNoteBn?:string;offlineNoteEn?:string;approvedAt?:string};
export type Project=MediaFields&{activityCategory?:'humanitarian'|'dawah'|'environment'|'community';objectivesBn?:string;objectivesEn?:string;beneficiariesBn?:string;beneficiariesEn?:string;areasBn?:string;areasEn?:string;itemsBn?:string;itemsEn?:string;faqs?:FAQ[];fundraisingTarget?:number;offlineTotal?:number;offlineNoteBn?:string;offlineNoteEn?:string;offlineSeparate?:boolean;id:string;kind:string;titleBn:string;titleEn:string;labelBn:string;labelEn:string;summaryBn:string;summaryEn:string;bodyBn:string;bodyEn:string;accepting:boolean;methods:string[];reference:string;instructionsBn:string;instructionsEn:string;campaignScheduleSet?:boolean;campaignStatus?:'planned'|'ongoing'|'completed';startsAt?:string;endsAt?:string;verifiedTotal?:number};
export type Post=MediaFields&{id:string;titleBn:string;titleEn:string;categoryBn:string;categoryEn:string;summaryBn:string;summaryEn:string;bodyBn:string;bodyEn:string};
export type Entry=MediaFields&{completion?:Completion;id:string;titleBn:string;titleEn:string;bodyBn:string;bodyEn:string;date?:string;status?:'upcoming'|'past'|'notice';projectId?:string};
export type Content={projects:Project[];posts:Post[];events:Entry[];reports:Entry[];updates:Entry[]};
export type DonationStatus='pending'|'verified'|'clarification'|'rejected';
export type Donation={id:string;project_id:string;amount:number;method:string;transaction_id:string;sender:string;paid_at:string;name:string;email:string;status:DonationStatus;created_at:string;public_note:string;internal_note:string};
export type Submission={id:string;kind:string;name:string;phone:string;email:string;area:string;interest:string;message:string;status:string;created_at:string};
export type AdminData={email:string;role:Role;permissions:{content:boolean;donations:boolean;requests:boolean;users:boolean};donations:Donation[];submissions:Submission[]};
export type Tracking={status:DonationStatus;amount:number;createdAt:string;publicNote:string;receipt:string|null;project:{titleBn:string;titleEn:string}};
export type ContentKind='project'|'post'|'event'|'report';

export type Role='user'|'editor'|'finance'|'admin';
export type UserSession={signedIn:boolean;id?:string;email?:string;name?:string;phone?:string;role?:Role};
export type AccountData={donations:{id:string;project_id:string;amount:number;status:DonationStatus;created_at:string;public_note:string;receipt:string|null}[];submissions:{id:string;kind:string;status:string;message:string;created_at:string}[]};
export type UserDirectory={currentUserId:string;users:{user_id:string;email:string;name:string;role:Role;protected:boolean}[]};

export type EditorialDraft={id:string;kind:ContentKind;payload:Project|Post|Entry;stage:'draft'|'review'|'changes'|'published';version:string;updatedBy:string;updatedAt:string;reviewNote:string};
export type EditorialData={content:Content;drafts:EditorialDraft[]};
export type Revision={id:string;actor:string;action:string;kind:ContentKind;payload:Project|Post|Entry;created_at:string;note?:string};
