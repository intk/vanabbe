import routes from '@plone/volto/routes';

routes[0].routes = routes[0].routes
  .filter((r) => r.path !== '/search')
  .filter((r) => r.path !== '/(nl|en)/search');

export default routes;
