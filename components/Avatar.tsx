import React from 'react';
import { User } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface AvatarProps {
  user: User | null;
  className?: string; // e.g., 'w-10 h-10'
}

const Avatar: React.FC<AvatarProps> = ({ user, className = 'w-12 h-12' }) => {
  const { storeItems } = useAppContext();

  if (!user) {
    return <div className={`${className} bg-gray-200 dark:bg-gray-700 rounded-xl border-2 border-black dark:border-gray-600 flex-shrink-0`}></div>;
  }
  
  const activeFrame = storeItems.find(item => item.id === user.activeAvatarFrameId);

  const frameClass = activeFrame?.id;

  // Only apply frame class if it's one of the recognized animated frames
  if (frameClass && ['frame-rgb', 'frame-christmas', 'frame-ghost', 'frame-fire'].includes(frameClass)) {
    return (
      <div className={`${className} ${frameClass} flex-shrink-0`}>
        <img
          src={user.avatar}
          alt={user.name}
          className={`w-full h-full object-cover rounded-lg`}
        />
      </div>
    );
  }

  // Default rendering: no frame, just image with border
  return (
    <img
      src={user.avatar}
      alt={user.name}
      className={`${className} object-cover rounded-xl border-2 border-black dark:border-gray-400 flex-shrink-0`}
    />
  );
};

export default Avatar;
