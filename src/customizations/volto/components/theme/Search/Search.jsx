/**
 * Search component.
 * @module components/theme/Search/Search
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { UniversalLink } from '@plone/volto/components';
import { asyncConnect } from '@plone/volto/helpers';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Portal } from 'react-portal';
import { Container, Pagination, Button, Header } from 'semantic-ui-react';
import qs from 'query-string';
import classNames from 'classnames';

import config from '@plone/volto/registry';
import { Helmet } from '@plone/volto/helpers';
import { searchContent } from '@plone/volto/actions';
import { SearchTags, Toolbar, Icon } from '@plone/volto/components';
import SearchWidget from '@package/components/theme/SearchWidget/SearchWidget';

import paginationLeftSVG from '@plone/volto/icons/back.svg';
import paginationRightSVG from '@plone/volto/icons/ahead.svg';

const messages = defineMessages({
  searchResultsCount: {
    id: 'SearchResults',
    defaultMessage: '{count} results for {search}',
  },
});

class Search extends Component {
  static propTypes = {
    searchContent: PropTypes.func.isRequired,
    searchableText: PropTypes.string,
    subject: PropTypes.string,
    path: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        '@type': PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
      }),
    ),
    pathname: PropTypes.string.isRequired,
  };

  static defaultProps = {
    items: [],
    searchableText: null,
    subject: null,
    path: null,
  };

  constructor(props) {
    super(props);
    this.state = { currentPage: 1, isClient: false, active: 'relevance' };
  }
  componentDidMount() {
    this.doSearch();
    this.setState({ isClient: true });
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (this.props.location.search !== nextProps.location.search) {
      this.doSearch();
    }
  };

  doSearch = () => {
    const options = qs.parse(this.props.history.location.search);
    this.setState({ currentPage: 1 });
    options['use_site_search_settings'] = 1;
    this.props.searchContent('', options);
  };

  handleQueryPaginationChange = (e, { activePage }) => {
    const { settings } = config;
    window.scrollTo(0, 0);
    let options = qs.parse(this.props.history.location.search);
    options['use_site_search_settings'] = 1;

    this.setState({ currentPage: activePage }, () => {
      this.props.searchContent('', {
        ...options,
        b_start: (this.state.currentPage - 1) * settings.defaultPageSize,
      });
    });
  };

  onSortChange = (event, sort_order) => {
    let options = qs.parse(this.props.history.location.search);
    options.sort_on = event.target.name;
    options.sort_order = sort_order || 'ascending';
    if (event.target.name === 'relevance') {
      delete options.sort_on;
      delete options.sort_order;
    }
    let searchParams = qs.stringify(options);
    this.setState({ currentPage: 1, active: event.target.name }, () => {
      // eslint-disable-next-line no-restricted-globals
      this.props.history.replace({
        search: searchParams,
      });
    });
  };

  render() {
    const { settings } = config;
    const { intl } = this.props;

    return (
      <Container id="page-search">
        <Helmet title="Search" />
        <div className="container">
          <article id="content">
            <header>
              <div id="page-search-widget">
                <SearchWidget />
              </div>

              <SearchTags />
            </header>

            <section id="content-core">
              {this.props.search?.items_total > 0 ? (
                <div className="search-header">
                  <div className="search-results-count">
                    {this.props.searchableText && (
                      <>
                        {intl.formatMessage(messages.searchResultsCount, {
                          count: this.props.search.items_total,
                          search: <strong>{this.props.searchableText}</strong>,
                        })}
                      </>
                    )}
                  </div>
                  <div className="items_total">
                    <section>
                      <Header>
                        <Header.Content className="header-content">
                          <div className="sort-by">
                            <FormattedMessage
                              id="Sort By:"
                              defaultMessage="Sort by:"
                            />
                          </div>
                          <Button
                            onClick={(event) => {
                              this.onSortChange(event);
                            }}
                            name="relevance"
                            size="tiny"
                            className={classNames('button-sort', {
                              'button-active':
                                this.state.active === 'relevance',
                            })}
                          >
                            <FormattedMessage
                              id="Relevance"
                              defaultMessage="Relevance"
                            />
                          </Button>
                          <Button
                            onClick={(event) => {
                              this.onSortChange(event);
                            }}
                            name="sortable_title"
                            size="tiny"
                            className={classNames('button-sort', {
                              'button-active':
                                this.state.active === 'sortable_title',
                            })}
                          >
                            <FormattedMessage
                              id="Alphabetically"
                              defaultMessage="Alphabetically"
                            />
                          </Button>
                          <Button
                            onClick={(event) => {
                              this.onSortChange(event, 'reverse');
                            }}
                            name="effective"
                            size="tiny"
                            className={classNames('button-sort', {
                              'button-active':
                                this.state.active === 'effective',
                            })}
                          >
                            <FormattedMessage
                              id="Date (newest first)"
                              defaultMessage="Date (newest first)"
                            />
                          </Button>
                        </Header.Content>
                      </Header>
                    </section>
                  </div>
                </div>
              ) : (
                <div>
                  <FormattedMessage
                    id="No results found"
                    defaultMessage="No results found"
                  />
                </div>
              )}
              {this.props.items.map((item) => (
                <article className="tileItem" key={item['@id']}>
                  <h3 className="tileHeadline">
                    <UniversalLink
                      item={item}
                      className="summary url"
                      title={item['@type']}
                    >
                      {item.title}
                    </UniversalLink>
                  </h3>
                  {item.description && (
                    <div className="tileBody">
                      <span className="description">{item.description}</span>
                    </div>
                  )}
                </article>
              ))}

              {this.props.search?.batching && (
                <div className="search-footer">
                  <Pagination
                    activePage={this.state.currentPage}
                    totalPages={Math.ceil(
                      this.props.search.items_total / settings.defaultPageSize,
                    )}
                    onPageChange={this.handleQueryPaginationChange}
                    firstItem={null}
                    lastItem={null}
                    prevItem={{
                      content: <Icon name={paginationLeftSVG} size="25px" />,
                      icon: true,
                      'aria-disabled': !this.props.search.batching.prev,
                      className: !this.props.search.batching.prev
                        ? 'disabled'
                        : null,
                    }}
                    nextItem={{
                      content: <Icon name={paginationRightSVG} size="25px" />,
                      icon: true,
                      'aria-disabled': !this.props.search.batching.next,
                      className: !this.props.search.batching.next
                        ? 'disabled'
                        : null,
                    }}
                  />
                </div>
              )}
            </section>
          </article>
        </div>
        {this.state.isClient && (
          <Portal node={document.getElementById('toolbar')}>
            <Toolbar
              pathname={this.props.pathname}
              hideDefaultViewButtons
              inner={<span />}
            />
          </Portal>
        )}
      </Container>
    );
  }
}

export const __test__ = connect(
  (state, props) => ({
    items: state.search.items,
    searchableText: qs.parse(props.history.location.search).SearchableText,
    pathname: props.history.location.pathname,
  }),
  { searchContent },
)(Search);

export default compose(
  injectIntl,
  connect(
    (state, props) => ({
      items: state.search.items,
      searchableText: qs.parse(props.history.location.search).SearchableText,
      pathname: props.location.pathname,
      currentLang: state.intl?.locale,
    }),
    { searchContent },
  ),
  asyncConnect([
    {
      key: 'search',
      promise: ({ location, store: { dispatch } }) =>
        dispatch(
          searchContent('', {
            ...qs.parse(location.search),
            use_site_search_settings: 1,
          }),
        ),
    },
  ]),
)(Search);
