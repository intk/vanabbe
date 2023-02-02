/**
 * Routes.
 * @module routes
 */

// import { App } from '@plone/volto/components';

// import { App } from '@plone/volto/components';
// import { defaultRoutes } from '@plone/volto/routes';
// import config from '@plone/volto/registry';
import routes from '@plone/volto/routes';
// import config from '@plone/volto/registry';

routes[0].routes = routes[0].routes
  .filter((r) => r.path !== '/search')
  .filter((r) => r.path !== '/(nl|en)/search');

console.log('routes', routes);

/**
 * Routes array.
 * @array
 * @returns {array} Routes.
 */
// const routes = [
//   {
//     path: '/',
//     component: App, // Change this if you want a different component
//     routes: [
//       // Add your routes here
//       ...(config.addonRoutes || []),
//       ...defaultRoutes,
//     ],
//   },
// ];
// const routes = [
//   {
//     path: '/',
//     component: App,
//     routes: [
//       // redirect to external links if path is in blacklist
//       ...(config.settings?.externalRoutes || []).map((route) => ({
//         ...route.match,
//         component: NotFound,
//       })),
//       // addon routes have a higher priority then default routes
//       ...(config.addonRoutes || []),
//       ...((config.settings?.isMultilingual && multilingualRoutes) || []),
//       ...defaultRoutes,
//     ],
//   },
// ];
//
//
// console.log('routes', routes);

/**
 * Routes array.
 * @array
 * @returns {array} Routes.
 */
// const routes = [
//   {
//     path: '/',
//     component: App, // Change this if you want a different component
//     routes: [
//       // Add your routes here
//       ...(config.addonRoutes || []),
//       ...defaultRoutes.filter(({ path }) => path !== '/search'),
//     ],
//   },
// ];

export default routes;
