/* eslint-disable */
import { Route as rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";
import { timerRoute } from "./routes/timer";
import { timerCalendarRoute } from "./routes/timer/calendar";
import { entriesRoute } from "./routes/entries";
import { projectsRoute } from "./routes/projects";
import { onboardingRoute } from "./routes/onboarding";
import { membersRoute } from "./routes/members";
import { favoritesRoute } from "./routes/favorites";
import { sharedRoute } from "./routes/shared";
import { workspacesNewRoute } from "./routes/workspaces/new";
import { authLoginRoute } from "./routes/auth/login";
import { authSignupRoute } from "./routes/auth/signup";
import { authCallbackRoute } from "./routes/auth/callback";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  timerRoute,
  timerCalendarRoute,
  entriesRoute,
  projectsRoute,
  onboardingRoute,
  membersRoute,
  favoritesRoute,
  sharedRoute,
  workspacesNewRoute,
  authLoginRoute,
  authSignupRoute,
  authCallbackRoute,
]);
