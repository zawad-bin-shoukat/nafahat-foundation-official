export const dynamic='force-dynamic';
import SiteApp from '@/components/site-app';import {seed} from '@/lib/initial-content.js';
export default function Home(){return <SiteApp lang="bn" route={[]} initialData={seed}/>}
