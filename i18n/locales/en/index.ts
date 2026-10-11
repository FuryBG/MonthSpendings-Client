import auth from './auth';
import budget from './budget';
import common from './common';
import drawer from './drawer';
import home from './home';
import invites from './invites';
import lock from './lock';
import navigation from './navigation';
import notifications from './notifications';
import participants from './participants';
import pending from './pending';
import pro from './pro';
import settings from './settings';
import spending from './spending';
import stats from './stats';
import tour from './tour';
import update from './update';

const en = {
  auth,
  budget,
  common,
  drawer,
  home,
  invites,
  lock,
  navigation,
  notifications,
  participants,
  pending,
  pro,
  settings,
  spending,
  stats,
  tour,
  update,
};

/** Shape every language must match (string leaves). */
export type Translation = typeof en;

export default en;
