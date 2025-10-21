import ButtonTest from '@/components/ButtonTest';
import Counter from '@/components/Counter';
import SCSSTest from '@/components/SCSSTest';
import ThemeToggle from '@/components/ThemeToggle';
import TodoList from '@/components/TodoList';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
      <Counter />
      <br />
      <br />
      <UserProfile />
      <br />
      <br />
      <ThemeToggle />
      <br />
      <br />
      <TodoList />
    </div>
  );
}
