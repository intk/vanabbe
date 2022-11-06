/**
 * Routes.
 * @module routes
 */

// import { App } from '@plone/volto/components';
import routes from '@plone/volto/routes';
// import config from '@plone/volto/registry';

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

export default routes;
