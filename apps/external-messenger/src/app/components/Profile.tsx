import React from 'react';

import './Profile.scss';
import defaultIcon from '../assets/default_icon.svg';
import { environment } from '../../../../../libs/shared/src/lib/config/environment';

const Profile = ({
  name = '',
  useInitials = false,
  initials = '',
  icon = null,
}) => (
  <div className="profile">
    {icon || (!icon && !useInitials) ? (
      <img
        className="profile__icon"
        src={
          icon !== null && icon !== ''
            ? `${environment.ASSET_HOST}${icon}_profile.png`
            : defaultIcon
        }
        alt=""
      />
    ) : (
      <span className="profile__initials">{initials}</span>
    )}
  </div>
);

export default Profile;
