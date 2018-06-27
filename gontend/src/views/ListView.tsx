import React from 'react';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {connect} from 'react-redux';
import {resetSearchParams, updateSearchParams} from '../actions';
import FilterBar from '../components/FilterBar';
import {AppThunkDispatch, SearchParams, State} from '../types/state';
import {ListResponse, Project} from '../types/api';

interface ListState<TResponse extends ListResponse> {
  response?: TResponse;
}

interface ListProps<TResponse extends ListResponse> {
  dispatch: AppThunkDispatch;
  searchParams: SearchParams;
  projects: Project[];
  eventTypes: string[];
}

abstract class ListView<TResponse extends ListResponse>
  extends React.Component<ListProps<TResponse>, ListState<TResponse>> {
  public state: ListState<TResponse> = {};
  private debouncedSearch = debounce(this.search, 500);
  private refreshInterval?: number;

  public componentDidMount() {
    this.search();
    this.refreshInterval = window.setInterval(() => this.search(), 10000);
  }

  public componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  public componentDidUpdate(prevProps) {
    if (!isEqual(this.props.searchParams, prevProps.searchParams)) {
      // Search parameters were updated, so a search is required
      this.search();
    }
  }

  private search() {
    const params = new URLSearchParams();
    const {searchParams} = this.props;
    Object.keys(searchParams).forEach((key) => {
      const value = searchParams[key];
      if (value !== null && value !== '' && value !== undefined) {
        params.append(key, value);
      }
    });
    this.getData(params).then((response) => {
      this.setState({response});
      this.props.dispatch(updateSearchParams({offset: response.offset, limit: response.limit}));
    });
  }

  private handleChange = (key, value) => {
    this.props.dispatch(updateSearchParams({[key]: value}));
  };

  protected abstract getData(params: URLSearchParams): Promise<TResponse>;
  protected abstract renderContent(): React.ReactChild;
  protected abstract getTitle(): string;

  public render() {
    const {searchParams, projects, eventTypes, dispatch} = this.props;
    const {response} = this.state;
    const content = (
      response ? this.renderContent() : null
    );
    return (
      <div className="List-view">
        <nav className="top flex flex-sb">
          <h1>
            {this.getTitle()}
            {response ? ` (${response.total})` : ''}
          </h1>
          <FilterBar
            searchParams={searchParams}
            projects={projects}
            eventTypes={eventTypes}
            total={response ? response.total : 0}
            handleChange={this.handleChange}
            handleReset={() => this.props.dispatch(resetSearchParams())}
          />
        </nav>
        <div className="content">{content}</div>
      </div>
    );
  }
}

const mapListViewStateToProps = ({searchParams, metadata}: State) => ({
  searchParams,
  projects: metadata.projects,
  eventTypes: metadata.eventTypes,
});

const connectListView = (listViewClass) => connect(
  mapListViewStateToProps,
  null,
  null,
  {pure: false},
)(listViewClass);

export {ListView, connectListView, mapListViewStateToProps};
