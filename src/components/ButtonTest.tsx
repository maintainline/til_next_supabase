import { Button } from './ui/button';

const ButtonTest = () => {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant='outline'>Click me</Button>
      <Button variant='destructive'>Click me</Button>
      <Button variant='secondary'>Click me</Button>
      <Button variant='ghost'>Click me</Button>
      <Button variant='link'>Click me</Button>
    </div>
  );
};

export default ButtonTest;
