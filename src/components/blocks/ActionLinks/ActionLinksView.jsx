import { UniversalLink } from '@plone/volto/components';
import { List } from 'semantic-ui-react';
import './style.less';

const ActionLinksView = (props) => {
  const { data = {}, mode = 'view' } = props;
  const { id, actions } = data;
  const isView = props.mode === 'edit';

  return (
    <div className="action-links-preview">
      {isView && <h4 className="action-links-title">Action links:</h4>}
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
