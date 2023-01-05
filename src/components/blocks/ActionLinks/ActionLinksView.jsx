import { UniversalLink } from '@plone/volto/components';
// import { useLocation } from 'react-router-dom';
import { List } from 'semantic-ui-react';

const ActionLinksView = (props) => {
  const { data = {}, mode = 'view' } = props;
  // const location = useLocation();
  const { id, actions } = data;
  const isView = props.mode === 'edit';

  return (
    <div>
      {isView && <h3>Action links</h3>}
      <div className="section-title">
        {data.blockTitle && <>{data.blockTitle}</>}
      </div>
      <List id={id}>
        {actions?.map((action, i) => (
          <List.Item key={i}>
            <List.Content>
              <UniversalLink
                item={{ ...action, '@id': action.href || `/#${action.id}` }}
              >
                {action.title}
              </UniversalLink>
            </List.Content>
          </List.Item>
        ))}
      </List>
      {(mode === 'edit') & !actions?.length ? (
        <div>No actions defined</div>
      ) : null}
    </div>
  );
};

export default ActionLinksView;
