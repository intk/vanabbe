import React from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Ref, Form, Input } from 'semantic-ui-react';
import qs from 'query-string';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  search: {
    id: 'Search',
    defaultMessage: 'Search',
  },
  searchPlaceholder: {
    id: 'Search artist, artwork etc... ',
    defaultMessage: 'Search artist, artwork etc... ',
  },
});

const SearchWidget = (props) => {
  const { pathname, history } = props;
  const searchableText = qs.parse(history.location.search).SearchableText;
  const currentLang = useSelector((state) => state.intl.locale);

  const inputRef = React.useRef();
  const [text, setText] = React.useState(searchableText);
  const intl = useIntl();

  React.useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current.getElementsByTagName('input')[0];
      input.focus();
    }
  }, []);

  const onSubmit = React.useCallback(
    (event) => {
      const l = pathname ? pathname.length : 0;
      // const section = this.state.section ? `&path=${this.props.pathname}` : '';
      const path = l > 0 ? `&path=${encodeURIComponent(pathname)}` : '';
      const encodedText = encodeURIComponent(text);
      history.push(
        `/${currentLang}/search?SearchableText=${encodedText}${path}`,
      );
      event.preventDefault();
    },
    [pathname, text, history, currentLang],
  );

  return (
    <Form action={`/${currentLang}/search`} onSubmit={onSubmit}>
      <Form.Field className="searchbox">
        <Ref innerRef={inputRef}>
          <Input
            aria-label={intl.formatMessage(messages.search)}
            onChange={(event, { value }) => setText(value)}
            name="SearchableText"
            value={text}
            transparent
            focus
            autoComplete="off"
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            title={intl.formatMessage(messages.search)}
          />
        </Ref>
      </Form.Field>
    </Form>
  );
};

export default withRouter(SearchWidget);
