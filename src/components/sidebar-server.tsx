import { getLists } from '@/app/actions/list';
import Sidebar from '@/components/sidebar';

export default async function SidebarServer() {
  const allLists = await getLists();
  return <Sidebar initialLists={allLists} />;
}
