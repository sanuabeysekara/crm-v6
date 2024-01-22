// assets
import { IconSettings } from '@tabler/icons';

// constant
const icons = {
  IconSettings
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'settings',
      title: 'Settings',
      type: 'collapse',
      icon: icons.IconSettings,
      children: [
        {
          id: 'profile',
          title: 'Profile',
          type: 'item',
          url: '/app/profile',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default utilities;
