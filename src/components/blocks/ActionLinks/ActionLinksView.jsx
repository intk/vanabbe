import { UniversalLink } from '@plone/volto/components';
import { useLocation } from 'react-router-dom';

const ActionLinksView = (props) => {
  const { data = {}, mode = 'view' } = props;
  const location = useLocation();
  const { id, actions } = data;
  const isView =
    props.mode === 'edit' || location.pathname.indexOf('footer-content') > -1;

  return (
    <>
      {isView && <h5>Action links block {data.globalId}</h5>}
      <ul className="action-links-block" id={id}>
        {actions?.map((action, i) => (
          <li key={i}>
            <UniversalLink
              item={{ ...action, '@id': action.href || `/#${action.id}` }}
            >
              {action.title}
            </UniversalLink>
          </li>
        ))}
      </ul>
      {(mode === 'edit') & !actions?.length ? (
        <div>No actions defined</div>
      ) : null}
    </>
  );
};

export default ActionLinksView;
